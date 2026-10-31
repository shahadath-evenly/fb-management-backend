import { ApiError } from "../../utils/ApiError.js";
import { saleRepository } from "../../repositories/sale.repository.js";

// "Prevent duplicate menu IDs in a request or normalize
// them by summing quantities before processing." We normalize: two
// lines for the same menuId become one line with the combined
// quantity, so the sale ends up with exactly one SaleItem per
// distinct menu item.
function normalizeItems(items) {
  const quantityByMenuId = new Map();
  for (const { menuId, quantity } of items) {
    quantityByMenuId.set(
      menuId,
      (quantityByMenuId.get(menuId) || 0) + quantity,
    );
  }
  return Array.from(quantityByMenuId, ([menuId, quantity]) => ({
    menuId,
    quantity,
  }));
}

export const staffSaleService = {
  async createSale(outletId, requestedItems) {
    const normalizedItems = normalizeItems(requestedItems);
    const menuIds = normalizedItems.map((item) => item.menuId);

    return saleRepository.runTransaction(async (tx) => {
      // Every item must be assigned to this outlet; its price comes
      // from the outlet-specific assignment, never MasterMenu.basePrice.
      const assignments = await saleRepository.findOutletMenusByIds(
        tx,
        outletId,
        menuIds,
      );
      if (assignments.length !== menuIds.length) {
        const assignedIds = new Set(
          assignments.map((assignment) => assignment.menuId),
        );
        const missing = menuIds.filter((id) => !assignedIds.has(id));
        throw new ApiError(
          400,
          `The following items are not assigned to this outlet: ${missing.join(", ")}`,
        );
      }
      const priceByMenuId = new Map(
        assignments.map((assignment) => [assignment.menuId, assignment.price]),
      );

      // Atomic conditional decrement per item. Each updateMany is a
      // single SQL `UPDATE ... WHERE stock >= quantity`, which Postgres
      // executes under a row lock — a concurrent sale for the same row
      // either waits and then re-checks the condition against the
      // now-updated stock, or (if this one fails) never gets to run at
      // all once this transaction rolls back. This is what prevents
      // negative stock under concurrency; no extra locking is needed.
      const saleItemsData = [];
      for (const item of normalizedItems) {
        const result = await saleRepository.decrementStock(
          tx,
          outletId,
          item.menuId,
          item.quantity,
        );
        if (result.count !== 1) {
          throw new ApiError(
            409,
            `Insufficient stock for menu item ${item.menuId}`,
          );
        }

        const unitPrice = priceByMenuId.get(item.menuId);
        const subtotal = unitPrice.times(item.quantity);

        saleItemsData.push({
          menuId: item.menuId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      // Decimal-safe sum — never JS floating-point arithmetic.
      const totalAmount = saleItemsData
        .map((item) => item.subtotal)
        .reduce((sum, subtotal) => sum.plus(subtotal));

      // Atomic per-outlet sequential receipt number. The row-level
      // lock on this single-row update is also what makes concurrent
      // receipt numbers for the same outlet come out unique and
      // sequential, with no gaps beyond a rolled-back sale.
      const counter = await saleRepository.incrementReceiptCounter(
        tx,
        outletId,
      );

      return saleRepository.createSaleWithItems(tx, {
        outletId,
        receiptNumber: counter.lastNumber,
        totalAmount,
        items: saleItemsData,
      });
    });
  },
};
