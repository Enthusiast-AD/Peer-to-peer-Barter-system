import express from 'express';
import { searchSkills } from '../controllers/skillController.js';
import { query } from 'express-validator';
import { validationResult } from 'express-validator';

const router = express.Router();

router.get('/search',
  [
    query('query')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Query is too long'),
    query('type')
      .optional()
      .isIn(['TEACH', 'LEARN']).withMessage('Invalid type')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array().map((e) => e.msg)
      });
    }
    next();
  },
  searchSkills
);

export default router;
