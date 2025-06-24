// frontend/src/constants/icons.ts - NOUVEAU FICHIER

// ===== ICÔNES POUR LES TYPES DE CULTURES =====
export const CROP_TYPE_ICONS: Record<string, string> = {
  rice: "🌾",
  maize: "🌽",
  peanut: "🥜",
  sorghum: "🌾",
  cowpea: "🫘",
  millet: "🌾",
  wheat: "🌾",
};

// ===== ICÔNES POUR LES TYPES D'ACTIVITÉS =====
export const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  "soil-preparation": "soil",
  sowing: "seed",
  fertilization: "fertilizer",
  irrigation: "water",
  weeding: "weed",
  "pest-control": "pest",
  harvest: "harvest",
  other: "other",
};

// ===== ICÔNES POUR LES TYPES DE PROBLÈMES =====
export const ISSUE_TYPE_ICONS: Record<string, string> = {
  disease: "disease",
  pest: "pest",
  weather: "weather",
  management: "management",
  other: "other",
};

// ===== EXPÉRIENCE POUR LES NIVEAUX DE CERTIFICATION =====
export const CERTIFICATION_EXPERIENCE: Record<string, string> = {
  beginner: "0-2 ans",
  intermediate: "2-5 ans",
  expert: "5+ ans",
};
