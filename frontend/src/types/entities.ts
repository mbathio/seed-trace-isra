// frontend/src/types/entities.ts - VERSION CORRIGÉE
import type { StatusConfig } from "../constants";

// backend/src/types/entities.ts - AJOUT

// Interface pour les filtres de recherche de lots
export interface SeedLotFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  level?: string;
  status?: string;
  varietyId?: number;
  multiplierId?: number;
  parcelId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeRelations?: boolean;
  includeExpired?: boolean;
  includeInactive?: boolean;
}

// Interface pour le résultat de getSeedLots
export interface GetSeedLotsResult {
  success: boolean;
  message: string;
  data: any[];
  meta: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role:
    | "admin"
    | "manager"
    | "researcher"
    | "technician"
    | "inspector"
    | "multiplier"
    | "guest";
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Variety {
  id: number;
  code: string;
  name: string;
  cropType:
    | "rice"
    | "maize"
    | "peanut"
    | "sorghum"
    | "cowpea"
    | "millet"
    | "wheat";
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances?: string[];
  origin?: string;
  releaseYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    seedLots: number;
  };
}

export interface SeedLot {
  id: string;
  varietyId: number;
  variety: Variety;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string;
  availableQuantity: number;
  expiryDate?: string;
  status:
    | "pending"
    | "certified"
    | "rejected"
    | "in-stock"
    | "active"
    | "distributed"
    | "sold";
  batchNumber?: string;
  parentLotId?: string;
  parentLot?: SeedLot;
  productions?: Production[]; // Ajouter cette ligne
  childLots?: SeedLot[];
  notes?: string;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  multiplier?: Multiplier;
  parcel?: Parcel;
  qualityControls?: QualityControl[];
  officialCertificate?: SeedLotCertificate | null;
  officialCertificateUrl?: string | null;
  _count?: {
    childLots: number;
    qualityControls: number;
    productions: number;
  };
}

export interface SeedLotCertificate {
  url: string | null;
  path?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  size?: number | null;
  uploadedAt?: string | null;
}

export interface Multiplier {
  id: number;
  name: string;
  status: "active" | "inactive";
  address: string;
  latitude: number;
  longitude: number;
  yearsExperience: number;
  certificationLevel: "beginner" | "intermediate" | "expert";
  specialization: string[];
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    parcels: number;
    contracts: number;
    seedLots: number;
    productions: number;
  };
}

export interface Parcel {
  id: number;
  code: string;
  name?: string;
  area: number;
  latitude: number;
  longitude: number;
  status: "available" | "in-use" | "resting";
  soilType?: string;
  irrigationSystem?: string;
  address?: string;
  multiplierId?: number;
  multiplier?: Multiplier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  soilAnalyses?: SoilAnalysis[];
  _count?: {
    seedLots: number;
    productions: number;
  };
}

// Extension pour StatusConfig si nécessaire
export interface StatusConfigExtended extends StatusConfig {
  icon?: string;
  experience?: string;
}

export interface QualityControl {
  id: number;
  lotId: string;
  seedLot: SeedLot;
  controlDate: string;
  germinationRate: number;
  varietyPurity: number;
  moistureContent?: number;
  seedHealth?: number;
  result: "pass" | "fail";
  observations?: string;
  testMethod?: string;
  laboratoryRef?: string;
  certificateUrl?: string;
  inspectorId: number;
  inspector: User;
  createdAt: string;
  updatedAt: string;
}

export interface Production {
  id: number;
  lotId: string;
  seedLot: SeedLot;
  startDate: string;
  endDate?: string;
  sowingDate: string;
  harvestDate?: string;
  yield?: number;
  conditions?: string;
  multiplierId: number;
  multiplier: Multiplier;
  parcelId: number;
  parcel: Parcel;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  plannedQuantity?: number;
  actualYield?: number;
  notes?: string;
  weatherConditions?: string;
  createdAt: string;
  updatedAt: string;
  activities?: ProductionActivity[];
  issues?: ProductionIssue[];
  weatherData?: WeatherData[];
  _count?: {
    activities: number;
    issues: number;
    weatherData: number;
  };
}

export interface SoilAnalysis {
  id: number;
  parcelId: number;
  analysisDate: string;
  pH?: number;
  organicMatter?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface WeatherData {
  id: number;
  productionId: number;
  recordDate: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed?: number;
  notes?: string;
  source?: string;
  createdAt: string;
}

export interface ProductionActivity {
  id: number;
  productionId: number;
  type:
    | "soil-preparation"
    | "sowing"
    | "fertilization"
    | "irrigation"
    | "weeding"
    | "pest-control"
    | "harvest"
    | "other";
  activityDate: string;
  description: string;
  personnel: string[];
  notes?: string;
  userId?: number;
  user?: User;
  inputs?: ActivityInput[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityInput {
  id: number;
  activityId: number;
  name: string;
  quantity: string;
  unit: string;
  cost?: number;
}

export interface ProductionIssue {
  id: number;
  productionId: number;
  issueDate: string;
  type: "disease" | "pest" | "weather" | "management" | "other";
  description: string;
  severity: "low" | "medium" | "high";
  actions: string;
  resolved: boolean;
  resolvedDate?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: number;
  multiplierId: number;
  varietyId: number;
  startDate: string;
  endDate: string;
  seedLevel: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  expectedQuantity: number;
  actualQuantity?: number;
  status: "draft" | "active" | "completed" | "cancelled";
  parcelId?: number;
  paymentTerms?: string;
  notes?: string;
  multiplier: Multiplier;
  variety: Variety;
  parcel?: Parcel;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  overview: {
    totalSeedLots: number;
    activeSeedLots: number;
    totalProductions: number;
    completedProductions: number;
    totalQualityControls: number;
    passedQualityControls: number;
    activeMultipliers: number;
    totalVarieties: number;
  };
  rates: {
    productionCompletionRate: number;
    qualityPassRate: number;
  };
  distribution: {
    lotsByLevel: Array<{
      level: string;
      count: number;
      totalQuantity: number;
    }>;
    topVarieties: Array<{
      variety: Variety;
      count: number;
      totalQuantity: number;
    }>;
  };
  activity: {
    recentProductions: number;
  };
}
