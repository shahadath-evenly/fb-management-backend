import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export const staffDashboardRepository = {
  findOutletName(outletId) {
    return prisma.outlet.findUnique({ where: { id: outletId }, select: { name: true } });
  },

  countAssignedMenuItems(outletId) {
    return prisma.outletMenu.count({ where: { outletId } });
  },

  countInventoryItems(outletId) {
    return prisma.outletInventory.count({ where: { outletId } });
  },

  countLowStockItems(outletId, threshold) {
    return prisma.outletInventory.count({ where: { outletId, stock: { lte: threshold } } });
  },

  async todaysSalesSummary(outletId, startOfDay) {
    const result = await prisma.sale.aggregate({
      where: { outletId, createdAt: { gte: startOfDay } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    return {
      count: result._count._all,
      revenue: result._sum.totalAmount ?? new Prisma.Decimal(0),
    };
  },
};
