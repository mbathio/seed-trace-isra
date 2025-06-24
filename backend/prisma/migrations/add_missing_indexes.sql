-- backend/prisma/migrations/add_missing_indexes.sql

-- Index pour améliorer les requêtes de contrôle qualité
CREATE INDEX idx_quality_controls_inspector_date ON quality_controls(inspectorId, controlDate DESC);
CREATE INDEX idx_quality_controls_lot_result ON quality_controls(lotId, result);

-- Index pour améliorer les requêtes de multiplicateurs
CREATE INDEX idx_multipliers_name ON multipliers(name);
CREATE INDEX idx_multipliers_email ON multipliers(email);

-- Index pour améliorer les requêtes de lots
CREATE INDEX idx_seed_lots_variety_status ON seed_lots(varietyId, status);
CREATE INDEX idx_seed_lots_multiplier_date ON seed_lots(multiplierId, productionDate DESC);