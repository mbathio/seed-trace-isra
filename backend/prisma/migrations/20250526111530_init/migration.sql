/*
  Warnings:

  - The values [RICE,MAIZE,PEANUT,SORGHUM,COWPEA,MILLET] on the enum `CropType` will be removed. If these variants are still used in the database, this will fail.
  - The values [AVAILABLE,IN_USE,RESTING] on the enum `ParcelStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,MANAGER,INSPECTOR,MULTIPLIER,GUEST,TECHNICIAN,RESEARCHER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CropType_new" AS ENUM ('rice', 'maize', 'peanut', 'sorghum', 'cowpea', 'millet');
ALTER TABLE "varieties" ALTER COLUMN "cropType" TYPE "CropType_new" USING ("cropType"::text::"CropType_new");
ALTER TYPE "CropType" RENAME TO "CropType_old";
ALTER TYPE "CropType_new" RENAME TO "CropType";
DROP TYPE "CropType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ParcelStatus_new" AS ENUM ('available', 'in_use', 'resting');
ALTER TABLE "parcels" ALTER COLUMN "status" TYPE "ParcelStatus_new" USING ("status"::text::"ParcelStatus_new");
ALTER TYPE "ParcelStatus" RENAME TO "ParcelStatus_old";
ALTER TYPE "ParcelStatus_new" RENAME TO "ParcelStatus";
DROP TYPE "ParcelStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'manager', 'inspector', 'multiplier', 'guest', 'technician', 'researcher');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- CreateIndex
CREATE INDEX "idx_seed_lots_variety_level_status" ON "seed_lots"("varietyId", "level", "status");

-- CreateIndex
CREATE INDEX "idx_seed_lots_production_level" ON "seed_lots"("productionDate", "level");

-- CreateIndex
CREATE INDEX "idx_seed_lots_multiplier_complete" ON "seed_lots"("multiplierId", "status", "productionDate");
