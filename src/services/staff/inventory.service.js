import { ApiError } from '../../utils/ApiError.js';
import { outletInventoryRepository } from '../../repositories/outlet-inventory.repository.js';
import { outletMenuRepository } from '../../repositories/outlet-menu.repository.js';

export const staffInventoryService = {
  async listInventory(outletId) {
    return outletInventoryRepository.findAllByOutlet(outletId);
  },

  async addStock(outletId, { menuId, stock }) {
    const assignment = await outletMenuRepository.findByOutletAndMenu(outletId, menuId);
    if (!assignment) {
      throw new ApiError(400, 'This menu item is not assigned to your outlet');
    }

    const existing = await outletInventoryRepository.findByOutletAndMenu(outletId, menuId);
    if (existing) {
      throw new ApiError(409, 'Inventory already exists for this menu item');
    }

    return outletInventoryRepository.create({ outletId, menuId, stock });
  },

  async updateStock(outletId, menuId, stock) {
    const existing = await outletInventoryRepository.findByOutletAndMenu(outletId, menuId);
    if (!existing) {
      throw new ApiError(404, 'Inventory record not found for this menu item');
    }

    return outletInventoryRepository.updateStock(outletId, menuId, stock);
  },
};
