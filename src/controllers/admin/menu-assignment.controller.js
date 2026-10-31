import { menuAssignmentService } from '../../services/admin/menu-assignment.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const menuAssignmentController = {
  create: asyncHandler(async (req, res) => {
    const assignment = await menuAssignmentService.createAssignment(req.body);
    successResponse(res, 201, 'Menu item assigned to outlet', { assignment });
  }),

  list: asyncHandler(async (req, res) => {
    const assignments = await menuAssignmentService.listAssignments(req.query);
    successResponse(res, 200, 'Assignments retrieved', { assignments });
  }),

  updatePrice: asyncHandler(async (req, res) => {
    const assignment = await menuAssignmentService.updatePrice(req.params.id, req.body.price);
    successResponse(res, 200, 'Outlet price updated', { assignment });
  }),

  remove: asyncHandler(async (req, res) => {
    await menuAssignmentService.removeAssignment(req.params.id);
    successResponse(res, 200, 'Menu item unassigned from outlet', null);
  }),
};
