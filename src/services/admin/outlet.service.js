import { ApiError } from '../../utils/ApiError.js';
import { outletRepository } from '../../repositories/outlet.repository.js';

export const outletService = {
  async createOutlet(name) {
    return outletRepository.createWithReceiptCounter(name);
  },

  async listOutlets() {
    return outletRepository.findAll();
  },

  async updateOutlet(id, name) {
    const existing = await outletRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Outlet not found');
    }
    return outletRepository.update(id, name);
  },
};
