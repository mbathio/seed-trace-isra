// Configuration centralisée des mappings d'enums UI <-> DB
export const ENUM_MAPPINGS = {
  // Statuts de lots
  LOT_STATUS: {
    UI_TO_DB: {
      pending: "PENDING",
      certified: "CERTIFIED",
      rejected: "REJECTED",
      "in-stock": "IN_STOCK",
      sold: "SOLD",
      active: "ACTIVE",
      distributed: "DISTRIBUTED",
    },
    DB_TO_UI: {
      PENDING: "pending",
      CERTIFIED: "certified",
      REJECTED: "rejected",
      IN_STOCK: "in-stock",
      SOLD: "sold",
      ACTIVE: "active",
      DISTRIBUTED: "distributed",
    },
  },
  // Statuts de parcelles
  PARCEL_STATUS: {
    UI_TO_DB: {
      available: "AVAILABLE",
      "in-use": "IN_USE",
      resting: "RESTING",
    },
    DB_TO_UI: {
      AVAILABLE: "available",
      IN_USE: "in-use",
      RESTING: "resting",
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
  // Rôles utilisateurs
  USER_ROLE: {
    UI_TO_DB: {
      admin: "ADMIN",
      manager: "MANAGER",
      researcher: "RESEARCHER",
      technician: "TECHNICIAN",
      inspector: "INSPECTOR",
      multiplier: "MULTIPLIER",
      guest: "GUEST",
    },
    DB_TO_UI: {
      ADMIN: "admin",
      MANAGER: "manager",
      RESEARCHER: "researcher",
      TECHNICIAN: "technician",
      INSPECTOR: "inspector",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
    },
  },
  // Statuts de production
  PRODUCTION_STATUS: {
    UI_TO_DB: {
      planned: "PLANNED",
      "in-progress": "IN_PROGRESS",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    },
    DB_TO_UI: {
      PLANNED: "planned",
      IN_PROGRESS: "in-progress",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    },
  },
  // Types d'activités
  ACTIVITY_TYPE: {
    UI_TO_DB: {
      "soil-preparation": "SOIL_PREPARATION",
      sowing: "SOWING",
      fertilization: "FERTILIZATION",
      irrigation: "IRRIGATION",
      weeding: "WEEDING",
      "pest-control": "PEST_CONTROL",
      harvest: "HARVEST",
      other: "OTHER",
    },
    DB_TO_UI: {
      SOIL_PREPARATION: "soil-preparation",
      SOWING: "sowing",
      FERTILIZATION: "fertilization",
      IRRIGATION: "irrigation",
      WEEDING: "weeding",
      PEST_CONTROL: "pest-control",
      HARVEST: "harvest",
      OTHER: "other",
    },
  },
  // Résultats de tests

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
  // Sévérité des problèmes
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
  // Types de rapports
  REPORT_TYPE: {
    UI_TO_DB: {
      production: "PRODUCTION",
      quality: "QUALITY",
      inventory: "INVENTORY",
      "multiplier-performance": "MULTIPLIER_PERFORMANCE",
      custom: "CUSTOM",
    },
    DB_TO_UI: {
      PRODUCTION: "production",
      QUALITY: "quality",
      INVENTORY: "inventory",
      MULTIPLIER_PERFORMANCE: "multiplier-performance",
      CUSTOM: "custom",
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
  // Niveaux de semences (identiques UI/DB)
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
};

// Fonction helper pour transformer une valeur d'enum
export function transformEnum(
  value: string | undefined | null,
  enumType: keyof typeof ENUM_MAPPINGS,
  direction: "UI_TO_DB" | "DB_TO_UI"
): string | undefined {
  if (!value) return undefined;

  const mapping = ENUM_MAPPINGS[enumType]?.[direction];
  if (!mapping) return value;

  return mapping[value as keyof typeof mapping] || value;
}

// Export des mappings individuels pour compatibilité
export const UI_TO_DB_MAPPINGS = Object.entries(ENUM_MAPPINGS).reduce(
  (acc, [key, value]) => {
    acc[key.toLowerCase()] = value.UI_TO_DB;
    return acc;
  },
  {} as any
);

export const DB_TO_UI_MAPPINGS = Object.entries(ENUM_MAPPINGS).reduce(
  (acc, [key, value]) => {
    acc[key.toLowerCase()] = value.DB_TO_UI;
    return acc;
  },
  {} as any
);
