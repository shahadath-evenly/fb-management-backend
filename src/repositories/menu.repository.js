import { prisma } from '../config/database.js';
import { getPaginationArgs } from '../utils/pagination.js';

export const menuRepository = {
  async findAllPaginated({ page, limit, search }) {
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const [items, total] = await Promise.all([
      prisma.masterMenu.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...getPaginationArgs({ page, limit }),
      }),
      prisma.masterMenu.count({ where }),
    ]);
    return { items, total };
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
