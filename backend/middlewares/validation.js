import { body, param, validationResult } from 'express-validator';

const PASSWORD_MIN = 8;

// Helper: run validators and surface errors as a single 400 response
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      success: false,
      message: messages[0],
      errors: messages
    });
  }
  next();
};

// Validates that URL path params are real UUIDs to avoid Prisma 500s.
const uuidParam = (name) => param(name).isUUID().withMessage('Invalid id format');

export const userIdParamValidation = [uuidParam('userId'), validate];
export const sessionIdParamValidation = [uuidParam('sessionId'), validate];
export const sessionIdPathValidation = [uuidParam('id'), validate];
export const proposalIdParamValidation = [uuidParam('proposalId'), validate];

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN }).withMessage(`Password must be at least ${PASSWORD_MIN} characters`)
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  validate
];

export const loginValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

export const updateProfileValidation = [
  body('bio')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
  body('skillsToTeach')
    .optional()
    .isArray({ max: 30 }).withMessage('Skills to teach must be an array of at most 30 items')
    .custom((arr) => (arr ?? []).every((s) => typeof s === 'string' && s.trim().length <= 50))
    .withMessage('Each skill must be a string of at most 50 characters'),
  body('skillsToLearn')
    .optional()
    .isArray({ max: 30 }).withMessage('Skills to learn must be an array of at most 30 items')
    .custom((arr) => (arr ?? []).every((s) => typeof s === 'string' && s.trim().length <= 50))
    .withMessage('Each skill must be a string of at most 50 characters'),
  validate
];

export const createSessionValidation = [
  body('teacherId')
    .notEmpty().withMessage('teacherId is required')
    .isUUID().withMessage('Invalid teacherId'),
  body('skillId')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid skillId'),
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required')
    .isLength({ max: 200 }).withMessage('Topic must be at most 200 characters'),
  body('scheduledAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('scheduledAt must be a valid date'),
  body('durationMinutes')
    .optional()
    .isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('mode')
    .optional()
    .isIn(['BARTER', 'CREDITS']).withMessage('Mode must be BARTER or CREDITS'),
  validate
];

export const updateSessionValidation = [
  body('status')
    .optional()
    .isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status value'),
  body('scheduledAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('scheduledAt must be a valid date'),
  body('actualDuration')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 600 }).withMessage('actualDuration must be between 0 and 600 minutes'),
  validate
];

export const reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters'),
  validate
];
