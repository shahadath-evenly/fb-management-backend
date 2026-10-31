import { ApiError } from '../../utils/ApiError.js';
import { outletRepository } from '../../repositories/outlet.repository.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

export const outletService = {
  async createOutlet(name) {
    return outletRepository.createWithReceiptCounter(name);
  },

  async listOutlets({ page, limit, search, status }) {
    const { items, total } = await outletRepository.findAllPaginated({ page, limit, search, status });
    return { items, pagination: buildPaginationMeta({ page, limit, total }) };
  },

  async updateOutlet(id, name) {
    const existing = await outletRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Outlet not found');
    }
    return outletRepository.update(id, name);
  },

  async updateOutletStatus(id, status) {
    const existing = await outletRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Outlet not found');
    }
    return outletRepository.updateStatus(id, status);
  },

  async deleteOutlet(id) {
    const existing = await outletRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Outlet not found');
    }

    try {
      await outletRepository.remove(id);
    } catch (err) {
      if (err.code === 'P2003') {
        throw new ApiError(
          409,
          'Cannot delete this outlet: it has staff, menu assignments, inventory, or sales history.',
        );
      }
      throw err;
    }
  },
};
