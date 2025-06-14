// frontend/src/constants/index.ts - ✅ CONSTANTES SYNCHRONISÉES AVEC LE BACKEND

// ===== NIVEAUX DE SEMENCES =====
// Identiques UI/DB (pas de transformation nécessaire)
export const SEED_LEVELS = [
  { value: "GO", label: "GO - Génération origine" },
  { value: "G1", label: "G1 - Première génération" },
  { value: "G2", label: "G2 - Deuxième génération" },
  { value: "G3", label: "G3 - Troisième génération" },
  { value: "G4", label: "G4 - Quatrième génération" },
  { value: "R1", label: "R1 - Première reproduction" },
  { value: "R2", label: "R2 - Deuxième reproduction" },
] as const;

// ===== TYPES DE CULTURE =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const CROP_TYPES = [
  { value: "rice", label: "Riz", icon: "🌾" },
  { value: "maize", label: "Maïs", icon: "🌽" },
  { value: "peanut", label: "Arachide", icon: "🥜" },
  { value: "sorghum", label: "Sorgho", icon: "🌾" },
  { value: "cowpea", label: "Niébé", icon: "🫘" },
  { value: "millet", label: "Mil", icon: "🌾" },
  { value: "wheat", label: "Blé", icon: "🌾" },
] as const;

// ===== STATUTS DE LOTS =====
// ✅ CORRECTION: Valeurs UI (kebab-case) - compatibles avec backend transformers
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
] as const;

// ===== RÔLES UTILISATEUR =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const USER_ROLES = [
  {
    value: "admin",
    label: "Administrateur",
    permissions: ["all"],
    color: "red",
    icon: "Crown",
  },
  {
    value: "manager",
    label: "Manager",
    permissions: ["manage", "read", "write"],
    color: "blue",
    icon: "Users",
  },
  {
    value: "researcher",
    label: "Chercheur",
    permissions: ["research", "read", "write"],
    color: "purple",
    icon: "Microscope",
  },
  {
    value: "technician",
    label: "Technicien",
    permissions: ["production", "read", "write"],
    color: "green",
    icon: "Wrench",
  },
  {
    value: "inspector",
    label: "Inspecteur",
    permissions: ["quality", "read", "write"],
    color: "orange",
    icon: "Search",
  },
  {
    value: "multiplier",
    label: "Multiplicateur",
    permissions: ["production", "read"],
    color: "yellow",
    icon: "Sprout",
  },
  {
    value: "guest",
    label: "Invité",
    permissions: ["read"],
    color: "gray",
    icon: "Eye",
  },
] as const;

// ===== RÉSULTATS DE TESTS QUALITÉ =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const QUALITY_TEST_RESULTS = [
  { value: "pass", label: "Réussi", color: "green", icon: "CheckCircle" },
  { value: "fail", label: "Échec", color: "red", icon: "XCircle" },
] as const;

// ===== STATUTS DE PRODUCTION =====
// ✅ CORRECTION: Valeurs UI (kebab-case) - compatibles avec backend transformers
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
] as const;

// ===== STATUTS MULTIPLICATEUR =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const MULTIPLIER_STATUSES = [
  { value: "active", label: "Actif", color: "green", icon: "CheckCircle" },
  { value: "inactive", label: "Inactif", color: "gray", icon: "Pause" },
] as const;

// ===== NIVEAUX DE CERTIFICATION =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const CERTIFICATION_LEVELS = [
  {
    value: "beginner",
    label: "Débutant",
    color: "yellow",
    experience: "0-2 ans",
    icon: "Star",
  },
  {
    value: "intermediate",
    label: "Intermédiaire",
    color: "blue",
    experience: "2-5 ans",
    icon: "Award",
  },
  {
    value: "expert",
    label: "Expert",
    color: "green",
    experience: "5+ ans",
    icon: "Crown",
  },
] as const;

// ===== STATUTS DE PARCELLES =====
// ✅ CORRECTION: Valeurs UI (kebab-case) - compatibles avec backend transformers
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
] as const;

// ===== STATUTS DE CONTRAT =====
// ✅ NOUVEAU: Synchronisé avec backend
export const CONTRACT_STATUSES = [
  { value: "draft", label: "Brouillon", color: "gray", icon: "Edit" },
  { value: "active", label: "Actif", color: "green", icon: "CheckCircle" },
  { value: "completed", label: "Terminé", color: "blue", icon: "Check" },
  { value: "cancelled", label: "Annulé", color: "red", icon: "XCircle" },
] as const;

// ===== TYPES D'ACTIVITÉ =====
// ✅ CORRECTION: Valeurs UI (kebab-case) - compatibles avec backend transformers
export const ACTIVITY_TYPES = [
  {
    value: "soil-preparation",
    label: "Préparation du sol",
    icon: "Shovel",
    color: "brown",
  },
  { value: "sowing", label: "Semis", icon: "Sprout", color: "green" },
  {
    value: "fertilization",
    label: "Fertilisation",
    icon: "Droplets",
    color: "blue",
  },
  {
    value: "irrigation",
    label: "Irrigation",
    icon: "CloudRain",
    color: "cyan",
  },
  { value: "weeding", label: "Désherbage", icon: "Scissors", color: "orange" },
  {
    value: "pest-control",
    label: "Lutte antiparasitaire",
    icon: "Bug",
    color: "red",
  },
  { value: "harvest", label: "Récolte", icon: "Package", color: "yellow" },
  { value: "other", label: "Autre", icon: "MoreHorizontal", color: "gray" },
] as const;

// ===== TYPES DE PROBLÈMES =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const ISSUE_TYPES = [
  { value: "disease", label: "Maladie", color: "red", icon: "AlertTriangle" },
  { value: "pest", label: "Ravageur", color: "orange", icon: "Bug" },
  { value: "weather", label: "Météo", color: "blue", icon: "Cloud" },
  { value: "management", label: "Gestion", color: "purple", icon: "Settings" },
  { value: "other", label: "Autre", color: "gray", icon: "MoreHorizontal" },
] as const;

// ===== NIVEAUX DE SÉVÉRITÉ =====
// ✅ CORRECTION: Valeurs UI (minuscules) - compatibles avec backend transformers
export const ISSUE_SEVERITIES = [
  { value: "low", label: "Faible", color: "green", icon: "Info" },
  { value: "medium", label: "Moyen", color: "orange", icon: "AlertTriangle" },
  { value: "high", label: "Élevé", color: "red", icon: "AlertOctagon" },
] as const;

// ===== TYPES DE RAPPORT =====
// ✅ NOUVEAU: Synchronisé avec backend
export const REPORT_TYPES = [
  {
    value: "production",
    label: "Production",
    color: "green",
    icon: "BarChart3",
  },
  { value: "quality", label: "Qualité", color: "blue", icon: "CheckSquare" },
  { value: "inventory", label: "Inventaire", color: "purple", icon: "Package" },
  {
    value: "multiplier-performance",
    label: "Performance multiplicateurs",
    color: "orange",
    icon: "TrendingUp",
  },
  { value: "custom", label: "Personnalisé", color: "gray", icon: "FileText" },
] as const;

// ===== CONFIGURATION API =====
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// ===== MESSAGES D'ERREUR =====
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

// ===== MESSAGES DE SUCCÈS =====
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

// ===== CONFIGURATION DES REQUÊTES =====
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

// ===== CONFIGURATION DES UPLOADS =====
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

// ===== FORMATS D'EXPORT =====
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
  { value: "html", label: "HTML", icon: "Globe", mimeType: "text/html" },
] as const;

// ===== LIMITES GÉOGRAPHIQUES DU SÉNÉGAL =====
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

// ===== CONFIGURATION DES GRAPHIQUES =====
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
    "#10b981", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#ec4899", // pink
    "#6366f1", // indigo
    "#eab308", // yellow
    "#d6d6d6", // gray
    "#000000", // black
    "#ffffff", // white
  ],
} as const;

// ===== CONFIGURATION DES NOTIFICATIONS =====
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

// ===== FONCTIONS UTILITAIRES =====
export const getStatusConfig = (value: string, statusArray: readonly any[]) => {
  return statusArray.find((status) => status.value === value) || statusArray[0];
};

export const getStatusLabel = (value: string, statusArray: readonly any[]) => {
  return getStatusConfig(value, statusArray).label;
};

export const getStatusColor = (value: string, statusArray: readonly any[]) => {
  return getStatusConfig(value, statusArray).color || "gray";
};

export const getStatusIcon = (value: string, statusArray: readonly any[]) => {
  return getStatusConfig(value, statusArray).icon || "Circle";
};

// ===== MAPPINGS POUR TRANSFORMATION =====
// Export des mappings pour utilisation dans les transformateurs
export const UI_TO_DB_MAPPINGS = {
  lotStatus: {
    pending: "PENDING",
    certified: "CERTIFIED",
    rejected: "REJECTED",
    "in-stock": "IN_STOCK",
    sold: "SOLD",
    active: "ACTIVE",
    distributed: "DISTRIBUTED",
  },
  role: {
    admin: "ADMIN",
    manager: "MANAGER",
    researcher: "RESEARCHER",
    technician: "TECHNICIAN",
    inspector: "INSPECTOR",
    multiplier: "MULTIPLIER",
    guest: "GUEST",
  },
  cropType: {
    rice: "RICE",
    maize: "MAIZE",
    peanut: "PEANUT",
    sorghum: "SORGHUM",
    cowpea: "COWPEA",
    millet: "MILLET",
    wheat: "WHEAT",
  },
  multiplierStatus: {
    active: "ACTIVE",
    inactive: "INACTIVE",
  },
  certificationLevel: {
    beginner: "BEGINNER",
    intermediate: "INTERMEDIATE",
    expert: "EXPERT",
  },
  parcelStatus: {
    available: "AVAILABLE",
    "in-use": "IN_USE",
    resting: "RESTING",
  },
  productionStatus: {
    planned: "PLANNED",
    "in-progress": "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  },
  contractStatus: {
    draft: "DRAFT",
    active: "ACTIVE",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  },
  activityType: {
    "soil-preparation": "SOIL_PREPARATION",
    sowing: "SOWING",
    fertilization: "FERTILIZATION",
    irrigation: "IRRIGATION",
    weeding: "WEEDING",
    "pest-control": "PEST_CONTROL",
    harvest: "HARVEST",
    other: "OTHER",
  },
  issueType: {
    disease: "DISEASE",
    pest: "PEST",
    weather: "WEATHER",
    management: "MANAGEMENT",
    other: "OTHER",
  },
  issueSeverity: {
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
  },
  testResult: {
    pass: "PASS",
    fail: "FAIL",
  },
  reportType: {
    production: "PRODUCTION",
    quality: "QUALITY",
    inventory: "INVENTORY",
    "multiplier-performance": "MULTIPLIER_PERFORMANCE",
    custom: "CUSTOM",
  },
} as const;

export const DB_TO_UI_MAPPINGS = {
  lotStatus: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.lotStatus).map(([k, v]) => [v, k])
  ),
  role: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.role).map(([k, v]) => [v, k])
  ),
  cropType: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.cropType).map(([k, v]) => [v, k])
  ),
  multiplierStatus: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.multiplierStatus).map(([k, v]) => [v, k])
  ),
  certificationLevel: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.certificationLevel).map(([k, v]) => [v, k])
  ),
  parcelStatus: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.parcelStatus).map(([k, v]) => [v, k])
  ),
  productionStatus: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.productionStatus).map(([k, v]) => [v, k])
  ),
  contractStatus: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.contractStatus).map(([k, v]) => [v, k])
  ),
  activityType: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.activityType).map(([k, v]) => [v, k])
  ),
  issueType: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.issueType).map(([k, v]) => [v, k])
  ),
  issueSeverity: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.issueSeverity).map(([k, v]) => [v, k])
  ),
  testResult: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.testResult).map(([k, v]) => [v, k])
  ),
  reportType: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.reportType).map(([k, v]) => [v, k])
  ),
} as const;

// ===== VALIDATION AU DÉVELOPPEMENT =====
if (import.meta.env.DEV) {
  console.log("🔧 Configuration des constantes synchronisée avec le backend:", {
    seedLevels: SEED_LEVELS.length,
    cropTypes: CROP_TYPES.length,
    lotStatuses: LOT_STATUSES.length,
    userRoles: USER_ROLES.length,
    apiBaseUrl: API_CONFIG.BASE_URL,
    mappingsCount: Object.keys(UI_TO_DB_MAPPINGS).length,
  });
}
