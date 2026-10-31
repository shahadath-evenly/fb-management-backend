import { prisma } from '../config/database.js';
import { getPaginationArgs } from '../utils/pagination.js';

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.user.create({ data });
  },

  async findAllStaffPaginated({ page, limit, search, status }) {
    const where = {
      role: 'staff',
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { outlet: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        ...getPaginationArgs({ page, limit }),
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  updateStatus(id, status) {
    return prisma.user.update({ where: { id }, data: { status } });
  },

  delete(id) {
    return prisma.user.delete({ where: { id } });
  },
};
