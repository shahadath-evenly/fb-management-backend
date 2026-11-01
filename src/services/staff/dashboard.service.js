import { staffDashboardRepository } from '../../repositories/staff-dashboard.repository.js';
import { LOW_STOCK_THRESHOLD } from '../../config/constants.js';

export const staffDashboardService = {
  async getSummary(outletId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [outlet, assignedMenuCount, inventoryItemCount, lowStockCount, todaysSales] = await Promise.all([
      staffDashboardRepository.findOutletName(outletId),
      staffDashboardRepository.countAssignedMenuItems(outletId),
      staffDashboardRepository.countInventoryItems(outletId),
      staffDashboardRepository.countLowStockItems(outletId, LOW_STOCK_THRESHOLD),
      staffDashboardRepository.todaysSalesSummary(outletId, startOfDay),
    ]);

    return {
      outletName: outlet?.name ?? null,
      assignedMenuCount,
      inventoryItemCount,
      lowStockCount,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      todaysSalesCount: todaysSales.count,
      todaysRevenue: todaysSales.revenue,
    };
  },
};
