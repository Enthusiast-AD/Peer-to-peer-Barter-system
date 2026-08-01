import { Session, User, Skill, Review } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSessionScheduledEmail } from '../services/mailService.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const createSessionRequest = asyncHandler(async (req, res) => {
  const { teacherId, skillId, topic, scheduledAt, durationMinutes } = req.body;
  
  if (teacherId === req.user.id) {
      throw new ApiError(400, "You cannot request a session with yourself");
  }

  const session = await Session.create({
    learnerId: req.user.id,
    teacherId,
    skillId,
    topic,
    scheduledAt,
    durationMinutes,
    status: 'PENDING'
  });
  
  res.status(201).json(new ApiResponse(201, session, "Session requested successfully"));
});

const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.findAll({
    where: {
      [Op.or]: [{ learnerId: req.user.id }, { teacherId: req.user.id }]
    },
    include: [
      { model: User, as: 'teacher', attributes: ['name', 'id', 'avatar'] },
      { model: User, as: 'learner', attributes: ['name', 'id', 'avatar'] },
      { model: Skill, attributes: ['name'] }
    ],
    order: [['scheduledAt', 'DESC']]
  });
  
  res.json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
});

const updateSessionStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, actualDuration, scheduledAt } = req.body; // 'SCHEDULED', 'COMPLETED', 'CANCELLED'
    const session = await Session.findByPk(id);

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id) {
        throw new ApiError(403, "Unauthorized to update this session");
    }

    if (status === 'COMPLETED') {
        // Credit transfer must be atomic to avoid double-spending and negative balances.
        const transaction = await sequelize.transaction();
        try {
            const lockedSession = await Session.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });

            if (!lockedSession) {
                throw new ApiError(404, "Session not found");
            }
            if (lockedSession.status === 'COMPLETED') {
                throw new ApiError(400, "Session is already completed");
            }
            if (lockedSession.status === 'CANCELLED') {
                throw new ApiError(400, "Cannot complete a cancelled session");
            }

            const learner = await User.findByPk(lockedSession.learnerId, { transaction, lock: transaction.LOCK.UPDATE });
            const teacher = await User.findByPk(lockedSession.teacherId, { transaction, lock: transaction.LOCK.UPDATE });

            // Calculate credits based on duration (1 credit per minute, or 60 per hour)
            // Default to 60 if duration not provided or very short (minimum charge)
            const duration = actualDuration && actualDuration > 10 ? actualDuration : 60;
            const creditsToTransfer = duration; // 1 credit per minute logic

            // Never allow the learner to go negative
            if (!learner || learner.credits < creditsToTransfer) {
                throw new ApiError(400, "Learner has insufficient credits");
            }

            await learner.decrement('credits', { by: creditsToTransfer, transaction });
            await teacher.increment('credits', { by: creditsToTransfer, transaction });

            lockedSession.status = status;
            await lockedSession.save({ transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        res.json(new ApiResponse(200, await Session.findByPk(id), "Session status updated"));
        return;
    }

    if (status === 'SCHEDULED' && session.status !== 'SCHEDULED' && !session.meetingLink) {
        // Use Jitsi for instant, free meeting links without API setup
        session.meetingLink = `https://meet.jit.si/SkillSwap-${session.id}`;
    }

    if (status === 'SCHEDULED' && scheduledAt) {
        const parsedDate = new Date(scheduledAt);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new ApiError(400, 'Invalid scheduledAt date');
        }
        session.scheduledAt = parsedDate;
    }

    session.status = status;
    await session.save();

    if (status === 'SCHEDULED') {
        const sessionWithParticipants = await Session.findByPk(id, {
            include: [
                { model: User, as: 'teacher', attributes: ['name', 'id', 'email'] },
                { model: User, as: 'learner', attributes: ['name', 'id', 'email'] },
                { model: Skill, attributes: ['name'] }
            ]
        });

        if (sessionWithParticipants?.learner?.email) {
            try {
                await sendSessionScheduledEmail({
                    learnerEmail: sessionWithParticipants.learner.email,
                    learnerName: sessionWithParticipants.learner.name,
                    teacherName: sessionWithParticipants.teacher?.name,
                    skillName: sessionWithParticipants.Skill?.name,
                    scheduledAt: sessionWithParticipants.scheduledAt,
                    meetingLink: sessionWithParticipants.meetingLink
                });
            } catch (mailError) {
                console.error('Failed to send scheduled session email:', mailError);
            }
        }
    }
    
    res.json(new ApiResponse(200, session, "Session status updated"));
});

const addReview = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { rating, comment } = req.body;
    
    const session = await Session.findByPk(sessionId);
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

    const existingReview = await Review.findOne({ where: { sessionId } });
    if (existingReview) {
        throw new ApiError(409, "A review already exists for this session");
    }

    const review = await Review.create({
        sessionId,
        reviewerId: req.user.id,
        revieweeId,
        rating,
        comment
    });

    res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

const generateJitsiToken = asyncHandler(async (req, res) => {
    // Check if JaaS is configured (we check for the private key path)
    if (!process.env.JAAS_PRIVATE_KEY_PATH) {
        return res.json(new ApiResponse(200, { token: null }, "No JaaS keys configured, using public server"));
    }

    const { sessionId } = req.params;
    const user = req.user;
    
    // Check if user is part of session
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, "Session not found");
    
    if (session.teacherId !== user.id && session.learnerId !== user.id) {
        throw new ApiError(403, "Not authorized");
    }

    const now = new Date();
    const exp = Math.round(now.getTime() / 1000) + 7200; // 2 hours
    const nbf = Math.round(now.getTime() / 1000) - 10;

    // Base room name (without tenant prefix)
    const rawRoomName = `SkillSwap-${sessionId}`;
    // Scope the token to the specific room instead of '*' (no cross-room access)
    const finalRoomName = process.env.JAAS_APP_ID
      ? `${process.env.JAAS_APP_ID}/${rawRoomName}`
      : rawRoomName;

    // For JaaS, the payload must be carefully structured
    const payload = {
        context: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                moderator: true
            },
            features: {
                recording: true,
                livestreaming: true,
                transcription: true,
                outbound_call: true
            }
        },
        aud: 'jitsi',
        iss: 'chat',
        sub: process.env.JAAS_APP_ID,
        room: finalRoomName,
        exp: exp,
        nbf: nbf
    };

    let token;

    try {
        if (process.env.JAAS_PRIVATE_KEY_PATH) {
             const privateKey = fs.readFileSync(process.env.JAAS_PRIVATE_KEY_PATH);

             token = jwt.sign(payload, privateKey, {
                 algorithm: 'RS256',
                 header: { kid: process.env.JAAS_API_KEY_ID }
             });
        } else {
             token = null;
        }
    } catch (error) {
        console.error("Error signing Jitsi token:", error);
        token = null;
    }
    
    res.json(new ApiResponse(200, { token, roomName: finalRoomName }, "Token generated"));
});

export { createSessionRequest, getMySessions, updateSessionStatus, addReview, generateJitsiToken };
