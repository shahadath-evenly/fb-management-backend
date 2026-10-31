import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      role: payload.role,
      outletId: payload.outletId ?? null,
    };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
