import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import { connectDB } from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import './passport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Fail fast if critical secrets are missing or weak
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('your_jwt_secret')) {
  console.error('CRITICAL: JWT_SECRET is missing, too short (<32 chars), or is the default value. Set a strong secret before going to production.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to start: weak JWT_SECRET in production');
  }
}

// Trust proxy is required for Render/Vercel/Heroku to correctly identify protocol (http vs https)
app.set('trust proxy', 1);

// Security headers (CSP, X-Frame-Options, HSTS, etc.)
app.use(helmet({
  contentSecurityPolicy: false, // API only - no HTML pages served
}));

// Hardened CORS - only allow explicitly configured origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin) return callback(null, true);
      // Only allow explicitly configured origins; otherwise omit CORS headers
      // so the browser blocks the request (no 500, no accidental leaks).
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Protect against crashing on invalid JSON payloads
app.use(express.json({ limit: '100kb', strict: true }));

// Apply global rate limit to all /api routes
app.use('/api', apiLimiter);

app.use(passport.initialize());

connectDB().catch((error) => {
  console.error('FATAL: Failed to connect to the database:', error.message);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    // CORS rejection (origin not allowed)
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
    }
    // JSON parse errors
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    // Body too large
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Payload too large' });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Never leak stack traces to clients
    if (statusCode >= 500) {
        console.error('Unhandled error:', err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        errors: Array.isArray(err.errors) ? err.errors : []
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
