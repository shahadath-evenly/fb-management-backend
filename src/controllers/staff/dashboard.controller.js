import { staffDashboardService } from '../../services/staff/dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const staffDashboardController = {
  summary: asyncHandler(async (req, res) => {
    const summary = await staffDashboardService.getSummary(req.user.outletId);
    successResponse(res, 200, 'Dashboard summary retrieved', { summary });
  }),
};
