// backend/src/types/entities.ts - VERSION CORRIGÉE
// ✅ CORRECTION: Supprimer les duplications et organiser proprement

// ==========================================
// INTERFACES DE CRÉATION (CREATE)
// ==========================================

export interface CreateSeedLotData {
  varietyId: string | number;
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status?: string;
  batchNumber?: string;
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
}

export interface CreateQualityControlData {
  lotId: string;
  controlDate: string;
  germinationRate: number;
  varietyPurity: number;
  moistureContent?: number;
  seedHealth?: number;
  observations?: string;
  testMethod?: string;
  laboratoryRef?: string;
  certificateUrl?: string; // ✅ Ajouté une seule fois
}

export interface CreateProductionData {
  lotId: string;
  multiplierId: number;
  parcelId: number;
  startDate: string;
  sowingDate?: string;
  plannedQuantity?: number;
  notes?: string;
  weatherConditions?: string;
}

export interface CreateMultiplierData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  yearsExperience: number;
  certificationLevel: string;
  specialization: string[];
  phone?: string;
  email?: string;
  status?: string;
}

export interface CreateVarietyData {
  code: string;
  name: string;
  cropType: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances?: string[];
  origin?: string;
  releaseYear?: number;
}

export interface CreateParcelData {
  name?: string;
  area: number;
  latitude: number;
  longitude: number;
  status?: string;
  soilType?: string;
  irrigationSystem?: string;
  address?: string;
  multiplierId?: number;
}

// ==========================================
// INTERFACES DE MISE À JOUR (UPDATE)
// ==========================================

export interface UpdateSeedLotData {
  quantity?: number;
  status?: string;
  notes?: string;
  expiryDate?: string;
  batchNumber?: string;
}

export interface UpdateQualityControlData {
  controlDate?: string;
  germinationRate?: number;
  varietyPurity?: number;
  moistureContent?: number;
  seedHealth?: number;
  observations?: string;
  testMethod?: string;
  laboratoryRef?: string;
  result?: "pass" | "fail"; // ✅ Utilise les valeurs Prisma lowercase
}

// ==========================================
// INTERFACES DE FILTRAGE ET RECHERCHE
// ==========================================

export interface QualityControlFilters {
  search?: string;
  result?: "pass" | "fail"; // ✅ Valeurs Prisma lowercase
  lotId?: string;
  inspectorId?: number;
  varietyId?: number;
  multiplierId?: number;
  startDate?: string;
  endDate?: string;
  minGerminationRate?: number;
  maxGerminationRate?: number;
}

// ==========================================
// INTERFACES DE STATISTIQUES
// ==========================================

export interface QualityControlStats {
  totalControls: number;
  passedControls: number;
  failedControls: number;
  passRate: number;
  averageGerminationRate: number;
  averageVarietyPurity: number;
  lastControlDate: Date;
}

export interface QualityControlReport {
  data: any[];
  summary: {
    totalControls: number;
    passedControls: number;
    failedControls: number;
    averageGerminationRate: number;
    averageVarietyPurity: number;
    byVariety: VarietyStats[];
    byMultiplier: MultiplierStats[];
    byMonth: MonthlyStats[];
  };
}

export interface VarietyStats {
  varietyId: number;
  varietyName: string;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  averageGerminationRate: number;
  averageVarietyPurity: number;
  passRate: number;
}

export interface MultiplierStats {
  multiplierId: number;
  multiplierName: string;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  averageGerminationRate: number;
  averageVarietyPurity: number;
  passRate: number;
}

export interface MonthlyStats {
  month: string; // Format: YYYY-MM
  totalControls: number;
  passedControls: number;
  failedControls: number;
  passRate: number;
}

// ==========================================
// SEUILS ET CONFIGURATIONS
// ==========================================

export interface QualityThresholds {
  [level: string]: {
    germination: number;
    purity: number;
  };
}

export const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds = {
  GO: { germination: 98, purity: 99.9 },
  G1: { germination: 95, purity: 99.5 },
  G2: { germination: 90, purity: 99.0 },
  G3: { germination: 85, purity: 98.0 },
  G4: { germination: 80, purity: 97.0 },
  R1: { germination: 80, purity: 97.0 },
  R2: { germination: 80, purity: 95.0 },
};

// ==========================================
// INTERFACES ADDITIONNELLES
// ==========================================

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface CreateReportData {
  title: string;
  type: string;
  description?: string;
  parameters?: any;
  data?: any;
  isPublic?: boolean;
  createdById: number;
}

// ==========================================
// INTERFACES DE PAGINATION ET FILTRES
// ==========================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SeedLotFilters extends PaginationParams {
  level?: string;
  status?: string;
  varietyId?: number;
  multiplierId?: number;
  startDate?: string;
  endDate?: string;
  includeRelations?: boolean;
  includeExpired?: boolean;
  includeInactive?: boolean;
}

export interface VarietyFilters extends PaginationParams {
  cropType?: string;
  isActive?: boolean;
}

export interface MultiplierFilters extends PaginationParams {
  status?: string;
  certificationLevel?: string;
  specialization?: string;
}

export interface ProductionFilters extends PaginationParams {
  status?: string;
  multiplierId?: number;
  varietyId?: number;
  startDate?: string;
  endDate?: string;
}

// ==========================================
// INTERFACES DE VALIDATION
// ==========================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  data?: any[];
}

// ==========================================
// INTERFACES D'EXPORT
// ==========================================

export interface ExportConfig {
  format: "csv" | "xlsx" | "json" | "pdf";
  filters?: any;
  fields?: string[];
  includeRelations?: boolean;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  data?: Buffer | string;
  filename: string;
  contentType: string;
  errors?: string[];
}

// ==========================================
// INTERFACES MÉTÉO ET ACTIVITÉS
// ==========================================

export interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed?: number;
  recordDate: string;
  notes?: string;
  source?: string;
}

export interface ActivityInput {
  name: string;
  quantity: string;
  unit: string;
  cost?: number;
}

export interface ProductionActivity {
  type: string;
  activityDate: string;
  description: string;
  personnel?: string[];
  notes?: string;
  inputs?: ActivityInput[];
}

export interface ProductionIssue {
  issueDate: string;
  type: string;
  description: string;
  severity: string;
  actions: string;
  resolved?: boolean;
  resolvedDate?: string;
  cost?: number;
}

// ==========================================
// INTERFACES DE GÉNÉALOGIE
// ==========================================

export interface GenealogyNode {
  id: string;
  level: string;
  variety: {
    id: number;
    name: string;
    code: string;
  };
  quantity: number;
  productionDate: Date;
  status: string;
  multiplier?: {
    id: number;
    name: string;
  };
  parentLotId?: string;
  children: GenealogyNode[];
  depth?: number;
  path?: string[];
}

export interface GenealogyStats {
  totalAncestors: number;
  totalDescendants: number;
  depth: number;
  breadth: number;
  multipliers: string[];
}

// ==========================================
// TYPES UTILITAIRES
// ==========================================

export type EntityType =
  | "seedLot"
  | "variety"
  | "multiplier"
  | "parcel"
  | "production"
  | "qualityControl"
  | "user"
  | "report";

export type SortOrder = "asc" | "desc";

export type FileFormat = "csv" | "xlsx" | "json" | "pdf" | "html";

// ==========================================
// CONSTANTES ET ENUMS
// ==========================================

export const SEED_LEVELS = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"] as const;
export const CROP_TYPES = [
  "rice",
  "maize",
  "peanut",
  "sorghum",
  "cowpea",
  "millet",
  "wheat",
] as const;
export const LOT_STATUSES = [
  "pending",
  "certified",
  "rejected",
  "in_stock",
  "sold",
  "active",
  "distributed",
] as const;
export const TEST_RESULTS = ["pass", "fail"] as const;

export type SeedLevel = (typeof SEED_LEVELS)[number];
export type CropType = (typeof CROP_TYPES)[number];
export type LotStatus = (typeof LOT_STATUSES)[number];
export type TestResult = (typeof TEST_RESULTS)[number];
