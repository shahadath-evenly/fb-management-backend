import { staffInventoryService } from '../../services/staff/inventory.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const staffInventoryController = {
  list: asyncHandler(async (req, res) => {
    const inventory = await staffInventoryService.listInventory(req.user.outletId);
    successResponse(res, 200, 'Inventory retrieved', { inventory });
  }),

  addStock: asyncHandler(async (req, res) => {
    const inventory = await staffInventoryService.addStock(req.user.outletId, req.body);
    successResponse(res, 201, 'Stock added', { inventory });
  }),

  updateStock: asyncHandler(async (req, res) => {
    const inventory = await staffInventoryService.updateStock(
      req.user.outletId,
      req.params.menuId,
      req.body.stock,
    );
    successResponse(res, 200, 'Stock updated', { inventory });
  }),
};
