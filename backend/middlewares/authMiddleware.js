import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
      return res.status(401).json(new ApiResponse(401, null, "Unauthorized request"));
  }

  jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'skillswap-api',
    audience: 'skillswap-client'
  }, (err, user) => {
    if (err) {
        return res.status(403).json(new ApiResponse(403, null, "Invalid token"));
    }
    req.user = user;
    next();
  });
};
