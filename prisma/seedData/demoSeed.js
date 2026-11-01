import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../src/config/database.js';

// How many sales to generate in total, spread across all demo
// outlets. Override with SEED_SALES_COUNT if you want a bigger or
// smaller demo dataset.
const SALES_COUNT = Number(process.env.SEED_SALES_COUNT) || 3000;
const SALES_WINDOW_DAYS = 90;
const DEMO_STAFF_PASSWORD = 'TestPass123';

const OUTLET_NAMES = [
  'Downtown Flagship',
  'Westside Mall',
  'Airport Terminal 2',
  'Riverside Plaza',
  'Uptown Square',
  'Central Station',
];

// [name, basePrice] — basePrice is a string, never a JS float literal,
// so it goes into Prisma.Decimal without any binary floating-point
// rounding (same rule the real menu-creation endpoint enforces).
const MENU_ITEMS = [
  ['Classic Cheeseburger', '8.99'],
  ['Double Beef Burger', '11.49'],
  ['Bacon BBQ Burger', '10.99'],
  ['Veggie Burger', '9.49'],
  ['Spicy Chicken Burger', '9.99'],
  ['Margherita Pizza', '12.99'],
  ['Pepperoni Pizza', '14.49'],
  ['BBQ Chicken Pizza', '15.99'],
  ['Veggie Supreme Pizza', '13.49'],
  ['Four Cheese Pizza', '14.99'],
  ['Spaghetti Bolognese', '11.99'],
  ['Fettuccine Alfredo', '12.49'],
  ['Penne Arrabbiata', '10.99'],
  ['French Fries', '4.49'],
  ['Onion Rings', '4.99'],
  ['Garlic Bread', '3.99'],
  ['Side Salad', '5.49'],
  ['Mozzarella Sticks', '6.49'],
  ['Grilled Chicken Breast', '13.99'],
  ['Fish and Chips', '12.99'],
  ['Steak Frites', '19.99'],
  ['Shrimp Platter', '17.99'],
  ['Coca-Cola', '2.49'],
  ['Sprite', '2.49'],
  ['Iced Tea', '2.99'],
  ['Lemonade', '3.49'],
  ['Fresh Orange Juice', '4.49'],
  ['Bottled Water', '1.99'],
  ['Espresso', '3.49'],
  ['Cappuccino', '4.49'],
  ['Latte', '4.99'],
  ['Hot Chocolate', '4.49'],
  ['Chocolate Lava Cake', '6.99'],
  ['Cheesecake', '6.49'],
  ['Tiramisu', '6.99'],
  ['Ice Cream Sundae', '5.49'],
  ['Apple Pie', '5.99'],
  ['Pancake Stack', '7.99'],
  ['Classic Omelette', '7.49'],
  ['Avocado Toast', '8.49'],
];

const STAFF_FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley',
  'Jamie', 'Avery', 'Sam', 'Drew', 'Harper', 'Reese',
];
const STAFF_LAST_NAMES = [
  'Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(items) {
  return items[randomInt(0, items.length - 1)];
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function findOrCreateOutlet(name) {
  const existing = await prisma.outlet.findFirst({ where: { name } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const outlet = await tx.outlet.create({ data: { name } });
    await tx.outletReceiptCounter.create({ data: { outletId: outlet.id, lastNumber: 0 } });
    return outlet;
  });
}

async function findOrCreateMenuItem(name, basePrice) {
  const existing = await prisma.masterMenu.findFirst({ where: { name } });
  if (existing) return existing;

  return prisma.masterMenu.create({
    data: { name, basePrice: new Prisma.Decimal(basePrice) },
  });
}

async function findOrCreateStaff(email, firstName, lastName, outletId) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(DEMO_STAFF_PASSWORD, 10);
  return prisma.user.create({
    data: { firstName, lastName, email, password: hashedPassword, role: 'staff', outletId },
  });
}

async function ensureOutletMenu(outletId, menu) {
  const existing = await prisma.outletMenu.findUnique({
    where: { outletId_menuId: { outletId, menuId: menu.id } },
  });
  if (existing) return existing;

  // Outlet-specific price: base price nudged by ±8%, computed entirely
  // in Decimal space — never JS floating-point arithmetic on money.
  const varianceFactor = new Prisma.Decimal(randomInt(92, 108)).dividedBy(100);
  const price = menu.basePrice.times(varianceFactor).toDecimalPlaces(2);

  return prisma.outletMenu.create({
    data: { outletId, menuId: menu.id, price },
  });
}

async function ensureOutletInventory(outletId, menuId) {
  const existing = await prisma.outletInventory.findUnique({
    where: { outletId_menuId: { outletId, menuId } },
  });
  if (existing) return existing;

  const initialStock = randomInt(200, 600);
  return prisma.outletInventory.create({
    data: { outletId, menuId, stock: initialStock },
  });
}

async function seedOutlets() {
  const outlets = [];
  for (const name of OUTLET_NAMES) {
    outlets.push(await findOrCreateOutlet(name));
  }
  console.log(`Outlets ready: ${outlets.length}`);
  return outlets;
}

async function seedMenuItems() {
  const menuItems = [];
  for (const [name, basePrice] of MENU_ITEMS) {
    menuItems.push(await findOrCreateMenuItem(name, basePrice));
  }
  console.log(`Menu items ready: ${menuItems.length}`);
  return menuItems;
}

async function seedStaff(outlets) {
  let total = 0;
  for (const outlet of outlets) {
    const slug = slugify(outlet.name);
    for (let i = 1; i <= 2; i += 1) {
      const email = `staff${i}.${slug}@fnbdemo.com`;
      await findOrCreateStaff(email, randomChoice(STAFF_FIRST_NAMES), randomChoice(STAFF_LAST_NAMES), outlet.id);
      total += 1;
    }
  }
  console.log(`Staff ready: ${total} (password for all demo staff: ${DEMO_STAFF_PASSWORD})`);
}

// Assigns ~70-90% of the catalog to each outlet (outlets don't all
// carry the same items — closer to a real multi-outlet menu) and
// ensures an inventory row for every assignment. Returns per-outlet
// assignment lists plus an in-memory stock map that the sales step
// below sells against and flushes to the database once at the end.
async function seedAssignmentsAndInventory(outlets, menuItems) {
  const assignmentsByOutlet = new Map();
  const stockByKey = new Map();

  for (const outlet of outlets) {
    const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
    const takeCount = Math.round((menuItems.length * randomInt(70, 90)) / 100);
    const assignedItems = shuffled.slice(0, takeCount);
    const assignments = [];

    for (const menu of assignedItems) {
      const outletMenu = await ensureOutletMenu(outlet.id, menu);
      assignments.push({ menuId: menu.id, price: outletMenu.price });

      const inventory = await ensureOutletInventory(outlet.id, menu.id);
      stockByKey.set(`${outlet.id}:${menu.id}`, inventory.stock);
    }
    assignmentsByOutlet.set(outlet.id, assignments);
  }
  console.log('Menu assignments and inventory ready.');
  return { assignmentsByOutlet, stockByKey };
}

// Generates SALES_COUNT sales spread unevenly across outlets (some
// busier than others, for realism) and across the last
// SALES_WINDOW_DAYS days. Stock is sold against the in-memory map
// built above — never going negative — and receipt numbers are
// assigned sequentially per outlet, continuing on from that outlet's
// existing OutletReceiptCounter. The counter row is only written once
// per outlet at the end; there's no concurrency in a seed script, so
// the per-sale atomic-update dance the real API uses isn't needed
// here.
async function seedSales(outlets, assignmentsByOutlet, stockByKey) {
  const weights = outlets.map(() => randomInt(1, 5));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const plan = outlets.map((outlet, index) => ({
    outlet,
    count: Math.max(1, Math.round((weights[index] / totalWeight) * SALES_COUNT)),
  }));

  const now = Date.now();
  const windowMs = SALES_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  let totalCreated = 0;

  for (const { outlet, count } of plan) {
    const assignments = assignmentsByOutlet.get(outlet.id) ?? [];
    if (assignments.length === 0) continue;

    const counter = await prisma.outletReceiptCounter.findUnique({ where: { outletId: outlet.id } });
    let nextReceipt = (counter?.lastNumber ?? 0) + 1;

    // Oldest-first so receipt numbers roughly increase with time.
    const timestamps = Array.from({ length: count }, () => now - randomInt(0, windowMs)).sort((a, b) => a - b);

    for (const ts of timestamps) {
      const lineCount = randomInt(1, 4);
      const pool = [...assignments];
      const chosenLines = [];
      for (let i = 0; i < lineCount && pool.length > 0; i += 1) {
        chosenLines.push(pool.splice(randomInt(0, pool.length - 1), 1)[0]);
      }

      const saleItemsData = [];
      for (const line of chosenLines) {
        const key = `${outlet.id}:${line.menuId}`;
        const available = stockByKey.get(key) ?? 0;
        if (available <= 0) continue;

        const quantity = Math.min(randomInt(1, 3), available);
        stockByKey.set(key, available - quantity);

        const unitPrice = line.price;
        const subtotal = unitPrice.times(quantity);
        saleItemsData.push({ menuId: line.menuId, quantity, unitPrice, subtotal });
      }
      if (saleItemsData.length === 0) continue;

      const totalAmount = saleItemsData.map((item) => item.subtotal).reduce((sum, subtotal) => sum.plus(subtotal));
      const createdAt = new Date(ts);

      await prisma.sale.create({
        data: {
          outletId: outlet.id,
          receiptNumber: nextReceipt,
          totalAmount,
          createdAt,
          updatedAt: createdAt,
          items: { create: saleItemsData },
        },
      });

      nextReceipt += 1;
      totalCreated += 1;
      if (totalCreated % 250 === 0) {
        console.log(`  ...${totalCreated} sales created so far`);
      }
    }

    await prisma.outletReceiptCounter.update({
      where: { outletId: outlet.id },
      data: { lastNumber: nextReceipt - 1 },
    });
  }

  console.log(`Sales created: ${totalCreated}`);
}

async function flushInventory(stockByKey) {
  const updates = [...stockByKey.entries()].map(([key, stock]) => {
    const [outletId, menuId] = key.split(':');
    return prisma.outletInventory.update({
      where: { outletId_menuId: { outletId, menuId } },
      data: { stock },
    });
  });
  await Promise.all(updates);
  console.log('Inventory levels finalized.');
}

export async function seedDemoData() {
  console.log('--- Seeding demo data (this can take a minute) ---');

  const outlets = await seedOutlets();
  const menuItems = await seedMenuItems();
  await seedStaff(outlets);
  const { assignmentsByOutlet, stockByKey } = await seedAssignmentsAndInventory(outlets, menuItems);
  await seedSales(outlets, assignmentsByOutlet, stockByKey);
  await flushInventory(stockByKey);

  console.log('--- Demo data seed complete ---');
}
