import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const JWT_OPTIONS = {
  expiresIn: '24h',
  issuer: 'skillswap-api',
  audience: 'skillswap-client'
};

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  JWT_OPTIONS
);

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existedUser = await User.findOne({ where: { email } });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, credits: 60 });

  const token = signToken(user);

  res.status(201).json(
      new ApiResponse(201, { userId: user.id, token, user: { id: user.id, name: user.name, email: user.email, credits: user.credits } }, "User created successfully")
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  // Generic error to avoid user enumeration (don't reveal whether email exists)
  const INVALID_CREDENTIALS = new ApiError(401, "Invalid email or password");

  if (!user) {
      throw INVALID_CREDENTIALS;
  }

  if (!user.password && user.googleId) {
      throw new ApiError(400, "This account uses Google Sign-In. Please log in with Google.");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
      throw INVALID_CREDENTIALS;
  }

  const token = signToken(user);

  res.json(
      new ApiResponse(200, {
          token,
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
              credits: user.credits,
              avatar: user.avatar
          }
      }, "Login successful")
  );
});

const googleAuthCallback = asyncHandler(async (req, res) => {
    const user = req.user;
    const token = signToken(user);

    // Redirect to frontend with token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/oauth/callback?token=${token}`);
});

export { register, login, googleAuthCallback };
