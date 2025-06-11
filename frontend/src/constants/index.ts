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
  { value: "RICE", label: "Riz" },
  { value: "MAIZE", label: "Maïs" },
  { value: "PEANUT", label: "Arachide" },
  { value: "SORGHUM", label: "Sorgho" },
  { value: "COWPEA", label: "Niébé" },
  { value: "MILLET", label: "Mil" },
];

// ✅ CORRECTION: Utiliser les mêmes valeurs exactes que la DB (MAJUSCULES + underscore)
export const LOT_STATUSES = [
  { value: "PENDING", label: "En attente" },
  { value: "CERTIFIED", label: "Certifié" },
  { value: "REJECTED", label: "Rejeté" },
  { value: "IN_STOCK", label: "En stock" },
  { value: "ACTIVE", label: "Actif" },
  { value: "DISTRIBUTED", label: "Distribué" },
  { value: "SOLD", label: "Vendu" },
];

// ✅ CORRECTION: Valeurs exactes de la DB (MAJUSCULES)
export const USER_ROLES = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "MANAGER", label: "Manager" },
  { value: "RESEARCHER", label: "Chercheur" },
  { value: "TECHNICIAN", label: "Technicien" },
  { value: "INSPECTOR", label: "Inspecteur" },
  { value: "MULTIPLIER", label: "Multiplicateur" },
  { value: "GUEST", label: "Invité" },
];

// ✅ CORRECTION: Valeurs exactes de la DB (MAJUSCULES)
export const QUALITY_TEST_RESULTS = [
  { value: "PASS", label: "Réussi" },
  { value: "FAIL", label: "Échec" },
];

// ✅ CORRECTION: Valeurs exactes de la DB (MAJUSCULES + underscore)
export const PRODUCTION_STATUSES = [
  { value: "PLANNED", label: "Planifiée" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminée" },
  { value: "CANCELLED", label: "Annulée" },
];

export const MULTIPLIER_STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
];

export const CERTIFICATION_LEVELS = [
  { value: "BEGINNER", label: "Débutant" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "EXPERT", label: "Expert" },
];

export const PARCEL_STATUSES = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "IN_USE", label: "En cours d'utilisation" },
  { value: "RESTING", label: "En repos" },
];

export const CONTRACT_STATUSES = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "ACTIVE", label: "Actif" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
];

// ✅ AJOUT: Mapping pour transformation frontend/backend si nécessaire
export const STATUS_MAPPINGS = {
  // Frontend vers Backend (si on utilisait des valeurs différentes)
  toBackend: {
    pending: "PENDING",
    certified: "CERTIFIED",
    rejected: "REJECTED",
    "in-stock": "IN_STOCK",
    active: "ACTIVE",
    distributed: "DISTRIBUTED",
    sold: "SOLD",
    planned: "PLANNED",
    "in-progress": "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
    pass: "PASS",
    fail: "FAIL",
  },
  // Backend vers Frontend (pour l'affichage)
  toFrontend: {
    PENDING: "En attente",
    CERTIFIED: "Certifié",
    REJECTED: "Rejeté",
    IN_STOCK: "En stock",
    ACTIVE: "Actif",
    DISTRIBUTED: "Distribué",
    SOLD: "Vendu",
    PLANNED: "Planifiée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
    PASS: "Réussi",
    FAIL: "Échec",
  },
};

// ✅ AJOUT: Configuration des endpoints API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Lots de semences
  SEED_LOTS: {
    BASE: "/seed-lots",
    DETAIL: (id: string) => `/seed-lots/${id}`,
    GENEALOGY: (id: string) => `/seed-lots/${id}/genealogy`,
    QR_CODE: (id: string) => `/seed-lots/${id}/qr-code`,
  },

  // Variétés
  VARIETIES: {
    BASE: "/varieties",
    DETAIL: (id: string) => `/varieties/${id}`,
  },

  // Multiplicateurs
  MULTIPLIERS: {
    BASE: "/multipliers",
    DETAIL: (id: number) => `/multipliers/${id}`,
  },

  // Parcelles
  PARCELS: {
    BASE: "/parcels",
    DETAIL: (id: number) => `/parcels/${id}`,
  },

  // Contrôles qualité
  QUALITY_CONTROLS: {
    BASE: "/quality-controls",
    DETAIL: (id: number) => `/quality-controls/${id}`,
  },

  // Productions
  PRODUCTIONS: {
    BASE: "/productions",
    DETAIL: (id: number) => `/productions/${id}`,
  },

  // Statistiques
  STATISTICS: {
    DASHBOARD: "/statistics/dashboard",
    PRODUCTION: "/statistics/production",
    QUALITY: "/statistics/quality",
  },

  // Autres
  HEALTH: "/health",
};

// ✅ AJOUT: Configuration par défaut pour les requêtes
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

// ✅ AJOUT: Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion au serveur",
  UNAUTHORIZED: "Session expirée. Veuillez vous reconnecter.",
  FORBIDDEN: "Accès refusé",
  NOT_FOUND: "Ressource non trouvée",
  VALIDATION_ERROR: "Données invalides",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite",
};
