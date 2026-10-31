-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN     "status" "EntityStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "EntityStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "Outlet_status_idx" ON "Outlet"("status");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");
