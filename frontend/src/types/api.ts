// frontend/src/types/api.ts - VERSION CORRIGÉE
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  level?: string;
  status?: string;
  cropType?: string;
  startDate?: string;
  endDate?: string;
  varietyId?: string | number;
  multiplierId?: number;
  parcelId?: number;
  userId?: number;
  certificationLevel?: string;
  yearsExperience?: number;
  specialization?: string[];
  result?: string;
  testMethod?: string;
  laboratoryRef?: string;
  productionStatus?: string;
  actualYield?: number;
  parcelStatus?: string;
  area?: number;
  soilType?: string;
  irrigationSystem?: string;
  maturityDays?: number;
  yieldPotential?: number;
  origin?: string;
  releaseYear?: number;
  contractStatus?: string;
  seedLevel?: string;
  expectedQuantity?: number;
  latitude?: number;
  longitude?: number;
  region?: string;
  isActive?: boolean;
  resolved?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  tags?: string[];
  category?: string;
  priority?: string;
  severity?: string;
  minGerminationRate?: number;
  maxGerminationRate?: number;
  minVarietyPurity?: number;
  maxVarietyPurity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  format?: string;
  includeRelations?: boolean;
  fields?: string[];
  exclude?: string[];
  relations?: string[];
}

export interface SeedLotFilters extends FilterParams {
  level?: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  status?:
    | "pending"
    | "certified"
    | "rejected"
    | "in-stock"
    | "active"
    | "distributed"
    | "sold";
  parentLotId?: string;
  hasQualityControl?: boolean;
  expiryDateBefore?: string;
  expiryDateAfter?: string;
}

export interface MultiplierFilters extends FilterParams {
  status?: "active" | "inactive";
  certificationLevel?: "beginner" | "intermediate" | "expert";
  minYearsExperience?: number;
  maxYearsExperience?: number;
  hasContracts?: boolean;
  hasParcels?: boolean;
}

export interface QualityControlFilters extends FilterParams {
  result?: "pass" | "fail";
  minGerminationRate?: number;
  maxGerminationRate?: number;
  minVarietyPurity?: number;
  maxVarietyPurity?: number;
  inspectorId?: number;
  laboratoryRef?: string;
  controlDateAfter?: string;
  controlDateBefore?: string;
}

export interface VarietyFilters extends FilterParams {
  cropType?:
    | "rice"
    | "maize"
    | "peanut"
    | "sorghum"
    | "cowpea"
    | "millet"
    | "wheat";
  minMaturityDays?: number;
  maxMaturityDays?: number;
  minYieldPotential?: number;
  maxYieldPotential?: number;
  hasResistances?: boolean;
  resistances?: string[];
}

export interface ParcelFilters extends FilterParams {
  status?: "available" | "in-use" | "resting";
  minArea?: number;
  maxArea?: number;
  soilType?: string;
  irrigationSystem?: string;
  hasMultiplier?: boolean;
  hasSoilAnalysis?: boolean;
}

export interface ProductionFilters extends FilterParams {
  status?: "planned" | "in-progress" | "completed" | "cancelled";
  sowingDateAfter?: string;
  sowingDateBefore?: string;
  harvestDateAfter?: string;
  harvestDateBefore?: string;
  minActualYield?: number;
  maxActualYield?: number;
  hasIssues?: boolean;
  hasActivities?: boolean;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  searchFields?: string[];
  exactMatch?: boolean;
  caseSensitive?: boolean;
  includeInactive?: boolean;
}

export interface ExportParams {
  format: "csv" | "xlsx" | "pdf" | "json";
  fields?: string[];
  includeHeaders?: boolean;
  includeRelations?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: FilterParams;
  filename?: string;
}

export interface ReportParams {
  type:
    | "production"
    | "quality"
    | "inventory"
    | "multiplier-performance"
    | "custom";
  startDate: string;
  endDate: string;
  groupBy?: string[];
  aggregations?: {
    field: string;
    operation: "sum" | "avg" | "count" | "min" | "max";
  }[];
  filters?: FilterParams;
  format?: "json" | "csv" | "pdf";
  includeCharts?: boolean;
  includeDetails?: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
    code?: string;
  }[];
  code?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface ExtendedPaginationMeta extends PaginationMeta {
  activeFilters?: Record<string, any>;
  filtersCount?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchQuery?: string;
  searchFields?: string[];
  queryTime?: number;
  cacheHit?: boolean;
  includedRelations?: string[];
  aggregations?: Record<string, any>;
}

export interface ExtendedApiResponse<T = any> extends ApiResponse<T> {
  meta?: ExtendedPaginationMeta;
  debug?: {
    sql?: string;
    executionTime?: number;
    memoryUsage?: number;
  };
}
