import { prisma } from '../config/database.js';
import { getPaginationArgs } from '../utils/pagination.js';

export const outletMenuRepository = {
  // Used by both the admin assignments listing and the staff-facing
  // "my outlet's menu" endpoint — paginated, with search across the
  // outlet's and/or the menu item's name.
  async findAllPaginated({ page, limit, search, outletId, menuId }) {
    const where = {
      ...(outletId ? { outletId } : {}),
      ...(menuId ? { menuId } : {}),
      ...(search
        ? {
            OR: [
              { outlet: { name: { contains: search, mode: 'insensitive' } } },
              { menu: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.outletMenu.findMany({
        where,
        include: {
          outlet: { select: { id: true, name: true } },
          menu: { select: { id: true, name: true, basePrice: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...getPaginationArgs({ page, limit }),
      }),
      prisma.outletMenu.count({ where }),
    ]);

    return { items, total };
  },

  findById(id) {
    return prisma.outletMenu.findUnique({ where: { id } });
  },

  findByOutletAndMenu(outletId, menuId) {
    return prisma.outletMenu.findUnique({
      where: { outletId_menuId: { outletId, menuId } },
    });
  },

  create({ outletId, menuId, price }) {
    return prisma.outletMenu.create({ data: { outletId, menuId, price } });
  },

  updatePrice(id, price) {
    return prisma.outletMenu.update({ where: { id }, data: { price } });
  },

  remove(id) {
    return prisma.outletMenu.delete({ where: { id } });
  },
};
