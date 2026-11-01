import { prisma } from '../config/database.js';
import { getPaginationArgs } from '../utils/pagination.js';

export const outletInventoryRepository = {
  async findAllByOutletPaginated({ outletId, page, limit, search }) {
    const where = {
      outletId,
      ...(search ? { menu: { name: { contains: search, mode: 'insensitive' } } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.outletInventory.findMany({
        where,
        include: { menu: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        ...getPaginationArgs({ page, limit }),
      }),
      prisma.outletInventory.count({ where }),
    ]);

    return { items, total };
  },

  findByOutletAndMenu(outletId, menuId) {
    return prisma.outletInventory.findUnique({
      where: { outletId_menuId: { outletId, menuId } },
    });
  },

  create({ outletId, menuId, stock }) {
    return prisma.outletInventory.create({ data: { outletId, menuId, stock } });
  },

  updateStock(outletId, menuId, stock) {
    return prisma.outletInventory.update({
      where: { outletId_menuId: { outletId, menuId } },
      data: { stock },
    });
  },
};
