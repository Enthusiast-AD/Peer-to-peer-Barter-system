import express from 'express';
import { getDashboard, listUsers, toggleBan, resetWarnings, listSessions, listReports, reviewReport } from '../controllers/adminController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { param, validationResult } from 'express-validator';

const router = express.Router();
router.use(verifyJWT);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  next();
};

router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.get('/sessions', listSessions);
router.get('/reports', listReports);
router.put('/reports/:reportId/review', [param('reportId').isUUID().withMessage('Invalid id')], handleValidation, reviewReport);
router.put('/users/:userId/ban', [param('userId').isUUID().withMessage('Invalid id')], handleValidation, toggleBan);
router.put('/users/:userId/reset-warnings', [param('userId').isUUID().withMessage('Invalid id')], handleValidation, resetWarnings);

export default router;
