import { prisma } from '../config/database.js';

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

  findAllStaff() {
    return prisma.user.findMany({
      where: { role: 'staff' },
      include: { outlet: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id) {
    return prisma.user.delete({ where: { id } });
  },
};
