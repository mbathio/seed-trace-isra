// backend/src/utils/transformers.ts - VERSION COMPLÈTE

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
  // ===== TRANSFORMATION D'ENTITÉS COMPLÈTES =====

  /**
   * Transforme un lot de semences complet (DB → UI)
   */
  static transformSeedLot(seedLot: any): any {
    if (!seedLot) return null;


    return {
      id: seedLot.id,
      varietyId: seedLot.varietyId,
      variety: seedLot.variety ? this.transformVariety(seedLot.variety) : null,
      level: seedLot.level, // Pas de transformation nécessaire pour SeedLevel
      quantity: seedLot.quantity,
      productionDate: seedLot.productionDate,
      expiryDate: seedLot.expiryDate,
      multiplierId: seedLot.multiplierId,
      multiplier: seedLot.multiplier ? this.transformMultiplier(seedLot.multiplier) : null,
      parcelId: seedLot.parcelId,
      parcel: seedLot.parcel ? this.transformParcel(seedLot.parcel) : null,
      status: this.transformLotStatusDBToUI(seedLot.status),
      batchNumber: seedLot.batchNumber,
      parentLotId: seedLot.parentLotId,
      notes: seedLot.notes,
      qrCode: seedLot.qrCode,
      isActive: seedLot.isActive,
      createdAt: seedLot.createdAt,
      updatedAt: seedLot.updatedAt,
      // Relations transformées
      qualityControls: seedLot.qualityControls?.map((qc: any) =>
        this.transformQualityControl(qc)
      ),
      productions: seedLot.productions?.map((p: any) =>
        this.transformProduction(p)
      ),
      childLots: seedLot.childLots?.map((cl: any) => this.transformSeedLot(cl)),
      parentLot: seedLot.parentLot
        ? this.transformSeedLot(seedLot.parentLot)
        : null,
    };
  }

  /**
   * Transforme une variété complète (DB → UI)
   */
  static transformVariety(variety: any): any {
    if (!variety) return null;
    

    // Mapping DB vers UI pour cropType
    const cropTypeMapping: Record<string, string> = {
      RICE: "rice",
      MAIZE: "maize",
      PEANUT: "peanut",
      SORGHUM: "sorghum",
      COWPEA: "cowpea",
      MILLET: "millet",
      WHEAT: "wheat",
    };

    return {
      id: variety.id,
      code: variety.code,
      name: variety.name,
      cropType:
        cropTypeMapping[variety.cropType] || variety.cropType.toLowerCase(),
      description: variety.description,
      maturityDays: variety.maturityDays,
      yieldPotential: variety.yieldPotential,
      resistances: variety.resistances,
      origin: variety.origin,
      releaseYear: variety.releaseYear,
      isActive: variety.isActive,
      createdAt: variety.createdAt,
      updatedAt: variety.updatedAt,
      // Inclure les compteurs si présents
      _count: variety._count,
      // Transformer les relations si présentes
      seedLots: variety.seedLots?.map((lot: any) => this.transformSeedLot(lot)),
      contracts: variety.contracts?.map((contract: any) =>
        this.transformContract(contract)
      ),
    };
  }

  /**
   * Transforme un multiplicateur complet (DB → UI)
   */
  static transformMultiplier(multiplier: any): any {
    if (!multiplier) return null;

    return {
      id: multiplier.id,
      name: multiplier.name,
      code: multiplier.code,
      status: this.transformMultiplierStatusDBToUI(multiplier.status),
      address: multiplier.address,
      latitude: multiplier.latitude,
      longitude: multiplier.longitude,
      yearsExperience: multiplier.yearsExperience,
      certificationLevel: this.transformCertificationLevelDBToUI(
        multiplier.certificationLevel
      ),
      specialization: multiplier.specialization,
      phone: multiplier.phone,
      email: multiplier.email,
      isActive: multiplier.isActive,
      createdAt: multiplier.createdAt,
      updatedAt: multiplier.updatedAt,
      // Relations si incluses
      parcels: multiplier.parcels?.map((p: any) => this.transformParcel(p)),
      contracts: multiplier.contracts?.map((c: any) =>
        this.transformContract(c)
      ),
      seedLots: multiplier.seedLots?.map((sl: any) =>
        this.transformSeedLot(sl)
      ),
      productions: multiplier.productions?.map((p: any) =>
        this.transformProduction(p)
      ),
      _count: multiplier._count,
    };
  }

  /**
   * Transforme une parcelle complète (DB → UI)
   */
  static transformParcel(parcel: any): any {
    if (!parcel) return null;

    return {
      id: parcel.id,
      name: parcel.name,
      area: parcel.area,
      latitude: parcel.latitude,
      longitude: parcel.longitude,
      status: this.transformParcelStatusDBToUI(parcel.status),
      soilType: parcel.soilType,
      irrigationSystem: parcel.irrigationSystem,
      address: parcel.address,
      multiplierId: parcel.multiplierId,
      multiplierName: parcel.multiplier?.name,
      isActive: parcel.isActive,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      // Relations si incluses
      multiplier: parcel.multiplier
        ? this.transformMultiplier(parcel.multiplier)
        : null,
      seedLots: parcel.seedLots?.map((sl: any) => this.transformSeedLot(sl)),
      productions: parcel.productions?.map((p: any) =>
        this.transformProduction(p)
      ),
      soilAnalyses: parcel.soilAnalyses,
      previousCrops: parcel.previousCrops,
      _count: parcel._count,
    };
  }

  /**
   * Transforme un contrôle qualité complet (DB → UI)
   */
  static transformQualityControl(qc: any): any {
    if (!qc) return null;

    return {
      id: qc.id,
      lotId: qc.lotId,
      controlDate: qc.controlDate,
      germinationRate: qc.germinationRate,
      varietyPurity: qc.varietyPurity,
      moistureContent: qc.moistureContent,
      seedHealth: qc.seedHealth,
      result: this.transformTestResultDBToUI(qc.result),
      observations: qc.observations,
      inspectorId: qc.inspectorId,
      inspectorName: qc.inspector?.name,
      testMethod: qc.testMethod,
      laboratoryRef: qc.laboratoryRef,
      certificateUrl: qc.certificateUrl,
      createdAt: qc.createdAt,
      updatedAt: qc.updatedAt,
      // Relations si incluses
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : null,
      inspector: qc.inspector ? this.transformUser(qc.inspector) : null,
    };
  }

  /**
   * Transforme une production complète (DB → UI)
   */
  static transformProduction(production: any): any {
    if (!production) return null;

    return {
      id: production.id,
      lotId: production.lotId,
      startDate: production.startDate,
      endDate: production.endDate,
      sowingDate: production.sowingDate,
      harvestDate: production.harvestDate,
      yield: production.yield,
      conditions: production.conditions,
      status: this.transformProductionStatusDBToUI(production.status),
      plannedQuantity: production.plannedQuantity,
      actualYield: production.actualYield,
      notes: production.notes,
      weatherConditions: production.weatherConditions,
      parcelId: production.parcelId,
      parcelName: production.parcel?.name,
      multiplierId: production.multiplierId,
      multiplierName: production.multiplier?.name,
      createdAt: production.createdAt,
      updatedAt: production.updatedAt,
      // Relations si incluses
      seedLot: production.seedLot
        ? this.transformSeedLot(production.seedLot)
        : null,
      multiplier: production.multiplier
        ? this.transformMultiplier(production.multiplier)
        : null,
      parcel: production.parcel
        ? this.transformParcel(production.parcel)
        : null,
      activities: production.activities?.map((a: any) =>
        this.transformActivity(a)
      ),
      issues: production.issues?.map((i: any) => this.transformIssue(i)),
      weatherData: production.weatherData,
      _count: production._count,
    };
  }

  /**
   * Transforme une activité de production (DB → UI)
   */
  static transformActivity(activity: any): any {
    if (!activity) return null;

    return {
      id: activity.id,
      productionId: activity.productionId,
      activityDate: activity.activityDate,
      type: this.transformActivityTypeDBToUI(activity.type),
      description: activity.description,
      responsibleId: activity.responsibleId,
      responsibleName: activity.responsible?.name,
      duration: activity.duration,
      laborCount: activity.laborCount,
      cost: activity.cost,
      notes: activity.notes,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      // Relations si incluses
      inputs: activity.inputs,
      responsible: activity.responsible
        ? this.transformUser(activity.responsible)
        : null,
    };
  }

  /**
   * Transforme un problème/issue de production (DB → UI)
   */
  static transformIssue(issue: any): any {
    if (!issue) return null;

    return {
      id: issue.id,
      productionId: issue.productionId,
      issueDate: issue.issueDate,
      type: this.transformIssueTypeDBToUI(issue.type),
      severity: this.transformIssueSeverityDBToUI(issue.severity),
      description: issue.description,
      actions: issue.actions,
      resolved: issue.resolved,
      resolvedDate: issue.resolvedDate,
      cost: issue.cost,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }

  /**
   * Transforme un utilisateur complet (DB → UI)
   */
  static transformUser(user: any): any {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: this.transformRoleDBToUI(user.role),
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Ne jamais renvoyer le mot de passe
    };
  }

  /**
   * Transforme un contrat complet (DB → UI)
   */
  static transformContract(contract: any): any {
    if (!contract) return null;

    return {
      id: contract.id,
      multiplierId: contract.multiplierId,
      varietyId: contract.varietyId,
      startDate: contract.startDate,
      endDate: contract.endDate,
      seedLevel: contract.seedLevel, // Pas de transformation nécessaire
      expectedQuantity: contract.expectedQuantity,
      actualQuantity: contract.actualQuantity,
      status: this.transformContractStatusDBToUI(contract.status),
      parcelId: contract.parcelId,
      paymentTerms: contract.paymentTerms,
      notes: contract.notes,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      // Relations si incluses
      multiplier: contract.multiplier
        ? this.transformMultiplier(contract.multiplier)
        : null,
      variety: contract.variety
        ? this.transformVariety(contract.variety)
        : null,
      parcel: contract.parcel ? this.transformParcel(contract.parcel) : null,
    };
  }

  /**
   * Transforme un rapport complet (DB → UI)
   */
  static transformReport(report: any): any {
    if (!report) return null;

    return {
      id: report.id,
      title: report.title,
      description: report.description,
      type: this.transformReportTypeDBToUI(report.type),
      createdById: report.createdById,
      fileName: report.fileName,
      filePath: report.filePath,
      parameters: report.parameters,
      data: report.data,
      isPublic: report.isPublic,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      // Relations si incluses
      createdBy: report.createdBy ? this.transformUser(report.createdBy) : null,
    };
  }

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

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Nettoie les champs undefined d'un objet
   */
  static cleanUndefinedFields(obj: any): any {
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
   * Transforme les données pour une création (UI → DB)
   */
  static transformForCreate(data: any, entityType: string): any {
    const transformed = { ...data };

    switch (entityType) {
      case "seedLot":
        if (transformed.status) {
          transformed.status = this.transformLotStatusUIToDB(
            transformed.status
          );
        }
        break;

      case "variety":
        if (transformed.cropType) {
          transformed.cropType = this.transformCropTypeUIToDB(
            transformed.cropType
          );
        }
        break;

      case "multiplier":
        if (transformed.status) {
          transformed.status = this.transformMultiplierStatusUIToDB(
            transformed.status
          );
        }
        if (transformed.certificationLevel) {
          transformed.certificationLevel =
            this.transformCertificationLevelUIToDB(
              transformed.certificationLevel
            );
        }
        break;

      case "parcel":
        if (transformed.status) {
          transformed.status = this.transformParcelStatusUIToDB(
            transformed.status
          );
        }
        break;

      case "qualityControl":
        if (transformed.result) {
          transformed.result = this.transformTestResultUIToDB(
            transformed.result
          );
        }
        break;

      case "production":
        if (transformed.status) {
          transformed.status = this.transformProductionStatusUIToDB(
            transformed.status
          );
        }
        break;

      case "activity":
        if (transformed.type) {
          transformed.type = this.transformActivityTypeUIToDB(transformed.type);
        }
        break;

      case "issue":
        if (transformed.type) {
          transformed.type = this.transformIssueTypeUIToDB(transformed.type);
        }
        if (transformed.severity) {
          transformed.severity = this.transformIssueSeverityUIToDB(
            transformed.severity
          );
        }
        break;

      case "user":
        if (transformed.role) {
          transformed.role = this.transformRoleUIToDB(transformed.role);
        }
        break;

      case "contract":
        if (transformed.status) {
          transformed.status = this.transformContractStatusUIToDB(
            transformed.status
          );
        }
        break;

      case "report":
        if (transformed.type) {
          transformed.type = this.transformReportTypeUIToDB(transformed.type);
        }
        break;
    }

    return this.cleanUndefinedFields(transformed);
  }

  /**
   * Transforme les données pour une mise à jour (UI → DB)
   */
  static transformForUpdate(data: any, entityType: string): any {
    // Utilise la même logique que transformForCreate
    return this.transformForCreate(data, entityType);
  }

  /**
   * Transforme une collection d'entités
   */
  static transformCollection(
    items: any[],
    transformMethod: (item: any) => any
  ): any[] {
    if (!Array.isArray(items)) return [];
    return items.map((item) => transformMethod.call(this, item));
  }
}
