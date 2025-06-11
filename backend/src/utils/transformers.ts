// backend/src/utils/transformers.ts - ✅ VERSION CORRIGÉE COMPLÈTE
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

// ✅ CORRECTION 1: Mappings bidirectionnels complets
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

  // Mappings pour les statuts multiplicateurs
  private static readonly MULTIPLIER_STATUS_DB_TO_UI: Record<
    MultiplierStatus,
    string
  > = {
    ACTIVE: "active",
    INACTIVE: "inactive",
  };

  private static readonly MULTIPLIER_STATUS_UI_TO_DB: Record<
    string,
    MultiplierStatus
  > = {
    active: "ACTIVE",
    inactive: "INACTIVE",
  };

  // Mappings pour les niveaux de certification
  private static readonly CERTIFICATION_LEVEL_DB_TO_UI: Record<
    CertificationLevel,
    string
  > = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    EXPERT: "expert",
  };

  private static readonly CERTIFICATION_LEVEL_UI_TO_DB: Record<
    string,
    CertificationLevel
  > = {
    beginner: "BEGINNER",
    intermediate: "INTERMEDIATE",
    expert: "EXPERT",
  };

  // Mappings pour les statuts de parcelles
  private static readonly PARCEL_STATUS_DB_TO_UI: Record<ParcelStatus, string> =
    {
      AVAILABLE: "available",
      IN_USE: "in-use",
      RESTING: "resting",
    };

  private static readonly PARCEL_STATUS_UI_TO_DB: Record<string, ParcelStatus> =
    {
      available: "AVAILABLE",
      "in-use": "IN_USE",
      resting: "RESTING",
    };

  // Mappings pour les statuts de production
  private static readonly PRODUCTION_STATUS_DB_TO_UI: Record<
    ProductionStatus,
    string
  > = {
    PLANNED: "planned",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };

  private static readonly PRODUCTION_STATUS_UI_TO_DB: Record<
    string,
    ProductionStatus
  > = {
    planned: "PLANNED",
    "in-progress": "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };

  // Mappings pour les types d'activités
  private static readonly ACTIVITY_TYPE_DB_TO_UI: Record<ActivityType, string> =
    {
      SOIL_PREPARATION: "soil-preparation",
      SOWING: "sowing",
      FERTILIZATION: "fertilization",
      IRRIGATION: "irrigation",
      WEEDING: "weeding",
      PEST_CONTROL: "pest-control",
      HARVEST: "harvest",
      OTHER: "other",
    };

  private static readonly ACTIVITY_TYPE_UI_TO_DB: Record<string, ActivityType> =
    {
      "soil-preparation": "SOIL_PREPARATION",
      sowing: "SOWING",
      fertilization: "FERTILIZATION",
      irrigation: "IRRIGATION",
      weeding: "WEEDING",
      "pest-control": "PEST_CONTROL",
      harvest: "HARVEST",
      other: "OTHER",
    };

  // Mappings pour les résultats de tests
  private static readonly TEST_RESULT_DB_TO_UI: Record<TestResult, string> = {
    PASS: "pass",
    FAIL: "fail",
  };

  private static readonly TEST_RESULT_UI_TO_DB: Record<string, TestResult> = {
    pass: "PASS",
    fail: "FAIL",
  };

  // ✅ CORRECTION 2: Méthodes de transformation génériques
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

  // ✅ CORRECTION 3: Transformations spécialisées
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

  // ✅ CORRECTION 4: Transformation complète des entités
  static transformUser(user: any): any {
    if (!user) return null;

    return {
      ...user,
      role: this.transformRoleDBToUI(user.role),
      createdAt: user.createdAt?.toISOString?.() || user.createdAt,
      updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
    };
  }

  static transformUserForDB(user: any): any {
    if (!user) return null;

    const transformed = { ...user };
    if (user.role) {
      transformed.role = this.transformRoleUIToDB(user.role);
    }
    return transformed;
  }

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

  static transformSeedLotForDB(lot: any): any {
    if (!lot) return null;

    const transformed = { ...lot };
    if (lot.status) {
      transformed.status = this.transformLotStatusUIToDB(lot.status);
    }
    // Convertir les dates si nécessaire
    if (lot.productionDate && typeof lot.productionDate === "string") {
      transformed.productionDate = new Date(lot.productionDate);
    }
    if (lot.expiryDate && typeof lot.expiryDate === "string") {
      transformed.expiryDate = new Date(lot.expiryDate);
    }
    return transformed;
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

  static transformVarietyForDB(variety: any): any {
    if (!variety) return null;

    const transformed = { ...variety };
    if (variety.cropType) {
      transformed.cropType = this.transformCropTypeUIToDB(variety.cropType);
    }
    return transformed;
  }

  static transformMultiplier(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: this.transformEnumDBToUI(
        multiplier.status,
        this.MULTIPLIER_STATUS_DB_TO_UI
      ),
      certificationLevel: this.transformEnumDBToUI(
        multiplier.certificationLevel,
        this.CERTIFICATION_LEVEL_DB_TO_UI
      ),
      specialization:
        multiplier.specialization?.map((spec: CropType) =>
          this.transformCropTypeDBToUI(spec)
        ) || [],
      createdAt: multiplier.createdAt?.toISOString?.() || multiplier.createdAt,
      updatedAt: multiplier.updatedAt?.toISOString?.() || multiplier.updatedAt,
    };
  }

  static transformMultiplierForDB(multiplier: any): any {
    if (!multiplier) return null;

    const transformed = { ...multiplier };
    if (multiplier.status) {
      transformed.status = this.transformEnumUIToDB(
        multiplier.status,
        this.MULTIPLIER_STATUS_UI_TO_DB
      );
    }
    if (multiplier.certificationLevel) {
      transformed.certificationLevel = this.transformEnumUIToDB(
        multiplier.certificationLevel,
        this.CERTIFICATION_LEVEL_UI_TO_DB
      );
    }
    if (multiplier.specialization) {
      transformed.specialization = multiplier.specialization.map(
        (spec: string) => this.transformCropTypeUIToDB(spec)
      );
    }
    return transformed;
  }

  static transformParcel(parcel: any): any {
    if (!parcel) return null;

    return {
      ...parcel,
      status: this.transformEnumDBToUI(
        parcel.status,
        this.PARCEL_STATUS_DB_TO_UI
      ),
      multiplier: parcel.multiplier
        ? this.transformMultiplier(parcel.multiplier)
        : undefined,
      soilAnalyses:
        parcel.soilAnalyses?.map((analysis: any) => ({
          ...analysis,
          analysisDate:
            analysis.analysisDate?.toISOString?.() || analysis.analysisDate,
          createdAt: analysis.createdAt?.toISOString?.() || analysis.createdAt,
          updatedAt: analysis.updatedAt?.toISOString?.() || analysis.updatedAt,
        })) || [],
      createdAt: parcel.createdAt?.toISOString?.() || parcel.createdAt,
      updatedAt: parcel.updatedAt?.toISOString?.() || parcel.updatedAt,
    };
  }

  static transformParcelForDB(parcel: any): any {
    if (!parcel) return null;

    const transformed = { ...parcel };
    if (parcel.status) {
      transformed.status = this.transformEnumUIToDB(
        parcel.status,
        this.PARCEL_STATUS_UI_TO_DB
      );
    }
    return transformed;
  }

  static transformQualityControl(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      result: this.transformEnumDBToUI(qc.result, this.TEST_RESULT_DB_TO_UI),
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : undefined,
      inspector: qc.inspector ? this.transformUser(qc.inspector) : undefined,
      controlDate: qc.controlDate?.toISOString?.() || qc.controlDate,
      createdAt: qc.createdAt?.toISOString?.() || qc.createdAt,
      updatedAt: qc.updatedAt?.toISOString?.() || qc.updatedAt,
    };
  }

  static transformQualityControlForDB(qc: any): any {
    if (!qc) return null;

    const transformed = { ...qc };
    if (qc.result) {
      transformed.result = this.transformEnumUIToDB(
        qc.result,
        this.TEST_RESULT_UI_TO_DB
      );
    }
    if (qc.controlDate && typeof qc.controlDate === "string") {
      transformed.controlDate = new Date(qc.controlDate);
    }
    return transformed;
  }

  static transformProduction(production: any): any {
    if (!production) return null;

    return {
      ...production,
      status: this.transformEnumDBToUI(
        production.status,
        this.PRODUCTION_STATUS_DB_TO_UI
      ),
      seedLot: production.seedLot
        ? this.transformSeedLot(production.seedLot)
        : undefined,
      multiplier: production.multiplier
        ? this.transformMultiplier(production.multiplier)
        : undefined,
      parcel: production.parcel
        ? this.transformParcel(production.parcel)
        : undefined,
      activities:
        production.activities?.map((activity: any) => ({
          ...activity,
          type: this.transformEnumDBToUI(
            activity.type,
            this.ACTIVITY_TYPE_DB_TO_UI
          ),
          activityDate:
            activity.activityDate?.toISOString?.() || activity.activityDate,
          user: activity.user ? this.transformUser(activity.user) : undefined,
          createdAt: activity.createdAt?.toISOString?.() || activity.createdAt,
          updatedAt: activity.updatedAt?.toISOString?.() || activity.updatedAt,
        })) || [],
      issues:
        production.issues?.map((issue: any) => ({
          ...issue,
          type: issue.type?.toLowerCase() || issue.type,
          severity: issue.severity?.toLowerCase() || issue.severity,
          issueDate: issue.issueDate?.toISOString?.() || issue.issueDate,
          resolvedDate:
            issue.resolvedDate?.toISOString?.() || issue.resolvedDate,
          createdAt: issue.createdAt?.toISOString?.() || issue.createdAt,
          updatedAt: issue.updatedAt?.toISOString?.() || issue.updatedAt,
        })) || [],
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

  static transformProductionForDB(production: any): any {
    if (!production) return null;

    const transformed = { ...production };
    if (production.status) {
      transformed.status = this.transformEnumUIToDB(
        production.status,
        this.PRODUCTION_STATUS_UI_TO_DB
      );
    }

    // Convertir les dates
    const dateFields = ["startDate", "endDate", "sowingDate", "harvestDate"];
    dateFields.forEach((field) => {
      if (production[field] && typeof production[field] === "string") {
        transformed[field] = new Date(production[field]);
      }
    });

    return transformed;
  }

  // ✅ CORRECTION 5: Transformation en masse
  static transformArray<T>(items: any[], transformFn: (item: any) => T): T[] {
    if (!Array.isArray(items)) return [];
    return items.map(transformFn).filter(Boolean);
  }

  static transformPaginatedResponse(
    response: any,
    transformFn: (item: any) => any
  ): any {
    if (!response) return null;

    return {
      ...response,
      data: this.transformArray(response.data || [], transformFn),
      meta: response.meta,
    };
  }

  // ✅ CORRECTION 6: Utilitaires de validation des transformations
  static validateTransformation(original: any, transformed: any): boolean {
    try {
      // Vérifications basiques
      if (!original && !transformed) return true;
      if (!original || !transformed) return false;

      // Vérifier que les champs critiques sont préservés
      const criticalFields = ["id", "name", "code"];
      for (const field of criticalFields) {
        if (original[field] && original[field] !== transformed[field]) {
          console.warn(
            `Transformation warning: ${field} changed from ${original[field]} to ${transformed[field]}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Transformation validation error:", error);
      return false;
    }
  }

  // ✅ CORRECTION 7: Méthodes de débogage
  static debugTransformation(
    original: any,
    transformed: any,
    entityType: string
  ): void {
    if (process.env.NODE_ENV === "development") {
      console.group(`🔄 Transformation Debug: ${entityType}`);
      console.log("Original:", original);
      console.log("Transformed:", transformed);
      console.log("Valid:", this.validateTransformation(original, transformed));
      console.groupEnd();
    }
  }

  // ✅ CORRECTION 8: Transformation des réponses API complètes
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
        response.data = this.transformArray(response.data, transformer);
      } else {
        response.data = transformer(response.data);
      }
    }

    return response;
  }
}
