import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    successResponse(res, 200, 'Login successful', { token, user });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    successResponse(res, 200, 'Current user retrieved', { user });
  }),
};
