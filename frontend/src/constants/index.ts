// frontend/src/constants/index.ts - CONSTANTES CORRIGÉES
export const SEED_LEVELS = [
  { value: "GO", label: "GO - Génération origine" },
  { value: "G1", label: "G1 - Première génération" },
  { value: "G2", label: "G2 - Deuxième génération" },
  { value: "G3", label: "G3 - Troisième génération" },
  { value: "G4", label: "G4 - Quatrième génération" },
  { value: "R1", label: "R1 - Première reproduction" },
  { value: "R2", label: "R2 - Deuxième reproduction" },
];

// Valeurs UI (minuscules avec tirets) - compatible avec les transformateurs
export const CROP_TYPES = [
  { value: "rice", label: "Riz" },
  { value: "maize", label: "Maïs" },
  { value: "peanut", label: "Arachide" },
  { value: "sorghum", label: "Sorgho" },
  { value: "cowpea", label: "Niébé" },
  { value: "millet", label: "Mil" },
];

// Valeurs UI (minuscules avec tirets) - compatible avec les transformateurs
export const LOT_STATUSES = [
  { value: "pending", label: "En attente", color: "orange", icon: "Clock" },
  {
    value: "certified",
    label: "Certifié",
    color: "green",
    icon: "CheckCircle",
  },
  { value: "rejected", label: "Rejeté", color: "red", icon: "XCircle" },
  { value: "in-stock", label: "En stock", color: "blue", icon: "Package" },
  { value: "active", label: "Actif", color: "emerald", icon: "Play" },
  { value: "distributed", label: "Distribué", color: "purple", icon: "Share" },
  { value: "sold", label: "Vendu", color: "gray", icon: "DollarSign" },
];

// Valeurs UI (minuscules) - compatible avec les transformateurs
export const USER_ROLES = [
  { value: "admin", label: "Administrateur", permissions: ["all"] },
  {
    value: "manager",
    label: "Manager",
    permissions: ["manage", "read", "write"],
  },
  {
    value: "researcher",
    label: "Chercheur",
    permissions: ["research", "read", "write"],
  },
  {
    value: "technician",
    label: "Technicien",
    permissions: ["production", "read", "write"],
  },
  {
    value: "inspector",
    label: "Inspecteur",
    permissions: ["quality", "read", "write"],
  },
  {
    value: "multiplier",
    label: "Multiplicateur",
    permissions: ["production", "read"],
  },
  { value: "guest", label: "Invité", permissions: ["read"] },
];

// Valeurs UI (minuscules) - compatible avec les transformateurs
export const QUALITY_TEST_RESULTS = [
  { value: "pass", label: "Réussi", color: "green", icon: "CheckCircle" },
  { value: "fail", label: "Échec", color: "red", icon: "XCircle" },
];

// Valeurs UI (minuscules avec tirets) - compatible avec les transformateurs
export const PRODUCTION_STATUSES = [
  { value: "planned", label: "Planifiée", color: "blue", icon: "Calendar" },
  { value: "in-progress", label: "En cours", color: "orange", icon: "Play" },
  {
    value: "completed",
    label: "Terminée",
    color: "green",
    icon: "CheckCircle",
  },
  { value: "cancelled", label: "Annulée", color: "red", icon: "XCircle" },
];

// Valeurs UI (minuscules) - compatible avec les transformateurs
export const MULTIPLIER_STATUSES = [
  { value: "active", label: "Actif", color: "green", icon: "CheckCircle" },
  { value: "inactive", label: "Inactif", color: "gray", icon: "Pause" },
];

// Valeurs UI (minuscules) - compatible avec les transformateurs
export const CERTIFICATION_LEVELS = [
  {
    value: "beginner",
    label: "Débutant",
    color: "yellow",
    experience: "0-2 ans",
  },
  {
    value: "intermediate",
    label: "Intermédiaire",
    color: "blue",
    experience: "2-5 ans",
  },
  { value: "expert", label: "Expert", color: "green", experience: "5+ ans" },
];

// Valeurs UI (minuscules avec tirets) - compatible avec les transformateurs
export const PARCEL_STATUSES = [
  {
    value: "available",
    label: "Disponible",
    color: "green",
    icon: "CheckCircle",
  },
  {
    value: "in-use",
    label: "En cours d'utilisation",
    color: "orange",
    icon: "Play",
  },
  { value: "resting", label: "En repos", color: "blue", icon: "Pause" },
];

// Types d'activités de production (UI format)
export const ACTIVITY_TYPES = [
  { value: "soil-preparation", label: "Préparation du sol", icon: "Shovel" },
  { value: "sowing", label: "Semis", icon: "Sprout" },
  { value: "fertilization", label: "Fertilisation", icon: "Droplets" },
  { value: "irrigation", label: "Irrigation", icon: "CloudRain" },
  { value: "weeding", label: "Désherbage", icon: "Scissors" },
  { value: "pest-control", label: "Lutte antiparasitaire", icon: "Bug" },
  { value: "harvest", label: "Récolte", icon: "Package" },
  { value: "other", label: "Autre", icon: "MoreHorizontal" },
];

// Types de problèmes de production (UI format)
export const ISSUE_TYPES = [
  { value: "disease", label: "Maladie", color: "red", icon: "AlertTriangle" },
  { value: "pest", label: "Ravageur", color: "orange", icon: "Bug" },
  { value: "weather", label: "Météo", color: "blue", icon: "Cloud" },
  { value: "management", label: "Gestion", color: "purple", icon: "Settings" },
  { value: "other", label: "Autre", color: "gray", icon: "MoreHorizontal" },
];

// Niveaux de sévérité des problèmes (UI format)
export const ISSUE_SEVERITIES = [
  { value: "low", label: "Faible", color: "green" },
  { value: "medium", label: "Moyen", color: "orange" },
  { value: "high", label: "Élevé", color: "red" },
];

// Configuration pour l'API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  // Headers par défaut
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion au serveur",
  UNAUTHORIZED: "Session expirée. Veuillez vous reconnecter.",
  FORBIDDEN: "Accès refusé. Permissions insuffisantes.",
  NOT_FOUND: "Ressource non trouvée",
  VALIDATION_ERROR: "Données invalides. Vérifiez les champs saisis.",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite",
  TIMEOUT_ERROR: "Délai d'attente dépassé",
  CONFLICT_ERROR: "Conflit de données. La ressource existe déjà.",
  TOO_MANY_REQUESTS: "Trop de requêtes. Veuillez patienter.",
} as const;

// Messages de succès standardisés
export const SUCCESS_MESSAGES = {
  CREATED: "Élément créé avec succès",
  UPDATED: "Élément mis à jour avec succès",
  DELETED: "Élément supprimé avec succès",
  SAVED: "Données sauvegardées avec succès",
  LOGIN_SUCCESS: "Connexion réussie",
  LOGOUT_SUCCESS: "Déconnexion réussie",
  PASSWORD_UPDATED: "Mot de passe mis à jour avec succès",
  EMAIL_SENT: "Email envoyé avec succès",
  UPLOAD_SUCCESS: "Fichier téléchargé avec succès",
  EXPORT_SUCCESS: "Export généré avec succès",
} as const;

// Configuration des requêtes par défaut
export const DEFAULT_QUERY_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 1 * 60 * 1000, // 1 minute
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_INTERVAL: false,
} as const;

// Configuration des uploads
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    DOCUMENTS: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    SPREADSHEETS: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ],
    ALL: [
      "image/*",
      "application/pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
    ],
  },
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: "Le fichier est trop volumineux (max 10MB)",
    INVALID_TYPE: "Type de fichier non autorisé",
    UPLOAD_FAILED: "Échec du téléchargement du fichier",
  },
} as const;

// Configuration des formats d'export
export const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: "FileText", mimeType: "text/csv" },
  {
    value: "xlsx",
    label: "Excel",
    icon: "FileSpreadsheet",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: "FileImage",
    mimeType: "application/pdf",
  },
  { value: "json", label: "JSON", icon: "Code", mimeType: "application/json" },
] as const;

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000, // 5 secondes
  DURATIONS: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    STICKY: 0, // Ne se ferme pas automatiquement
  },
  POSITIONS: {
    TOP_RIGHT: "top-right",
    TOP_LEFT: "top-left",
    BOTTOM_RIGHT: "bottom-right",
    BOTTOM_LEFT: "bottom-left",
    TOP_CENTER: "top-center",
    BOTTOM_CENTER: "bottom-center",
  },
} as const;

// Limites géographiques du Sénégal
export const SENEGAL_BOUNDS = {
  LAT_MIN: 12.0,
  LAT_MAX: 16.7,
  LNG_MIN: -17.6,
  LNG_MAX: -11.3,
  CENTER: {
    lat: 14.7167,
    lng: -17.4677,
  },
} as const;

// Configuration des graphiques
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: "#10b981", // green-500
    SECONDARY: "#3b82f6", // blue-500
    SUCCESS: "#22c55e", // green-500
    WARNING: "#f59e0b", // amber-500
    ERROR: "#ef4444", // red-500
    INFO: "#3b82f6", // blue-500
  },
  PALETTE: [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ],
} as const;

// Fonctions utilitaires pour les constantes
export const getStatusConfig = (value: string, statusArray: any[]) => {
  return statusArray.find((status) => status.value === value) || statusArray[0];
};

export const getStatusLabel = (value: string, statusArray: any[]) => {
  return getStatusConfig(value, statusArray).label;
};

export const getStatusColor = (value: string, statusArray: any[]) => {
  return getStatusConfig(value, statusArray).color || "gray";
};

// Validation des constantes au chargement
if (import.meta.env.DEV) {
  console.log("🔧 Configuration des constantes chargée:", {
    seedLevels: SEED_LEVELS.length,
    cropTypes: CROP_TYPES.length,
    lotStatuses: LOT_STATUSES.length,
    userRoles: USER_ROLES.length,
    apiBaseUrl: API_CONFIG.BASE_URL,
  });
}
