// backend/src/types/entities.ts
export interface CreateSeedLotData {
  varietyId: string | number; // ✅ Peut être un ID numérique ou un code string
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string; // ✅ Ajouté - optionnel
  status?: string; // ✅ Ajouté - optionnel, pour le statut du lot
  batchNumber?: string; // ✅ Ajouté - optionnel, pour le numéro de lot
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
}

export interface UpdateSeedLotData {
  quantity?: number;
  status?: string;
  notes?: string;
  expiryDate?: string;
  batchNumber?: string; // ✅ Ajouté - optionnel, pour le numéro de lot
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

// backend/src/types/entities.ts - Ajout des types pour QualityControl
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
  certificateUrl?: string; // ✅ Ajouté pour résoudre l'erreur TypeScript
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
  result?: "PASS" | "FAIL"; // Peut être recalculé automatiquement
}

/**
 * Interface pour les filtres de recherche de contrôles qualité
 */
export interface QualityControlFilters {
  search?: string;
  result?: "PASS" | "FAIL" | "pass" | "fail";
  lotId?: string;
  inspectorId?: number;
  varietyId?: number;
  multiplierId?: number;
  startDate?: string;
  endDate?: string;
  minGerminationRate?: number;
  maxGerminationRate?: number;
}

/**
 * Interface pour les statistiques de contrôle qualité
 */
export interface QualityControlStats {
  totalControls: number;
  passedControls: number;
  failedControls: number;
  passRate: number;
  averageGerminationRate: number;
  averageVarietyPurity: number;
  lastControlDate: Date;
}

/**
 * Interface pour le rapport de contrôle qualité
 */
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

/**
 * Statistiques par variété
 */
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

/**
 * Statistiques par multiplicateur
 */
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

/**
 * Statistiques mensuelles
 */
export interface MonthlyStats {
  month: string; // Format: YYYY-MM
  totalControls: number;
  passedControls: number;
  failedControls: number;
  passRate: number;
}

/**
 * Seuils de validation par niveau de semence
 */
export interface QualityThresholds {
  [level: string]: {
    germination: number;
    purity: number;
  };
}

/**
 * Configuration des seuils par défaut
 */
export const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds = {
  GO: { germination: 98, purity: 99.9 },
  G1: { germination: 95, purity: 99.5 },
  G2: { germination: 90, purity: 99.0 },
  G3: { germination: 85, purity: 98.0 },
  G4: { germination: 80, purity: 97.0 },
  R1: { germination: 80, purity: 97.0 },
  R2: { germination: 80, purity: 95.0 },
};
