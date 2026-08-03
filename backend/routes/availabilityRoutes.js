import express from 'express';
import { getMySlots, getUserSlots, addSlot, deleteSlot, replaceAllSlots } from '../controllers/availabilityController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();
router.use(verifyJWT);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array().map((e) => e.msg) });
  next();
};

router.get('/mine', getMySlots);
router.get('/user/:userId', [param('userId').isUUID().withMessage('Invalid id')], handleValidation, getUserSlots);
router.post(
  '/',
  [
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be 0-6'),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startTime must be a valid HH:mm time'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endTime must be a valid HH:mm time')
  ],
  handleValidation,
  addSlot
);
router.put('/', [body('slots').isArray().withMessage('slots must be an array')], handleValidation, replaceAllSlots);
router.delete('/:id', [param('id').isUUID().withMessage('Invalid id')], handleValidation, deleteSlot);

export default router;
