// backend/src/config/enumMappings.ts - VERSION COMPLÈTE
export const ENUM_MAPPINGS = {
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
  USER_ROLE: {
    UI_TO_DB: {
      admin: "ADMIN",
      manager: "MANAGER",
      technician: "TECHNICIAN",
      inspector: "INSPECTOR",
      researcher: "RESEARCHER",
      multiplier: "MULTIPLIER",
      guest: "GUEST",
    },
    DB_TO_UI: {
      ADMIN: "admin",
      MANAGER: "manager",
      TECHNICIAN: "technician",
      INSPECTOR: "inspector",
      RESEARCHER: "researcher",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
    },
  },
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
} as const;

export type EnumType = keyof typeof ENUM_MAPPINGS;
export type TransformDirection = "UI_TO_DB" | "DB_TO_UI";

export function transformEnum(
  value: string,
  enumType: EnumType,
  direction: TransformDirection
): string {
  const mapping = ENUM_MAPPINGS[enumType];
  if (!mapping) return value;

  const transformMap = mapping[direction];
  return transformMap[value as keyof typeof transformMap] || value;
}
