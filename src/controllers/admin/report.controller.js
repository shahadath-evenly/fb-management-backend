import { reportService } from '../../services/admin/report.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const reportController = {
  revenueByOutlet: asyncHandler(async (req, res) => {
    const report = await reportService.revenueByOutlet();
    successResponse(res, 200, 'Revenue by outlet retrieved', { report });
  }),

  topSellingItems: asyncHandler(async (req, res) => {
    const report = await reportService.topSellingItemsByOutlet();
    successResponse(res, 200, 'Top selling items retrieved', { report });
  }),
};
