-- backend/init.sql
-- Script d'initialisation de la base de données PostgreSQL

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Définir le timezone pour l'Afrique de l'Ouest
SET timezone = 'Africa/Dakar';

-- Créer les index pour les performances de recherche
CREATE INDEX IF NOT EXISTS idx_seed_lots_search 
  ON seed_lots USING gin(to_tsvector('french', id || ' ' || COALESCE(notes, '')));

CREATE INDEX IF NOT EXISTS idx_varieties_search 
  ON varieties USING gin(to_tsvector('french', name || ' ' || code || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_multipliers_search 
  ON multipliers USING gin(to_tsvector('french', name || ' ' || address || ' ' || COALESCE(email, '')));

-- Index pour les coordonnées géographiques
CREATE INDEX IF NOT EXISTS idx_parcels_location 
  ON parcels USING gist(point(longitude, latitude));

CREATE INDEX IF NOT EXISTS idx_multipliers_location 
  ON multipliers USING gist(point(longitude, latitude));

-- Index pour les dates
CREATE INDEX IF NOT EXISTS idx_productions_date_range 
  ON productions(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_quality_controls_month 
  ON quality_controls(date_trunc('month', control_date));

-- Fonction pour calculer la distance entre deux points (en km)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 FLOAT, lon1 FLOAT, 
  lat2 FLOAT, lon2 FLOAT
) RETURNS FLOAT AS $$
BEGIN
  RETURN 6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) * 
    cos(radians(lon2) - radians(lon1)) + 
    sin(radians(lat1)) * sin(radians(lat2))
  );
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques mensuelles
CREATE OR REPLACE VIEW monthly_production_stats AS
SELECT 
  date_trunc('month', start_date) as month,
  COUNT(*) as production_count,
  SUM(actual_yield) as total_yield,
  AVG(actual_yield) as avg_yield,
  COUNT(DISTINCT multiplier_id) as active_multipliers
FROM productions
WHERE start_date >= NOW() - INTERVAL '12 months'
GROUP BY date_trunc('month', start_date)
ORDER BY month DESC;

-- Vue pour l'inventaire actuel
CREATE OR REPLACE VIEW current_inventory AS
SELECT 
  v.name as variety_name,
  v.code as variety_code,
  sl.level,
  COUNT(*) as lot_count,
  SUM(sl.quantity) as total_quantity,
  COUNT(CASE WHEN sl.status = 'CERTIFIED' THEN 1 END) as certified_lots,
  COUNT(CASE WHEN sl.status = 'PENDING' THEN 1 END) as pending_lots
FROM seed_lots sl
JOIN varieties v ON sl.variety_id = v.id
WHERE sl.is_active = true
GROUP BY v.id, v.name, v.code, sl.level
ORDER BY v.name, sl.level;

-- Commentaires sur les tables principales
COMMENT ON TABLE users IS 'Utilisateurs du système ISRA de traçabilité des semences';
COMMENT ON TABLE varieties IS 'Variétés de semences (riz, maïs, arachide, etc.)';
COMMENT ON TABLE seed_lots IS 'Lots de semences avec traçabilité complète';
COMMENT ON TABLE multipliers IS 'Multiplicateurs de semences certifiés';
COMMENT ON TABLE parcels IS 'Parcelles agricoles pour la production';
COMMENT ON TABLE productions IS 'Productions de semences avec suivi complet';
COMMENT ON TABLE quality_controls IS 'Contrôles qualité des lots de semences';

-- Trigger pour mettre à jour automatiquement le statut des lots expirés
CREATE OR REPLACE FUNCTION update_expired_lots() RETURNS trigger AS $$
BEGIN
  UPDATE seed_lots 
  SET status = 'REJECTED' 
  WHERE expiry_date < NOW() 
  AND status NOT IN ('REJECTED', 'SOLD');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_expired_lots
  AFTER INSERT OR UPDATE ON seed_lots
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_expired_lots();