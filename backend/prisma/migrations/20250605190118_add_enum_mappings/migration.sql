/*
  Warnings:

  - The `status` column on the `contracts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `multipliers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `parcels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `productions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `seed_lots` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `multipliers` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `seedLevel` on the `contracts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `certificationLevel` on the `multipliers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `production_activities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `seedLevel` on the `production_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `production_issues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `severity` on the `production_issues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `result` on the `quality_controls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `level` on the `seed_lots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cropType` on the `varieties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'manager', 'inspector', 'multiplier', 'guest', 'technician', 'researcher');

-- CreateEnum
CREATE TYPE "seed_level" AS ENUM ('GO', 'G1', 'G2', 'G3', 'G4', 'R1', 'R2');

-- CreateEnum
CREATE TYPE "crop_type" AS ENUM ('rice', 'maize', 'peanut', 'sorghum', 'cowpea', 'millet');

-- CreateEnum
CREATE TYPE "parcel_status" AS ENUM ('available', 'in-use', 'resting');

-- CreateEnum
CREATE TYPE "lot_status" AS ENUM ('pending', 'certified', 'rejected', 'in-stock', 'sold', 'active', 'distributed');

-- CreateEnum
CREATE TYPE "contract_status" AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "certification_level" AS ENUM ('beginner', 'intermediate', 'expert');

-- CreateEnum
CREATE TYPE "production_status" AS ENUM ('planned', 'in-progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('soil-preparation', 'sowing', 'fertilization', 'irrigation', 'weeding', 'pest-control', 'harvest', 'other');

-- CreateEnum
CREATE TYPE "issue_type" AS ENUM ('disease', 'pest', 'weather', 'management', 'other');

-- CreateEnum
CREATE TYPE "issue_severity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "test_result" AS ENUM ('pass', 'fail');

-- CreateEnum
CREATE TYPE "report_type" AS ENUM ('production', 'quality', 'inventory', 'multiplier-performance', 'custom');

-- CreateEnum
CREATE TYPE "multiplier_status" AS ENUM ('active', 'inactive');

-- DropForeignKey
ALTER TABLE "weather_data" DROP CONSTRAINT "weather_data_productionId_fkey";

-- AlterTable
ALTER TABLE "contracts" ALTER COLUMN "startDate" SET DATA TYPE DATE,
ALTER COLUMN "endDate" SET DATA TYPE DATE,
DROP COLUMN "seedLevel",
ADD COLUMN     "seedLevel" "seed_level" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "contract_status" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "multipliers" DROP COLUMN "certificationLevel",
ADD COLUMN     "certificationLevel" "certification_level" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "multiplier_status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "parcels" DROP COLUMN "status",
ADD COLUMN     "status" "parcel_status" NOT NULL DEFAULT 'available';

-- AlterTable
ALTER TABLE "production_activities" DROP COLUMN "type",
ADD COLUMN     "type" "activity_type" NOT NULL,
ALTER COLUMN "activityDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "production_history" DROP COLUMN "seedLevel",
ADD COLUMN     "seedLevel" "seed_level" NOT NULL;

-- AlterTable
ALTER TABLE "production_issues" ALTER COLUMN "issueDate" SET DATA TYPE DATE,
DROP COLUMN "type",
ADD COLUMN     "type" "issue_type" NOT NULL,
DROP COLUMN "severity",
ADD COLUMN     "severity" "issue_severity" NOT NULL,
ALTER COLUMN "resolvedDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "productions" ALTER COLUMN "startDate" SET DATA TYPE DATE,
ALTER COLUMN "endDate" SET DATA TYPE DATE,
ALTER COLUMN "sowingDate" SET DATA TYPE DATE,
ALTER COLUMN "harvestDate" SET DATA TYPE DATE,
DROP COLUMN "status",
ADD COLUMN     "status" "production_status" NOT NULL DEFAULT 'planned';

-- AlterTable
ALTER TABLE "quality_controls" ALTER COLUMN "controlDate" SET DATA TYPE DATE,
DROP COLUMN "result",
ADD COLUMN     "result" "test_result" NOT NULL;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "type",
ADD COLUMN     "type" "report_type" NOT NULL;

-- AlterTable
ALTER TABLE "seed_lots" DROP COLUMN "level",
ADD COLUMN     "level" "seed_level" NOT NULL,
ALTER COLUMN "productionDate" SET DATA TYPE DATE,
ALTER COLUMN "expiryDate" SET DATA TYPE DATE,
DROP COLUMN "status",
ADD COLUMN     "status" "lot_status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "soil_analyses" ALTER COLUMN "analysisDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "user_role" NOT NULL;

-- AlterTable
ALTER TABLE "varieties" DROP COLUMN "cropType",
ADD COLUMN     "cropType" "crop_type" NOT NULL;

-- AlterTable
ALTER TABLE "weather_data" ALTER COLUMN "recordDate" SET DATA TYPE DATE;

-- DropEnum
DROP TYPE "ActivityType";

-- DropEnum
DROP TYPE "CertificationLevel";

-- DropEnum
DROP TYPE "ContractStatus";

-- DropEnum
DROP TYPE "CropType";

-- DropEnum
DROP TYPE "IssueSeverity";

-- DropEnum
DROP TYPE "IssueType";

-- DropEnum
DROP TYPE "LotStatus";

-- DropEnum
DROP TYPE "MultiplierStatus";

-- DropEnum
DROP TYPE "ParcelStatus";

-- DropEnum
DROP TYPE "ProductionStatus";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SeedLevel";

-- DropEnum
DROP TYPE "TestResult";

-- CreateIndex
CREATE INDEX "idx_activity_inputs_activity" ON "activity_inputs"("activityId");

-- CreateIndex
CREATE INDEX "idx_contracts_status" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "idx_contracts_variety" ON "contracts"("varietyId");

-- CreateIndex
CREATE INDEX "idx_contracts_dates" ON "contracts"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "multipliers_email_key" ON "multipliers"("email");

-- CreateIndex
CREATE INDEX "idx_multipliers_status" ON "multipliers"("status");

-- CreateIndex
CREATE INDEX "idx_multipliers_certification" ON "multipliers"("certificationLevel");

-- CreateIndex
CREATE INDEX "idx_multipliers_active" ON "multipliers"("isActive");

-- CreateIndex
CREATE INDEX "idx_multipliers_location" ON "multipliers"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "idx_multipliers_email" ON "multipliers"("email");

-- CreateIndex
CREATE INDEX "idx_multipliers_name" ON "multipliers"("name");

-- CreateIndex
CREATE INDEX "idx_parcels_status" ON "parcels"("status");

-- CreateIndex
CREATE INDEX "idx_parcels_active" ON "parcels"("isActive");

-- CreateIndex
CREATE INDEX "idx_parcels_location" ON "parcels"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "idx_previous_crops_parcel" ON "previous_crops"("parcelId");

-- CreateIndex
CREATE INDEX "idx_previous_crops_year" ON "previous_crops"("year");

-- CreateIndex
CREATE INDEX "idx_production_activities_production" ON "production_activities"("productionId");

-- CreateIndex
CREATE INDEX "idx_production_activities_date" ON "production_activities"("activityDate");

-- CreateIndex
CREATE INDEX "idx_production_activities_type" ON "production_activities"("type");

-- CreateIndex
CREATE INDEX "idx_production_history_multiplier" ON "production_history"("multiplierId");

-- CreateIndex
CREATE INDEX "idx_production_history_year" ON "production_history"("year");

-- CreateIndex
CREATE INDEX "idx_production_issues_production" ON "production_issues"("productionId");

-- CreateIndex
CREATE INDEX "idx_production_issues_date" ON "production_issues"("issueDate");

-- CreateIndex
CREATE INDEX "idx_production_issues_resolved" ON "production_issues"("resolved");

-- CreateIndex
CREATE INDEX "idx_productions_status" ON "productions"("status");

-- CreateIndex
CREATE INDEX "idx_productions_parcel" ON "productions"("parcelId");

-- CreateIndex
CREATE INDEX "idx_productions_lot" ON "productions"("lotId");

-- CreateIndex
CREATE INDEX "idx_productions_date_range" ON "productions"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "idx_quality_controls_result" ON "quality_controls"("result");

-- CreateIndex
CREATE INDEX "idx_quality_controls_inspector" ON "quality_controls"("inspectorId");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_expiry" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "idx_reports_type" ON "reports"("type");

-- CreateIndex
CREATE INDEX "idx_reports_creator" ON "reports"("createdById");

-- CreateIndex
CREATE INDEX "idx_reports_public" ON "reports"("isPublic");

-- CreateIndex
CREATE INDEX "idx_seed_lots_status" ON "seed_lots"("status");

-- CreateIndex
CREATE INDEX "idx_seed_lots_level" ON "seed_lots"("level");

-- CreateIndex
CREATE INDEX "idx_seed_lots_active" ON "seed_lots"("isActive");

-- CreateIndex
CREATE INDEX "idx_seed_lots_variety_level_status" ON "seed_lots"("varietyId", "level", "status");

-- CreateIndex
CREATE INDEX "idx_seed_lots_production_level" ON "seed_lots"("productionDate", "level");

-- CreateIndex
CREATE INDEX "idx_seed_lots_multiplier_complete" ON "seed_lots"("multiplierId", "status", "productionDate");

-- CreateIndex
CREATE INDEX "idx_soil_analyses_parcel" ON "soil_analyses"("parcelId");

-- CreateIndex
CREATE INDEX "idx_soil_analyses_date" ON "soil_analyses"("analysisDate");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_active" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "idx_varieties_crop_type" ON "varieties"("cropType");

-- CreateIndex
CREATE INDEX "idx_varieties_code" ON "varieties"("code");

-- CreateIndex
CREATE INDEX "idx_varieties_name" ON "varieties"("name");

-- CreateIndex
CREATE INDEX "idx_weather_data_production" ON "weather_data"("productionId");

-- CreateIndex
CREATE INDEX "idx_weather_data_date" ON "weather_data"("recordDate");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
