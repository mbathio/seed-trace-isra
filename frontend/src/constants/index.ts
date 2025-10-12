// frontend/src/constants/index.ts - VERSION CORRIGÉE AVEC TYPES ÉTENDUS

// ===== TYPES DE CONFIGURATION =====
interface StatusConfig {
  label: string;
  value: string;
  color: string;
  variant?: "default" | "destructive" | "secondary" | "outline";
}

// ✅ AJOUTÉ: Interface étendue avec propriétés optionnelles
interface StatusConfigExtended extends StatusConfig {
  icon?: string;
  experience?: string; // Pour les niveaux de certification
}

interface LevelConfig {
  label: string;
  value: string;
  color: string;
  order: number;
}

interface APIConfig {
  BASE_URL: string;
  TIMEOUT: number;
  VERSION: string;
}

// ===== CONFIGURATION API =====
export const API_CONFIG: APIConfig = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  TIMEOUT: 30000,
  VERSION: "v1",
};

// ===== NIVEAUX DE SEMENCES =====
export const SEED_LEVELS: LevelConfig[] = [
  {
    label: "GO",
    value: "GO",
    color:
      "bg-purple-500/20 text-purple-800 font-semibold rounded-full px-3 py-0.5",
    order: 0,
  },
  {
    label: "G1",
    value: "G1",
    color:
      "bg-blue-500/20 text-blue-800 font-semibold rounded-full px-3 py-0.5",
    order: 1,
  },
  {
    label: "G2",
    value: "G2",
    color:
      "bg-cyan-500/20 text-cyan-800 font-semibold rounded-full px-3 py-0.5",
    order: 2,
  },
  {
    label: "G3",
    value: "G3",
    color:
      "bg-green-500/20 text-green-800 font-semibold rounded-full px-3 py-0.5",
    order: 3,
  },
  {
    label: "G4",
    value: "G4",
    color:
      "bg-yellow-500/20 text-yellow-800 font-semibold rounded-full px-3 py-0.5",
    order: 4,
  },
  {
    label: "R1",
    value: "R1",
    color:
      "bg-orange-500/20 text-orange-800 font-semibold rounded-full px-3 py-0.5",
    order: 5,
  },
  {
    label: "R2",
    value: "R2",
    color: "bg-red-500/20 text-red-800 font-semibold rounded-full px-3 py-0.5",
    order: 6,
  },
];

// ===== TYPES DE CULTURES =====
export const CROP_TYPES: StatusConfigExtended[] = [
  {
    label: "Riz",
    value: "rice",
    color: "bg-green-100 text-green-800",
    icon: "🌾",
  },
  {
    label: "Maïs",
    value: "maize",
    color: "bg-yellow-100 text-yellow-800",
    icon: "🌽",
  },
  {
    label: "Arachide",
    value: "peanut",
    color: "bg-orange-100 text-orange-800",
    icon: "🥜",
  },
  {
    label: "Sorgho",
    value: "sorghum",
    color: "bg-red-100 text-red-800",
    icon: "🌾",
  },
  {
    label: "Niébé",
    value: "cowpea",
    color: "bg-purple-100 text-purple-800",
    icon: "🫘",
  },
  {
    label: "Mil",
    value: "millet",
    color: "bg-blue-100 text-blue-800",
    icon: "🌾",
  },
  {
    label: "Blé",
    value: "wheat",
    color: "bg-amber-100 text-amber-800",
    icon: "🌾",
  },
];

// ===== CATÉGORIES DE VARIÉTÉS =====
export const VARIETY_CATEGORIES: StatusConfig[] = [
  {
    label: "Céréales",
    value: "cereal",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    label: "Légumes",
    value: "vegetable",
    color: "bg-green-100 text-green-800",
  },
  {
    label: "Légumineuses",
    value: "leguminous",
    color: "bg-purple-100 text-purple-800",
  },
  {
    label: "Tubercules",
    value: "tuber",
    color: "bg-orange-100 text-orange-800",
  },
  {
    label: "Industrielles",
    value: "industrial",
    color: "bg-blue-100 text-blue-800",
  },
  { label: "Fourragères", value: "forage", color: "bg-gray-100 text-gray-800" },
];

// ===== STATUTS DES LOTS =====
export const LOT_STATUSES: StatusConfig[] = [
  {
    label: "En attente",
    value: "pending",
    color: "bg-yellow-100 text-yellow-800",
    variant: "secondary",
  },
  {
    label: "Certifié",
    value: "certified",
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "Rejeté",
    value: "rejected",
    color: "bg-red-100 text-red-800",
    variant: "destructive",
  },
  {
    label: "En stock",
    value: "in-stock",
    color: "bg-blue-100 text-blue-800",
    variant: "default",
  },
  {
    label: "Vendu",
    value: "sold",
    color: "bg-gray-100 text-gray-800",
    variant: "secondary",
  },
  {
    label: "Actif",
    value: "active",
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "Distribué",
    value: "distributed",
    color: "bg-purple-100 text-purple-800",
    variant: "secondary",
  },
];

// ===== RÔLES UTILISATEUR =====
export const USER_ROLES: StatusConfig[] = [
  { label: "Administrateur", value: "admin", color: "bg-red-100 text-red-800" },
  {
    label: "Gestionnaire",
    value: "manager",
    color: "bg-blue-100 text-blue-800",
  },
  {
    label: "Technicien",
    value: "technician",
    color: "bg-green-100 text-green-800",
  },
  {
    label: "Inspecteur",
    value: "inspector",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    label: "Chercheur",
    value: "researcher",
    color: "bg-purple-100 text-purple-800",
  },
  {
    label: "Multiplicateur",
    value: "multiplier",
    color: "bg-orange-100 text-orange-800",
  },
];

// ===== STATUTS MULTIPLICATEUR =====
export const MULTIPLIER_STATUSES: StatusConfig[] = [
  {
    label: "Actif",
    value: "active",
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "Inactif",
    value: "inactive",
    color: "bg-gray-100 text-gray-800",
    variant: "secondary",
  },
];

// ===== NIVEAUX DE CERTIFICATION =====
export const CERTIFICATION_LEVELS: StatusConfigExtended[] = [
  {
    label: "Débutant",
    value: "beginner",
    color: "bg-gray-100 text-gray-800",
    experience: "0-2 ans",
  },
  {
    label: "Intermédiaire",
    value: "intermediate",
    color: "bg-blue-100 text-blue-800",
    experience: "2-5 ans",
  },
  {
    label: "Expert",
    value: "expert",
    color: "bg-green-100 text-green-800",
    experience: "5+ ans",
  },
];

// ===== STATUTS PARCELLE =====
export const PARCEL_STATUSES: StatusConfig[] = [
  {
    label: "Disponible",
    value: "available",
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "En utilisation",
    value: "in-use",
    color: "bg-orange-100 text-orange-800",
    variant: "secondary",
  },
  {
    label: "Au repos",
    value: "resting",
    color: "bg-gray-100 text-gray-800",
    variant: "outline",
  },
];

// ===== STATUTS PRODUCTION =====
export const PRODUCTION_STATUSES: StatusConfig[] = [
  {
    label: "Planifiée",
    value: "planned",
    color: "bg-blue-100 text-blue-800",
    variant: "secondary",
  },
  {
    label: "En cours",
    value: "in-progress",
    color: "bg-yellow-100 text-yellow-800",
    variant: "default",
  },
  {
    label: "Terminée",
    value: "completed",
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "Annulée",
    value: "cancelled",
    color: "bg-red-100 text-red-800",
    variant: "destructive",
  },
];

// ===== STATUTS CONTRAT =====
export const CONTRACT_STATUSES: StatusConfig[] = [
  {
    label: "Brouillon",
    value: "draft",
    color: "bg-gray-100 text-gray-800",
    variant: "outline",
  },
  {
    label: "En attente",
    value: "pending",
    color: "bg-yellow-100 text-yellow-800",
    variant: "secondary",
  },
  {
    label: "Signé",
    value: "signed",
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "En cours",
    value: "active",
    color: "bg-blue-100 text-blue-800",
    variant: "default",
  },
  {
    label: "Terminé",
    value: "completed",
    color: "bg-purple-100 text-purple-800",
    variant: "secondary",
  },
  {
    label: "Annulé",
    value: "cancelled",
    color: "bg-red-100 text-red-800",
    variant: "destructive",
  },
];

// ===== TYPES D'ACTIVITÉS =====
export const ACTIVITY_TYPES: StatusConfigExtended[] = [
  {
    label: "Préparation du sol",
    value: "soil-preparation",
    color: "bg-brown-100 text-brown-800",
    icon: "tractor", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Semis",
    value: "sowing",
    color: "bg-green-100 text-green-800",
    icon: "sprout", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Fertilisation",
    value: "fertilization",
    color: "bg-lime-100 text-lime-800",
    icon: "flask", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Irrigation",
    value: "irrigation",
    color: "bg-blue-100 text-blue-800",
    icon: "droplets", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Désherbage",
    value: "weeding",
    color: "bg-yellow-100 text-yellow-800",
    icon: "scissors", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Contrôle phytosanitaire",
    value: "pest-control",
    color: "bg-red-100 text-red-800",
    icon: "bug", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Récolte",
    value: "harvest",
    color: "bg-orange-100 text-orange-800",
    icon: "package", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Autre",
    value: "other",
    color: "bg-gray-100 text-gray-800",
    icon: "settings", // ✅ CORRIGÉ: Nom d'icône correct
  },
];

// ===== TYPES DE PROBLÈMES =====
export const ISSUE_TYPES: StatusConfigExtended[] = [
  {
    label: "Maladie",
    value: "disease",
    color: "bg-red-100 text-red-800",
    icon: "🦠",
  },
  {
    label: "Ravageur",
    value: "pest",
    color: "bg-orange-100 text-orange-800",
    icon: "🐛",
  },
  {
    label: "Météo",
    value: "weather",
    color: "bg-blue-100 text-blue-800",
    icon: "🌦️",
  },
  {
    label: "Gestion",
    value: "management",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⚠️",
  },
  {
    label: "Autre",
    value: "other",
    color: "bg-gray-100 text-gray-800",
    icon: "❓",
  },
];

// ===== SÉVÉRITÉS DES PROBLÈMES =====
export const ISSUE_SEVERITIES: StatusConfigExtended[] = [
  {
    label: "Faible",
    value: "low",
    color: "bg-green-100 text-green-800",
    variant: "default",
    icon: "info", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Moyenne",
    value: "medium",
    color: "bg-yellow-100 text-yellow-800",
    variant: "secondary",
    icon: "alert-triangle", // ✅ CORRIGÉ: Nom d'icône correct
  },
  {
    label: "Élevée",
    value: "high",
    color: "bg-red-100 text-red-800",
    variant: "destructive",
    icon: "alert-circle", // ✅ CORRIGÉ: Nom d'icône correct
  },
];

// ===== RÉSULTATS DES TESTS =====
export const TEST_RESULTS: StatusConfig[] = [
  {
    label: "Réussi",
    value: "pass", // CORRIGÉ de "passed" à "pass"
    color: "bg-green-100 text-green-800",
    variant: "default",
  },
  {
    label: "Échoué",
    value: "fail", // CORRIGÉ de "failed" à "fail"
    color: "bg-red-100 text-red-800",
    variant: "destructive",
  },
  {
    label: "En attente",
    value: "pending",
    color: "bg-yellow-100 text-yellow-800",
    variant: "secondary",
  },
];

// ===== TYPES DE RAPPORTS =====
export const REPORT_TYPES: StatusConfig[] = [
  {
    label: "Production",
    value: "production",
    color: "bg-green-100 text-green-800",
  },
  { label: "Qualité", value: "quality", color: "bg-blue-100 text-blue-800" },
  {
    label: "Inventaire",
    value: "inventory",
    color: "bg-purple-100 text-purple-800",
  },
  {
    label: "Performance Multiplicateurs",
    value: "multiplier-performance",
    color: "bg-orange-100 text-orange-800",
  },
  {
    label: "Personnalisé",
    value: "custom",
    color: "bg-gray-100 text-gray-800",
  },
];

// ===== LIMITES GÉOGRAPHIQUES DU SÉNÉGAL =====
export const SENEGAL_BOUNDS = {
  NORTH: 16.7,
  SOUTH: 12.3,
  EAST: -11.3,
  WEST: -17.6,
  CENTER: {
    lat: 14.497401,
    lng: -14.452362,
  },
  // Alias pour la compatibilité
  LAT_MIN: 12.3,
  LAT_MAX: 16.7,
  LNG_MIN: -17.6,
  LNG_MAX: -11.3,
};

// ===== FONCTION UTILITAIRE POUR OBTENIR LA CONFIG D'UN STATUT =====
export const getStatusConfig = (
  value: string | undefined,
  statusList: (StatusConfig | StatusConfigExtended)[]
): StatusConfig | StatusConfigExtended => {
  if (!value) {
    return {
      label: "Inconnu",
      value: "",
      color: "bg-gray-100 text-gray-800",
      variant: "outline",
    };
  }

  const config = statusList.find(
    (s) => s.value === value || s.value === value.toLowerCase()
  );

  if (!config) {
    console.warn(`Status config not found for value: ${value}`);
    return {
      label: value,
      value: value,
      color: "bg-gray-100 text-gray-800",
      variant: "outline",
    };
  }

  return config;
};

// ===== FONCTION UTILITAIRE POUR OBTENIR LE NIVEAU DE SEMENCE =====
export const getSeedLevelConfig = (level: string | undefined): LevelConfig => {
  if (!level) {
    return { label: "Inconnu", value: "", color: "text-gray-600", order: 999 };
  }

  const config = SEED_LEVELS.find((l) => l.value === level.toUpperCase());

  if (!config) {
    console.warn(`Seed level config not found for level: ${level}`);
    return { label: level, value: level, color: "text-gray-600", order: 999 };
  }

  return config;
};

// ===== MAPPINGS UI <-> DB =====
export const LOT_STATUS_MAPPING = {
  // UI → Backend
  UI_TO_BACKEND: {
    pending: "PENDING",
    certified: "CERTIFIED",
    rejected: "REJECTED",
    "in-stock": "IN_STOCK",
    sold: "SOLD",
    active: "ACTIVE",
    distributed: "DISTRIBUTED",
  },
  // Backend → UI
  BACKEND_TO_UI: {
    PENDING: "pending",
    CERTIFIED: "certified",
    REJECTED: "rejected",
    IN_STOCK: "in-stock",
    SOLD: "sold",
    ACTIVE: "active",
    DISTRIBUTED: "distributed",
  },
};
// Mappings UI vers DB
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
    technician: "TECHNICIAN",
    inspector: "INSPECTOR",
    researcher: "RESEARCHER",
    multiplier: "MULTIPLIER",
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
  varietyCategory: {
    cereal: "CEREAL",
    vegetable: "VEGETABLE",
    leguminous: "LEGUMINOUS",
    tuber: "TUBER",
    industrial: "INDUSTRIAL",
    forage: "FORAGE",
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
    pending: "PENDING",
    signed: "SIGNED",
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
    pass: "PASS", // CORRIGÉ de "passed" à "pass"
    fail: "FAIL", // CORRIGÉ de "failed" à "fail"
    pending: "PENDING",
  },
  reportType: {
    production: "PRODUCTION",
    quality: "QUALITY",
    inventory: "INVENTORY",
    "multiplier-performance": "MULTIPLIER_PERFORMANCE",
    custom: "CUSTOM",
  },
} as const;

// Mappings DB vers UI (inversés automatiquement)
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
  varietyCategory: Object.fromEntries(
    Object.entries(UI_TO_DB_MAPPINGS.varietyCategory).map(([k, v]) => [v, k])
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

// ===== CONFIGURATION POUR REACT QUERY =====
export const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
  // AJOUT des propriétés manquantes pour la compatibilité
  RETRY_ATTEMPTS: 3,
  STALE_TIME: 5 * 60 * 1000,
  CACHE_TIME: 10 * 60 * 1000,
};

// ===== MESSAGES D'ERREUR =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Erreur de connexion réseau. Veuillez vérifier votre connexion.",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action.",
  NOT_FOUND: "Ressource introuvable.",
  VALIDATION_ERROR: "Veuillez vérifier les informations saisies.",
  GENERIC_ERROR: "Une erreur est survenue. Veuillez réessayer.",
  // AJOUT des messages manquants
  FORBIDDEN: "Accès interdit.",
  UNKNOWN_ERROR: "Erreur inconnue.",
};

// ===== RÉSULTATS DES TESTS QUALITÉ =====
export const QUALITY_TEST_RESULTS: StatusConfig[] = TEST_RESULTS;

// Export du type StatusConfig pour utilisation dans d'autres fichiers
export type { StatusConfig, StatusConfigExtended };
