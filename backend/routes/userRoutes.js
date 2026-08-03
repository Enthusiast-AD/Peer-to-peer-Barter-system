import express from 'express';
import { body, validationResult } from 'express-validator';
import { getProfile, updateProfile, getPublicProfile, changePassword } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { updateProfileValidation, userIdParamValidation } from '../middlewares/validation.js';

const router = express.Router();

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('New password must contain a letter')
    .matches(/[0-9]/).withMessage('New password must contain a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
    next();
  }
];

router.get('/profile', verifyJWT, getProfile);
router.put('/profile', verifyJWT, updateProfileValidation, updateProfile);
router.put('/profile/password', verifyJWT, changePasswordValidation, changePassword);
router.get('/:userId/public', verifyJWT, userIdParamValidation, getPublicProfile);

export default router;
