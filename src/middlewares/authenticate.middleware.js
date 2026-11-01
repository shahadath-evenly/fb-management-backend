import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { userRepository } from '../repositories/user.repository.js';

// Re-checks the user against the database on every request, not just
// at login. A JWT is valid for 14 days, so without this, deactivating
// a user (or changing a staff member's outlet) would have no effect
// until that token expired. req.user is built from this fresh DB row,
// not the token's payload, so role/outletId can never go stale either.
export async function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  try {
    const user = await userRepository.findById(payload.sub);
    if (!user || user.status !== 'active') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }

    req.user = {
      id: user.id,
      role: user.role,
      outletId: user.outletId,
    };
    next();
  } catch (err) {
    next(err);
  }
}
