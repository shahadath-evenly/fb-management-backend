import { prisma } from '../config/database.js';

export const outletRepository = {
  findAll() {
    return prisma.outlet.findMany({ orderBy: { createdAt: 'desc' } });
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
};
