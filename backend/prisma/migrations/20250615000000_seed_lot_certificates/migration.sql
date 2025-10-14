-- Add columns to store official certificate metadata for seed lots
ALTER TABLE "seed_lots"
  ADD COLUMN "officialCertificatePath" TEXT,
  ADD COLUMN "officialCertificateFilename" TEXT,
  ADD COLUMN "officialCertificateMimeType" TEXT,
  ADD COLUMN "officialCertificateSize" INTEGER,
  ADD COLUMN "officialCertificateUploadedAt" TIMESTAMP(3);
