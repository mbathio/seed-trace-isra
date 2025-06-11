// backend/src/utils/transformers.ts - ✅ VERSION CORRIGÉE avec transformInputStatus
import {
  SeedLevel,
  LotStatus,
  Role,
  CropType,
  MultiplierStatus,
  CertificationLevel,
  ParcelStatus,
  ContractStatus,
  ProductionStatus,
  ActivityType,
  IssueType,
  IssueSeverity,
  TestResult,
  ReportType,
} from "@prisma/client";

export class DataTransformer {
  // Mappings pour les statuts de lots
  private static readonly LOT_STATUS_DB_TO_UI: Record<LotStatus, string> = {
    PENDING: "pending",
    CERTIFIED: "certified",
    REJECTED: "rejected",
    IN_STOCK: "in-stock",
    SOLD: "sold",
    ACTIVE: "active",
    DISTRIBUTED: "distributed",
  };

  private static readonly LOT_STATUS_UI_TO_DB: Record<string, LotStatus> = {
    pending: "PENDING",
    certified: "CERTIFIED",
    rejected: "REJECTED",
    "in-stock": "IN_STOCK",
    sold: "SOLD",
    active: "ACTIVE",
    distributed: "DISTRIBUTED",
  };

  // Mappings pour les rôles utilisateurs
  private static readonly ROLE_DB_TO_UI: Record<Role, string> = {
    ADMIN: "admin",
    MANAGER: "manager",
    INSPECTOR: "inspector",
    MULTIPLIER: "multiplier",
    GUEST: "guest",
    TECHNICIAN: "technician",
    RESEARCHER: "researcher",
  };

  private static readonly ROLE_UI_TO_DB: Record<string, Role> = {
    admin: "ADMIN",
    manager: "MANAGER",
    inspector: "INSPECTOR",
    multiplier: "MULTIPLIER",
    guest: "GUEST",
    technician: "TECHNICIAN",
    researcher: "RESEARCHER",
  };

  // Mappings pour les types de cultures
  private static readonly CROP_TYPE_DB_TO_UI: Record<CropType, string> = {
    RICE: "rice",
    MAIZE: "maize",
    PEANUT: "peanut",
    SORGHUM: "sorghum",
    COWPEA: "cowpea",
    MILLET: "millet",
  };

  private static readonly CROP_TYPE_UI_TO_DB: Record<string, CropType> = {
    rice: "RICE",
    maize: "MAIZE",
    peanut: "PEANUT",
    sorghum: "SORGHUM",
    cowpea: "COWPEA",
    millet: "MILLET",
  };
  // Dans backend/src/utils/transformers.ts
  static readonly MULTIPLIER_STATUS_UI_TO_DB: Record<string, MultiplierStatus> =
    {
      active: "ACTIVE",
      inactive: "INACTIVE",
    };

  static readonly CERTIFICATION_LEVEL_UI_TO_DB: Record<
    string,
    CertificationLevel
  > = {
    beginner: "BEGINNER",
    intermediate: "INTERMEDIATE",
    expert: "EXPERT",
  };

  static readonly TEST_RESULT_UI_TO_DB: Record<string, TestResult> = {
    pass: "PASS",
    fail: "FAIL",
  };

  static readonly PRODUCTION_STATUS_UI_TO_DB: Record<string, ProductionStatus> =
    {
      planned: "PLANNED",
      "in-progress": "IN_PROGRESS",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    };

  static readonly ACTIVITY_TYPE_UI_TO_DB: Record<string, ActivityType> = {
    "soil-preparation": "SOIL_PREPARATION",
    sowing: "SOWING",
    fertilization: "FERTILIZATION",
    irrigation: "IRRIGATION",
    weeding: "WEEDING",
    "pest-control": "PEST_CONTROL",
    harvest: "HARVEST",
    other: "OTHER",
  };

  static readonly PARCEL_STATUS_UI_TO_DB: Record<string, ParcelStatus> = {
    available: "AVAILABLE",
    "in-use": "IN_USE",
    resting: "RESTING",
  };

  // Méthodes helper pour accéder aux mappings
  static getMultiplierStatusMapping() {
    return this.MULTIPLIER_STATUS_UI_TO_DB;
  }

  static getCertificationLevelMapping() {
    return this.CERTIFICATION_LEVEL_UI_TO_DB;
  }

  static getTestResultMapping() {
    return this.TEST_RESULT_UI_TO_DB;
  }

  static getProductionStatusMapping() {
    return this.PRODUCTION_STATUS_UI_TO_DB;
  }

  static getActivityTypeMapping() {
    return this.ACTIVITY_TYPE_UI_TO_DB;
  }

  static getParcelStatusMapping() {
    return this.PARCEL_STATUS_UI_TO_DB;
  }

  // ✅ CORRECTION: Méthode manquante transformInputStatus
  static transformInputStatus(status: string): LotStatus {
    return this.transformLotStatusUIToDB(status);
  }

  // ✅ CORRECTION: Transformations spécialisées
  static transformLotStatusDBToUI(status: LotStatus): string {
    return (
      this.LOT_STATUS_DB_TO_UI[status] ||
      status.toLowerCase().replace(/_/g, "-")
    );
  }

  static transformLotStatusUIToDB(status: string): LotStatus {
    return (
      this.LOT_STATUS_UI_TO_DB[status] ||
      (status.toUpperCase().replace(/-/g, "_") as LotStatus)
    );
  }

  static transformRoleDBToUI(role: Role): string {
    return this.ROLE_DB_TO_UI[role] || role.toLowerCase();
  }

  static transformRoleUIToDB(role: string): Role {
    return this.ROLE_UI_TO_DB[role] || (role.toUpperCase() as Role);
  }

  static transformCropTypeDBToUI(cropType: CropType): string {
    return this.CROP_TYPE_DB_TO_UI[cropType] || cropType.toLowerCase();
  }

  static transformCropTypeUIToDB(cropType: string): CropType {
    return (
      this.CROP_TYPE_UI_TO_DB[cropType] || (cropType.toUpperCase() as CropType)
    );
  }

  // ✅ CORRECTION: Méthodes génériques de transformation
  static transformEnumDBToUI<T extends string>(
    value: T,
    mapping: Record<T, string>
  ): string {
    return mapping[value] || value.toLowerCase().replace(/_/g, "-");
  }

  static transformEnumUIToDB<T extends string>(
    value: string,
    mapping: Record<string, T>
  ): T {
    return mapping[value] || (value.toUpperCase().replace(/-/g, "_") as T);
  }

  // ✅ CORRECTION: Transformation complète des entités
  static transformSeedLot(lot: any): any {
    if (!lot) return null;

    return {
      ...lot,
      status: this.transformLotStatusDBToUI(lot.status),
      // Transformer les relations
      variety: lot.variety
        ? {
            ...lot.variety,
            cropType: this.transformCropTypeDBToUI(lot.variety.cropType),
            createdAt:
              lot.variety.createdAt?.toISOString?.() || lot.variety.createdAt,
            updatedAt:
              lot.variety.updatedAt?.toISOString?.() || lot.variety.updatedAt,
          }
        : undefined,
      multiplier: lot.multiplier
        ? this.transformMultiplier(lot.multiplier)
        : undefined,
      parcel: lot.parcel ? this.transformParcel(lot.parcel) : undefined,
      parentLot: lot.parentLot
        ? this.transformSeedLot(lot.parentLot)
        : undefined,
      childLots:
        lot.childLots?.map((child: any) => this.transformSeedLot(child)) || [],
      qualityControls:
        lot.qualityControls?.map((qc: any) =>
          this.transformQualityControl(qc)
        ) || [],
      productions:
        lot.productions?.map((p: any) => this.transformProduction(p)) || [],
      // Transformer les dates
      productionDate: lot.productionDate?.toISOString?.() || lot.productionDate,
      expiryDate: lot.expiryDate?.toISOString?.() || lot.expiryDate,
      createdAt: lot.createdAt?.toISOString?.() || lot.createdAt,
      updatedAt: lot.updatedAt?.toISOString?.() || lot.updatedAt,
    };
  }

  static transformUser(user: any): any {
    if (!user) return null;

    return {
      ...user,
      role: this.transformRoleDBToUI(user.role),
      createdAt: user.createdAt?.toISOString?.() || user.createdAt,
      updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
    };
  }

  static transformVariety(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      cropType: this.transformCropTypeDBToUI(variety.cropType),
      createdAt: variety.createdAt?.toISOString?.() || variety.createdAt,
      updatedAt: variety.updatedAt?.toISOString?.() || variety.updatedAt,
    };
  }

  static transformMultiplier(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: multiplier.status?.toLowerCase?.() || multiplier.status,
      certificationLevel:
        multiplier.certificationLevel?.toLowerCase?.() ||
        multiplier.certificationLevel,
      specialization:
        multiplier.specialization?.map((spec: CropType) =>
          this.transformCropTypeDBToUI(spec)
        ) || [],
      createdAt: multiplier.createdAt?.toISOString?.() || multiplier.createdAt,
      updatedAt: multiplier.updatedAt?.toISOString?.() || multiplier.updatedAt,
    };
  }

  static transformParcel(parcel: any): any {
    if (!parcel) return null;

    return {
      ...parcel,
      status:
        parcel.status?.toLowerCase?.().replace(/_/g, "-") || parcel.status,
      multiplier: parcel.multiplier
        ? this.transformMultiplier(parcel.multiplier)
        : undefined,
      createdAt: parcel.createdAt?.toISOString?.() || parcel.createdAt,
      updatedAt: parcel.updatedAt?.toISOString?.() || parcel.updatedAt,
    };
  }

  static transformQualityControl(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      result: qc.result?.toLowerCase?.() || qc.result,
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : undefined,
      inspector: qc.inspector ? this.transformUser(qc.inspector) : undefined,
      controlDate: qc.controlDate?.toISOString?.() || qc.controlDate,
      createdAt: qc.createdAt?.toISOString?.() || qc.createdAt,
      updatedAt: qc.updatedAt?.toISOString?.() || qc.updatedAt,
    };
  }

  static transformProduction(production: any): any {
    if (!production) return null;

    return {
      ...production,
      status:
        production.status?.toLowerCase?.().replace(/_/g, "-") ||
        production.status,
      seedLot: production.seedLot
        ? this.transformSeedLot(production.seedLot)
        : undefined,
      multiplier: production.multiplier
        ? this.transformMultiplier(production.multiplier)
        : undefined,
      parcel: production.parcel
        ? this.transformParcel(production.parcel)
        : undefined,
      startDate: production.startDate?.toISOString?.() || production.startDate,
      endDate: production.endDate?.toISOString?.() || production.endDate,
      sowingDate:
        production.sowingDate?.toISOString?.() || production.sowingDate,
      harvestDate:
        production.harvestDate?.toISOString?.() || production.harvestDate,
      createdAt: production.createdAt?.toISOString?.() || production.createdAt,
      updatedAt: production.updatedAt?.toISOString?.() || production.updatedAt,
    };
  }

  // ✅ CORRECTION: Transformation des réponses API complètes
  static transformApiResponse(response: any, entityType: string): any {
    if (!response) return null;

    const transformers: Record<string, (item: any) => any> = {
      user: this.transformUser,
      seedlot: this.transformSeedLot,
      variety: this.transformVariety,
      multiplier: this.transformMultiplier,
      parcel: this.transformParcel,
      qualitycontrol: this.transformQualityControl,
      production: this.transformProduction,
    };

    const transformer = transformers[entityType.toLowerCase()];
    if (!transformer) {
      console.warn(`No transformer found for entity type: ${entityType}`);
      return response;
    }

    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformer).filter(Boolean);
      } else {
        response.data = transformer(response.data);
      }
    }

    return response;
  }
}
