import express from 'express';
import { skillsRssFeed } from '../controllers/feedController.js';

const router = express.Router();

router.get('/skills.rss', skillsRssFeed);

export default router;
