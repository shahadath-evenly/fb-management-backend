import { prisma } from '../config/database.js';

export const reportRepository = {
  findAllOutlets() {
    return prisma.outlet.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  },

  sumRevenueByOutlet() {
    return prisma.sale.groupBy({
      by: ['outletId'],
      _sum: { totalAmount: true },
    });
  },

  topSellingItemsForOutlet(outletId, limit) {
    return prisma.saleItem.groupBy({
      by: ['menuId'],
      where: { sale: { outletId } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
  },

  findMenuNamesByIds(menuIds) {
    return prisma.masterMenu.findMany({
      where: { id: { in: menuIds } },
      select: { id: true, name: true },
    });
  },
};
