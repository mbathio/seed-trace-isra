-- backend/prisma/migrations/unify_enum_values.sql
-- Migration pour unifier les valeurs d'enums

-- ✅ 1. Role enum (UPPER_CASE vers minuscules)
UPDATE users SET role = 'admin' WHERE role = 'ADMIN';
UPDATE users SET role = 'manager' WHERE role = 'MANAGER';
UPDATE users SET role = 'inspector' WHERE role = 'INSPECTOR';
UPDATE users SET role = 'multiplier' WHERE role = 'MULTIPLIER';
UPDATE users SET role = 'guest' WHERE role = 'GUEST';
UPDATE users SET role = 'technician' WHERE role = 'TECHNICIAN';
UPDATE users SET role = 'researcher' WHERE role = 'RESEARCHER';

-- ✅ 2. CropType enum (UPPER_CASE vers minuscules)
UPDATE varieties SET "cropType" = 'rice' WHERE "cropType" = 'RICE';
UPDATE varieties SET "cropType" = 'maize' WHERE "cropType" = 'MAIZE';
UPDATE varieties SET "cropType" = 'peanut' WHERE "cropType" = 'PEANUT';
UPDATE varieties SET "cropType" = 'sorghum' WHERE "cropType" = 'SORGHUM';
UPDATE varieties SET "cropType" = 'cowpea' WHERE "cropType" = 'COWPEA';
UPDATE varieties SET "cropType" = 'millet' WHERE "cropType" = 'MILLET';
UPDATE varieties SET "cropType" = 'wheat' WHERE "cropType" = 'WHEAT';

-- ✅ 3. LotStatus enum (UPPER_CASE/SNAKE_CASE vers kebab-case)
UPDATE seed_lots SET status = 'pending' WHERE status = 'PENDING';
UPDATE seed_lots SET status = 'certified' WHERE status = 'CERTIFIED';
UPDATE seed_lots SET status = 'rejected' WHERE status = 'REJECTED';
UPDATE seed_lots SET status = 'in-stock' WHERE status IN ('IN_STOCK', 'IN-STOCK');
UPDATE seed_lots SET status = 'sold' WHERE status = 'SOLD';
UPDATE seed_lots SET status = 'active' WHERE status = 'ACTIVE';
UPDATE seed_lots SET status = 'distributed' WHERE status = 'DISTRIBUTED';

-- ✅ 4. TestResult enum (UPPER_CASE vers minuscules)
UPDATE quality_controls SET result = 'pass' WHERE result = 'PASS';
UPDATE quality_controls SET result = 'fail' WHERE result = 'FAIL';

-- ✅ 5. ParcelStatus enum (UPPER_CASE/SNAKE_CASE vers kebab-case)
UPDATE parcels SET status = 'available' WHERE status = 'AVAILABLE';
UPDATE parcels SET status = 'in-use' WHERE status IN ('IN_USE', 'IN-USE');
UPDATE parcels SET status = 'resting' WHERE status = 'RESTING';

-- ✅ 6. ProductionStatus enum (UPPER_CASE/SNAKE_CASE vers kebab-case)
UPDATE productions SET status = 'planned' WHERE status = 'PLANNED';
UPDATE productions SET status = 'in-progress' WHERE status IN ('IN_PROGRESS', 'IN-PROGRESS');
UPDATE productions SET status = 'completed' WHERE status = 'COMPLETED';
UPDATE productions SET status = 'cancelled' WHERE status = 'CANCELLED';

-- ✅ 7. ActivityType enum (UPPER_CASE/SNAKE_CASE vers kebab-case)
UPDATE production_activities SET type = 'soil-preparation' WHERE type IN ('SOIL_PREPARATION', 'SOIL-PREPARATION');
UPDATE production_activities SET type = 'sowing' WHERE type = 'SOWING';
UPDATE production_activities SET type = 'fertilization' WHERE type = 'FERTILIZATION';
UPDATE production_activities SET type = 'irrigation' WHERE type = 'IRRIGATION';
UPDATE production_activities SET type = 'weeding' WHERE type = 'WEEDING';
UPDATE production_activities SET type = 'pest-control' WHERE type IN ('PEST_CONTROL', 'PEST-CONTROL');
UPDATE production_activities SET type = 'harvest' WHERE type = 'HARVEST';
UPDATE production_activities SET type = 'other' WHERE type = 'OTHER';

-- ✅ 8. MultiplierStatus enum (UPPER_CASE vers minuscules)
UPDATE multipliers SET status = 'active' WHERE status = 'ACTIVE';
UPDATE multipliers SET status = 'inactive' WHERE status = 'INACTIVE';

-- ✅ 9. CertificationLevel enum (UPPER_CASE vers minuscules)
UPDATE multipliers SET "certificationLevel" = 'beginner' WHERE "certificationLevel" = 'BEGINNER';
UPDATE multipliers SET "certificationLevel" = 'intermediate' WHERE "certificationLevel" = 'INTERMEDIATE';
UPDATE multipliers SET "certificationLevel" = 'expert' WHERE "certificationLevel" = 'EXPERT';

-- ✅ 10. ContractStatus enum (UPPER_CASE vers minuscules)
UPDATE contracts SET status = 'draft' WHERE status = 'DRAFT';
UPDATE contracts SET status = 'active' WHERE status = 'ACTIVE';
UPDATE contracts SET status = 'completed' WHERE status = 'COMPLETED';
UPDATE contracts SET status = 'cancelled' WHERE status = 'CANCELLED';

-- ✅ 11. IssueType enum (UPPER_CASE vers minuscules)
UPDATE production_issues SET type = 'disease' WHERE type = 'DISEASE';
UPDATE production_issues SET type = 'pest' WHERE type = 'PEST';
UPDATE production_issues SET type = 'weather' WHERE type = 'WEATHER';
UPDATE production_issues SET type = 'management' WHERE type = 'MANAGEMENT';
UPDATE production_issues SET type = 'other' WHERE type = 'OTHER';

-- ✅ 12. IssueSeverity enum (UPPER_CASE vers minuscules)
UPDATE production_issues SET severity = 'low' WHERE severity = 'LOW';
UPDATE production_issues SET severity = 'medium' WHERE severity = 'MEDIUM';
UPDATE production_issues SET severity = 'high' WHERE severity = 'HIGH';

-- ✅ 13. ReportType enum (UPPER_CASE/SNAKE_CASE vers kebab-case)
UPDATE reports SET type = 'production' WHERE type = 'PRODUCTION';
UPDATE reports SET type = 'quality' WHERE type = 'QUALITY';
UPDATE reports SET type = 'inventory' WHERE type = 'INVENTORY';
UPDATE reports SET type = 'multiplier-performance' WHERE type IN ('MULTIPLIER_PERFORMANCE', 'MULTIPLIER-PERFORMANCE');
UPDATE reports SET type = 'custom' WHERE type = 'CUSTOM';

-- ✅ Mise à jour des spécialisations des multiplicateurs (array de CropType)
-- Cette partie nécessite du code PostgreSQL plus complexe car c'est un array
UPDATE multipliers 
SET specialization = ARRAY(
  SELECT CASE 
    WHEN unnest(specialization) = 'RICE' THEN 'rice'
    WHEN unnest(specialization) = 'MAIZE' THEN 'maize'
    WHEN unnest(specialization) = 'PEANUT' THEN 'peanut'
    WHEN unnest(specialization) = 'SORGHUM' THEN 'sorghum'
    WHEN unnest(specialization) = 'COWPEA' THEN 'cowpea'
    WHEN unnest(specialization) = 'MILLET' THEN 'millet'
    WHEN unnest(specialization) = 'WHEAT' THEN 'wheat'
    ELSE unnest(specialization)
  END
  FROM unnest(specialization)
)
WHERE specialization && ARRAY['RICE', 'MAIZE', 'PEANUT', 'SORGHUM', 'COWPEA', 'MILLET', 'WHEAT'];

-- Vérification des mises à jour
SELECT 'Users roles updated:' as message, COUNT(*) as count 
FROM users 
WHERE role IN ('admin', 'manager', 'inspector', 'multiplier', 'guest', 'technician', 'researcher');

SELECT 'Seed lots status updated:' as message, COUNT(*) as count 
FROM seed_lots 
WHERE status IN ('pending', 'certified', 'rejected', 'in-stock', 'sold', 'active', 'distributed');

SELECT 'Quality controls result updated:' as message, COUNT(*) as count 
FROM quality_controls 
WHERE result IN ('pass', 'fail');