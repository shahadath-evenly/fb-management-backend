import { outletMenuRepository } from '../../repositories/outlet-menu.repository.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

export const staffMenuService = {
  async getAssignedMenu(outletId, { page, limit, search }) {
    const { items, total } = await outletMenuRepository.findAllPaginated({
      page,
      limit,
      search,
      outletId,
    });

    return {
      items: items.map((assignment) => ({
        id: assignment.menu.id,
        name: assignment.menu.name,
        price: assignment.price,
      })),
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },
};
