import { ApiError } from '../../utils/ApiError.js';
import { menuRepository } from '../../repositories/menu.repository.js';

export const menuService = {
  async createMenu({ name, basePrice }) {
    return menuRepository.create({ name, basePrice });
  },

  async listMenus() {
    return menuRepository.findAll();
  },

  async updateMenu(id, { name, basePrice }) {
    const existing = await menuRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Menu item not found');
    }
    return menuRepository.update(id, { name, basePrice });
  },

  async deleteMenu(id) {
    const existing = await menuRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Menu item not found');
    }

    try {
      await menuRepository.remove(id);
    } catch (err) {
      if (err.code === 'P2003') {
        throw new ApiError(
          409,
          'Cannot delete this menu item: it is assigned to an outlet, has inventory, or has sales history.',
        );
      }
      throw err;
    }
  },
};
