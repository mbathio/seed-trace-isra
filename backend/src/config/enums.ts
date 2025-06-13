// backend/src/config/enums.ts - ✅ SOURCE DE VÉRITÉ pour tous les enums
// Ce fichier centralise TOUS les enums utilisés dans l'application
// et définit les mappings bidirectionnels UI ↔ DB

// ===== ENUMS DE BASE DE DONNÉES (Prisma) =====

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  INSPECTOR = "INSPECTOR",
  MULTIPLIER = "MULTIPLIER",
  GUEST = "GUEST",
  TECHNICIAN = "TECHNICIAN",
  RESEARCHER = "RESEARCHER",
}

export enum SeedLevel {
  GO = "GO",
  G1 = "G1",
  G2 = "G2",
  G3 = "G3",
  G4 = "G4",
  R1 = "R1",
  R2 = "R2",
}

export enum CropType {
  RICE = "RICE",
  MAIZE = "MAIZE",
  PEANUT = "PEANUT",
  SORGHUM = "SORGHUM",
  COWPEA = "COWPEA",
  MILLET = "MILLET",
  WHEAT = "WHEAT",
}

export enum ParcelStatus {
  AVAILABLE = "AVAILABLE",
  IN_USE = "IN_USE",
  RESTING = "RESTING",
}

export enum LotStatus {
  PENDING = "PENDING",
  CERTIFIED = "CERTIFIED",
  REJECTED = "REJECTED",
  IN_STOCK = "IN_STOCK",
  SOLD = "SOLD",
  ACTIVE = "ACTIVE",
  DISTRIBUTED = "DISTRIBUTED",
}

export enum ContractStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum CertificationLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  EXPERT = "EXPERT",
}

export enum ProductionStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ActivityType {
  SOIL_PREPARATION = "SOIL_PREPARATION",
  SOWING = "SOWING",
  FERTILIZATION = "FERTILIZATION",
  IRRIGATION = "IRRIGATION",
  WEEDING = "WEEDING",
  PEST_CONTROL = "PEST_CONTROL",
  HARVEST = "HARVEST",
  OTHER = "OTHER",
}

export enum IssueType {
  DISEASE = "DISEASE",
  PEST = "PEST",
  WEATHER = "WEATHER",
  MANAGEMENT = "MANAGEMENT",
  OTHER = "OTHER",
}

export enum IssueSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum TestResult {
  PASS = "PASS",
  FAIL = "FAIL",
}

export enum ReportType {
  PRODUCTION = "PRODUCTION",
  QUALITY = "QUALITY",
  INVENTORY = "INVENTORY",
  MULTIPLIER_PERFORMANCE = "MULTIPLIER_PERFORMANCE",
  CUSTOM = "CUSTOM",
}

export enum MultiplierStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ===== MAPPINGS UI (kebab-case/lowercase) ↔ DB (UPPER_CASE) =====

// Convention UI: minuscules avec tirets (ex: "in-progress", "seed-preparation")
// Convention DB: MAJUSCULES avec underscores (ex: "IN_PROGRESS", "SEED_PREPARATION")

export const ROLE_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [Role.ADMIN]: "admin",
    [Role.MANAGER]: "manager",
    [Role.INSPECTOR]: "inspector",
    [Role.MULTIPLIER]: "multiplier",
    [Role.GUEST]: "guest",
    [Role.TECHNICIAN]: "technician",
    [Role.RESEARCHER]: "researcher",
  } as const,

  // UI → DB
  UI_TO_DB: {
    admin: Role.ADMIN,
    manager: Role.MANAGER,
    inspector: Role.INSPECTOR,
    multiplier: Role.MULTIPLIER,
    guest: Role.GUEST,
    technician: Role.TECHNICIAN,
    researcher: Role.RESEARCHER,
  } as const,
};

export const CROP_TYPE_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [CropType.RICE]: "rice",
    [CropType.MAIZE]: "maize",
    [CropType.PEANUT]: "peanut",
    [CropType.SORGHUM]: "sorghum",
    [CropType.COWPEA]: "cowpea",
    [CropType.MILLET]: "millet",
  } as const,

  // UI → DB
  UI_TO_DB: {
    rice: CropType.RICE,
    maize: CropType.MAIZE,
    peanut: CropType.PEANUT,
    sorghum: CropType.SORGHUM,
    cowpea: CropType.COWPEA,
    millet: CropType.MILLET,
  } as const,
};

export const LOT_STATUS_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [LotStatus.PENDING]: "pending",
    [LotStatus.CERTIFIED]: "certified",
    [LotStatus.REJECTED]: "rejected",
    [LotStatus.IN_STOCK]: "in-stock",
    [LotStatus.SOLD]: "sold",
    [LotStatus.ACTIVE]: "active",
    [LotStatus.DISTRIBUTED]: "distributed",
  } as const,

  // UI → DB
  UI_TO_DB: {
    pending: LotStatus.PENDING,
    certified: LotStatus.CERTIFIED,
    rejected: LotStatus.REJECTED,
    "in-stock": LotStatus.IN_STOCK,
    sold: LotStatus.SOLD,
    active: LotStatus.ACTIVE,
    distributed: LotStatus.DISTRIBUTED,
  } as const,
};

export const PARCEL_STATUS_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [ParcelStatus.AVAILABLE]: "available",
    [ParcelStatus.IN_USE]: "in-use",
    [ParcelStatus.RESTING]: "resting",
  } as const,

  // UI → DB
  UI_TO_DB: {
    available: ParcelStatus.AVAILABLE,
    "in-use": ParcelStatus.IN_USE,
    resting: ParcelStatus.RESTING,
  } as const,
};

export const PRODUCTION_STATUS_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [ProductionStatus.PLANNED]: "planned",
    [ProductionStatus.IN_PROGRESS]: "in-progress",
    [ProductionStatus.COMPLETED]: "completed",
    [ProductionStatus.CANCELLED]: "cancelled",
  } as const,

  // UI → DB
  UI_TO_DB: {
    planned: ProductionStatus.PLANNED,
    "in-progress": ProductionStatus.IN_PROGRESS,
    completed: ProductionStatus.COMPLETED,
    cancelled: ProductionStatus.CANCELLED,
  } as const,
};

export const ACTIVITY_TYPE_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [ActivityType.SOIL_PREPARATION]: "soil-preparation",
    [ActivityType.SOWING]: "sowing",
    [ActivityType.FERTILIZATION]: "fertilization",
    [ActivityType.IRRIGATION]: "irrigation",
    [ActivityType.WEEDING]: "weeding",
    [ActivityType.PEST_CONTROL]: "pest-control",
    [ActivityType.HARVEST]: "harvest",
    [ActivityType.OTHER]: "other",
  } as const,

  // UI → DB
  UI_TO_DB: {
    "soil-preparation": ActivityType.SOIL_PREPARATION,
    sowing: ActivityType.SOWING,
    fertilization: ActivityType.FERTILIZATION,
    irrigation: ActivityType.IRRIGATION,
    weeding: ActivityType.WEEDING,
    "pest-control": ActivityType.PEST_CONTROL,
    harvest: ActivityType.HARVEST,
    other: ActivityType.OTHER,
  } as const,
};

export const ISSUE_TYPE_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [IssueType.DISEASE]: "disease",
    [IssueType.PEST]: "pest",
    [IssueType.WEATHER]: "weather",
    [IssueType.MANAGEMENT]: "management",
    [IssueType.OTHER]: "other",
  } as const,

  // UI → DB
  UI_TO_DB: {
    disease: IssueType.DISEASE,
    pest: IssueType.PEST,
    weather: IssueType.WEATHER,
    management: IssueType.MANAGEMENT,
    other: IssueType.OTHER,
  } as const,
};

export const ISSUE_SEVERITY_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [IssueSeverity.LOW]: "low",
    [IssueSeverity.MEDIUM]: "medium",
    [IssueSeverity.HIGH]: "high",
  } as const,

  // UI → DB
  UI_TO_DB: {
    low: IssueSeverity.LOW,
    medium: IssueSeverity.MEDIUM,
    high: IssueSeverity.HIGH,
  } as const,
};

export const TEST_RESULT_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [TestResult.PASS]: "pass",
    [TestResult.FAIL]: "fail",
  } as const,

  // UI → DB
  UI_TO_DB: {
    pass: TestResult.PASS,
    fail: TestResult.FAIL,
  } as const,
};

export const CERTIFICATION_LEVEL_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [CertificationLevel.BEGINNER]: "beginner",
    [CertificationLevel.INTERMEDIATE]: "intermediate",
    [CertificationLevel.EXPERT]: "expert",
  } as const,

  // UI → DB
  UI_TO_DB: {
    beginner: CertificationLevel.BEGINNER,
    intermediate: CertificationLevel.INTERMEDIATE,
    expert: CertificationLevel.EXPERT,
  } as const,
};

export const MULTIPLIER_STATUS_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [MultiplierStatus.ACTIVE]: "active",
    [MultiplierStatus.INACTIVE]: "inactive",
  } as const,

  // UI → DB
  UI_TO_DB: {
    active: MultiplierStatus.ACTIVE,
    inactive: MultiplierStatus.INACTIVE,
  } as const,
};

export const CONTRACT_STATUS_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [ContractStatus.DRAFT]: "draft",
    [ContractStatus.ACTIVE]: "active",
    [ContractStatus.COMPLETED]: "completed",
    [ContractStatus.CANCELLED]: "cancelled",
  } as const,

  // UI → DB
  UI_TO_DB: {
    draft: ContractStatus.DRAFT,
    active: ContractStatus.ACTIVE,
    completed: ContractStatus.COMPLETED,
    cancelled: ContractStatus.CANCELLED,
  } as const,
};

export const REPORT_TYPE_MAPPINGS = {
  // DB → UI
  DB_TO_UI: {
    [ReportType.PRODUCTION]: "production",
    [ReportType.QUALITY]: "quality",
    [ReportType.INVENTORY]: "inventory",
    [ReportType.MULTIPLIER_PERFORMANCE]: "multiplier-performance",
    [ReportType.CUSTOM]: "custom",
  } as const,

  // UI → DB
  UI_TO_DB: {
    production: ReportType.PRODUCTION,
    quality: ReportType.QUALITY,
    inventory: ReportType.INVENTORY,
    "multiplier-performance": ReportType.MULTIPLIER_PERFORMANCE,
    custom: ReportType.CUSTOM,
  } as const,
};

// ===== SEED LEVELS (identiques UI/DB) =====
export const SEED_LEVEL_MAPPINGS = {
  // Les niveaux de semence sont identiques en UI et DB
  DB_TO_UI: {
    [SeedLevel.GO]: "GO",
    [SeedLevel.G1]: "G1",
    [SeedLevel.G2]: "G2",
    [SeedLevel.G3]: "G3",
    [SeedLevel.G4]: "G4",
    [SeedLevel.R1]: "R1",
    [SeedLevel.R2]: "R2",
  } as const,

  UI_TO_DB: {
    GO: SeedLevel.GO,
    G1: SeedLevel.G1,
    G2: SeedLevel.G2,
    G3: SeedLevel.G3,
    G4: SeedLevel.G4,
    R1: SeedLevel.R1,
    R2: SeedLevel.R2,
  } as const,
};

// ===== MAPPING REGISTRY (pour la transformation générique) =====
export const MAPPING_REGISTRY = {
  role: ROLE_MAPPINGS,
  cropType: CROP_TYPE_MAPPINGS,
  lotStatus: LOT_STATUS_MAPPINGS,
  parcelStatus: PARCEL_STATUS_MAPPINGS,
  productionStatus: PRODUCTION_STATUS_MAPPINGS,
  activityType: ACTIVITY_TYPE_MAPPINGS,
  issueType: ISSUE_TYPE_MAPPINGS,
  issueSeverity: ISSUE_SEVERITY_MAPPINGS,
  testResult: TEST_RESULT_MAPPINGS,
  certificationLevel: CERTIFICATION_LEVEL_MAPPINGS,
  multiplierStatus: MULTIPLIER_STATUS_MAPPINGS,
  contractStatus: CONTRACT_STATUS_MAPPINGS,
  reportType: REPORT_TYPE_MAPPINGS,
  seedLevel: SEED_LEVEL_MAPPINGS,
} as const;

// ===== TYPES DÉRIVÉS =====
export type UIRole = keyof typeof ROLE_MAPPINGS.UI_TO_DB;
export type UICropType = keyof typeof CROP_TYPE_MAPPINGS.UI_TO_DB;
export type UILotStatus = keyof typeof LOT_STATUS_MAPPINGS.UI_TO_DB;
export type UIParcelStatus = keyof typeof PARCEL_STATUS_MAPPINGS.UI_TO_DB;
export type UIProductionStatus =
  keyof typeof PRODUCTION_STATUS_MAPPINGS.UI_TO_DB;
export type UIActivityType = keyof typeof ACTIVITY_TYPE_MAPPINGS.UI_TO_DB;
export type UIIssueType = keyof typeof ISSUE_TYPE_MAPPINGS.UI_TO_DB;
export type UIIssueSeverity = keyof typeof ISSUE_SEVERITY_MAPPINGS.UI_TO_DB;
export type UITestResult = keyof typeof TEST_RESULT_MAPPINGS.UI_TO_DB;
export type UICertificationLevel =
  keyof typeof CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB;
export type UIMultiplierStatus =
  keyof typeof MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB;
export type UIContractStatus = keyof typeof CONTRACT_STATUS_MAPPINGS.UI_TO_DB;
export type UIReportType = keyof typeof REPORT_TYPE_MAPPINGS.UI_TO_DB;
export type UISeedLevel = keyof typeof SEED_LEVEL_MAPPINGS.UI_TO_DB;

// ===== LISTES POUR VALIDATION =====
export const VALID_UI_VALUES = {
  roles: Object.keys(ROLE_MAPPINGS.UI_TO_DB),
  cropTypes: Object.keys(CROP_TYPE_MAPPINGS.UI_TO_DB),
  lotStatuses: Object.keys(LOT_STATUS_MAPPINGS.UI_TO_DB),
  parcelStatuses: Object.keys(PARCEL_STATUS_MAPPINGS.UI_TO_DB),
  productionStatuses: Object.keys(PRODUCTION_STATUS_MAPPINGS.UI_TO_DB),
  activityTypes: Object.keys(ACTIVITY_TYPE_MAPPINGS.UI_TO_DB),
  issueTypes: Object.keys(ISSUE_TYPE_MAPPINGS.UI_TO_DB),
  issueSeverities: Object.keys(ISSUE_SEVERITY_MAPPINGS.UI_TO_DB),
  testResults: Object.keys(TEST_RESULT_MAPPINGS.UI_TO_DB),
  certificationLevels: Object.keys(CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB),
  multiplierStatuses: Object.keys(MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB),
  contractStatuses: Object.keys(CONTRACT_STATUS_MAPPINGS.UI_TO_DB),
  reportTypes: Object.keys(REPORT_TYPE_MAPPINGS.UI_TO_DB),
  seedLevels: Object.keys(SEED_LEVEL_MAPPINGS.UI_TO_DB),
} as const;

export const VALID_DB_VALUES = {
  roles: Object.values(Role),
  cropTypes: Object.values(CropType),
  lotStatuses: Object.values(LotStatus),
  parcelStatuses: Object.values(ParcelStatus),
  productionStatuses: Object.values(ProductionStatus),
  activityTypes: Object.values(ActivityType),
  issueTypes: Object.values(IssueType),
  issueSeverities: Object.values(IssueSeverity),
  testResults: Object.values(TestResult),
  certificationLevels: Object.values(CertificationLevel),
  multiplierStatuses: Object.values(MultiplierStatus),
  contractStatuses: Object.values(ContractStatus),
  reportTypes: Object.values(ReportType),
  seedLevels: Object.values(SeedLevel),
} as const;

// ===== HELPERS DE VALIDATION =====
export const isValidUIValue = <T extends keyof typeof VALID_UI_VALUES>(
  type: T,
  value: string
): value is (typeof VALID_UI_VALUES)[T][number] => {
  return VALID_UI_VALUES[type].includes(value as any);
};

export const isValidDBValue = <T extends keyof typeof VALID_DB_VALUES>(
  type: T,
  value: string
): value is (typeof VALID_DB_VALUES)[T][number] => {
  return (VALID_DB_VALUES[type] as readonly string[]).includes(value);
};

// ===== METADATA POUR DEBUGGING =====
export const ENUM_METADATA = {
  totalEnums: Object.keys(MAPPING_REGISTRY).length,
  totalMappings: Object.values(MAPPING_REGISTRY).reduce(
    (acc, mapping) => acc + Object.keys(mapping.UI_TO_DB).length,
    0
  ),
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  conventions: {
    ui: "kebab-case (lowercase with hyphens)",
    db: "UPPER_CASE (with underscores for multi-word)",
  },
} as const;

// Log des métadonnées en développement
if (process.env.NODE_ENV === "development") {
  console.log("📋 Enum mappings loaded:", ENUM_METADATA);
}
