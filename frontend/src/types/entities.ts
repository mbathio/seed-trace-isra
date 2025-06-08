export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Variety {
  id: number;
  code: string;
  name: string;
  cropType: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances?: string[];
  origin?: string;
  releaseYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeedLot {
  id: string;
  varietyId: number;
  variety: Variety;
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status: string;
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
}

export interface Multiplier {
  id: number;
  name: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  yearsExperience: number;
  certificationLevel: string;
  specialization: string[];
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Parcel {
  id: number;
  name?: string;
  area: number;
  latitude: number;
  longitude: number;
  status: string;
  soilType?: string;
  irrigationSystem?: string;
  address?: string;
  multiplierId?: number;
  multiplier?: Multiplier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  result: string;
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
  status: string;
  plannedQuantity?: number;
  actualYield?: number;
  notes?: string;
  weatherConditions?: string;
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
