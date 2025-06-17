/*
  Warnings:

  - The values [soil_preparation,sowing,fertilization,irrigation,weeding,pest_control,harvest,other] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [beginner,intermediate,expert] on the enum `CertificationLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [draft,active,completed,cancelled] on the enum `ContractStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [rice,maize,peanut,sorghum,cowpea,millet] on the enum `CropType` will be removed. If these variants are still used in the database, this will fail.
  - The values [low,medium,high] on the enum `IssueSeverity` will be removed. If these variants are still used in the database, this will fail.
  - The values [disease,pest,weather,management,other] on the enum `IssueType` will be removed. If these variants are still used in the database, this will fail.
  - The values [available,in_use,resting] on the enum `ParcelStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [planned,in_progress,completed,cancelled] on the enum `ProductionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [production,quality,inventory,multiplier_performance,custom] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `multipliers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `seed_lots` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `varieties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `varieties` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[code]` on the table `varieties` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `varietyId` on the `contracts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `varietyId` on the `production_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `sowingDate` on table `productions` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `result` on the `quality_controls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `varietyId` on the `seed_lots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `code` to the `varieties` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'INSPECTOR', 'MULTIPLIER', 'GUEST', 'TECHNICIAN', 'RESEARCHER');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('PENDING', 'CERTIFIED', 'REJECTED', 'IN_STOCK', 'SOLD', 'ACTIVE', 'DISTRIBUTED');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "MultiplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('SOIL_PREPARATION', 'SOWING', 'FERTILIZATION', 'IRRIGATION', 'WEEDING', 'PEST_CONTROL', 'HARVEST', 'OTHER');
ALTER TABLE "production_activities" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "ActivityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CertificationLevel_new" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');
ALTER TABLE "multipliers" ALTER COLUMN "certificationLevel" TYPE "CertificationLevel_new" USING ("certificationLevel"::text::"CertificationLevel_new");
ALTER TYPE "CertificationLevel" RENAME TO "CertificationLevel_old";
ALTER TYPE "CertificationLevel_new" RENAME TO "CertificationLevel";
DROP TYPE "CertificationLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ContractStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "contracts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "contracts" ALTER COLUMN "status" TYPE "ContractStatus_new" USING ("status"::text::"ContractStatus_new");
ALTER TYPE "ContractStatus" RENAME TO "ContractStatus_old";
ALTER TYPE "ContractStatus_new" RENAME TO "ContractStatus";
DROP TYPE "ContractStatus_old";
ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CropType_new" AS ENUM ('RICE', 'MAIZE', 'PEANUT', 'SORGHUM', 'COWPEA', 'MILLET');
ALTER TABLE "varieties" ALTER COLUMN "cropType" TYPE "CropType_new" USING ("cropType"::text::"CropType_new");
ALTER TYPE "CropType" RENAME TO "CropType_old";
ALTER TYPE "CropType_new" RENAME TO "CropType";
DROP TYPE "CropType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IssueSeverity_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
ALTER TABLE "production_issues" ALTER COLUMN "severity" TYPE "IssueSeverity_new" USING ("severity"::text::"IssueSeverity_new");
ALTER TYPE "IssueSeverity" RENAME TO "IssueSeverity_old";
ALTER TYPE "IssueSeverity_new" RENAME TO "IssueSeverity";
DROP TYPE "IssueSeverity_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IssueType_new" AS ENUM ('DISEASE', 'PEST', 'WEATHER', 'MANAGEMENT', 'OTHER');
ALTER TABLE "production_issues" ALTER COLUMN "type" TYPE "IssueType_new" USING ("type"::text::"IssueType_new");
ALTER TYPE "IssueType" RENAME TO "IssueType_old";
ALTER TYPE "IssueType_new" RENAME TO "IssueType";
DROP TYPE "IssueType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ParcelStatus_new" AS ENUM ('AVAILABLE', 'IN_USE', 'RESTING');
ALTER TABLE "parcels" ALTER COLUMN "status" TYPE "ParcelStatus_new" USING ("status"::text::"ParcelStatus_new");
ALTER TYPE "ParcelStatus" RENAME TO "ParcelStatus_old";
ALTER TYPE "ParcelStatus_new" RENAME TO "ParcelStatus";
DROP TYPE "ParcelStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProductionStatus_new" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "productions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "productions" ALTER COLUMN "status" TYPE "ProductionStatus_new" USING ("status"::text::"ProductionStatus_new");
ALTER TYPE "ProductionStatus" RENAME TO "ProductionStatus_old";
ALTER TYPE "ProductionStatus_new" RENAME TO "ProductionStatus";
DROP TYPE "ProductionStatus_old";
ALTER TABLE "productions" ALTER COLUMN "status" SET DEFAULT 'PLANNED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('PRODUCTION', 'QUALITY', 'INVENTORY', 'MULTIPLIER_PERFORMANCE', 'CUSTOM');
ALTER TABLE "reports" ALTER COLUMN "type" TYPE "ReportType_new" USING ("type"::text::"ReportType_new");
ALTER TYPE "ReportType" RENAME TO "ReportType_old";
ALTER TYPE "ReportType_new" RENAME TO "ReportType";
DROP TYPE "ReportType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_varietyId_fkey";

-- DropForeignKey
ALTER TABLE "seed_lots" DROP CONSTRAINT "seed_lots_varietyId_fkey";

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "varietyId",
ADD COLUMN     "varietyId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "multipliers" DROP COLUMN "status",
ADD COLUMN     "status" "MultiplierStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "production_history" DROP COLUMN "varietyId",
ADD COLUMN     "varietyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "productions" ADD COLUMN     "conditions" TEXT,
ADD COLUMN     "yield" DOUBLE PRECISION,
ALTER COLUMN "sowingDate" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PLANNED';

-- AlterTable
ALTER TABLE "quality_controls" DROP COLUMN "result",
ADD COLUMN     "result" "TestResult" NOT NULL;

-- AlterTable
ALTER TABLE "seed_lots" DROP COLUMN "varietyId",
ADD COLUMN     "varietyId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "LotStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "varieties" DROP CONSTRAINT "varieties_pkey",
ADD COLUMN     "code" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "varieties_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "QualityControlResult";

-- DropEnum
DROP TYPE "SeedLotStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "idx_multipliers_status" ON "multipliers"("status");

-- CreateIndex
CREATE INDEX "idx_quality_controls_result" ON "quality_controls"("result");

-- CreateIndex
CREATE INDEX "idx_seed_lots_variety" ON "seed_lots"("varietyId");

-- CreateIndex
CREATE INDEX "idx_seed_lots_status" ON "seed_lots"("status");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "varieties_code_key" ON "varieties"("code");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seed_lots" ADD CONSTRAINT "seed_lots_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
