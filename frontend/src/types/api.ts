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

// ✅ CORRIGÉ: Interface FilterParams étendue avec toutes les propriétés nécessaires
export interface FilterParams {
  // Filtres généraux
  level?: string;
  status?: string;
  cropType?: string;

  // Filtres de date
  startDate?: string;
  endDate?: string;

  // Filtres de relation
  varietyId?: string | number;
  multiplierId?: number;
  parcelId?: number;
  userId?: number;

  // Filtres spécifiques aux multiplicateurs
  certificationLevel?: string;
  yearsExperience?: number;
  specialization?: string[];

  // Filtres spécifiques aux contrôles qualité
  result?: string; // Pour les contrôles qualité (pass/fail)
  testMethod?: string;
  laboratoryRef?: string;

  // Filtres spécifiques aux productions
  productionStatus?: string;
  actualYield?: number;

  // Filtres spécifiques aux parcelles
  parcelStatus?: string;
  area?: number;
  soilType?: string;
  irrigationSystem?: string;

  // Filtres spécifiques aux variétés
  maturityDays?: number;
  yieldPotential?: number;
  origin?: string;
  releaseYear?: number;

  // Filtres spécifiques aux contrats
  contractStatus?: string;
  seedLevel?: string;
  expectedQuantity?: number;

  // Filtres géographiques
  latitude?: number;
  longitude?: number;
  region?: string;

  // Filtres booléens
  isActive?: boolean;
  resolved?: boolean; // Pour les issues

  // Filtres de métadonnées
  createdBy?: number;
  updatedBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;

  // Filtres avancés
  tags?: string[];
  category?: string;
  priority?: string;
  severity?: string; // Pour les issues

  // Filtres de performance
  minGerminationRate?: number;
  maxGerminationRate?: number;
  minVarietyPurity?: number;
  maxVarietyPurity?: number;

  // Filtres de quantité
  minQuantity?: number;
  maxQuantity?: number;

  // Filtres d'export/import
  format?: string;
  includeRelations?: boolean;

  // Meta-filtres pour la pagination et le tri avancé
  fields?: string[]; // Champs à inclure dans la réponse
  exclude?: string[]; // Champs à exclure de la réponse
  relations?: string[]; // Relations à inclure
}

// ✅ AJOUTÉ: Types spécialisés pour des filtres spécifiques
export interface SeedLotFilters extends FilterParams {
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  status:
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
  status: "active" | "inactive";
  certificationLevel: "beginner" | "intermediate" | "expert";
  minYearsExperience?: number;
  maxYearsExperience?: number;
  hasContracts?: boolean;
  hasParcels?: boolean;
}

export interface QualityControlFilters extends FilterParams {
  result: "pass" | "fail";
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
  cropType: "rice" | "maize" | "peanut" | "sorghum" | "cowpea" | "millet";
  minMaturityDays?: number;
  maxMaturityDays?: number;
  minYieldPotential?: number;
  maxYieldPotential?: number;
  hasResistances?: boolean;
  resistances?: string[];
}

export interface ParcelFilters extends FilterParams {
  status: "available" | "in-use" | "resting";
  minArea?: number;
  maxArea?: number;
  soilType?: string;
  irrigationSystem?: string;
  hasMultiplier?: boolean;
  hasSoilAnalysis?: boolean;
}

export interface ProductionFilters extends FilterParams {
  status: "planned" | "in-progress" | "completed" | "cancelled";
  sowingDateAfter?: string;
  sowingDateBefore?: string;
  harvestDateAfter?: string;
  harvestDateBefore?: string;
  minActualYield?: number;
  maxActualYield?: number;
  hasIssues?: boolean;
  hasActivities?: boolean;
}

// ✅ AJOUTÉ: Type pour les paramètres de recherche avancée
export interface SearchParams extends PaginationParams {
  query?: string;
  searchFields?: string[]; // Champs dans lesquels rechercher
  exactMatch?: boolean; // Recherche exacte ou partielle
  caseSensitive?: boolean; // Sensible à la casse
  includeInactive?: boolean; // Inclure les entités inactives
}

// ✅ AJOUTÉ: Type pour les paramètres d'export
export interface ExportParams {
  format: "csv" | "xlsx" | "pdf" | "json";
  fields?: string[]; // Champs à exporter
  includeHeaders?: boolean; // Inclure les en-têtes
  includeRelations?: boolean; // Inclure les relations
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: FilterParams; // Filtres à appliquer avant export
  filename?: string; // Nom du fichier d'export
}

// ✅ AJOUTÉ: Type pour les paramètres de rapport
export interface ReportParams {
  type:
    | "production"
    | "quality"
    | "inventory"
    | "multiplier-performance"
    | "custom";
  startDate: string;
  endDate: string;
  groupBy?: string[]; // Grouper par champs
  aggregations?: {
    field: string;
    operation: "sum" | "avg" | "count" | "min" | "max";
  }[];
  filters?: FilterParams;
  format?: "json" | "csv" | "pdf";
  includeCharts?: boolean;
  includeDetails?: boolean;
}

// ✅ AJOUTÉ: Type pour les réponses d'erreur API
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

// ✅ AJOUTÉ: Type pour les métadonnées étendues
export interface ExtendedPaginationMeta extends PaginationMeta {
  // Informations sur les filtres appliqués
  activeFilters?: Record<string, any>;
  filtersCount?: number;

  // Informations sur le tri
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Informations sur la recherche
  searchQuery?: string;
  searchFields?: string[];

  // Informations de performance
  queryTime?: number; // Temps d'exécution en ms
  cacheHit?: boolean; // Si le résultat vient du cache

  // Informations sur les relations
  includedRelations?: string[];

  // Informations sur les agrégations
  aggregations?: Record<string, any>;
}

// ✅ AJOUTÉ: Type pour les réponses avec métadonnées étendues
export interface ExtendedApiResponse<T = any> extends ApiResponse<T> {
  meta?: ExtendedPaginationMeta;
  debug?: {
    sql?: string; // Requête SQL générée (en développement)
    executionTime?: number;
    memoryUsage?: number;
  };
}
