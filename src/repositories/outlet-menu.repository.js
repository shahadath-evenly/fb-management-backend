import { prisma } from '../config/database.js';
import { getPaginationArgs } from '../utils/pagination.js';

export const outletMenuRepository = {
  // Used by the staff-facing "my outlet's menu" endpoint (Phase 10) —
  // intentionally unpaginated, a single outlet's assigned items only.
  findAll({ outletId, menuId } = {}) {
    return prisma.outletMenu.findMany({
      where: {
        ...(outletId ? { outletId } : {}),
        ...(menuId ? { menuId } : {}),
      },
      include: {
        outlet: { select: { id: true, name: true } },
        menu: { select: { id: true, name: true, basePrice: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Used by the admin assignments listing — paginated, with search
  // across both the outlet's and the menu item's name.
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
