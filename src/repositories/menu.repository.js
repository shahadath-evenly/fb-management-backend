import { prisma } from '../config/database.js';

export const menuRepository = {
  findAll() {
    return prisma.masterMenu.findMany({ orderBy: { createdAt: 'desc' } });
  },

  findById(id) {
    return prisma.masterMenu.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.masterMenu.create({ data });
  },

  update(id, data) {
    return prisma.masterMenu.update({ where: { id }, data });
  },

  remove(id) {
    return prisma.masterMenu.delete({ where: { id } });
  },
};
