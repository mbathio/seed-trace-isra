// backend/src/utils/transformers.ts - TRANSFORMATEURS CORRIGÉS SANS WHEAT
import {
  SeedLevel,
  LotStatus,
  Role,
  CropType,
  MultiplierStatus,
  CertificationLevel,
  ParcelStatus,
  ProductionStatus,
  TestResult,
} from "@prisma/client";

export class DataTransformer {
  // ===== MAPPINGS BIDIRECTIONNELS =====

  // Statuts de lots (DB <-> UI)
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

  // Rôles utilisateurs (DB <-> UI)
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

  // Types de culture SANS WHEAT (DB <-> UI)
  private static readonly CROP_TYPE_DB_TO_UI: Record<CropType, string> = {
    RICE: "rice",
    MAIZE: "maize",
    PEANUT: "peanut",
    SORGHUM: "sorghum",
    COWPEA: "cowpea",
    MILLET: "millet",
    WHEAT: "WHEAT",
  };

  private static readonly CROP_TYPE_UI_TO_DB: Record<string, CropType> = {
    rice: "RICE",
    maize: "MAIZE",
    peanut: "PEANUT",
    sorghum: "SORGHUM",
    cowpea: "COWPEA",
    millet: "MILLET",
    wheat: "WHEAT", // Note: Wheat is kept as uppercase to match DB values
  };

  // Statuts multiplicateurs (DB <-> UI)
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

  // Niveaux de certification (DB <-> UI)
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

  // Statuts parcelles (DB <-> UI)
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

  // Statuts production (DB <-> UI)
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

  // Résultats de test (DB <-> UI)
  private static readonly TEST_RESULT_DB_TO_UI: Record<TestResult, string> = {
    PASS: "pass",
    FAIL: "fail",
  };

  private static readonly TEST_RESULT_UI_TO_DB: Record<string, TestResult> = {
    pass: "PASS",
    fail: "FAIL",
  };

  // ===== MÉTHODES DE TRANSFORMATION =====

  // Transformation des statuts de lots
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

  // Méthode spéciale pour l'input status (compatibilité)
  static transformInputStatus(status: string): LotStatus {
    return this.transformLotStatusUIToDB(status);
  }

  // Transformation des rôles
  static transformRoleDBToUI(role: Role): string {
    return this.ROLE_DB_TO_UI[role] || role.toLowerCase();
  }

  static transformRoleUIToDB(role: string): Role {
    return this.ROLE_UI_TO_DB[role] || (role.toUpperCase() as Role);
  }

  // Transformation des types de culture
  static transformCropTypeDBToUI(cropType: CropType): string {
    return this.CROP_TYPE_DB_TO_UI[cropType] || cropType.toLowerCase();
  }

  static transformCropTypeUIToDB(cropType: string): CropType {
    // Gestion spéciale pour wheat qui sera mappé en SORGHUM temporairement

    return (
      this.CROP_TYPE_UI_TO_DB[cropType] || (cropType.toUpperCase() as CropType)
    );
  }

  // Transformation des statuts multiplicateurs
  static transformMultiplierStatusDBToUI(status: MultiplierStatus): string {
    return this.MULTIPLIER_STATUS_DB_TO_UI[status] || status.toLowerCase();
  }

  static transformMultiplierStatusUIToDB(status: string): MultiplierStatus {
    return (
      this.MULTIPLIER_STATUS_UI_TO_DB[status] ||
      (status.toUpperCase() as MultiplierStatus)
    );
  }

  // Transformation des niveaux de certification
  static transformCertificationLevelDBToUI(level: CertificationLevel): string {
    return this.CERTIFICATION_LEVEL_DB_TO_UI[level] || level.toLowerCase();
  }

  static transformCertificationLevelUIToDB(level: string): CertificationLevel {
    return (
      this.CERTIFICATION_LEVEL_UI_TO_DB[level] ||
      (level.toUpperCase() as CertificationLevel)
    );
  }

  // Transformation des statuts parcelles
  static transformParcelStatusDBToUI(status: ParcelStatus): string {
    return (
      this.PARCEL_STATUS_DB_TO_UI[status] ||
      status.toLowerCase().replace(/_/g, "-")
    );
  }

  static transformParcelStatusUIToDB(status: string): ParcelStatus {
    return (
      this.PARCEL_STATUS_UI_TO_DB[status] ||
      (status.toUpperCase().replace(/-/g, "_") as ParcelStatus)
    );
  }

  // Transformation des statuts production
  static transformProductionStatusDBToUI(status: ProductionStatus): string {
    return (
      this.PRODUCTION_STATUS_DB_TO_UI[status] ||
      status.toLowerCase().replace(/_/g, "-")
    );
  }

  static transformProductionStatusUIToDB(status: string): ProductionStatus {
    return (
      this.PRODUCTION_STATUS_UI_TO_DB[status] ||
      (status.toUpperCase().replace(/-/g, "_") as ProductionStatus)
    );
  }

  // Transformation des résultats de test
  static transformTestResultDBToUI(result: TestResult): string {
    return this.TEST_RESULT_DB_TO_UI[result] || result.toLowerCase();
  }

  static transformTestResultUIToDB(result: string): TestResult {
    return (
      this.TEST_RESULT_UI_TO_DB[result] || (result.toUpperCase() as TestResult)
    );
  }

  // ✅ MÉTHODE GÉNÉRIQUE pour transformer les enums
  static transformEnumUIToDB(
    value: string,
    mapping: Record<string, string>
  ): string {
    return mapping[value] || value.toUpperCase().replace(/-/g, "_");
  }

  // ===== TRANSFORMATION D'ENTITÉS COMPLÈTES =====

  // Transformation des lots de semences
  static transformSeedLot(lot: any): any {
    if (!lot) return null;

    return {
      ...lot,
      status: this.transformLotStatusDBToUI(lot.status),
      variety: lot.variety
        ? {
            ...lot.variety,
            cropType: this.transformCropTypeDBToUI(lot.variety.cropType),
            createdAt: this.formatDate(lot.variety.createdAt),
            updatedAt: this.formatDate(lot.variety.updatedAt),
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
      productionDate: this.formatDate(lot.productionDate),
      expiryDate: this.formatDate(lot.expiryDate),
      createdAt: this.formatDate(lot.createdAt),
      updatedAt: this.formatDate(lot.updatedAt),
    };
  }

  // Transformation des variétés
  static transformVariety(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      cropType: this.transformCropTypeDBToUI(variety.cropType),
      createdAt: this.formatDate(variety.createdAt),
      updatedAt: this.formatDate(variety.updatedAt),
    };
  }

  // Transformation des multiplicateurs
  static transformMultiplier(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: this.transformMultiplierStatusDBToUI(multiplier.status),
      certificationLevel: this.transformCertificationLevelDBToUI(
        multiplier.certificationLevel
      ),
      specialization:
        multiplier.specialization?.map((spec: CropType) =>
          this.transformCropTypeDBToUI(spec)
        ) || [],
      createdAt: this.formatDate(multiplier.createdAt),
      updatedAt: this.formatDate(multiplier.updatedAt),
    };
  }

  // Transformation des parcelles
  static transformParcel(parcel: any): any {
    if (!parcel) return null;

    return {
      ...parcel,
      status: this.transformParcelStatusDBToUI(parcel.status),
      multiplier: parcel.multiplier
        ? this.transformMultiplier(parcel.multiplier)
        : undefined,
      soilAnalyses:
        parcel.soilAnalyses?.map((analysis: any) => ({
          ...analysis,
          analysisDate: this.formatDate(analysis.analysisDate),
          createdAt: this.formatDate(analysis.createdAt),
          updatedAt: this.formatDate(analysis.updatedAt),
        })) || [],
      createdAt: this.formatDate(parcel.createdAt),
      updatedAt: this.formatDate(parcel.updatedAt),
    };
  }

  // Transformation des contrôles qualité
  static transformQualityControl(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      result: this.transformTestResultDBToUI(qc.result),
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : undefined,
      inspector: qc.inspector ? this.transformUser(qc.inspector) : undefined,
      controlDate: this.formatDate(qc.controlDate),
      createdAt: this.formatDate(qc.createdAt),
      updatedAt: this.formatDate(qc.updatedAt),
    };
  }

  // Transformation des productions
  static transformProduction(production: any): any {
    if (!production) return null;

    return {
      ...production,
      status: this.transformProductionStatusDBToUI(production.status),
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
          type:
            activity.type?.toLowerCase?.().replace(/_/g, "-") || activity.type,
          activityDate: this.formatDate(activity.activityDate),
          createdAt: this.formatDate(activity.createdAt),
          updatedAt: this.formatDate(activity.updatedAt),
        })) || [],
      issues:
        production.issues?.map((issue: any) => ({
          ...issue,
          type: issue.type?.toLowerCase?.() || issue.type,
          severity: issue.severity?.toLowerCase?.() || issue.severity,
          issueDate: this.formatDate(issue.issueDate),
          resolvedDate: this.formatDate(issue.resolvedDate),
          createdAt: this.formatDate(issue.createdAt),
          updatedAt: this.formatDate(issue.updatedAt),
        })) || [],
      startDate: this.formatDate(production.startDate),
      endDate: this.formatDate(production.endDate),
      sowingDate: this.formatDate(production.sowingDate),
      harvestDate: this.formatDate(production.harvestDate),
      createdAt: this.formatDate(production.createdAt),
      updatedAt: this.formatDate(production.updatedAt),
    };
  }

  // Transformation des utilisateurs
  static transformUser(user: any): any {
    if (!user) return null;

    return {
      ...user,
      role: this.transformRoleDBToUI(user.role),
      createdAt: this.formatDate(user.createdAt),
      updatedAt: this.formatDate(user.updatedAt),
    };
  }

  // ===== MÉTHODES UTILITAIRES =====

  // Formatage des dates
  private static formatDate(date: any): string | null {
    if (!date) return null;
    try {
      if (typeof date === "string") return date;
      return date.toISOString
        ? date.toISOString()
        : new Date(date).toISOString();
    } catch {
      return null;
    }
  }

  // Transformation des réponses API complètes
  static transformApiResponse(response: any, entityType: string): any {
    if (!response) return null;

    const transformers: Record<string, (item: any) => any> = {
      user: this.transformUser.bind(this),
      seedlot: this.transformSeedLot.bind(this),
      seedLot: this.transformSeedLot.bind(this),
      variety: this.transformVariety.bind(this),
      multiplier: this.transformMultiplier.bind(this),
      parcel: this.transformParcel.bind(this),
      qualitycontrol: this.transformQualityControl.bind(this),
      qualityControl: this.transformQualityControl.bind(this),
      production: this.transformProduction.bind(this),
    };

    const transformer = transformers[entityType.toLowerCase()];
    if (!transformer) {
      console.warn(`No transformer found for entity type: ${entityType}`);
      return response;
    }

    // Transformation des données
    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformer).filter(Boolean);
      } else {
        response.data = transformer(response.data);
      }
    }

    // Transformation des résultats paginés
    if (response.lots && Array.isArray(response.lots)) {
      response.lots = response.lots
        .map(this.transformSeedLot.bind(this))
        .filter(Boolean);
    }

    if (response.varieties && Array.isArray(response.varieties)) {
      response.varieties = response.varieties
        .map(this.transformVariety.bind(this))
        .filter(Boolean);
    }

    if (response.multipliers && Array.isArray(response.multipliers)) {
      response.multipliers = response.multipliers
        .map(this.transformMultiplier.bind(this))
        .filter(Boolean);
    }

    if (response.parcels && Array.isArray(response.parcels)) {
      response.parcels = response.parcels
        .map(this.transformParcel.bind(this))
        .filter(Boolean);
    }

    if (response.controls && Array.isArray(response.controls)) {
      response.controls = response.controls
        .map(this.transformQualityControl.bind(this))
        .filter(Boolean);
    }

    if (response.productions && Array.isArray(response.productions)) {
      response.productions = response.productions
        .map(this.transformProduction.bind(this))
        .filter(Boolean);
    }

    if (response.users && Array.isArray(response.users)) {
      response.users = response.users
        .map(this.transformUser.bind(this))
        .filter(Boolean);
    }

    return response;
  }

  // Validation des transformations
  static validateTransformation(original: any, transformed: any): boolean {
    try {
      if (!original && !transformed) return true;
      if (!original || !transformed) return false;

      // Vérifier les champs critiques
      const criticalFields = ["id", "name", "code"];
      for (const field of criticalFields) {
        if (
          original[field] !== undefined &&
          original[field] !== transformed[field]
        ) {
          console.warn(
            `Transformation warning: ${field} changed from ${original[field]} to ${transformed[field]}`
          );
        }
      }
      return true;
    } catch (error) {
      console.error("Validation transformation error:", error);
      return false;
    }
  }

  // Nettoyage des données
  static sanitizeData(data: any): any {
    if (!data || typeof data !== "object") return data;

    const sanitized = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        continue; // Supprimer les valeurs null/undefined
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          (sanitized as any)[key] = trimmed;
        }
      } else if (typeof value === "object") {
        const sanitizedValue = this.sanitizeData(value);
        if (sanitizedValue !== null && Object.keys(sanitizedValue).length > 0) {
          (sanitized as any)[key] = sanitizedValue;
        }
      } else {
        (sanitized as any)[key] = value;
      }
    }

    return sanitized;
  }
}
