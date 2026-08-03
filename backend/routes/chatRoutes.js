import express from 'express';
import { getMessages, sendMessage, proposeTime, respondToProposal, getProposals } from '../controllers/chatController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

router.use(verifyJWT);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => e.msg)
    });
  }
  next();
};

router.get('/:sessionId/messages', [param('sessionId').isUUID().withMessage('Invalid id format')], handleValidation, getMessages);
router.post('/:sessionId/messages',
  [param('sessionId').isUUID().withMessage('Invalid id format'), body('content').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message too long')],
  handleValidation,
  sendMessage
);
router.get('/:sessionId/proposals', [param('sessionId').isUUID().withMessage('Invalid id format')], handleValidation, getProposals);
router.post('/:sessionId/proposals',
  [param('sessionId').isUUID().withMessage('Invalid id format'), body('proposedAt').notEmpty().withMessage('proposedAt is required').isISO8601().withMessage('Invalid proposed time')],
  handleValidation,
  proposeTime
);
router.post('/:sessionId/proposals/:proposalId/respond',
  [param('sessionId').isUUID().withMessage('Invalid id format'), param('proposalId').isUUID().withMessage('Invalid proposal id'), body('accept').isBoolean().withMessage('accept must be true or false')],
  handleValidation,
  respondToProposal
);

export default router;
