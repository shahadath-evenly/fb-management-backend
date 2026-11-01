import { menuService } from '../../services/admin/menu.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';

export const menuController = {
  create: asyncHandler(async (req, res) => {
    const menu = await menuService.createMenu(req.body);
    successResponse(res, 201, 'Menu item created', { menu });
  }),

  list: asyncHandler(async (req, res) => {
    const result = await menuService.listMenus(req.query);
    successResponse(res, 200, 'Menu items retrieved', result);
  }),

  update: asyncHandler(async (req, res) => {
    const menu = await menuService.updateMenu(req.params.id, req.body);
    successResponse(res, 200, 'Menu item updated', { menu });
  }),

  remove: asyncHandler(async (req, res) => {
    await menuService.deleteMenu(req.params.id);
    successResponse(res, 200, 'Menu item deleted', null);
  }),
};
