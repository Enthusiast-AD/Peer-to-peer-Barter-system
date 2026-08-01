import express from 'express';
import passport from 'passport';
import { register, login, googleAuthCallback } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { registerValidation, loginValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleAuthCallback
);

export default router;
