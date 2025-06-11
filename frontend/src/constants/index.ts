// frontend/src/constants/index.ts - VERSION CORRIGÉE
export const SEED_LEVELS = [
  { value: "GO", label: "GO - Génération origine" },
  { value: "G1", label: "G1 - Première génération" },
  { value: "G2", label: "G2 - Deuxième génération" },
  { value: "G3", label: "G3 - Troisième génération" },
  { value: "G4", label: "G4 - Quatrième génération" },
  { value: "R1", label: "R1 - Première reproduction" },
  { value: "R2", label: "R2 - Deuxième reproduction" },
];

export const CROP_TYPES = [
  { value: "rice", label: "Riz" },
  { value: "maize", label: "Maïs" },
  { value: "peanut", label: "Arachide" },
  { value: "sorghum", label: "Sorgho" },
  { value: "cowpea", label: "Niébé" },
  { value: "millet", label: "Mil" },
];

// Valeurs UI (minuscules avec tirets)
export const LOT_STATUSES = [
  { value: "pending", label: "En attente" },
  { value: "certified", label: "Certifié" },
  { value: "rejected", label: "Rejeté" },
  { value: "in-stock", label: "En stock" },
  { value: "active", label: "Actif" },
  { value: "distributed", label: "Distribué" },
  { value: "sold", label: "Vendu" },
];

export const USER_ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "manager", label: "Manager" },
  { value: "researcher", label: "Chercheur" },
  { value: "technician", label: "Technicien" },
  { value: "inspector", label: "Inspecteur" },
  { value: "multiplier", label: "Multiplicateur" },
  { value: "guest", label: "Invité" },
];

export const QUALITY_TEST_RESULTS = [
  { value: "pass", label: "Réussi" },
  { value: "fail", label: "Échec" },
];

export const PRODUCTION_STATUSES = [
  { value: "planned", label: "Planifiée" },
  { value: "in-progress", label: "En cours" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];

export const MULTIPLIER_STATUSES = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
];

export const CERTIFICATION_LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "expert", label: "Expert" },
];

export const PARCEL_STATUSES = [
  { value: "available", label: "Disponible" },
  { value: "in-use", label: "En cours d'utilisation" },
  { value: "resting", label: "En repos" },
];

// Configuration pour l'API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion au serveur",
  UNAUTHORIZED: "Session expirée. Veuillez vous reconnecter.",
  FORBIDDEN: "Accès refusé",
  NOT_FOUND: "Ressource non trouvée",
  VALIDATION_ERROR: "Données invalides",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite",
};

// Configuration des requêtes par défaut
export const DEFAULT_QUERY_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 1 * 60 * 1000, // 1 minute
  RETRY_ATTEMPTS: 3,
};
