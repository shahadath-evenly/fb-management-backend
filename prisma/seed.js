import "dotenv/config";
import bcrypt from "bcryptjs";
import { disconnectDatabase, prisma } from "../src/config/database.js";

// Defaults match the credentials the project always expects to exist
// for local/demo use. Override with real ADMIN_EMAIL/ADMIN_PASSWORD
// env vars for any environment where these shouldn't be the password.
const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const DEFAULT_ADMIN_PASSWORD = "Test123@@";

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME || "HQ";
  const lastName = process.env.ADMIN_LAST_NAME || "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists (${email}) — skipping creation.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
      outletId: null,
    },
  });
  console.log(`Admin user created: ${admin.email} (id: ${admin.id})`);
}

async function main() {
  await ensureAdmin();

  if (process.env.SEED_DEMO_DATA === "true") {
    const { seedDemoData } = await import("./seedData/demoSeed.js");
    await seedDemoData();
  } else {
    console.log(
      'SEED_DEMO_DATA is not "true" — skipping demo outlets/menus/staff/sales.',
    );
    console.log(
      "Run `SEED_DEMO_DATA=true npm run db:seed` to also generate demo data.",
    );
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
