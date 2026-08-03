import jwt from 'jsonwebtoken';
import { prisma } from '../db/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
      return res.status(401).json(new ApiResponse(401, null, "Unauthorized request"));
  }

  jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'peersy-api',
    audience: 'peersy-client'
  }, async (err, payload) => {
    if (err) {
        return res.status(403).json(new ApiResponse(403, null, "Invalid token"));
    }
    // Re-validate the account on every request so bans and deletions take
    // effect immediately instead of waiting for the JWT to expire.
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, banned: true }
      });
      if (!user) {
        return res.status(401).json(new ApiResponse(401, null, "Account no longer exists"));
      }
      if (user.banned) {
        return res.status(403).json(new ApiResponse(403, null, "Your account has been suspended"));
      }
    } catch (dbError) {
      return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
    req.user = payload;
    next();
  });
};
