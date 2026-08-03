import express from 'express';
import { createSessionRequest, getMySessions, getSessionById, acceptSession, updateSessionStatus, recordJoin, recordLeave, reportNoShow, addReview, generateLiveKitToken } from '../controllers/sessionController.js';
import { getUnreadCounts } from '../controllers/chatController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { sessionRequestLimiter } from '../middlewares/rateLimiter.js';
import { createSessionValidation, updateSessionValidation, reviewValidation, sessionIdPathValidation, sessionIdParamValidation } from '../middlewares/validation.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/request', sessionRequestLimiter, createSessionValidation, createSessionRequest);
router.get('/', getMySessions);
router.get('/unread-counts', getUnreadCounts);
router.get('/:id', sessionIdPathValidation, getSessionById);
router.put('/:id/accept', sessionIdPathValidation, updateSessionValidation, acceptSession);
router.put('/:id', sessionIdPathValidation, updateSessionValidation, updateSessionStatus);
router.put('/:id/status', sessionIdPathValidation, updateSessionValidation, updateSessionStatus);
router.post('/:sessionId/review', sessionIdParamValidation, reviewValidation, addReview);
router.get('/:sessionId/token', sessionIdParamValidation, generateLiveKitToken);
router.post('/:id/join', sessionIdPathValidation, recordJoin);
router.post('/:id/leave', sessionIdPathValidation, recordLeave);
router.post('/:id/no-show', sessionIdPathValidation, reportNoShow);

export default router;
