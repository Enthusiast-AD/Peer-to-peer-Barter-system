import express from 'express';
import { getNotifications, getUnreadCount, markAllRead, markRead } from '../controllers/notificationController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { param, validationResult } from 'express-validator';

const router = express.Router();
router.use(verifyJWT);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  next();
};

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', [param('id').isUUID().withMessage('Invalid id')], handleValidation, markRead);

export default router;
