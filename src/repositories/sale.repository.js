import { prisma } from '../config/database.js';

export const saleRepository = {
  runTransaction(callback) {
    return prisma.$transaction(callback);
  },

  findOutletMenusByIds(tx, outletId, menuIds) {
    return tx.outletMenu.findMany({
      where: { outletId, menuId: { in: menuIds } },
      include: { menu: { select: { name: true } } },
    });
  },

  // Used only to build a user-friendly error message when some
  // requested items aren't assigned to the outlet — those ids have no
  // OutletMenu row to read a name from, so look the names up directly.
  findMenuNamesByIds(tx, menuIds) {
    return tx.masterMenu.findMany({
      where: { id: { in: menuIds } },
      select: { id: true, name: true },
    });
  },

  // Informational read after a failed conditional decrement, used only
  // to report the current stock in the error message — not part of
  // the atomic stock check itself.
  findCurrentStock(tx, outletId, menuId) {
    return tx.outletInventory.findUnique({
      where: { outletId_menuId: { outletId, menuId } },
      select: { stock: true },
    });
  },

  // Atomic conditional decrement: only succeeds if enough stock exists.
  // Uses updateMany (not update) because the WHERE clause needs the
  // extra `stock >= quantity` condition, which Prisma's unique-only
  // `update()` where-input does not support.
  decrementStock(tx, outletId, menuId, quantity) {
    return tx.outletInventory.updateMany({
      where: { outletId, menuId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
  },

  // Atomic per-outlet increment + read of the new value in one statement.
  incrementReceiptCounter(tx, outletId) {
    return tx.outletReceiptCounter.update({
      where: { outletId },
      data: { lastNumber: { increment: 1 } },
    });
  },

  createSaleWithItems(tx, { outletId, receiptNumber, totalAmount, items }) {
    return tx.sale.create({
      data: {
        outletId,
        receiptNumber,
        totalAmount,
        items: { create: items },
      },
      include: { items: true },
    });
  },
};
