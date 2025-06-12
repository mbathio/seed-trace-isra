// frontend/src/utils/transformers.ts - ✅ TRANSFORMATEURS SYNCHRONISÉS AVEC LE BACKEND

import { UI_TO_DB_MAPPINGS, DB_TO_UI_MAPPINGS } from "../constants/index";

// ===== TYPES DE TRANSFORMATION =====
export type TransformDirection = "uiToDb" | "dbToUi";
export type EntityType =
  | "seedLot"
  | "variety"
  | "multiplier"
  | "qualityControl"
  | "production"
  | "parcel"
  | "user"
  | "contract";

// ===== CLASSE PRINCIPALE DE TRANSFORMATION =====
export class DataTransformer {
  // ===== MÉTHODES DE TRANSFORMATION GÉNÉRIQUES =====

  /**
   * Transforme une valeur enum selon la direction spécifiée
   */
  private static transformEnum(
    value: string | undefined | null,
    mapping: Record<string, string>
  ): string | undefined {
    if (!value || typeof value !== "string") return undefined;
    return mapping[value] || value;
  }

  /**
   * Transforme un statut de lot (UI ↔ DB)
   */
  static transformLotStatus(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.lotStatus
        : DB_TO_UI_MAPPINGS.lotStatus;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un rôle utilisateur (UI ↔ DB)
   */
  static transformRole(value: string, direction: TransformDirection): string {
    const mapping =
      direction === "uiToDb" ? UI_TO_DB_MAPPINGS.role : DB_TO_UI_MAPPINGS.role;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un type de culture (UI ↔ DB)
   */
  static transformCropType(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.cropType
        : DB_TO_UI_MAPPINGS.cropType;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un statut de multiplicateur (UI ↔ DB)
   */
  static transformMultiplierStatus(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.multiplierStatus
        : DB_TO_UI_MAPPINGS.multiplierStatus;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un niveau de certification (UI ↔ DB)
   */
  static transformCertificationLevel(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.certificationLevel
        : DB_TO_UI_MAPPINGS.certificationLevel;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un statut de parcelle (UI ↔ DB)
   */
  static transformParcelStatus(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.parcelStatus
        : DB_TO_UI_MAPPINGS.parcelStatus;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un statut de production (UI ↔ DB)
   */
  static transformProductionStatus(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.productionStatus
        : DB_TO_UI_MAPPINGS.productionStatus;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un statut de contrat (UI ↔ DB)
   */
  static transformContractStatus(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.contractStatus
        : DB_TO_UI_MAPPINGS.contractStatus;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un type d'activité (UI ↔ DB)
   */
  static transformActivityType(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.activityType
        : DB_TO_UI_MAPPINGS.activityType;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un type de problème (UI ↔ DB)
   */
  static transformIssueType(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.issueType
        : DB_TO_UI_MAPPINGS.issueType;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un niveau de sévérité (UI ↔ DB)
   */
  static transformIssueSeverity(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.issueSeverity
        : DB_TO_UI_MAPPINGS.issueSeverity;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un résultat de test (UI ↔ DB)
   */
  static transformTestResult(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.testResult
        : DB_TO_UI_MAPPINGS.testResult;

    return this.transformEnum(value, mapping) || value;
  }

  /**
   * Transforme un type de rapport (UI ↔ DB)
   */
  static transformReportType(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.reportType
        : DB_TO_UI_MAPPINGS.reportType;

    return this.transformEnum(value, mapping) || value;
  }

  // ===== MÉTHODES DE FORMATAGE DE DATE =====

  /**
   * Formate une date pour l'affichage (ISO string → date locale)
   */
  private static formatDateForDisplay(
    date: string | Date | null | undefined
  ): string | undefined {
    if (!date) return undefined;

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) return undefined;

      // Retourner au format YYYY-MM-DD pour les inputs
      return dateObj.toISOString().split("T")[0];
    } catch {
      return undefined;
    }
  }

  /**
   * Formate une date pour l'API (date locale → ISO string)
   */
  private static formatDateForAPI(
    date: string | Date | null | undefined
  ): string | undefined {
    if (!date) return undefined;

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) return undefined;

      return dateObj.toISOString();
    } catch {
      return undefined;
    }
  }

  // ===== TRANSFORMATIONS D'ENTITÉS COMPLÈTES =====

  /**
   * Transforme un lot de semences depuis le backend vers l'UI
   */
  static transformSeedLotFromAPI(lot: any): any {
    if (!lot) return null;

    return {
      ...lot,
      status: this.transformLotStatus(lot.status, "dbToUi"),
      productionDate: this.formatDateForDisplay(lot.productionDate),
      expiryDate: this.formatDateForDisplay(lot.expiryDate),
      createdAt: this.formatDateForDisplay(lot.createdAt),
      updatedAt: this.formatDateForDisplay(lot.updatedAt),

      // Transformer les relations
      variety: lot.variety
        ? this.transformVarietyFromAPI(lot.variety)
        : undefined,
      multiplier: lot.multiplier
        ? this.transformMultiplierFromAPI(lot.multiplier)
        : undefined,
      parcel: lot.parcel ? this.transformParcelFromAPI(lot.parcel) : undefined,
      parentLot: lot.parentLot
        ? this.transformSeedLotFromAPI(lot.parentLot)
        : undefined,

      // Transformer les collections
      childLots:
        lot.childLots?.map((child: any) =>
          this.transformSeedLotFromAPI(child)
        ) || [],
      qualityControls:
        lot.qualityControls?.map((qc: any) =>
          this.transformQualityControlFromAPI(qc)
        ) || [],
      productions:
        lot.productions?.map((p: any) => this.transformProductionFromAPI(p)) ||
        [],
    };
  }

  /**
   * Transforme un lot de semences depuis l'UI vers l'API
   */
  static transformSeedLotForAPI(lot: any): any {
    if (!lot) return null;

    const transformed = {
      ...lot,
      status: lot.status
        ? this.transformLotStatus(lot.status, "uiToDb")
        : undefined,
      productionDate: this.formatDateForAPI(lot.productionDate),
      expiryDate: this.formatDateForAPI(lot.expiryDate),
    };

    // Nettoyer les champs undefined
    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme une variété depuis le backend vers l'UI
   */
  static transformVarietyFromAPI(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      cropType: this.transformCropType(variety.cropType, "dbToUi"),
      createdAt: this.formatDateForDisplay(variety.createdAt),
      updatedAt: this.formatDateForDisplay(variety.updatedAt),

      // Transformer les relations
      seedLots:
        variety.seedLots?.map((lot: any) =>
          this.transformSeedLotFromAPI(lot)
        ) || [],
    };
  }

  /**
   * Transforme une variété depuis l'UI vers l'API
   */
  static transformVarietyForAPI(variety: any): any {
    if (!variety) return null;

    const transformed = {
      ...variety,
      cropType: variety.cropType
        ? this.transformCropType(variety.cropType, "uiToDb")
        : undefined,
    };

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme un multiplicateur depuis le backend vers l'UI
   */
  static transformMultiplierFromAPI(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: this.transformMultiplierStatus(multiplier.status, "dbToUi"),
      certificationLevel: this.transformCertificationLevel(
        multiplier.certificationLevel,
        "dbToUi"
      ),
      specialization:
        multiplier.specialization?.map((spec: string) =>
          this.transformCropType(spec, "dbToUi")
        ) || [],
      createdAt: this.formatDateForDisplay(multiplier.createdAt),
      updatedAt: this.formatDateForDisplay(multiplier.updatedAt),

      // Transformer les relations
      contracts:
        multiplier.contracts?.map((contract: any) =>
          this.transformContractFromAPI(contract)
        ) || [],
      seedLots:
        multiplier.seedLots?.map((lot: any) =>
          this.transformSeedLotFromAPI(lot)
        ) || [],
      productions:
        multiplier.productions?.map((prod: any) =>
          this.transformProductionFromAPI(prod)
        ) || [],
      parcels:
        multiplier.parcels?.map((parcel: any) =>
          this.transformParcelFromAPI(parcel)
        ) || [],
    };
  }

  /**
   * Transforme un multiplicateur depuis l'UI vers l'API
   */
  static transformMultiplierForAPI(multiplier: any): any {
    if (!multiplier) return null;

    const transformed = {
      ...multiplier,
      status: multiplier.status
        ? this.transformMultiplierStatus(multiplier.status, "uiToDb")
        : undefined,
      certificationLevel: multiplier.certificationLevel
        ? this.transformCertificationLevel(
            multiplier.certificationLevel,
            "uiToDb"
          )
        : undefined,
      specialization: multiplier.specialization?.map((spec: string) =>
        this.transformCropType(spec, "uiToDb")
      ),
    };

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme un contrôle qualité depuis le backend vers l'UI
   */
  static transformQualityControlFromAPI(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      result: this.transformTestResult(qc.result, "dbToUi"),
      controlDate: this.formatDateForDisplay(qc.controlDate),
      createdAt: this.formatDateForDisplay(qc.createdAt),
      updatedAt: this.formatDateForDisplay(qc.updatedAt),

      // Transformer les relations
      seedLot: qc.seedLot
        ? this.transformSeedLotFromAPI(qc.seedLot)
        : undefined,
      inspector: qc.inspector
        ? this.transformUserFromAPI(qc.inspector)
        : undefined,
    };
  }

  /**
   * Transforme un contrôle qualité depuis l'UI vers l'API
   */
  static transformQualityControlForAPI(qc: any): any {
    if (!qc) return null;

    const transformed = {
      ...qc,
      result: qc.result
        ? this.transformTestResult(qc.result, "uiToDb")
        : undefined,
      controlDate: this.formatDateForAPI(qc.controlDate),
    };

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme une production depuis le backend vers l'UI
   */
  static transformProductionFromAPI(production: any): any {
    if (!production) return null;

    return {
      ...production,
      status: this.transformProductionStatus(production.status, "dbToUi"),
      startDate: this.formatDateForDisplay(production.startDate),
      endDate: this.formatDateForDisplay(production.endDate),
      sowingDate: this.formatDateForDisplay(production.sowingDate),
      harvestDate: this.formatDateForDisplay(production.harvestDate),
      createdAt: this.formatDateForDisplay(production.createdAt),
      updatedAt: this.formatDateForDisplay(production.updatedAt),

      // Transformer les relations
      seedLot: production.seedLot
        ? this.transformSeedLotFromAPI(production.seedLot)
        : undefined,
      multiplier: production.multiplier
        ? this.transformMultiplierFromAPI(production.multiplier)
        : undefined,
      parcel: production.parcel
        ? this.transformParcelFromAPI(production.parcel)
        : undefined,

      // Transformer les collections
      activities:
        production.activities?.map((activity: any) => ({
          ...activity,
          type: this.transformActivityType(activity.type, "dbToUi"),
          activityDate: this.formatDateForDisplay(activity.activityDate),
          createdAt: this.formatDateForDisplay(activity.createdAt),
          updatedAt: this.formatDateForDisplay(activity.updatedAt),
        })) || [],

      issues:
        production.issues?.map((issue: any) => ({
          ...issue,
          type: this.transformIssueType(issue.type, "dbToUi"),
          severity: this.transformIssueSeverity(issue.severity, "dbToUi"),
          issueDate: this.formatDateForDisplay(issue.issueDate),
          resolvedDate: this.formatDateForDisplay(issue.resolvedDate),
          createdAt: this.formatDateForDisplay(issue.createdAt),
          updatedAt: this.formatDateForDisplay(issue.updatedAt),
        })) || [],

      weatherData:
        production.weatherData?.map((weather: any) => ({
          ...weather,
          recordDate: this.formatDateForDisplay(weather.recordDate),
          createdAt: this.formatDateForDisplay(weather.createdAt),
          updatedAt: this.formatDateForDisplay(weather.updatedAt),
        })) || [],
    };
  }

  /**
   * Transforme une production depuis l'UI vers l'API
   */
  static transformProductionForAPI(production: any): any {
    if (!production) return null;

    const transformed = {
      ...production,
      status: production.status
        ? this.transformProductionStatus(production.status, "uiToDb")
        : undefined,
      startDate: this.formatDateForAPI(production.startDate),
      endDate: this.formatDateForAPI(production.endDate),
      sowingDate: this.formatDateForAPI(production.sowingDate),
      harvestDate: this.formatDateForAPI(production.harvestDate),
    };

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme une parcelle depuis le backend vers l'UI
   */
  static transformParcelFromAPI(parcel: any): any {
    if (!parcel) return null;

    return {
      ...parcel,
      status: this.transformParcelStatus(parcel.status, "dbToUi"),
      createdAt: this.formatDateForDisplay(parcel.createdAt),
      updatedAt: this.formatDateForDisplay(parcel.updatedAt),

      // Transformer les relations
      multiplier: parcel.multiplier
        ? this.transformMultiplierFromAPI(parcel.multiplier)
        : undefined,

      // Transformer les collections
      soilAnalyses:
        parcel.soilAnalyses?.map((analysis: any) => ({
          ...analysis,
          analysisDate: this.formatDateForDisplay(analysis.analysisDate),
          createdAt: this.formatDateForDisplay(analysis.createdAt),
          updatedAt: this.formatDateForDisplay(analysis.updatedAt),
        })) || [],

      seedLots:
        parcel.seedLots?.map((lot: any) => this.transformSeedLotFromAPI(lot)) ||
        [],
      productions:
        parcel.productions?.map((prod: any) =>
          this.transformProductionFromAPI(prod)
        ) || [],
    };
  }

  /**
   * Transforme une parcelle depuis l'UI vers l'API
   */
  static transformParcelForAPI(parcel: any): any {
    if (!parcel) return null;

    const transformed = {
      ...parcel,
      status: parcel.status
        ? this.transformParcelStatus(parcel.status, "uiToDb")
        : undefined,
    };

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme un utilisateur depuis le backend vers l'UI
   */
  static transformUserFromAPI(user: any): any {
    if (!user) return null;

    return {
      ...user,
      role: this.transformRole(user.role, "dbToUi"),
      createdAt: this.formatDateForDisplay(user.createdAt),
      updatedAt: this.formatDateForDisplay(user.updatedAt),
    };
  }

  /**
   * Transforme un utilisateur depuis l'UI vers l'API
   */
  static transformUserForAPI(user: any): any {
    if (!user) return null;

    const transformed = {
      ...user,
      role: user.role ? this.transformRole(user.role, "uiToDb") : undefined,
    };

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme un contrat depuis le backend vers l'UI
   */
  static transformContractFromAPI(contract: any): any {
    if (!contract) return null;

    return {
      ...contract,
      status: this.transformContractStatus(contract.status, "dbToUi"),
      startDate: this.formatDateForDisplay(contract.startDate),
      endDate: this.formatDateForDisplay(contract.endDate),
      createdAt: this.formatDateForDisplay(contract.createdAt),
      updatedAt: this.formatDateForDisplay(contract.updatedAt),

      // Transformer les relations
      variety: contract.variety
        ? this.transformVarietyFromAPI(contract.variety)
        : undefined,
      multiplier: contract.multiplier
        ? this.transformMultiplierFromAPI(contract.multiplier)
        : undefined,
    };
  }

  /**
   * Transforme un contrat depuis l'UI vers l'API
   */
  static transformContractForAPI(contract: any): any {
    if (!contract) return null;

    const transformed = {
      ...contract,
      status: contract.status
        ? this.transformContractStatus(contract.status, "uiToDb")
        : undefined,
      startDate: this.formatDateForAPI(contract.startDate),
      endDate: this.formatDateForAPI(contract.endDate),
    };

    return this.cleanUndefinedFields(transformed);
  }

  // ===== TRANSFORMATIONS DE COLLECTIONS =====

  /**
   * Transforme une liste d'entités depuis le backend vers l'UI
   */
  static transformCollectionFromAPI<T>(
    collection: T[],
    entityType: EntityType
  ): T[] {
    if (!Array.isArray(collection)) return [];

    const transformFn = this.getTransformFromAPIFunction(entityType);
    return collection.map(transformFn).filter(Boolean);
  }

  /**
   * Transforme une liste d'entités depuis l'UI vers l'API
   */
  static transformCollectionForAPI<T>(
    collection: T[],
    entityType: EntityType
  ): T[] {
    if (!Array.isArray(collection)) return [];

    const transformFn = this.getTransformForAPIFunction(entityType);
    return collection.map(transformFn).filter(Boolean);
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Obtient la fonction de transformation appropriée (API → UI)
   */
  static getTransformFromAPIFunction(entityType: EntityType) {
    const transformMap = {
      seedLot: this.transformSeedLotFromAPI.bind(this),
      variety: this.transformVarietyFromAPI.bind(this),
      multiplier: this.transformMultiplierFromAPI.bind(this),
      qualityControl: this.transformQualityControlFromAPI.bind(this),
      production: this.transformProductionFromAPI.bind(this),
      parcel: this.transformParcelFromAPI.bind(this),
      user: this.transformUserFromAPI.bind(this),
      contract: this.transformContractFromAPI.bind(this),
    };

    return transformMap[entityType] || ((x: any) => x);
  }

  /**
   * Obtient la fonction de transformation appropriée (UI → API)
   */
  static getTransformForAPIFunction(entityType: EntityType) {
    const transformMap = {
      seedLot: this.transformSeedLotForAPI.bind(this),
      variety: this.transformVarietyForAPI.bind(this),
      multiplier: this.transformMultiplierForAPI.bind(this),
      qualityControl: this.transformQualityControlForAPI.bind(this),
      production: this.transformProductionForAPI.bind(this),
      parcel: this.transformParcelForAPI.bind(this),
      user: this.transformUserForAPI.bind(this),
      contract: this.transformContractForAPI.bind(this),
    };

    return transformMap[entityType] || ((x: any) => x);
  }

  /**
   * Nettoie les champs undefined d'un objet
   */
  private static cleanUndefinedFields(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  /**
   * Valide qu'une transformation n'a pas corrompu les données critiques
   */
  static validateTransformation(original: any, transformed: any): boolean {
    try {
      if (!original && !transformed) return true;
      if (!original || !transformed) return false;

      // Vérifier les champs critiques
      const criticalFields = ["id", "name", "code", "email"];
      for (const field of criticalFields) {
        if (
          original[field] !== undefined &&
          original[field] !== transformed[field]
        ) {
          console.warn(
            `Transformation warning: ${field} changed from ${original[field]} to ${transformed[field]}`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Validation transformation error:", error);
      return false;
    }
  }

  /**
   * Log de débogage pour les transformations
   */
  static debugTransformation(
    original: any,
    transformed: any,
    operation: string
  ): void {
    if (import.meta.env.DEV) {
      console.group(`🔄 Transformation: ${operation}`);
      console.log("Original:", original);
      console.log("Transformed:", transformed);
      console.log("Valid:", this.validateTransformation(original, transformed));
      console.groupEnd();
    }
  }
}

// ===== FONCTIONS UTILITAIRES EXPORTÉES =====

/**
 * Transforme automatiquement les données selon le contexte
 */
export const transformData = (
  data: any,
  entityType: EntityType,
  direction: TransformDirection
): any => {
  if (!data) return data;

  if (direction === "dbToUi") {
    return DataTransformer.transformCollectionFromAPI(
      Array.isArray(data) ? data : [data],
      entityType
    );
  } else {
    return DataTransformer.transformCollectionForAPI(
      Array.isArray(data) ? data : [data],
      entityType
    );
  }
};

/**
 * Hook de transformation pour les requêtes React Query
 */
export const createTransformQueryFn = (entityType: EntityType) => {
  return (data: any) => {
    if (!data) return data;

    // Si c'est une réponse API avec structure { data, meta }
    if (data.data !== undefined) {
      return {
        ...data,
        data: Array.isArray(data.data)
          ? DataTransformer.transformCollectionFromAPI(data.data, entityType)
          : DataTransformer.getTransformFromAPIFunction(entityType)(data.data),
      };
    }

    // Sinon transformer directement
    return Array.isArray(data)
      ? DataTransformer.transformCollectionFromAPI(data, entityType)
      : DataTransformer.getTransformFromAPIFunction(entityType)(data);
  };
};

// Export par défaut
export default DataTransformer;
