import { prisma } from '../db/index.js';
import { AccessToken } from 'livekit-server-sdk';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSessionRequestEmail, sendSessionScheduledEmail } from '../services/mailService.js';
import { sessionCost, reserveCredits, settleCredits, refundCredits } from '../services/creditsService.js';
import { createNotification } from '../services/notificationService.js';

const createSessionRequest = asyncHandler(async (req, res) => {
  const { teacherId, skillId, topic, scheduledAt, durationMinutes, mode } = req.body;

  if (teacherId === req.user.id) {
      throw new ApiError(400, "You cannot request a session with yourself");
  }

  const requestedMode = mode === 'CREDITS' ? 'CREDITS' : 'BARTER';

  // Verify teacher exists and is not banned
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new ApiError(404, "Teacher not found");
  if (teacher.banned) throw new ApiError(403, "This user is no longer active on the platform");

  const duration = durationMinutes || 60;
  const cost = sessionCost(duration);

  // Escrow credits atomically when the requester chooses a credit-paid session.
  const session = await prisma.$transaction(async (tx) => {
    if (requestedMode === 'CREDITS') {
      await reserveCredits(tx, { learnerId: req.user.id, amount: cost });
    }
    return tx.session.create({
      data: {
        learnerId: req.user.id,
        teacherId,
        skillId: skillId || null,
        topic,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        durationMinutes: duration,
        mode: requestedMode,
        status: 'PENDING',
        creditsReserved: requestedMode === 'CREDITS' ? cost : 0
      }
    });
  });

  // Notify the teacher by email with the requester's details and arrangement.
  try {
    const learner = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true }
    });
    const teachSkills = (learner?.skills || [])
      .filter((s) => s.type === 'TEACH')
      .map((s) => s.name);
    await sendSessionRequestEmail({
      teacherEmail: teacher.email,
      teacherName: teacher.name,
      learnerName: learner?.name,
      learnerBio: learner?.bio,
      learnerTeachSkills: teachSkills,
      topic,
      mode: requestedMode,
      durationMinutes: duration
    });

    await createNotification({
      userId: teacher.id,
      type: 'session_request',
      title: 'New session request',
      body: `${learner?.name || 'Someone'} requested a session: ${topic} (${requestedMode === 'BARTER' ? 'barter' : 'credit-paid'}).`,
      link: `/dashboard/session/${session.id}`
    });
  } catch (mailError) {
    console.error('Failed to send session request email:', mailError);
  }

  res.status(201).json(new ApiResponse(201, session, "Session requested successfully"));
});

const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: {
      OR: [{ learnerId: req.user.id }, { teacherId: req.user.id }]
    },
    include: {
      teacher: { select: { name: true, id: true, avatar: true } },
      learner: { select: { name: true, id: true, avatar: true } },
      skill: { select: { name: true } },
      reviews: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Attach the current user's review as `myReview` for convenience.
  const withMyReview = sessions.map((s) => ({
    ...s,
    myReview: s.reviews.find((r) => r.reviewerId === req.user.id) || null
  }));

  res.json(new ApiResponse(200, withMyReview, "Sessions fetched successfully"));
});

const getSessionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
        where: { id },
        include: {
            teacher: { select: { name: true, id: true, avatar: true, bio: true } },
            learner: { select: { name: true, id: true, avatar: true, bio: true } },
            skill: { select: { name: true } },
            reviews: true
        }
    });

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id) {
        throw new ApiError(403, "Not authorized to view this session");
    }

    const withMyReview = {
        ...session,
        myReview: session.reviews.find((r) => r.reviewerId === req.user.id) || null
    };

    res.json(new ApiResponse(200, withMyReview, "Session fetched successfully"));
});

// Teacher (the session organizer) accepts a request. The teacher decides the
// final arrangement: BARTER or CREDITS. If they pick CREDITS, escrow happens now.
const acceptSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { mode, scheduledAt } = req.body;

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, "Session not found");

    // Only the teacher (organizer) can accept
    if (session.teacherId !== req.user.id) {
        throw new ApiError(403, "Only the teacher can accept this session");
    }
    if (session.status !== 'PENDING') {
        throw new ApiError(400, "Session is not pending");
    }

    const finalMode = mode === 'CREDITS' ? 'CREDITS' : 'BARTER';

    const updated = await prisma.$transaction(async (tx) => {
        let creditsReserved = 0;

        if (finalMode === 'CREDITS') {
            // If credits were escrowed at request, keep them; otherwise reserve now.
            if ((session.creditsReserved ?? 0) > 0) {
                creditsReserved = session.creditsReserved;
            } else {
                const cost = sessionCost(session.durationMinutes);
                await reserveCredits(tx, { learnerId: session.learnerId, amount: cost });
                creditsReserved = cost;
            }
        } else {
            // Switching to barter - refund anything escrowed at request time.
            if ((session.creditsReserved ?? 0) > 0) {
                await refundCredits(tx, { session });
            }
            creditsReserved = 0;
        }

        const data = {
            mode: finalMode,
            status: 'SCHEDULED',
            creditsReserved,
            meetingLink: `peersy-${session.id}`
        };
        if (scheduledAt) data.scheduledAt = new Date(scheduledAt);

        return tx.session.update({ where: { id }, data });
    });

    // Notify learner
    try {
        const withParticipants = await prisma.session.findUnique({
            where: { id },
            include: {
                teacher: { select: { name: true, email: true } },
                learner: { select: { name: true, email: true } },
                skill: { select: { name: true } }
            }
        });
        if (withParticipants?.learner?.email) {
            await sendSessionScheduledEmail({
                learnerEmail: withParticipants.learner.email,
                learnerName: withParticipants.learner.name,
                teacherName: withParticipants.teacher?.name,
                skillName: withParticipants.skill?.name || session.topic,
                scheduledAt: withParticipants.scheduledAt,
                meetingLink: withParticipants.meetingLink
            });
        }

        await createNotification({
            userId: session.learnerId,
            type: 'session_accepted',
            title: 'Session accepted',
            body: `${withParticipants?.teacher?.name || 'Your teacher'} accepted your session${withParticipants?.scheduledAt ? ` for ${new Date(withParticipants.scheduledAt).toLocaleString()}` : ''}.`,
            link: `/dashboard/session/${session.id}`
        });
    } catch (mailError) {
        console.error('Failed to send scheduled session email:', mailError);
    }

    res.json(new ApiResponse(200, updated, "Session accepted"));
});

const updateSessionStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, actualDuration } = req.body; // 'COMPLETED', 'CANCELLED'
    const session = await prisma.session.findUnique({ where: { id } });

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id) {
        throw new ApiError(403, "Unauthorized to update this session");
    }

    if (status === 'COMPLETED') {
        const completed = await prisma.$transaction(async (tx) => {
            const locked = await tx.$queryRaw`SELECT * FROM "Sessions" WHERE id = ${id} FOR UPDATE`;
            const current = locked[0];
            if (!current) throw new ApiError(404, "Session not found");
            if (current.status === 'COMPLETED') throw new ApiError(400, "Session is already completed");
            if (current.status === 'CANCELLED') throw new ApiError(400, "Cannot complete a cancelled session");
            // Only scheduled sessions can be completed. This prevents a requester
            // from "completing" a never-scheduled PENDING session to trigger an
            // escrow refund or settle credits for a session that never happened.
            if (current.status !== 'SCHEDULED') {
                throw new ApiError(400, "Only scheduled sessions can be completed");
            }
            // A session can only be completed if the meeting actually started
            // (someone joined). This prevents settling credits or rewarding a
            // teacher for a meeting nobody attended.
            if (!current.startedAt) {
                throw new ApiError(400, "This meeting never started. You can report a no-show or reach out to the other participant instead.");
            }

            // Use server-tracked duration when available, else client report.
            const actualMinutes = current.actualDurationMinutes
                ?? (actualDuration && actualDuration > 0 ? Math.round(actualDuration) : null)
                ?? session.durationMinutes
                ?? 60;

            // Settle credits for credit-paid sessions (barter never settles).
            if (current.mode === 'CREDITS') {
                await settleCredits(tx, { session: { ...current, actualDurationMinutes: actualMinutes } });
            }

            return tx.session.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    endedAt: current.endedAt ?? new Date(),
                    actualDurationMinutes: actualMinutes
                }
            });
        });

        res.json(new ApiResponse(200, completed, "Session completed"));
        return;
    }

    if (status === 'CANCELLED') {
        if (session.status === 'COMPLETED') {
            throw new ApiError(400, "Cannot cancel a completed session");
        }
        if (session.status === 'SCHEDULED') {
            throw new ApiError(400, "Scheduled sessions cannot be cancelled. Discuss with the other party or report a no-show after the session.");
        }
        const cancelled = await prisma.$transaction(async (tx) => {
            if ((session.creditsReserved ?? 0) > 0) {
                await refundCredits(tx, { session });
            }
            return tx.session.update({
                where: { id },
                data: { status: 'CANCELLED', creditsReserved: 0 }
            });
        });
        res.json(new ApiResponse(200, cancelled, "Session cancelled"));
        return;
    }

    throw new ApiError(400, "Invalid status transition");
});

// Record a participant joining the meeting (for time tracking).
const recordJoin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, "Session not found");
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id) {
        throw new ApiError(403, "Not a participant");
    }
    if (session.status !== 'SCHEDULED') {
        throw new ApiError(400, "Session is not scheduled");
    }
    // Require an agreed time so a never-scheduled session can't be marked as
    // started (and later completed to settle credits).
    if (!session.scheduledAt) {
        throw new ApiError(400, "This session has no scheduled time yet. Agree on a time first.");
    }

    const updated = await prisma.session.update({
        where: { id },
        data: { startedAt: session.startedAt ?? new Date() }
    });
    res.json(new ApiResponse(200, updated, "Join recorded"));
});

// Record a participant leaving / the meeting ending. Computes elapsed time.
const recordLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, "Session not found");
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id) {
        throw new ApiError(403, "Not a participant");
    }

    const endedAt = new Date();
    let actualMinutes = session.actualDurationMinutes;
    if (session.startedAt) {
        const ms = endedAt.getTime() - session.startedAt.getTime();
        actualMinutes = Math.max(1, Math.ceil(ms / 60000));
    }

    const updated = await prisma.session.update({
        where: { id },
        data: { endedAt, actualDurationMinutes: actualMinutes }
    });

    res.json(new ApiResponse(200, updated, "Leave recorded"));
});

// Organizer (teacher) reports the other party as a no-show.
// First no-show = warning, second = ban.
const reportNoShow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, "Session not found");

    // Only the organizer (teacher) can report a no-show
    if (session.teacherId !== req.user.id) {
        throw new ApiError(403, "Only the teacher can report a no-show");
    }
    if (session.status !== 'SCHEDULED' && session.status !== 'COMPLETED') {
        throw new ApiError(400, "Only scheduled sessions can be reported");
    }
    if (session.noShowReportedAt) {
        throw new ApiError(400, "No-show already reported for this session");
    }

    // No-show can only be flagged after the meeting start time + 2 minutes.
    if (session.scheduledAt) {
        const flagOpenAt = new Date(session.scheduledAt.getTime() + 2 * 60 * 1000);
        if (new Date() < flagOpenAt) {
            const waitMin = Math.ceil((flagOpenAt.getTime() - Date.now()) / 60000);
            throw new ApiError(400, `You can report a no-show ${waitMin} minute(s) after the meeting start time.`);
        }
    }

    const noShowUserId = session.learnerId;

    // File a report for admin review. Warnings/bans are only applied on approval.
    const report = await prisma.$transaction(async (tx) => {
        const updated = await tx.session.update({
            where: { id },
            data: {
                noShowUserId,
                noShowReportedById: req.user.id,
                noShowReportedAt: new Date()
            }
        });
        const created = await tx.noShowReport.create({
            data: {
                sessionId: id,
                reportedBy: req.user.id,
                reportedUser: noShowUserId,
                reason: reason || null,
                status: 'PENDING'
            }
        });
        return { session: updated, report: created };
    });

    // Notify admins that a report needs review.
    const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true } });
    for (const admin of admins) {
        await createNotification({
            userId: admin.id,
            type: 'system',
            title: 'No-show report pending review',
            body: `A learner was reported as a no-show. Review it in the admin panel.`,
            link: `/dashboard/admin`
        });
    }

    res.json(new ApiResponse(201, report, "No-show report submitted for admin review"));
});

const addReview = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { rating, comment } = req.body;
    
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new ApiError(404, "Session not found");
    
    if (session.status !== 'COMPLETED') {
        throw new ApiError(400, "Can only review completed sessions");
    }

    let revieweeId;
    if (req.user.id === session.learnerId) {
        revieweeId = session.teacherId;
    } else if (req.user.id === session.teacherId) {
        revieweeId = session.learnerId;
    } else {
        throw new ApiError(403, "Not a participant of this session");
    }

    // Each participant can review once per session.
    const existingReview = await prisma.review.findUnique({
        where: { sessionId_reviewerId: { sessionId, reviewerId: req.user.id } }
    });
    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this session");
    }

    const review = await prisma.review.create({
        data: {
            sessionId,
            reviewerId: req.user.id,
            revieweeId,
            rating,
            comment
        }
    });

    // Notify the other party that they received a review.
    await createNotification({
        userId: revieweeId,
        type: 'review',
        title: 'You received a review',
        body: `${req.user.name} rated your session ${rating}/5.`,
        link: `/dashboard/session/${sessionId}`
    });

    res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

const generateLiveKitToken = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const user = req.user;
    
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new ApiError(404, "Session not found");
    
    if (session.teacherId !== user.id && session.learnerId !== user.id) {
        throw new ApiError(403, "Not authorized");    }

    if (session.status !== 'SCHEDULED') {
        throw new ApiError(400, "Session is not scheduled");
    }

    // A session with no agreed time can never be joined - this prevents a
    // SCHEDULED-but-unslotted session from being joinable indefinitely.
    if (!session.scheduledAt) {
        throw new ApiError(400, "This session has no scheduled time yet. Agree on a time first.");
    }

    // Join window: users may join 10 minutes before the scheduled time.
    const windowStart = new Date(session.scheduledAt.getTime() - 10 * 60 * 1000);
    const windowEnd = new Date(session.scheduledAt.getTime() + (session.durationMinutes || 60) * 60 * 1000);
    const now = new Date();
    if (now < windowStart) {
        throw new ApiError(400, "You can join this session 10 minutes before the scheduled time");
    }
    if (now > windowEnd) {
        throw new ApiError(400, "This session window has passed");
    }

    const roomName = `peersy-${sessionId}`;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
        throw new ApiError(500, "LiveKit is not configured on the server");
    }

    // The JWT only carries { id, email }, so fetch the full profile to get the
    // user's Peersy name for the meeting participant display name.
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, avatar: true }
    });
    const displayName = dbUser?.name || user.name || user.email || 'User';

    const token = new AccessToken(apiKey, apiSecret, {
        identity: user.id,
        name: displayName,
        ttl: '2h',
        metadata: JSON.stringify({
            sessionId,
            role: user.id === session.teacherId ? 'teacher' : 'learner',
            topic: session.topic
        })
    });
    token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true
    });

    const jwt = await token.toJwt();

    res.json(new ApiResponse(200, { token: jwt, roomName }, "LiveKit token generated"));
});

export { createSessionRequest, getMySessions, getSessionById, acceptSession, updateSessionStatus, recordJoin, recordLeave, reportNoShow, addReview, generateLiveKitToken };
