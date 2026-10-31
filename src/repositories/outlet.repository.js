import { prisma } from '../config/database.js';
import { getPaginationArgs } from '../utils/pagination.js';

function buildWhere({ search, status }) {
  return {
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    ...(status ? { status } : {}),
  };
}

export const outletRepository = {
  async findAllPaginated({ page, limit, search, status }) {
    const where = buildWhere({ search, status });
    const [items, total] = await Promise.all([
      prisma.outlet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...getPaginationArgs({ page, limit }),
      }),
      prisma.outlet.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return prisma.outlet.findUnique({ where: { id } });
  },

  createWithReceiptCounter(name) {
    return prisma.$transaction(async (tx) => {
      const outlet = await tx.outlet.create({ data: { name } });
      await tx.outletReceiptCounter.create({
        data: { outletId: outlet.id, lastNumber: 0 },
      });
      return outlet;
    });
  },

  update(id, name) {
    return prisma.outlet.update({ where: { id }, data: { name } });
  },

  updateStatus(id, status) {
    return prisma.outlet.update({ where: { id }, data: { status } });
  },

  remove(id) {
    // OutletReceiptCounter is internal bookkeeping (created
    // automatically with every outlet), not business history — it
    // must not block deletion the way staff/menus/inventory/sales do,
    // so it's removed in the same transaction as the outlet itself.
    return prisma.$transaction(async (tx) => {
      await tx.outletReceiptCounter.deleteMany({ where: { outletId: id } });
      await tx.outlet.delete({ where: { id } });
    });
  },
};
