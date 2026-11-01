import { ApiError } from '../../utils/ApiError.js';
import { outletMenuRepository } from '../../repositories/outlet-menu.repository.js';
import { outletRepository } from '../../repositories/outlet.repository.js';
import { menuRepository } from '../../repositories/menu.repository.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

export const menuAssignmentService = {
  async createAssignment({ outletId, menuId, price }) {
    const outlet = await outletRepository.findById(outletId);
    if (!outlet) {
      throw new ApiError(400, 'Outlet does not exist');
    }

    const menu = await menuRepository.findById(menuId);
    if (!menu) {
      throw new ApiError(400, 'Menu item does not exist');
    }

    const existing = await outletMenuRepository.findByOutletAndMenu(outletId, menuId);
    if (existing) {
      throw new ApiError(409, 'This menu item is already assigned to this outlet');
    }

    return outletMenuRepository.create({ outletId, menuId, price });
  },

  async listAssignments({ page, limit, search, outletId, menuId }) {
    const { items, total } = await outletMenuRepository.findAllPaginated({
      page,
      limit,
      search,
      outletId,
      menuId,
    });
    return { items, pagination: buildPaginationMeta({ page, limit, total }) };
  },

  async updatePrice(id, price) {
    const existing = await outletMenuRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Assignment not found');
    }
    return outletMenuRepository.updatePrice(id, price);
  },

  async removeAssignment(id) {
    const existing = await outletMenuRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Assignment not found');
    }
    await outletMenuRepository.remove(id);
  },
};
