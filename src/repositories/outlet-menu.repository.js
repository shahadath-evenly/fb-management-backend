import { prisma } from '../config/database.js';

export const outletMenuRepository = {
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
