import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { disconnectDatabase, prisma } from '../src/config/database.js';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`A user with email "${email}" already exists. No changes made.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      firstName: process.env.ADMIN_FIRST_NAME || 'HQ',
      lastName: process.env.ADMIN_LAST_NAME || 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      outletId: null,
    },
  });

  console.log(`Admin user created: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((err) => {
    console.error('Failed to seed admin user:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
