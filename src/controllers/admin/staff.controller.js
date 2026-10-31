import { staffService } from '../../services/admin/staff.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const staffController = {
  create: asyncHandler(async (req, res) => {
    const staff = await staffService.createStaff(req.body);
    successResponse(res, 201, 'Staff created', { staff });
  }),

  list: asyncHandler(async (req, res) => {
    const result = await staffService.listStaff(req.query);
    successResponse(res, 200, 'Staff retrieved', result);
  }),

  update: asyncHandler(async (req, res) => {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    successResponse(res, 200, 'Staff updated', { staff });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const staff = await staffService.updateStaffStatus(req.params.id, req.body.status);
    successResponse(res, 200, 'Staff status updated', { staff });
  }),

  remove: asyncHandler(async (req, res) => {
    await staffService.deleteStaff(req.params.id);
    successResponse(res, 200, 'Staff deleted', null);
  }),
};
