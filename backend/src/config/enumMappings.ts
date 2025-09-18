// backend/src/config/enumMappings.ts - VERSION CORRIGÉE

// ✅ CORRECTION CRITIQUE: Mappings complets et cohérents
export const ENUM_MAPPINGS = {
  // Statuts de lots (UI ↔ DB)
  LOT_STATUS: {
    UI_TO_DB: {
      pending: "PENDING",
      certified: "CERTIFIED",
      rejected: "REJECTED",
      "in-stock": "IN_STOCK", // ✅ CRITIQUE: kebab-case UI -> SNAKE_CASE DB
      sold: "SOLD",
      active: "ACTIVE",
      distributed: "DISTRIBUTED",
    },
    DB_TO_UI: {
      PENDING: "pending",
      CERTIFIED: "certified",
      REJECTED: "rejected",
      IN_STOCK: "in-stock", // ✅ CRITIQUE: SNAKE_CASE DB -> kebab-case UI
      SOLD: "sold",
      ACTIVE: "active",
      DISTRIBUTED: "distributed",
    },
  },

  // Niveaux de semences (identiques UI et DB)
  SEED_LEVEL: {
    UI_TO_DB: {
      GO: "GO",
      G1: "G1",
      G2: "G2",
      G3: "G3",
      G4: "G4",
      R1: "R1",
      R2: "R2",
    },
    DB_TO_UI: {
      GO: "GO",
      G1: "G1",
      G2: "G2",
      G3: "G3",
      G4: "G4",
      R1: "R1",
      R2: "R2",
    },
  },

  // Types de cultures
  CROP_TYPE: {
    UI_TO_DB: {
      rice: "RICE",
      maize: "MAIZE",
      peanut: "PEANUT",
      sorghum: "SORGHUM",
      cowpea: "COWPEA",
      millet: "MILLET",
      wheat: "WHEAT",
    },
    DB_TO_UI: {
      RICE: "rice",
      MAIZE: "maize",
      PEANUT: "peanut",
      SORGHUM: "sorghum",
      COWPEA: "cowpea",
      MILLET: "millet",
      WHEAT: "wheat",
    },
  },

  // Rôles utilisateur
  USER_ROLE: {
    UI_TO_DB: {
      admin: "ADMIN",
      manager: "MANAGER",
      inspector: "INSPECTOR",
      multiplier: "MULTIPLIER",
      guest: "GUEST",
      technician: "TECHNICIAN",
      researcher: "RESEARCHER",
    },
    DB_TO_UI: {
      ADMIN: "admin",
      MANAGER: "manager",
      INSPECTOR: "inspector",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
      TECHNICIAN: "technician",
      RESEARCHER: "researcher",
    },
  },

  // Statuts de parcelles
  PARCEL_STATUS: {
    UI_TO_DB: {
      available: "AVAILABLE",
      "in-use": "IN_USE", // ✅ kebab-case -> SNAKE_CASE
      resting: "RESTING",
    },
    DB_TO_UI: {
      AVAILABLE: "available",
      IN_USE: "in-use", // ✅ SNAKE_CASE -> kebab-case
      RESTING: "resting",
    },
  },

  // Statuts de production
  PRODUCTION_STATUS: {
    UI_TO_DB: {
      planned: "PLANNED",
      "in-progress": "IN_PROGRESS", // ✅ kebab-case -> SNAKE_CASE
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    },
    DB_TO_UI: {
      PLANNED: "planned",
      IN_PROGRESS: "in-progress", // ✅ SNAKE_CASE -> kebab-case
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    },
  },

  // Types d'activités
  ACTIVITY_TYPE: {
    UI_TO_DB: {
      "soil-preparation": "SOIL_PREPARATION", // ✅ kebab-case -> SNAKE_CASE
      sowing: "SOWING",
      fertilization: "FERTILIZATION",
      irrigation: "IRRIGATION",
      weeding: "WEEDING",
      "pest-control": "PEST_CONTROL", // ✅ kebab-case -> SNAKE_CASE
      harvest: "HARVEST",
      other: "OTHER",
    },
    DB_TO_UI: {
      SOIL_PREPARATION: "soil-preparation", // ✅ SNAKE_CASE -> kebab-case
      SOWING: "sowing",
      FERTILIZATION: "fertilization",
      IRRIGATION: "irrigation",
      WEEDING: "weeding",
      PEST_CONTROL: "pest-control", // ✅ SNAKE_CASE -> kebab-case
      HARVEST: "harvest",
      OTHER: "other",
    },
  },

  // Types de problèmes
  ISSUE_TYPE: {
    UI_TO_DB: {
      disease: "DISEASE",
      pest: "PEST",
      weather: "WEATHER",
      management: "MANAGEMENT",
      other: "OTHER",
    },
    DB_TO_UI: {
      DISEASE: "disease",
      PEST: "pest",
      WEATHER: "weather",
      MANAGEMENT: "management",
      OTHER: "other",
    },
  },

  // Niveaux de sévérité
  ISSUE_SEVERITY: {
    UI_TO_DB: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    },
    DB_TO_UI: {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
    },
  },

  // Résultats de tests
  TEST_RESULT: {
    UI_TO_DB: {
      pass: "PASS",
      fail: "FAIL",
    },
    DB_TO_UI: {
      PASS: "pass",
      FAIL: "fail",
    },
  },

  // Niveaux de certification
  CERTIFICATION_LEVEL: {
    UI_TO_DB: {
      beginner: "BEGINNER",
      intermediate: "INTERMEDIATE",
      expert: "EXPERT",
    },
    DB_TO_UI: {
      BEGINNER: "beginner",
      INTERMEDIATE: "intermediate",
      EXPERT: "expert",
    },
  },

  // Statuts de multiplicateurs
  MULTIPLIER_STATUS: {
    UI_TO_DB: {
      active: "ACTIVE",
      inactive: "INACTIVE",
    },
    DB_TO_UI: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
  },

  // Statuts de contrats
  CONTRACT_STATUS: {
    UI_TO_DB: {
      draft: "DRAFT",
      active: "ACTIVE",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    },
    DB_TO_UI: {
      DRAFT: "draft",
      ACTIVE: "active",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    },
  },

  // Types de rapports
  REPORT_TYPE: {
    UI_TO_DB: {
      production: "PRODUCTION",
      quality: "QUALITY",
      inventory: "INVENTORY",
      "multiplier-performance": "MULTIPLIER_PERFORMANCE", // ✅ kebab-case -> SNAKE_CASE
      custom: "CUSTOM",
    },
    DB_TO_UI: {
      PRODUCTION: "production",
      QUALITY: "quality",
      INVENTORY: "inventory",
      MULTIPLIER_PERFORMANCE: "multiplier-performance", // ✅ SNAKE_CASE -> kebab-case
      CUSTOM: "custom",
    },
  },
} as const;

/**
 * ✅ FONCTION DE TRANSFORMATION PRINCIPALE - CORRIGÉE
 */
export function transformEnum(
  value: string | undefined | null,
  enumType: keyof typeof ENUM_MAPPINGS,
  direction: "UI_TO_DB" | "DB_TO_UI"
): string {
  // Validation des paramètres
  if (!value || typeof value !== "string") {
    return value || "";
  }

  // Obtenir le mapping approprié
  const enumMapping = ENUM_MAPPINGS[enumType];
  if (!enumMapping) {
    console.warn(`Enum type not found: ${enumType}`);
    return value;
  }

  const directionalMapping = enumMapping[direction];
  if (!directionalMapping) {
    console.warn(`Direction not found: ${direction} for ${enumType}`);
    return value;
  }

  // Effectuer la transformation
  const transformedValue =
    directionalMapping[value as keyof typeof directionalMapping];

  if (transformedValue) {
    return transformedValue;
  }

  // Si pas de mapping trouvé, logger et retourner la valeur originale
  console.warn(`No mapping found for "${value}" in ${enumType}.${direction}`);
  return value;
}

/**
 * ✅ FONCTIONS DE TRANSFORMATION SPÉCIFIQUES - CORRIGÉES
 */

// Transformation des statuts de lots
export const transformLotStatus = (
  value: string,
  direction: "UI_TO_DB" | "DB_TO_UI"
): string => {
  return transformEnum(value, "LOT_STATUS", direction);
};

// Transformation des niveaux de semences (pas de transformation nécessaire)
export const transformSeedLevel = (value: string): string => {
  return value?.toUpperCase() || value;
};

// Transformation des types de cultures
export const transformCropType = (
  value: string,
  direction: "UI_TO_DB" | "DB_TO_UI"
): string => {
  return transformEnum(value, "CROP_TYPE", direction);
};

// Transformation des rôles utilisateur
export const transformUserRole = (
  value: string,
  direction: "UI_TO_DB" | "DB_TO_UI"
): string => {
  return transformEnum(value, "USER_ROLE", direction);
};

// Transformation des statuts de production
export const transformProductionStatus = (
  value: string,
  direction: "UI_TO_DB" | "DB_TO_UI"
): string => {
  return transformEnum(value, "PRODUCTION_STATUS", direction);
};

/**
 * ✅ FONCTION DE VALIDATION DES ENUMS
 */
export function isValidEnumValue(
  value: string,
  enumType: keyof typeof ENUM_MAPPINGS,
  direction: "UI_TO_DB" | "DB_TO_UI"
): boolean {
  if (!value || !enumType) return false;

  const enumMapping = ENUM_MAPPINGS[enumType];
  if (!enumMapping) return false;

  const directionalMapping = enumMapping[direction];
  if (!directionalMapping) return false;

  return value in directionalMapping;
}

/**
 * ✅ FONCTION DE DEBUG POUR LES TRANSFORMATIONS
 */
export function debugTransformation(
  value: string,
  enumType: keyof typeof ENUM_MAPPINGS,
  direction: "UI_TO_DB" | "DB_TO_UI"
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `🔄 [ENUM DEBUG] Transforming "${value}" (${enumType}.${direction})`
    );
    const result = transformEnum(value, enumType, direction);
    console.log(`✅ [ENUM DEBUG] Result: "${result}"`);
  }
}
