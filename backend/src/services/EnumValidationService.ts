// backend/src/services/EnumValidationService.ts - NOUVEAU SERVICE

import { 
  Role,
  SeedLevel,
  CropType,
  LotStatus,
  ParcelStatus,
  ProductionStatus,
  ActivityType,
  IssueType,
  IssueSeverity,
  TestResult,
  CertificationLevel,
  MultiplierStatus,
  ContractStatus,
  ReportType
} from "@prisma/client";

/**
 * ✅ NOUVEAU: Service centralisé de validation des enums
 * Valide que les valeurs sont correctes avant transformation
 */
export class EnumValidationService {
  
  // ✅ Mapping des valeurs UI valides
  private static readonly UI_ENUM_VALUES = {
    ROLE: ["admin", "manager", "inspector", "multiplier", "guest", "technician", "researcher"],
    SEED_LEVEL: ["GO", "G1", "G2", "G3", "G4", "R1", "R2"],
    CROP_TYPE: ["rice", "maize", "peanut", "sorghum", "cowpea", "millet", "wheat"],
    LOT_STATUS: ["pending", "certified", "rejected", "in-stock", "sold", "active", "distributed"],
    PARCEL_STATUS: ["available", "in-use", "resting"],
    PRODUCTION_STATUS: ["planned", "in-progress", "completed", "cancelled"],
    ACTIVITY_TYPE: ["soil-preparation", "sowing", "fertilization", "irrigation", "weeding", "pest-control", "harvest", "other"],
    ISSUE_TYPE: ["disease", "pest", "weather", "management", "other"],
    ISSUE_SEVERITY: ["low", "medium", "high"],
    TEST_RESULT: ["pass", "fail"],
    CERTIFICATION_LEVEL: ["beginner", "intermediate", "expert"],
    MULTIPLIER_STATUS: ["active", "inactive"],
    CONTRACT_STATUS: ["draft", "active", "completed", "cancelled"],
    REPORT_TYPE: ["production", "quality", "inventory", "multiplier-performance", "custom"]
  } as const;

  // ✅ Mapping des valeurs DB valides
  private static readonly DB_ENUM_VALUES = {
    ROLE: Object.values(Role),
    SEED_LEVEL: Object.values(SeedLevel),
    CROP_TYPE: Object.values(CropType),
    LOT_STATUS: Object.values(LotStatus),
    PARCEL_STATUS: Object.values(ParcelStatus),
    PRODUCTION_STATUS: Object.values(ProductionStatus),
    ACTIVITY_TYPE: Object.values(ActivityType),
    ISSUE_TYPE: Object.values(IssueType),
    ISSUE_SEVERITY: Object.values(IssueSeverity),
    TEST_RESULT: Object.values(TestResult),
    CERTIFICATION_LEVEL: Object.values(CertificationLevel),
    MULTIPLIER_STATUS: Object.values(MultiplierStatus),
    CONTRACT_STATUS: Object.values(ContractStatus),
    REPORT_TYPE: Object.values(ReportType)
  } as const;

  /**
   * ✅ Valide qu'une valeur UI est correcte pour un enum donné
   */
  static isValidUIEnumValue(value: string, enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES): boolean {
    if (!value || typeof value !== "string") return false;
    return this.UI_ENUM_VALUES[enumType].includes(value as any);
  }

  /**
   * ✅ Valide qu'une valeur DB est correcte pour un enum donné
   */
  static isValidDBEnumValue(value: string, enumType: keyof typeof EnumValidationService.DB_ENUM_VALUES): boolean {
    if (!value || typeof value !== "string") return false;
    return (this.DB_ENUM_VALUES[enumType] as readonly string[]).includes(value);
  }

  /**
   * ✅ Valide qu'une valeur est correcte (UI ou DB) pour un enum donné
   */
  static isValidEnumValue(value: string, enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES): boolean {
    if (!value || typeof value !== "string") return false;
    
    return this.isValidUIEnumValue(value, enumType) || 
           this.isValidDBEnumValue(value, enumType as keyof typeof EnumValidationService.DB_ENUM_VALUES);
  }

  /**
   * ✅ Obtient toutes les valeurs UI valides pour un enum
   */
  static getValidUIValues(enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES): readonly string[] {
    return this.UI_ENUM_VALUES[enumType];
  }

  /**
   * ✅ Obtient toutes les valeurs DB valides pour un enum
   */
  static getValidDBValues(enumType: keyof typeof EnumValidationService.DB_ENUM_VALUES): readonly string[] {
    return this.DB_ENUM_VALUES[enumType];
  }

  /**
   * ✅ Valide un objet complet avec ses enums
   */
  static validateObjectEnums(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return { isValid: true, errors: [] };
    }

    // ✅ Mapping des champs vers leurs types d'enum
    const fieldToEnumMapping: Record<string, keyof typeof EnumValidationService.UI_ENUM_VALUES> = {
      role: "ROLE",
      level: "SEED_LEVEL",
      seedLevel: "SEED_LEVEL",
      cropType: "CROP_TYPE",
      status: "LOT_STATUS", // Par défaut LOT_STATUS, peut être surchargé
      result: "TEST_RESULT",
      testResult: "TEST_RESULT",
      severity: "ISSUE_SEVERITY",
      issueSeverity: "ISSUE_SEVERITY",
      type: "ACTIVITY_TYPE", // Par défaut ACTIVITY_TYPE, peut être surchargé
      activityType: "ACTIVITY_TYPE",
      issueType: "ISSUE_TYPE",
      reportType: "REPORT_TYPE",
      certificationLevel: "CERTIFICATION_LEVEL"
    };

    // ✅ Validation contextuelle du status selon le contexte
    if (data.status) {
      let enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES = "LOT_STATUS";
      
      // Détecter le contexte pour déterminer le bon type de status
      if (data.parcelId !== undefined || data.area !== undefined) {
        enumType = "PARCEL_STATUS";
      } else if (data.startDate !== undefined || data.endDate !== undefined) {
        enumType = "PRODUCTION_STATUS";
      } else if (data.multiplierId !== undefined && data.address !== undefined) {
        enumType = "MULTIPLIER_STATUS";
      } else if (data.contractId !== undefined || data.expectedQuantity !== undefined) {
        enumType = "CONTRACT_STATUS";
      }

      if (!this.isValidEnumValue(data.status, enumType)) {
        errors.push(`Invalid status "${data.status}" for context. Valid values: ${this.getValidUIValues(enumType).join(", ")}`);