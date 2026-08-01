import rateLimit from 'express-rate-limit';

// Global API limiter - applied to every request
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Stricter limiter for authentication endpoints (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts. Please try again in 15 minutes.'
  }
});

// Stricter limiter for session creation (spam/abuse protection)
export const sessionRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many session requests. Please try again later.'
  }
});
