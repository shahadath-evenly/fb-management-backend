import { outletMenuRepository } from '../../repositories/outlet-menu.repository.js';

export const staffMenuService = {
  async getAssignedMenu(outletId) {
    const assignments = await outletMenuRepository.findAll({ outletId });
    return assignments.map((assignment) => ({
      id: assignment.menu.id,
      name: assignment.menu.name,
      price: assignment.price,
    }));
  },
};
