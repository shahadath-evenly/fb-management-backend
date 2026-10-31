import { staffMenuService } from '../../services/staff/menu.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const staffMenuController = {
  list: asyncHandler(async (req, res) => {
    const menu = await staffMenuService.getAssignedMenu(req.user.outletId);
    successResponse(res, 200, 'Assigned menu retrieved', { menu });
  }),
};
