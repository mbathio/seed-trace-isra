export interface User {
  id: number;
  name: string;
  email: string;
  role:
    | "ADMIN"
    | "MANAGER"
    | "RESEARCHER"
    | "TECHNICIAN"
    | "INSPECTOR"
    | "MULTIPLIER"
    | "GUEST";
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Variety {
  id: number;
  code: string;
  name: string;
  cropType: "RICE" | "MAIZE" | "PEANUT" | "SORGHUM" | "COWPEA" | "MILLET";
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances?: string[];
  origin?: string;
  releaseYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // ✅ AJOUTÉ: Champs manquants
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
  expiryDate?: string;
  status:
    | "PENDING"
    | "CERTIFIED"
    | "REJECTED"
    | "IN_STOCK"
    | "ACTIVE"
    | "DISTRIBUTED"
    | "SOLD";
  batchNumber?: string;
  parentLotId?: string;
  parentLot?: SeedLot;
  childLots?: SeedLot[];
  notes?: string;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  multiplier?: Multiplier;
  parcel?: Parcel;
  qualityControls?: QualityControl[];
  // ✅ AJOUTÉ: Champs manquants
  _count?: {
    childLots: number;
    qualityControls: number;
    productions: number;
  };
}

export interface Multiplier {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  address: string;
  latitude: number;
  longitude: number;
  yearsExperience: number;
  certificationLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  specialization: string[];
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // ✅ AJOUTÉ: Champs manquants
  _count?: {
    parcels: number;
    contracts: number;
    seedLots: number;
    productions: number;
  };
}

export interface Parcel {
  id: number;
  name?: string;
  area: number;
  latitude: number;
  longitude: number;
  status: "AVAILABLE" | "IN_USE" | "RESTING";
  soilType?: string;
  irrigationSystem?: string;
  address?: string;
  multiplierId?: number;
  multiplier?: Multiplier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // ✅ AJOUTÉ: Champs manquants
  soilAnalyses?: SoilAnalysis[];
  _count?: {
    seedLots: number;
    productions: number;
  };
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
  result: "PASS" | "FAIL";
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
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  plannedQuantity?: number;
  actualYield?: number;
  notes?: string;
  weatherConditions?: string;
  createdAt: string;
  updatedAt: string;
  // ✅ AJOUTÉ: Champs manquants
  activities?: ProductionActivity[];
  issues?: ProductionIssue[];
  _count?: {
    activities: number;
    issues: number;
    weatherData: number;
  };
}

// ✅ AJOUTÉ: Types manquants
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

export interface ProductionActivity {
  id: number;
  productionId: number;
  type:
    | "SOIL_PREPARATION"
    | "SOWING"
    | "FERTILIZATION"
    | "IRRIGATION"
    | "WEEDING"
    | "PEST_CONTROL"
    | "HARVEST"
    | "OTHER";
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
  type: "DISEASE" | "PEST" | "WEATHER" | "MANAGEMENT" | "OTHER";
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
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
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
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
