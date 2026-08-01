import express from 'express';
import { getProfile, updateProfile, getPublicProfile } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { updateProfileValidation } from '../middlewares/validation.js';

const router = express.Router();

router.get('/profile', verifyJWT, getProfile);
router.put('/profile', verifyJWT, updateProfileValidation, updateProfile);
router.get('/:userId/public', verifyJWT, getPublicProfile);

export default router;
