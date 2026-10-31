-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'staff');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "outletId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterMenu" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletMenu" (
    "id" UUID NOT NULL,
    "outletId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletInventory" (
    "id" UUID NOT NULL,
    "outletId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" UUID NOT NULL,
    "outletId" UUID NOT NULL,
    "receiptNumber" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletReceiptCounter" (
    "id" UUID NOT NULL,
    "outletId" UUID NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OutletReceiptCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_outletId_idx" ON "User"("outletId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "OutletMenu_outletId_idx" ON "OutletMenu"("outletId");

-- CreateIndex
CREATE INDEX "OutletMenu_menuId_idx" ON "OutletMenu"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletMenu_outletId_menuId_key" ON "OutletMenu"("outletId", "menuId");

-- CreateIndex
CREATE INDEX "OutletInventory_outletId_idx" ON "OutletInventory"("outletId");

-- CreateIndex
CREATE INDEX "OutletInventory_menuId_idx" ON "OutletInventory"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletInventory_outletId_menuId_key" ON "OutletInventory"("outletId", "menuId");

-- CreateIndex
CREATE INDEX "Sale_outletId_idx" ON "Sale"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_outletId_receiptNumber_key" ON "Sale"("outletId", "receiptNumber");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_menuId_idx" ON "SaleItem"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletReceiptCounter_outletId_key" ON "OutletReceiptCounter"("outletId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletMenu" ADD CONSTRAINT "OutletMenu_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletMenu" ADD CONSTRAINT "OutletMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MasterMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletInventory" ADD CONSTRAINT "OutletInventory_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletInventory" ADD CONSTRAINT "OutletInventory_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MasterMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MasterMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletReceiptCounter" ADD CONSTRAINT "OutletReceiptCounter_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint: admin users must have no outlet, staff users must have one
ALTER TABLE "User" ADD CONSTRAINT "User_role_outletId_check" CHECK (
    ("role" = 'admin' AND "outletId" IS NULL) OR
    ("role" = 'staff' AND "outletId" IS NOT NULL)
);

-- CheckConstraint: stock can never go negative
ALTER TABLE "OutletInventory" ADD CONSTRAINT "OutletInventory_stock_check" CHECK ("stock" >= 0);

-- CheckConstraint: sale item quantity must be a positive integer
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_quantity_check" CHECK ("quantity" > 0);
