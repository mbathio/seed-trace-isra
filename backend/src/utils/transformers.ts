// backend/src/utils/transformers.ts - ✅ VERSION COMPLÈTE AVEC TOUTES LES MÉTHODES
import {
  ROLE_MAPPINGS,
  CROP_TYPE_MAPPINGS,
  LOT_STATUS_MAPPINGS,
  PARCEL_STATUS_MAPPINGS,
  PRODUCTION_STATUS_MAPPINGS,
  ACTIVITY_TYPE_MAPPINGS,
  ISSUE_TYPE_MAPPINGS,
  ISSUE_SEVERITY_MAPPINGS,
  TEST_RESULT_MAPPINGS,
  CERTIFICATION_LEVEL_MAPPINGS,
  MULTIPLIER_STATUS_MAPPINGS,
  CONTRACT_STATUS_MAPPINGS,
  REPORT_TYPE_MAPPINGS,
  SEED_LEVEL_MAPPINGS,
} from "../config/enums";

/**
 * Classe de transformation des données entre UI et DB
 * Centralise toutes les transformations d'enums et d'entités
 */
export default class DataTransformer {
  // ===== TRANSFORMATIONS D'ENUMS INDIVIDUELS =====

  /**
   * Transforme un type de culture UI vers DB
   */
  static transformCropTypeUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      CROP_TYPE_MAPPINGS.UI_TO_DB[
        value as keyof typeof CROP_TYPE_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un type de culture DB vers UI
   */
  static transformCropTypeDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      CROP_TYPE_MAPPINGS.DB_TO_UI[
        value as keyof typeof CROP_TYPE_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un résultat de test UI vers DB
   */
  static transformTestResultUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      TEST_RESULT_MAPPINGS.UI_TO_DB[
        value as keyof typeof TEST_RESULT_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un résultat de test DB vers UI
   */
  static transformTestResultDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      TEST_RESULT_MAPPINGS.DB_TO_UI[
        value as keyof typeof TEST_RESULT_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un statut de lot UI vers DB
   */
  static transformLotStatusUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      LOT_STATUS_MAPPINGS.UI_TO_DB[
        value as keyof typeof LOT_STATUS_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un statut de lot DB vers UI
   */
  static transformLotStatusDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      LOT_STATUS_MAPPINGS.DB_TO_UI[
        value as keyof typeof LOT_STATUS_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un rôle UI vers DB
   */
  static transformRoleUIToDB(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return (
      ROLE_MAPPINGS.UI_TO_DB[value as keyof typeof ROLE_MAPPINGS.UI_TO_DB] ||
      value
    );
  }

  /**
   * Transforme un rôle DB vers UI
   */
  static transformRoleDBToUI(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return (
      ROLE_MAPPINGS.DB_TO_UI[value as keyof typeof ROLE_MAPPINGS.DB_TO_UI] ||
      value
    );
  }

  /**
   * Transforme un statut de multiplicateur UI vers DB
   */
  static transformMultiplierStatusUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB[
        value as keyof typeof MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un statut de multiplicateur DB vers UI
   */
  static transformMultiplierStatusDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      MULTIPLIER_STATUS_MAPPINGS.DB_TO_UI[
        value as keyof typeof MULTIPLIER_STATUS_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un niveau de certification UI vers DB
   */
  static transformCertificationLevelUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB[
        value as keyof typeof CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un niveau de certification DB vers UI
   */
  static transformCertificationLevelDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      CERTIFICATION_LEVEL_MAPPINGS.DB_TO_UI[
        value as keyof typeof CERTIFICATION_LEVEL_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un statut de parcelle UI vers DB
   */
  static transformParcelStatusUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      PARCEL_STATUS_MAPPINGS.UI_TO_DB[
        value as keyof typeof PARCEL_STATUS_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un statut de parcelle DB vers UI
   */
  static transformParcelStatusDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      PARCEL_STATUS_MAPPINGS.DB_TO_UI[
        value as keyof typeof PARCEL_STATUS_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un statut de production UI vers DB
   */
  static transformProductionStatusUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      PRODUCTION_STATUS_MAPPINGS.UI_TO_DB[
        value as keyof typeof PRODUCTION_STATUS_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un statut de production DB vers UI
   */
  static transformProductionStatusDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      PRODUCTION_STATUS_MAPPINGS.DB_TO_UI[
        value as keyof typeof PRODUCTION_STATUS_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un type d'activité UI vers DB
   */
  static transformActivityTypeUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      ACTIVITY_TYPE_MAPPINGS.UI_TO_DB[
        value as keyof typeof ACTIVITY_TYPE_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un type d'activité DB vers UI
   */
  static transformActivityTypeDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      ACTIVITY_TYPE_MAPPINGS.DB_TO_UI[
        value as keyof typeof ACTIVITY_TYPE_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un type de problème UI vers DB
   */
  static transformIssueTypeUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      ISSUE_TYPE_MAPPINGS.UI_TO_DB[
        value as keyof typeof ISSUE_TYPE_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un type de problème DB vers UI
   */
  static transformIssueTypeDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      ISSUE_TYPE_MAPPINGS.DB_TO_UI[
        value as keyof typeof ISSUE_TYPE_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme une sévérité UI vers DB
   */
  static transformIssueSeverityUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      ISSUE_SEVERITY_MAPPINGS.UI_TO_DB[
        value as keyof typeof ISSUE_SEVERITY_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme une sévérité DB vers UI
   */
  static transformIssueSeverityDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      ISSUE_SEVERITY_MAPPINGS.DB_TO_UI[
        value as keyof typeof ISSUE_SEVERITY_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un statut de contrat UI vers DB
   */
  static transformContractStatusUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      CONTRACT_STATUS_MAPPINGS.UI_TO_DB[
        value as keyof typeof CONTRACT_STATUS_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un statut de contrat DB vers UI
   */
  static transformContractStatusDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      CONTRACT_STATUS_MAPPINGS.DB_TO_UI[
        value as keyof typeof CONTRACT_STATUS_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  /**
   * Transforme un type de rapport UI vers DB
   */
  static transformReportTypeUIToDB(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      REPORT_TYPE_MAPPINGS.UI_TO_DB[
        value as keyof typeof REPORT_TYPE_MAPPINGS.UI_TO_DB
      ] || value
    );
  }

  /**
   * Transforme un type de rapport DB vers UI
   */
  static transformReportTypeDBToUI(
    value: string | undefined
  ): string | undefined {
    if (!value) return undefined;
    return (
      REPORT_TYPE_MAPPINGS.DB_TO_UI[
        value as keyof typeof REPORT_TYPE_MAPPINGS.DB_TO_UI
      ] || value
    );
  }

  // ===== TRANSFORMATIONS D'ENTITÉS COMPLÈTES =====

  /**
   * Transforme une variété complète (DB → UI)
   */
  static transformVariety(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      cropType: this.transformCropTypeDBToUI(variety.cropType),
      // Transformer les lots de semences associés si présents
      seedLots: variety.seedLots?.map((lot: any) => this.transformSeedLot(lot)),
      // Transformer les contrats associés si présents
      contracts: variety.contracts?.map((contract: any) =>
        this.transformContract(contract)
      ),
    };
  }

  /**
   * Transforme un lot de semences complet (DB → UI)
   */
  static transformSeedLot(lot: any): any {
    if (!lot) return null;

    return {
      ...lot,
      status: this.transformLotStatusDBToUI(lot.status),
      // Transformer la variété associée si présente
      variety: lot.variety ? this.transformVariety(lot.variety) : undefined,
      // Transformer le multiplicateur associé si présent
      multiplier: lot.multiplier
        ? this.transformMultiplier(lot.multiplier)
        : undefined,
      // Transformer la parcelle associée si présente
      parcel: lot.parcel ? this.transformParcel(lot.parcel) : undefined,
      // Transformer le lot parent si présent
      parentLot: lot.parentLot
        ? this.transformSeedLot(lot.parentLot)
        : undefined,
      // Transformer les lots enfants si présents
      childLots: lot.childLots?.map((child: any) =>
        this.transformSeedLot(child)
      ),
      // Transformer les contrôles qualité associés si présents
      qualityControls: lot.qualityControls?.map((qc: any) =>
        this.transformQualityControl(qc)
      ),
      // Transformer les productions associées si présentes
      productions: lot.productions?.map((prod: any) =>
        this.transformProduction(prod)
      ),
    };
  }

  /**
   * Transforme un contrôle qualité complet (DB → UI)
   */
  static transformQualityControl(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      result: this.transformTestResultDBToUI(qc.result),
      // Transformer le lot associé si présent
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : undefined,
      // Transformer l'inspecteur associé si présent
      inspector: qc.inspector ? this.transformUser(qc.inspector) : undefined,
    };
  }

  /**
   * Transforme un multiplicateur complet (DB → UI)
   */
  static transformMultiplier(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: this.transformMultiplierStatusDBToUI(multiplier.status),
      certificationLevel: this.transformCertificationLevelDBToUI(
        multiplier.certificationLevel
      ),
      // Transformer les spécialisations (types de cultures)
      specialization: multiplier.specialization?.map((spec: string) =>
        this.transformCropTypeDBToUI(spec)
      ),
      // Transformer les parcelles associées si présentes
      parcels: multiplier.parcels?.map((parcel: any) =>
        this.transformParcel(parcel)
      ),
      // Transformer les contrats associés si présents
      contracts: multiplier.contracts?.map((contract: any) =>
        this.transformContract(contract)
      ),
      // Transformer les lots de semences associés si présents
      seedLots: multiplier.seedLots?.map((lot: any) =>
        this.transformSeedLot(lot)
      ),
      // Transformer les productions associées si présentes
      productions: multiplier.productions?.map((prod: any) =>
        this.transformProduction(prod)
      ),
    };
  }

  /**
   * Transforme une parcelle complète (DB → UI)
   */
  static transformParcel(parcel: any): any {
    if (!parcel) return null;

    return {
      ...parcel,
      status: this.transformParcelStatusDBToUI(parcel.status),
      // Transformer le multiplicateur associé si présent
      multiplier: parcel.multiplier
        ? this.transformMultiplier(parcel.multiplier)
        : undefined,
      // Transformer les analyses de sol si présentes
      soilAnalyses: parcel.soilAnalyses,
      // Transformer les cultures précédentes si présentes
      previousCrops: parcel.previousCrops,
    };
  }

  /**
   * Transforme une production complète (DB → UI)
   */
  static transformProduction(production: any): any {
    if (!production) return null;

    return {
      ...production,
      status: this.transformProductionStatusDBToUI(production.status),
      // Transformer le lot associé si présent
      seedLot: production.seedLot
        ? this.transformSeedLot(production.seedLot)
        : undefined,
      // Transformer le multiplicateur associé si présent
      multiplier: production.multiplier
        ? this.transformMultiplier(production.multiplier)
        : undefined,
      // Transformer la parcelle associée si présente
      parcel: production.parcel
        ? this.transformParcel(production.parcel)
        : undefined,
      // Transformer les activités associées si présentes
      activities: production.activities?.map((activity: any) => ({
        ...activity,
        type: this.transformActivityTypeDBToUI(activity.type),
        user: activity.user ? this.transformUser(activity.user) : undefined,
      })),
      // Transformer les problèmes associés si présents
      issues: production.issues?.map((issue: any) => ({
        ...issue,
        type: this.transformIssueTypeDBToUI(issue.type),
        severity: this.transformIssueSeverityDBToUI(issue.severity),
      })),
    };
  }

  /**
   * Transforme un utilisateur complet (DB → UI)
   */
  static transformUser(user: any): any {
    if (!user) return null;

    return {
      ...user,
      role: this.transformRoleDBToUI(user.role),
    };
  }

  /**
   * Transforme un contrat complet (DB → UI)
   */
  static transformContract(contract: any): any {
    if (!contract) return null;

    return {
      ...contract,
      status: this.transformContractStatusDBToUI(contract.status),
      // Les niveaux de semences sont identiques UI/DB, pas de transformation nécessaire
      seedLevel: contract.seedLevel,
      // Transformer le multiplicateur associé si présent
      multiplier: contract.multiplier
        ? this.transformMultiplier(contract.multiplier)
        : undefined,
      // Transformer la variété associée si présente
      variety: contract.variety
        ? this.transformVariety(contract.variety)
        : undefined,
      // Transformer la parcelle associée si présente
      parcel: contract.parcel
        ? this.transformParcel(contract.parcel)
        : undefined,
    };
  }

  /**
   * Transforme un rapport complet (DB → UI)
   */
  static transformReport(report: any): any {
    if (!report) return null;

    return {
      ...report,
      type: this.transformReportTypeDBToUI(report.type),
      // Transformer l'utilisateur créateur si présent
      createdBy: report.createdBy
        ? this.transformUser(report.createdBy)
        : undefined,
    };
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Nettoie les valeurs undefined d'un objet
   */
  static cleanUndefinedValues(obj: any): any {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    }
    return cleaned;
  }

  /**
   * Transforme un tableau d'entités
   */
  static transformArray(items: any[], transformFn: (item: any) => any): any[] {
    if (!items || !Array.isArray(items)) return [];
    return items.map(transformFn).filter(Boolean);
  }

  /**
   * Log de transformation pour debug
   */
  static debugTransform(
    entityType: string,
    original: any,
    transformed: any
  ): void {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DataTransformer] ${entityType}:`, {
        original,
        transformed,
      });
    }
  }
}
