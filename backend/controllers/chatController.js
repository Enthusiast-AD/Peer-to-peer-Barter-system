import { prisma } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSessionScheduledEmail } from '../services/mailService.js';
import { createNotification } from '../services/notificationService.js';
import { sessionCost, reserveCredits } from '../services/creditsService.js';

const assertParticipant = async (userId, sessionId) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, 'Session not found');
  if (session.teacherId !== userId && session.learnerId !== userId) {
    throw new ApiError(403, 'You are not a participant of this session');
  }
  return session;
};

const getMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  await assertParticipant(req.user.id, sessionId);

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    include: {
      sender: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Mark messages as read when the user fetches them.
  await prisma.sessionRead.upsert({
    where: { sessionId_userId: { sessionId, userId: req.user.id } },
    update: { lastReadAt: new Date() },
    create: { sessionId, userId: req.user.id }
  });

  res.json(new ApiResponse(200, messages, 'Messages fetched'));
});

// Returns unread message counts per session for the current user.
const getUnreadCounts = asyncHandler(async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { OR: [{ learnerId: req.user.id }, { teacherId: req.user.id }] },
    select: { id: true }
  });
  const sessionIds = sessions.map((s) => s.id);

  const reads = await prisma.sessionRead.findMany({
    where: { userId: req.user.id, sessionId: { in: sessionIds } },
    select: { sessionId: true, lastReadAt: true }
  });
  const readMap = Object.fromEntries(reads.map((r) => [r.sessionId, r.lastReadAt.getTime()]));

  // Count only messages newer than the user's last read per session.
  const result = {};
  for (const c of sessionIds) {
    const lastRead = readMap[c];
    const unreadCount = await prisma.chatMessage.count({
      where: {
        sessionId: c,
        senderId: { not: req.user.id },
        ...(lastRead ? { createdAt: { gt: new Date(lastRead) } } : {})
      }
    });
    if (unreadCount > 0) result[c] = unreadCount;
  }

  res.json(new ApiResponse(200, result, 'Unread counts'));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;
  const session = await assertParticipant(req.user.id, sessionId);

  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      senderId: req.user.id,
      content
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } }
    }
  });

  // Notify the other participant about the new message.
  const otherUserId = session.teacherId === req.user.id ? session.learnerId : session.teacherId;
  await createNotification({
    userId: otherUserId,
    type: 'message',
    title: 'New message',
    body: `${message.sender.name}: ${content.slice(0, 120)}`,
    link: `/dashboard/session/${sessionId}`
  });

  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

const proposeTime = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { proposedAt } = req.body;
  const session = await assertParticipant(req.user.id, sessionId);

  if (session.status !== 'PENDING' && session.status !== 'SCHEDULED') {
    throw new ApiError(400, 'Cannot propose a time for this session anymore');
  }

  const parsed = new Date(proposedAt);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, 'Invalid proposed time');
  }
  if (parsed.getTime() < Date.now()) {
    throw new ApiError(400, 'Proposed time must be in the future');
  }

  const proposal = await prisma.timeProposal.create({
    data: {
      sessionId,
      proposedById: req.user.id,
      proposedAt: parsed,
      status: 'PENDING'
    },
    include: {
      proposedBy: { select: { id: true, name: true } }
    }
  });

  // Notify the other party about the proposed time.
  const otherUserId = session.teacherId === req.user.id ? session.learnerId : session.teacherId;
  await createNotification({
    userId: otherUserId,
    type: 'proposal',
    title: 'New time proposal',
    body: `${proposal.proposedBy.name} proposed ${new Date(parsed).toLocaleString()}.`,
    link: `/dashboard/session/${sessionId}`
  });

  res.status(201).json(new ApiResponse(201, proposal, 'Time proposed'));
});

const respondToProposal = asyncHandler(async (req, res) => {
  const { sessionId, proposalId } = req.params;
  const { accept } = req.body;
  await assertParticipant(req.user.id, sessionId);

  const proposal = await prisma.timeProposal.findUnique({ where: { id: proposalId } });
  if (!proposal || proposal.sessionId !== sessionId) {
    throw new ApiError(404, 'Proposal not found');
  }
  if (proposal.proposedById === req.user.id) {
    throw new ApiError(400, 'You cannot respond to your own proposal');
  }
  if (proposal.status !== 'PENDING') {
    throw new ApiError(400, 'Proposal already responded to');
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  const result = await prisma.$transaction(async (tx) => {
    if (accept) {
      // Mark all other pending proposals declined, accept this one, schedule session.
      await tx.timeProposal.updateMany({
        where: { sessionId, status: 'PENDING' },
        data: { status: 'DECLINED' }
      });
      await tx.timeProposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED', respondedById: req.user.id, respondedAt: new Date() }
      });

      // Escrow credits for credit-paid sessions when they haven't been reserved
      // yet (mirrors acceptSession so credit-paid sessions are never scheduled
      // without a reserve).
      let creditsReserved = session.creditsReserved ?? 0;
      if (session.mode === 'CREDITS' && creditsReserved === 0) {
        const cost = sessionCost(session.durationMinutes ?? 60);
        await reserveCredits(tx, { learnerId: session.learnerId, amount: cost });
        creditsReserved = cost;
      }

      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          scheduledAt: proposal.proposedAt,
          status: 'SCHEDULED',
          meetingLink: session.meetingLink || `peersy-${sessionId}`,
          creditsReserved
        }
      });
      return { proposal: { id: proposalId, status: 'ACCEPTED' }, session: updatedSession };
    }

    await tx.timeProposal.update({
      where: { id: proposalId },
      data: { status: 'DECLINED', respondedById: req.user.id, respondedAt: new Date() }
    });
    return { proposal: { id: proposalId, status: 'DECLINED' }, session };
  });

  if (accept) {
    try {
      const withParticipants = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          teacher: { select: { name: true, email: true } },
          learner: { select: { name: true, email: true } }
        }
      });
      const learner = withParticipants?.learner;
      if (learner?.email) {
        await sendSessionScheduledEmail({
          learnerEmail: learner.email,
          learnerName: learner.name,
          teacherName: withParticipants?.teacher?.name,
          skillName: session.topic,
          scheduledAt: proposal.proposedAt,
          meetingLink: withParticipants?.meetingLink
        });
      }
      await createNotification({
        userId: proposal.proposedById,
        type: 'session_accepted',
        title: 'Time agreed',
        body: `Your proposed time ${new Date(proposal.proposedAt).toLocaleString()} was accepted.`,
        link: `/dashboard/session/${sessionId}`
      });
    } catch (mailError) {
      console.error('Failed to send scheduled email:', mailError);
    }
  }

  res.json(new ApiResponse(200, result, accept ? 'Time agreed. Session scheduled!' : 'Proposal declined'));
});

const getProposals = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  await assertParticipant(req.user.id, sessionId);

  const proposals = await prisma.timeProposal.findMany({
    where: { sessionId },
    include: {
      proposedBy: { select: { id: true, name: true } },
      respondedBy: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(new ApiResponse(200, proposals, 'Proposals fetched'));
});

export { getMessages, getUnreadCounts, sendMessage, proposeTime, respondToProposal, getProposals };
