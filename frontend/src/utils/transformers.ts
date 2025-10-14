// frontend/src/utils/transformers.ts - VERSION CORRIGÉE ET COMPLÈTE

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
   * Transforme un niveau de semence (UI ↔ DB)
   */
  static transformSeedLevel(
    value: string,
    direction: TransformDirection
  ): string {
    if (!value) return value;

    if (direction === "uiToDb") {
      return value.toUpperCase();
    } else {
      return value.toLowerCase();
    }
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
   * Transforme une catégorie de variété (UI ↔ DB)
   */
  static transformVarietyCategory(
    value: string,
    direction: TransformDirection
  ): string {
    const mapping =
      direction === "uiToDb"
        ? UI_TO_DB_MAPPINGS.varietyCategory
        : DB_TO_UI_MAPPINGS.varietyCategory;

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
   * CORRIGÉ: Gestion correcte des valeurs déjà transformées par le middleware
   */
  // Mise à jour de transformSeedLotFromAPI
  static transformSeedLotFromAPI(lot: any): any {
    if (!lot) return null;

    // Le middleware backend a déjà transformé les valeurs DB -> UI
    // On ne transforme que les dates pour l'affichage
    return {
      ...lot,
      // Formater les dates pour l'affichage si nécessaires
      productionDate: DataTransformer.formatDateForDisplay(lot.productionDate),
      expiryDate: DataTransformer.formatDateForDisplay(lot.expiryDate),

      // Garder les dates complètes pour l'affichage détaillé
      createdAt: lot.createdAt,
      updatedAt: lot.updatedAt,
      // Les relations sont déjà transformées par le middleware
      variety: lot.variety,
      multiplier: lot.multiplier,
      parcel: lot.parcel,
      parentLot: lot.parentLot,
      childLots: lot.childLots,
      qualityControls: lot.qualityControls,
      productions: lot.productions,
      officialCertificate: lot.officialCertificate ?? null,
      officialCertificateUrl:
        lot.officialCertificateUrl ?? lot.officialCertificate?.url ?? null,
      // Ajouter la quantité disponible si elle n'est pas fournie
      availableQuantity: lot.availableQuantity ?? lot.quantity,
    };
  }

  // Mise à jour de transformSeedLotForAPI
  static transformSeedLotForAPI(lot: any): any {
    if (!lot) return null;

    // Nettoyer l'objet des champs undefined et préparer pour l'API
    const cleaned: any = {};

    // Copier seulement les champs qui doivent être envoyés
    if (lot.varietyId !== undefined) cleaned.varietyId = lot.varietyId;
    if (lot.level !== undefined) cleaned.level = lot.level.toUpperCase();
    if (lot.quantity !== undefined) cleaned.quantity = lot.quantity;
    if (lot.productionDate !== undefined)
      cleaned.productionDate = lot.productionDate;
    if (lot.expiryDate) cleaned.expiryDate = lot.expiryDate;
    if (lot.status) cleaned.status = lot.status;
    if (lot.batchNumber) cleaned.batchNumber = lot.batchNumber;
    if (lot.multiplierId) cleaned.multiplierId = lot.multiplierId;
    if (lot.parcelId) cleaned.parcelId = lot.parcelId;
    if (lot.parentLotId) cleaned.parentLotId = lot.parentLotId;
    if (lot.notes) cleaned.notes = lot.notes;

    return cleaned;
  }

  /**
   * Transforme une variété depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformVarietyFromAPI(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      // Les relations sont déjà transformées
      seedLots: variety.seedLots,
      contracts: variety.contracts,
    };
  }

  /**
   * Transforme une variété pour l'API
   */
  static transformVarietyForAPI(variety: any): any {
    if (!variety) return null;

    const cleaned = this.cleanUndefinedFields({
      ...variety,
      // Les valeurs sont déjà en format UI
    });

    // Retirer les relations
    delete cleaned.seedLots;
    delete cleaned.contracts;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  /**
   * Transforme un multiplicateur depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformMultiplierFromAPI(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      // Les dates restent à formater
      createdAt: this.formatDateForDisplay(multiplier.createdAt),
      updatedAt: this.formatDateForDisplay(multiplier.updatedAt),

      // Les relations sont déjà transformées
      contracts: multiplier.contracts,
      productions: multiplier.productions,
      parcels: multiplier.parcels,
      seedLots: multiplier.seedLots,
    };
  }

  /**
   * Transforme un multiplicateur pour l'API
   */
  static transformMultiplierForAPI(multiplier: any): any {
    if (!multiplier) return null;

    const cleaned = this.cleanUndefinedFields({
      ...multiplier,
      // Les valeurs sont déjà en format UI
    });

    // Retirer les relations et dates
    delete cleaned.contracts;
    delete cleaned.productions;
    delete cleaned.parcels;
    delete cleaned.seedLots;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  /**
   * Transforme un contrôle qualité depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformQualityControlFromAPI(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      controlDate: this.formatDateForDisplay(qc.controlDate),
      createdAt: this.formatDateForDisplay(qc.createdAt),
      updatedAt: this.formatDateForDisplay(qc.updatedAt),

      // Les relations sont déjà transformées
      seedLot: qc.seedLot,
      inspector: qc.inspector,
    };
  }

  /**
   * Transforme un contrôle qualité pour l'API
   */
  static transformQualityControlForAPI(qc: any): any {
    if (!qc) return null;

    const cleaned = this.cleanUndefinedFields({
      ...qc,
      controlDate: this.formatDateForAPI(qc.controlDate),
    });

    // Retirer les relations
    delete cleaned.seedLot;
    delete cleaned.inspector;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  /**
   * Transforme une production depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformProductionFromAPI(production: any): any {
    if (!production) return null;

    return {
      ...production,
      startDate: this.formatDateForDisplay(production.startDate),
      endDate: this.formatDateForDisplay(production.endDate),
      createdAt: this.formatDateForDisplay(production.createdAt),
      updatedAt: this.formatDateForDisplay(production.updatedAt),

      // Les relations et activités sont déjà transformées
      seedLot: production.seedLot,
      multiplier: production.multiplier,
      parcel: production.parcel,
      activities: production.activities?.map((activity: any) => ({
        ...activity,
        activityDate: this.formatDateForDisplay(activity.activityDate),
      })),
      issues: production.issues?.map((issue: any) => ({
        ...issue,
        issueDate: this.formatDateForDisplay(issue.issueDate),
        resolvedDate: this.formatDateForDisplay(issue.resolvedDate),
      })),
    };
  }

  /**
   * Transforme une production pour l'API
   */
  static transformProductionForAPI(production: any): any {
    if (!production) return null;

    const cleaned = this.cleanUndefinedFields({
      ...production,
      startDate: this.formatDateForAPI(production.startDate),
      endDate: this.formatDateForAPI(production.endDate),
    });

    // Retirer les relations et listes
    delete cleaned.seedLot;
    delete cleaned.multiplier;
    delete cleaned.parcel;
    delete cleaned.activities;
    delete cleaned.issues;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  /**
   * Transforme une parcelle depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformParcelFromAPI(parcel: any): any {
    if (!parcel) return null;

    return {
      ...parcel,
      createdAt: this.formatDateForDisplay(parcel.createdAt),
      updatedAt: this.formatDateForDisplay(parcel.updatedAt),

      // Les relations sont déjà transformées
      multiplier: parcel.multiplier,
      seedLots: parcel.seedLots,
      productions: parcel.productions,
      soilAnalyses: parcel.soilAnalyses?.map((analysis: any) => ({
        ...analysis,
        analysisDate: this.formatDateForDisplay(analysis.analysisDate),
      })),
    };
  }

  /**
   * Transforme une parcelle pour l'API
   */
  static transformParcelForAPI(parcel: any): any {
    if (!parcel) return null;

    const cleaned = this.cleanUndefinedFields({
      ...parcel,
      // Les valeurs sont déjà en format UI
    });

    // Retirer les relations
    delete cleaned.multiplier;
    delete cleaned.seedLots;
    delete cleaned.productions;
    delete cleaned.soilAnalyses;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  /**
   * Transforme un utilisateur depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformUserFromAPI(user: any): any {
    if (!user) return null;

    return {
      ...user,
      createdAt: this.formatDateForDisplay(user.createdAt),
      updatedAt: this.formatDateForDisplay(user.updatedAt),
    };
  }

  /**
   * Transforme un utilisateur pour l'API
   */
  static transformUserForAPI(user: any): any {
    if (!user) return null;

    const cleaned = this.cleanUndefinedFields({
      ...user,
      // Les valeurs sont déjà en format UI
    });

    // Retirer les dates et le mot de passe si présent
    delete cleaned.password;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  /**
   * Transforme un contrat depuis le backend vers l'UI
   * CORRIGÉ: Les valeurs sont déjà transformées par le middleware
   */
  static transformContractFromAPI(contract: any): any {
    if (!contract) return null;

    return {
      ...contract,
      startDate: this.formatDateForDisplay(contract.startDate),
      endDate: this.formatDateForDisplay(contract.endDate),
      signedDate: this.formatDateForDisplay(contract.signedDate),
      createdAt: this.formatDateForDisplay(contract.createdAt),
      updatedAt: this.formatDateForDisplay(contract.updatedAt),

      // Les relations sont déjà transformées
      multiplier: contract.multiplier,
      variety: contract.variety,
      parcel: contract.parcel,
      seedLots: contract.seedLots,
    };
  }

  /**
   * Transforme un contrat pour l'API
   */
  static transformContractForAPI(contract: any): any {
    if (!contract) return null;

    const cleaned = this.cleanUndefinedFields({
      ...contract,
      startDate: this.formatDateForAPI(contract.startDate),
      endDate: this.formatDateForAPI(contract.endDate),
      signedDate: this.formatDateForAPI(contract.signedDate),
    });

    // Retirer les relations
    delete cleaned.multiplier;
    delete cleaned.variety;
    delete cleaned.parcel;
    delete cleaned.seedLots;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    return cleaned;
  }

  // ===== MÉTHODES DE TRANSFORMATION DE COLLECTIONS =====

  /**
   * Transforme une collection d'entités depuis l'API
   */
  static transformCollectionFromAPI(
    collection: any[],
    entityType: EntityType
  ): any[] {
    if (!Array.isArray(collection)) return [];

    const transformFunction = this.getTransformFromAPIFunction(entityType);
    return collection.map(transformFunction);
  }

  /**
   * Transforme une collection d'entités pour l'API
   */
  static transformCollectionForAPI(
    collection: any[],
    entityType: EntityType
  ): any[] {
    if (!Array.isArray(collection)) return [];

    const transformFunction = this.getTransformForAPIFunction(entityType);
    return collection.map(transformFunction);
  }

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
 * CORRIGÉ: Gestion correcte de la transformation avec le middleware backend
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
    )[0];
  } else {
    return DataTransformer.transformCollectionForAPI(
      Array.isArray(data) ? data : [data],
      entityType
    )[0];
  }
};

/**
 * Vérifie si une valeur est valide selon son type
 */
export const isValidEnumValue = (
  value: string,
  enumType: keyof typeof UI_TO_DB_MAPPINGS
): boolean => {
  return value in UI_TO_DB_MAPPINGS[enumType];
};

// ===== EXPORT PAR DÉFAUT =====
export default DataTransformer;
