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
