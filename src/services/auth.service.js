import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { userRepository } from '../repositories/user.repository.js';
import { toSafeUser } from '../utils/sanitizeUser.js';

function generateToken(user) {
  return jwt.sign({ role: user.role, outletId: user.outletId }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  });
}

export const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Same generic message as a wrong password — don't reveal account
    // state to an unauthenticated request.
    if (user.status !== 'active') {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user);
    return { token, user: toSafeUser(user) };
  },

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return toSafeUser(user);
  },
};
