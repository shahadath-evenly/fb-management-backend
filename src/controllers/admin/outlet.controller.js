import { outletService } from '../../services/admin/outlet.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const outletController = {
  create: asyncHandler(async (req, res) => {
    const outlet = await outletService.createOutlet(req.body.name);
    successResponse(res, 201, 'Outlet created', { outlet });
  }),

  list: asyncHandler(async (req, res) => {
    const outlets = await outletService.listOutlets();
    successResponse(res, 200, 'Outlets retrieved', { outlets });
  }),

  update: asyncHandler(async (req, res) => {
    const outlet = await outletService.updateOutlet(req.params.id, req.body.name);
    successResponse(res, 200, 'Outlet updated', { outlet });
  }),
};
