import { prisma } from '../config/database.js';

export const outletInventoryRepository = {
  findAllByOutlet(outletId) {
    return prisma.outletInventory.findMany({
      where: { outletId },
      include: { menu: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
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
