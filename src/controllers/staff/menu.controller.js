import { staffMenuService } from '../../services/staff/menu.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const staffMenuController = {
  list: asyncHandler(async (req, res) => {
    const result = await staffMenuService.getAssignedMenu(req.user.outletId, req.query);
    successResponse(res, 200, 'Assigned menu retrieved', result);
  }),
};
