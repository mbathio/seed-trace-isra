/*
  Warnings:

  - The `specialization` column on the `multipliers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `crop` on the `previous_crops` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `previous_crops` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `production_history` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `production_history` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `production_issues` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `production_issues` table. All the data in the column will be lost.
  - The primary key for the `productions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `conditions` on the `productions` table. All the data in the column will be lost.
  - You are about to drop the column `yield` on the `productions` table. All the data in the column will be lost.
  - You are about to alter the column `actualYield` on the `productions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `refresh_tokens` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `soil_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `soil_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `weather_data` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `multipliers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cropType` to the `previous_crops` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `production_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productionId` on table `weather_data` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "previous_crops" DROP CONSTRAINT "previous_crops_parcelId_fkey";

-- DropForeignKey
ALTER TABLE "production_activities" DROP CONSTRAINT "production_activities_productionId_fkey";

-- DropForeignKey
ALTER TABLE "production_activities" DROP CONSTRAINT "production_activities_userId_fkey";

-- DropForeignKey
ALTER TABLE "production_issues" DROP CONSTRAINT "production_issues_productionId_fkey";

-- DropForeignKey
ALTER TABLE "soil_analyses" DROP CONSTRAINT "soil_analyses_parcelId_fkey";

-- DropForeignKey
ALTER TABLE "weather_data" DROP CONSTRAINT "weather_data_productionId_fkey";

-- DropIndex
DROP INDEX "idx_activity_inputs_activity";

-- DropIndex
DROP INDEX "idx_contracts_dates";

-- DropIndex
DROP INDEX "idx_contracts_multiplier_status";

-- DropIndex
DROP INDEX "idx_multipliers_email";

-- DropIndex
DROP INDEX "idx_multipliers_location";

-- DropIndex
DROP INDEX "idx_multipliers_name";

-- DropIndex
DROP INDEX "idx_multipliers_status_active";

-- DropIndex
DROP INDEX "multipliers_email_key";

-- DropIndex
DROP INDEX "idx_parcels_location";

-- DropIndex
DROP INDEX "idx_parcels_multiplier_status";

-- DropIndex
DROP INDEX "idx_previous_crops_parcel_year";

-- DropIndex
DROP INDEX "idx_production_activities_date";

-- DropIndex
DROP INDEX "idx_production_activities_prod_date";

-- DropIndex
DROP INDEX "idx_production_history_multiplier_year";

-- DropIndex
DROP INDEX "idx_production_issues_date";

-- DropIndex
DROP INDEX "idx_production_issues_prod_resolved";

-- DropIndex
DROP INDEX "idx_productions_date_range";

-- DropIndex
DROP INDEX "idx_productions_multiplier_status";

-- DropIndex
DROP INDEX "idx_productions_start_date";

-- DropIndex
DROP INDEX "idx_quality_controls_date";

-- DropIndex
DROP INDEX "idx_quality_controls_inspector";

-- DropIndex
DROP INDEX "idx_quality_controls_lot_date";

-- DropIndex
DROP INDEX "idx_quality_controls_result_date";

-- DropIndex
DROP INDEX "idx_refresh_tokens_token_expiry";

-- DropIndex
DROP INDEX "idx_refresh_tokens_user_expiry";

-- DropIndex
DROP INDEX "idx_reports_created";

-- DropIndex
DROP INDEX "idx_reports_type_created";

-- DropIndex
DROP INDEX "idx_seed_lots_active";

-- DropIndex
DROP INDEX "idx_seed_lots_expiry_status";

-- DropIndex
DROP INDEX "idx_seed_lots_multiplier";

-- DropIndex
DROP INDEX "idx_seed_lots_multiplier_complete";

-- DropIndex
DROP INDEX "idx_seed_lots_parcel";

-- DropIndex
DROP INDEX "idx_seed_lots_parent";

-- DropIndex
DROP INDEX "idx_seed_lots_production_date";

-- DropIndex
DROP INDEX "idx_seed_lots_production_level";

-- DropIndex
DROP INDEX "idx_seed_lots_variety_level_status";

-- DropIndex
DROP INDEX "idx_soil_analyses_date";

-- DropIndex
DROP INDEX "idx_soil_analyses_parcel_date";

-- DropIndex
DROP INDEX "idx_users_role_active";

-- DropIndex
DROP INDEX "idx_varieties_crop_active";

-- DropIndex
DROP INDEX "idx_varieties_name";

-- DropIndex
DROP INDEX "idx_weather_data_prod_date";

-- AlterTable
ALTER TABLE "multipliers" ADD COLUMN     "code" TEXT,
DROP COLUMN "specialization",
ADD COLUMN     "specialization" "crop_type"[];

-- AlterTable
ALTER TABLE "previous_crops" DROP COLUMN "crop",
DROP COLUMN "season",
ADD COLUMN     "cropType" "crop_type" NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "variety" TEXT;

-- AlterTable
ALTER TABLE "production_activities" ALTER COLUMN "productionId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "production_history" DROP COLUMN "contractId",
DROP COLUMN "createdAt",
ALTER COLUMN "qualityScore" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "production_issues" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "productionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "productions" DROP CONSTRAINT "productions_pkey",
DROP COLUMN "conditions",
DROP COLUMN "yield",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sowingDate" DROP NOT NULL,
ALTER COLUMN "actualYield" SET DATA TYPE INTEGER,
ADD CONSTRAINT "productions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "productions_id_seq";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "soil_analyses" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "weather_data" DROP COLUMN "createdAt",
ALTER COLUMN "productionId" SET NOT NULL,
ALTER COLUMN "productionId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "multipliers_code_key" ON "multipliers"("code");

-- CreateIndex
CREATE INDEX "production_activities_userId_idx" ON "production_activities"("userId");

-- CreateIndex
CREATE INDEX "production_history_varietyId_idx" ON "production_history"("varietyId");

-- CreateIndex
CREATE INDEX "production_issues_type_idx" ON "production_issues"("type");

-- CreateIndex
CREATE INDEX "production_issues_severity_idx" ON "production_issues"("severity");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "production_activities" ADD CONSTRAINT "production_activities_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_activities" ADD CONSTRAINT "production_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_issues" ADD CONSTRAINT "production_issues_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_analyses" ADD CONSTRAINT "soil_analyses_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "previous_crops" ADD CONSTRAINT "previous_crops_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_history" ADD CONSTRAINT "production_history_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_contracts_multiplier" RENAME TO "contracts_multiplierId_idx";

-- RenameIndex
ALTER INDEX "idx_contracts_status" RENAME TO "contracts_status_idx";

-- RenameIndex
ALTER INDEX "idx_contracts_variety" RENAME TO "contracts_varietyId_idx";

-- RenameIndex
ALTER INDEX "idx_multipliers_active" RENAME TO "multipliers_isActive_idx";

-- RenameIndex
ALTER INDEX "idx_multipliers_certification" RENAME TO "multipliers_certificationLevel_idx";

-- RenameIndex
ALTER INDEX "idx_multipliers_status" RENAME TO "multipliers_status_idx";

-- RenameIndex
ALTER INDEX "idx_parcels_active" RENAME TO "parcels_isActive_idx";

-- RenameIndex
ALTER INDEX "idx_parcels_multiplier" RENAME TO "parcels_multiplierId_idx";

-- RenameIndex
ALTER INDEX "idx_parcels_status" RENAME TO "parcels_status_idx";

-- RenameIndex
ALTER INDEX "idx_previous_crops_parcel" RENAME TO "previous_crops_parcelId_idx";

-- RenameIndex
ALTER INDEX "idx_previous_crops_year" RENAME TO "previous_crops_year_idx";

-- RenameIndex
ALTER INDEX "idx_production_activities_production" RENAME TO "production_activities_productionId_idx";

-- RenameIndex
ALTER INDEX "idx_production_activities_type" RENAME TO "production_activities_type_idx";

-- RenameIndex
ALTER INDEX "idx_production_history_multiplier" RENAME TO "production_history_multiplierId_idx";

-- RenameIndex
ALTER INDEX "idx_production_history_year" RENAME TO "production_history_year_idx";

-- RenameIndex
ALTER INDEX "idx_production_issues_production" RENAME TO "production_issues_productionId_idx";

-- RenameIndex
ALTER INDEX "idx_production_issues_resolved" RENAME TO "production_issues_resolved_idx";

-- RenameIndex
ALTER INDEX "idx_productions_lot" RENAME TO "productions_lotId_idx";

-- RenameIndex
ALTER INDEX "idx_productions_multiplier" RENAME TO "productions_multiplierId_idx";

-- RenameIndex
ALTER INDEX "idx_productions_parcel" RENAME TO "productions_parcelId_idx";

-- RenameIndex
ALTER INDEX "idx_productions_status" RENAME TO "productions_status_idx";

-- RenameIndex
ALTER INDEX "idx_quality_controls_lot" RENAME TO "quality_controls_lotId_idx";

-- RenameIndex
ALTER INDEX "idx_quality_controls_result" RENAME TO "quality_controls_result_idx";

-- RenameIndex
ALTER INDEX "idx_refresh_tokens_expiry" RENAME TO "refresh_tokens_expiresAt_idx";

-- RenameIndex
ALTER INDEX "idx_refresh_tokens_user" RENAME TO "refresh_tokens_userId_idx";

-- RenameIndex
ALTER INDEX "idx_reports_creator" RENAME TO "reports_createdById_idx";

-- RenameIndex
ALTER INDEX "idx_reports_public" RENAME TO "reports_isPublic_idx";

-- RenameIndex
ALTER INDEX "idx_reports_type" RENAME TO "reports_type_idx";

-- RenameIndex
ALTER INDEX "idx_seed_lots_level" RENAME TO "seed_lots_level_idx";

-- RenameIndex
ALTER INDEX "idx_seed_lots_status" RENAME TO "seed_lots_status_idx";

-- RenameIndex
ALTER INDEX "idx_seed_lots_variety" RENAME TO "seed_lots_varietyId_idx";

-- RenameIndex
ALTER INDEX "idx_soil_analyses_parcel" RENAME TO "soil_analyses_parcelId_idx";

-- RenameIndex
ALTER INDEX "idx_users_active" RENAME TO "users_isActive_idx";

-- RenameIndex
ALTER INDEX "idx_users_email" RENAME TO "users_email_idx";

-- RenameIndex
ALTER INDEX "idx_users_role" RENAME TO "users_role_idx";

-- RenameIndex
ALTER INDEX "idx_varieties_active" RENAME TO "varieties_isActive_idx";

-- RenameIndex
ALTER INDEX "idx_varieties_code" RENAME TO "varieties_code_idx";

-- RenameIndex
ALTER INDEX "idx_varieties_crop_type" RENAME TO "varieties_cropType_idx";

-- RenameIndex
ALTER INDEX "idx_weather_data_date" RENAME TO "weather_data_recordDate_idx";

-- RenameIndex
ALTER INDEX "idx_weather_data_production" RENAME TO "weather_data_productionId_idx";
