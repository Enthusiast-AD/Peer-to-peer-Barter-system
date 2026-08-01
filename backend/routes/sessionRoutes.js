import express from 'express';
import { createSessionRequest, getMySessions, updateSessionStatus, addReview, generateJitsiToken } from '../controllers/sessionController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { sessionRequestLimiter } from '../middlewares/rateLimiter.js';
import { createSessionValidation, updateSessionValidation, reviewValidation } from '../middlewares/validation.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/request', sessionRequestLimiter, createSessionValidation, createSessionRequest);
router.get('/', getMySessions);
router.put('/:id', updateSessionValidation, updateSessionStatus);
router.put('/:id/status', updateSessionValidation, updateSessionStatus);
router.post('/:sessionId/review', reviewValidation, addReview);
router.get('/:sessionId/token', generateJitsiToken);

export default router;
