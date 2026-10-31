import { staffSaleService } from '../../services/staff/sale.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const staffSaleController = {
  create: asyncHandler(async (req, res) => {
    const sale = await staffSaleService.createSale(req.user.outletId, req.body.items);
    successResponse(res, 201, 'Sale completed', { sale });
  }),
};
