import { Prisma } from '@prisma/client';
import { reportRepository } from '../../repositories/report.repository.js';

const TOP_ITEMS_LIMIT = 5;

export const reportService = {
  async revenueByOutlet() {
    const outlets = await reportRepository.findAllOutlets();
    const sums = await reportRepository.sumRevenueByOutlet();
    const revenueByOutletId = new Map(sums.map((sum) => [sum.outletId, sum._sum.totalAmount]));

    return outlets.map((outlet) => ({
      outletId: outlet.id,
      outletName: outlet.name,
      totalRevenue: revenueByOutletId.get(outlet.id) ?? new Prisma.Decimal(0),
    }));
  },

  async topSellingItemsByOutlet() {
    const outlets = await reportRepository.findAllOutlets();

    return Promise.all(
      outlets.map(async (outlet) => {
        const grouped = await reportRepository.topSellingItemsForOutlet(outlet.id, TOP_ITEMS_LIMIT);
        const menus = await reportRepository.findMenuNamesByIds(grouped.map((g) => g.menuId));
        const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));

        return {
          outletId: outlet.id,
          outletName: outlet.name,
          topItems: grouped.map((g) => ({
            menuId: g.menuId,
            menuName: menuNameById.get(g.menuId),
            quantitySold: g._sum.quantity,
          })),
        };
      }),
    );
  },
};
