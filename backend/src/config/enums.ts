// 2. backend/src/config/enums.ts - NOUVEAU fichier simplifié
// ✅ ENUMS TYPESCRIPT qui matchent exactement Prisma

export enum Role {
  admin = "admin",
  manager = "manager",
  inspector = "inspector",
  multiplier = "multiplier",
  guest = "guest",
  technician = "technician",
  researcher = "researcher",
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
  rice = "rice",
  maize = "maize",
  peanut = "peanut",
  sorghum = "sorghum",
  cowpea = "cowpea",
  millet = "millet",
  wheat = "wheat",
}

export enum LotStatus {
  pending = "pending",
  certified = "certified",
  rejected = "rejected",
  in_stock = "in-stock", // ✅ kebab-case unifié
  sold = "sold",
  active = "active",
  distributed = "distributed",
}

export enum ParcelStatus {
  available = "available",
  in_use = "in-use", // ✅ kebab-case unifié
  resting = "resting",
}

export enum ProductionStatus {
  planned = "planned",
  in_progress = "in-progress", // ✅ kebab-case unifié
  completed = "completed",
  cancelled = "cancelled",
}

export enum ActivityType {
  soil_preparation = "soil-preparation", // ✅ kebab-case unifié
  sowing = "sowing",
  fertilization = "fertilization",
  irrigation = "irrigation",
  weeding = "weeding",
  pest_control = "pest-control", // ✅ kebab-case unifié
  harvest = "harvest",
  other = "other",
}

export enum TestResult {
  pass = "pass",
  fail = "fail",
}

export enum MultiplierStatus {
  active = "active",
  inactive = "inactive",
}

export enum CertificationLevel {
  beginner = "beginner",
  intermediate = "intermediate",
  expert = "expert",
}

export enum ContractStatus {
  draft = "draft",
  active = "active",
  completed = "completed",
  cancelled = "cancelled",
}

export enum IssueType {
  disease = "disease",
  pest = "pest",
  weather = "weather",
  management = "management",
  other = "other",
}

export enum IssueSeverity {
  low = "low",
  medium = "medium",
  high = "high",
}

export enum ReportType {
  production = "production",
  quality = "quality",
  inventory = "inventory",
  multiplier_performance = "multiplier-performance", // ✅ kebab-case unifié
  custom = "custom",
}

// ✅ Fonction utilitaire pour validation
export function isValidEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string
): value is T[keyof T] {
  return Object.values(enumObject).includes(value);
}

// ✅ Listes des valeurs valides pour validation
export const VALID_ENUM_VALUES = {
  Role: Object.values(Role),
  SeedLevel: Object.values(SeedLevel),
  CropType: Object.values(CropType),
  LotStatus: Object.values(LotStatus),
  ParcelStatus: Object.values(ParcelStatus),
  ProductionStatus: Object.values(ProductionStatus),
  ActivityType: Object.values(ActivityType),
  TestResult: Object.values(TestResult),
  MultiplierStatus: Object.values(MultiplierStatus),
  CertificationLevel: Object.values(CertificationLevel),
  ContractStatus: Object.values(ContractStatus),
  IssueType: Object.values(IssueType),
  IssueSeverity: Object.values(IssueSeverity),
  ReportType: Object.values(ReportType),
} as const;
