-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'inspector', 'multiplier', 'guest', 'technician', 'researcher');

-- CreateEnum
CREATE TYPE "SeedLevel" AS ENUM ('GO', 'G1', 'G2', 'G3', 'G4', 'R1', 'R2');

-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('rice', 'maize', 'peanut', 'sorghum', 'cowpea', 'millet');

-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('available', 'in_use', 'resting');

-- CreateEnum
CREATE TYPE "SeedLotStatus" AS ENUM ('pending', 'certified', 'rejected', 'in_stock', 'sold', 'active', 'distributed');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "CertificationLevel" AS ENUM ('beginner', 'intermediate', 'expert');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('soil_preparation', 'sowing', 'fertilization', 'irrigation', 'weeding', 'pest_control', 'harvest', 'other');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('disease', 'pest', 'weather', 'management', 'other');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "QualityControlResult" AS ENUM ('pass', 'fail');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('production', 'quality', 'inventory', 'multiplier_performance', 'custom');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "varieties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cropType" "CropType" NOT NULL,
    "description" TEXT,
    "maturityDays" INTEGER NOT NULL,
    "yieldPotential" DOUBLE PRECISION,
    "resistances" TEXT[],
    "origin" TEXT,
    "releaseYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "varieties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "area" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "ParcelStatus" NOT NULL,
    "soilType" TEXT,
    "irrigationSystem" TEXT,
    "address" TEXT,
    "multiplierId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soil_analyses" (
    "id" SERIAL NOT NULL,
    "parcelId" INTEGER NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL,
    "pH" DOUBLE PRECISION,
    "organicMatter" DOUBLE PRECISION,
    "nitrogen" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "previous_crops" (
    "id" SERIAL NOT NULL,
    "parcelId" INTEGER NOT NULL,
    "crop" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "yield" DOUBLE PRECISION,

    CONSTRAINT "previous_crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multipliers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "certificationLevel" "CertificationLevel" NOT NULL,
    "specialization" TEXT[],
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "multipliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" SERIAL NOT NULL,
    "multiplierId" INTEGER NOT NULL,
    "varietyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "seedLevel" "SeedLevel" NOT NULL,
    "expectedQuantity" INTEGER NOT NULL,
    "actualQuantity" INTEGER,
    "status" "ContractStatus" NOT NULL DEFAULT 'draft',
    "parcelId" INTEGER,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_history" (
    "id" SERIAL NOT NULL,
    "multiplierId" INTEGER NOT NULL,
    "varietyId" TEXT NOT NULL,
    "seedLevel" "SeedLevel" NOT NULL,
    "season" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "qualityScore" INTEGER,
    "contractId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seed_lots" (
    "id" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "level" "SeedLevel" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "multiplierId" INTEGER,
    "parcelId" INTEGER,
    "status" "SeedLotStatus" NOT NULL DEFAULT 'pending',
    "batchNumber" TEXT,
    "parentLotId" TEXT,
    "notes" TEXT,
    "qrCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seed_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_controls" (
    "id" SERIAL NOT NULL,
    "lotId" TEXT NOT NULL,
    "controlDate" TIMESTAMP(3) NOT NULL,
    "germinationRate" DOUBLE PRECISION NOT NULL,
    "varietyPurity" DOUBLE PRECISION NOT NULL,
    "moistureContent" DOUBLE PRECISION,
    "seedHealth" DOUBLE PRECISION,
    "result" "QualityControlResult" NOT NULL,
    "observations" TEXT,
    "inspectorId" INTEGER NOT NULL,
    "testMethod" TEXT,
    "laboratoryRef" TEXT,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions" (
    "id" SERIAL NOT NULL,
    "lotId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "sowingDate" TIMESTAMP(3),
    "harvestDate" TIMESTAMP(3),
    "multiplierId" INTEGER NOT NULL,
    "parcelId" INTEGER NOT NULL,
    "status" "ProductionStatus" NOT NULL DEFAULT 'planned',
    "plannedQuantity" INTEGER,
    "actualYield" DOUBLE PRECISION,
    "notes" TEXT,
    "weatherConditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_activities" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "personnel" TEXT[],
    "notes" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_inputs" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,

    CONSTRAINT "activity_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_issues" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "type" "IssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "actions" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "description" TEXT,
    "createdById" INTEGER NOT NULL,
    "fileName" TEXT,
    "filePath" TEXT,
    "parameters" JSONB,
    "data" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_varieties_crop_type" ON "varieties"("cropType");

-- CreateIndex
CREATE INDEX "idx_varieties_active" ON "varieties"("isActive");

-- CreateIndex
CREATE INDEX "idx_parcels_status" ON "parcels"("status");

-- CreateIndex
CREATE INDEX "idx_parcels_multiplier" ON "parcels"("multiplierId");

-- CreateIndex
CREATE INDEX "idx_multipliers_status" ON "multipliers"("status");

-- CreateIndex
CREATE INDEX "idx_multipliers_certification" ON "multipliers"("certificationLevel");

-- CreateIndex
CREATE INDEX "idx_contracts_status" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "idx_contracts_multiplier" ON "contracts"("multiplierId");

-- CreateIndex
CREATE INDEX "idx_seed_lots_variety" ON "seed_lots"("varietyId");

-- CreateIndex
CREATE INDEX "idx_seed_lots_multiplier" ON "seed_lots"("multiplierId");

-- CreateIndex
CREATE INDEX "idx_seed_lots_parcel" ON "seed_lots"("parcelId");

-- CreateIndex
CREATE INDEX "idx_seed_lots_status" ON "seed_lots"("status");

-- CreateIndex
CREATE INDEX "idx_seed_lots_level" ON "seed_lots"("level");

-- CreateIndex
CREATE INDEX "idx_seed_lots_production_date" ON "seed_lots"("productionDate");

-- CreateIndex
CREATE INDEX "idx_seed_lots_parent" ON "seed_lots"("parentLotId");

-- CreateIndex
CREATE INDEX "idx_quality_controls_date" ON "quality_controls"("controlDate");

-- CreateIndex
CREATE INDEX "idx_quality_controls_result" ON "quality_controls"("result");

-- CreateIndex
CREATE INDEX "idx_quality_controls_lot" ON "quality_controls"("lotId");

-- CreateIndex
CREATE INDEX "idx_productions_status" ON "productions"("status");

-- CreateIndex
CREATE INDEX "idx_productions_start_date" ON "productions"("startDate");

-- CreateIndex
CREATE INDEX "idx_productions_multiplier" ON "productions"("multiplierId");

-- CreateIndex
CREATE INDEX "idx_reports_type" ON "reports"("type");

-- CreateIndex
CREATE INDEX "idx_reports_created" ON "reports"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_multiplierId_fkey" FOREIGN KEY ("multiplierId") REFERENCES "multipliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_analyses" ADD CONSTRAINT "soil_analyses_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "previous_crops" ADD CONSTRAINT "previous_crops_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_multiplierId_fkey" FOREIGN KEY ("multiplierId") REFERENCES "multipliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_history" ADD CONSTRAINT "production_history_multiplierId_fkey" FOREIGN KEY ("multiplierId") REFERENCES "multipliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seed_lots" ADD CONSTRAINT "seed_lots_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seed_lots" ADD CONSTRAINT "seed_lots_multiplierId_fkey" FOREIGN KEY ("multiplierId") REFERENCES "multipliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seed_lots" ADD CONSTRAINT "seed_lots_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seed_lots" ADD CONSTRAINT "seed_lots_parentLotId_fkey" FOREIGN KEY ("parentLotId") REFERENCES "seed_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_controls" ADD CONSTRAINT "quality_controls_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "seed_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_controls" ADD CONSTRAINT "quality_controls_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "seed_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_multiplierId_fkey" FOREIGN KEY ("multiplierId") REFERENCES "multipliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_activities" ADD CONSTRAINT "production_activities_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_activities" ADD CONSTRAINT "production_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_inputs" ADD CONSTRAINT "activity_inputs_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "production_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_issues" ADD CONSTRAINT "production_issues_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
