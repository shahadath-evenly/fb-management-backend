import { outletService } from '../../services/admin/outlet.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const outletController = {
  create: asyncHandler(async (req, res) => {
    const outlet = await outletService.createOutlet(req.body.name);
    successResponse(res, 201, 'Outlet created', { outlet });
  }),

  list: asyncHandler(async (req, res) => {
    const result = await outletService.listOutlets(req.query);
    successResponse(res, 200, 'Outlets retrieved', result);
  }),

  update: asyncHandler(async (req, res) => {
    const outlet = await outletService.updateOutlet(req.params.id, req.body.name);
    successResponse(res, 200, 'Outlet updated', { outlet });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const outlet = await outletService.updateOutletStatus(req.params.id, req.body.status);
    successResponse(res, 200, 'Outlet status updated', { outlet });
  }),

  remove: asyncHandler(async (req, res) => {
    await outletService.deleteOutlet(req.params.id);
    successResponse(res, 200, 'Outlet deleted', null);
  }),
};
