// backend/src/services/EnumValidationService.ts - VERSION CORRIGÉE

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
  ReportType,
} from "@prisma/client";

/**
 * ✅ Service centralisé de validation des enums
 */
export class EnumValidationService {
  // ✅ Mapping des valeurs UI valides
  private static readonly UI_ENUM_VALUES = {
    ROLE: [
      "admin",
      "manager",
      "inspector",
      "multiplier",
      "guest",
      "technician",
      "researcher",
    ],
    SEED_LEVEL: ["GO", "G1", "G2", "G3", "G4", "R1", "R2"],
    CROP_TYPE: [
      "rice",
      "maize",
      "peanut",
      "sorghum",
      "cowpea",
      "millet",
      "wheat",
    ],
    LOT_STATUS: [
      "pending",
      "certified",
      "rejected",
      "in-stock",
      "sold",
      "active",
      "distributed",
    ],
    PARCEL_STATUS: ["available", "in-use", "resting"],
    PRODUCTION_STATUS: ["planned", "in-progress", "completed", "cancelled"],
    ACTIVITY_TYPE: [
      "soil-preparation",
      "sowing",
      "fertilization",
      "irrigation",
      "weeding",
      "pest-control",
      "harvest",
      "other",
    ],
    ISSUE_TYPE: ["disease", "pest", "weather", "management", "other"],
    ISSUE_SEVERITY: ["low", "medium", "high"],
    TEST_RESULT: ["pass", "fail"],
    CERTIFICATION_LEVEL: ["beginner", "intermediate", "expert"],
    MULTIPLIER_STATUS: ["active", "inactive"],
    CONTRACT_STATUS: ["draft", "active", "completed", "cancelled"],
    REPORT_TYPE: [
      "production",
      "quality",
      "inventory",
      "multiplier-performance",
      "custom",
    ],
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
    REPORT_TYPE: Object.values(ReportType),
  } as const;

  /**
   * ✅ Valide qu'une valeur UI est correcte pour un enum donné
   */
  static isValidUIEnumValue(
    value: string,
    enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES
  ): boolean {
    if (!value || typeof value !== "string") return false;
    return this.UI_ENUM_VALUES[enumType].includes(value as any);
  }

  /**
   * ✅ Valide qu'une valeur DB est correcte pour un enum donné
   */
  static isValidDBEnumValue(
    value: string,
    enumType: keyof typeof EnumValidationService.DB_ENUM_VALUES
  ): boolean {
    if (!value || typeof value !== "string") return false;
    return (this.DB_ENUM_VALUES[enumType] as readonly string[]).includes(value);
  }

  /**
   * ✅ Valide qu'une valeur est correcte (UI ou DB) pour un enum donné
   */
  static isValidEnumValue(
    value: string,
    enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES
  ): boolean {
    if (!value || typeof value !== "string") return false;

    return (
      this.isValidUIEnumValue(value, enumType) ||
      this.isValidDBEnumValue(
        value,
        enumType as keyof typeof EnumValidationService.DB_ENUM_VALUES
      )
    );
  }

  /**
   * ✅ Obtient toutes les valeurs UI valides pour un enum
   */
  static getValidUIValues(
    enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES
  ): readonly string[] {
    return this.UI_ENUM_VALUES[enumType];
  }

  /**
   * ✅ Obtient toutes les valeurs DB valides pour un enum
   */
  static getValidDBValues(
    enumType: keyof typeof EnumValidationService.DB_ENUM_VALUES
  ): readonly string[] {
    return this.DB_ENUM_VALUES[enumType];
  }

  /**
   * ✅ CORRECTION SYNTAXE: Valide un objet complet avec ses enums
   */
  static validateObjectEnums(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return { isValid: true, errors: [] };
    }

    // ✅ Mapping des champs vers leurs types d'enum
    const fieldToEnumMapping: Record<
      string,
      keyof typeof EnumValidationService.UI_ENUM_VALUES
    > = {
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
      certificationLevel: "CERTIFICATION_LEVEL",
    };

    // ✅ CORRECTION: Validation contextuelle du status selon le contexte
    if (data.status) {
      let enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES =
        "LOT_STATUS";

      // Détecter le contexte pour déterminer le bon type de status
      if (data.parcelId !== undefined || data.area !== undefined) {
        enumType = "PARCEL_STATUS";
      } else if (data.startDate !== undefined || data.endDate !== undefined) {
        enumType = "PRODUCTION_STATUS";
      } else if (
        data.multiplierId !== undefined &&
        data.address !== undefined
      ) {
        enumType = "MULTIPLIER_STATUS";
      } else if (
        data.contractId !== undefined ||
        data.expectedQuantity !== undefined
      ) {
        enumType = "CONTRACT_STATUS";
      }

      if (!this.isValidEnumValue(data.status, enumType)) {
        errors.push(
          `Invalid status "${
            data.status
          }" for context. Valid values: ${this.getValidUIValues(enumType).join(
            ", "
          )}`
        );
      }
    }

    // ✅ CORRECTION: Validation contextuelle du type selon le contexte
    if (data.type) {
      let enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES =
        "ACTIVITY_TYPE";

      // Détecter le contexte pour déterminer le bon type
      if (data.issueDate !== undefined || data.severity !== undefined) {
        enumType = "ISSUE_TYPE";
      } else if (data.title !== undefined || data.description !== undefined) {
        enumType = "REPORT_TYPE";
      }

      if (!this.isValidEnumValue(data.type, enumType)) {
        errors.push(
          `Invalid type "${
            data.type
          }" for context. Valid values: ${this.getValidUIValues(enumType).join(
            ", "
          )}`
        );
      }
    }

    // ✅ Validation des autres champs d'enum
    for (const [field, enumType] of Object.entries(fieldToEnumMapping)) {
      if (data[field] !== undefined && data[field] !== null) {
        if (!this.isValidEnumValue(data[field], enumType)) {
          errors.push(
            `Invalid ${field} "${
              data[field]
            }". Valid values: ${this.getValidUIValues(enumType).join(", ")}`
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Valide spécifiquement un lot de semences
   */
  static validateSeedLotEnums(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.level && !this.isValidEnumValue(data.level, "SEED_LEVEL")) {
      errors.push(
        `Invalid seed level "${
          data.level
        }". Valid values: ${this.getValidUIValues("SEED_LEVEL").join(", ")}`
      );
    }

    if (data.status && !this.isValidEnumValue(data.status, "LOT_STATUS")) {
      errors.push(
        `Invalid lot status "${
          data.status
        }". Valid values: ${this.getValidUIValues("LOT_STATUS").join(", ")}`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Valide spécifiquement une variété
   */
  static validateVarietyEnums(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.cropType && !this.isValidEnumValue(data.cropType, "CROP_TYPE")) {
      errors.push(
        `Invalid crop type "${
          data.cropType
        }". Valid values: ${this.getValidUIValues("CROP_TYPE").join(", ")}`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Valide spécifiquement un multiplicateur
   */
  static validateMultiplierEnums(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      data.status &&
      !this.isValidEnumValue(data.status, "MULTIPLIER_STATUS")
    ) {
      errors.push(
        `Invalid multiplier status "${
          data.status
        }". Valid values: ${this.getValidUIValues("MULTIPLIER_STATUS").join(
          ", "
        )}`
      );
    }

    if (
      data.certificationLevel &&
      !this.isValidEnumValue(data.certificationLevel, "CERTIFICATION_LEVEL")
    ) {
      errors.push(
        `Invalid certification level "${
          data.certificationLevel
        }". Valid values: ${this.getValidUIValues("CERTIFICATION_LEVEL").join(
          ", "
        )}`
      );
    }

    if (data.specialization && Array.isArray(data.specialization)) {
      const invalidSpecializations = data.specialization.filter(
        (spec: string) => !this.isValidEnumValue(spec, "CROP_TYPE")
      );
      if (invalidSpecializations.length > 0) {
        errors.push(
          `Invalid specializations: ${invalidSpecializations.join(
            ", "
          )}. Valid values: ${this.getValidUIValues("CROP_TYPE").join(", ")}`
        );
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Valide spécifiquement un contrôle qualité
   */
  static validateQualityControlEnums(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.result && !this.isValidEnumValue(data.result, "TEST_RESULT")) {
      errors.push(
        `Invalid test result "${
          data.result
        }". Valid values: ${this.getValidUIValues("TEST_RESULT").join(", ")}`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Valide spécifiquement une production
   */
  static validateProductionEnums(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      data.status &&
      !this.isValidEnumValue(data.status, "PRODUCTION_STATUS")
    ) {
      errors.push(
        `Invalid production status "${
          data.status
        }". Valid values: ${this.getValidUIValues("PRODUCTION_STATUS").join(
          ", "
        )}`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Valide spécifiquement un utilisateur
   */
  static validateUserEnums(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.role && !this.isValidEnumValue(data.role, "ROLE")) {
      errors.push(
        `Invalid user role "${
          data.role
        }". Valid values: ${this.getValidUIValues("ROLE").join(", ")}`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * ✅ Détecte automatiquement le type d'entité et valide ses enums
   */
  static validateEntityEnums(data: any): {
    isValid: boolean;
    errors: string[];
    entityType?: string;
  } {
    if (!data || typeof data !== "object") {
      return { isValid: true, errors: [] };
    }

    // ✅ Détection automatique du type d'entité
    let entityType = "unknown";
    let validation = { isValid: true, errors: [] as string[] };

    if (
      data.level !== undefined &&
      (data.varietyId !== undefined || data.quantity !== undefined)
    ) {
      entityType = "seedLot";
      validation = this.validateSeedLotEnums(data);
    } else if (data.cropType !== undefined || data.maturityDays !== undefined) {
      entityType = "variety";
      validation = this.validateVarietyEnums(data);
    } else if (
      data.certificationLevel !== undefined ||
      data.yearsExperience !== undefined
    ) {
      entityType = "multiplier";
      validation = this.validateMultiplierEnums(data);
    } else if (
      data.germinationRate !== undefined ||
      data.varietyPurity !== undefined
    ) {
      entityType = "qualityControl";
      validation = this.validateQualityControlEnums(data);
    } else if (
      data.startDate !== undefined &&
      data.multiplierId !== undefined &&
      data.parcelId !== undefined
    ) {
      entityType = "production";
      validation = this.validateProductionEnums(data);
    } else if (data.role !== undefined) {
      entityType = "user";
      validation = this.validateUserEnums(data);
    } else {
      // ✅ Validation générique pour les entités non reconnues
      validation = this.validateObjectEnums(data);
    }

    return { ...validation, entityType };
  }

  /**
   * ✅ Nettoyage et normalisation des valeurs d'enum
   */
  static normalizeEnumValue(
    value: string,
    enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES
  ): string {
    if (!value || typeof value !== "string") return value;

    const normalized = value.toLowerCase().trim();
    const validValues = this.getValidUIValues(enumType);

    // ✅ Recherche exacte d'abord
    const exactMatch = validValues.find((v) => v.toLowerCase() === normalized);
    if (exactMatch) return exactMatch;

    // ✅ Recherche approximative (cas spéciaux)
    switch (enumType) {
      case "LOT_STATUS":
        if (normalized === "in_stock" || normalized === "in stock")
          return "in-stock";
        if (normalized === "in_progress" || normalized === "in progress")
          return "in-progress";
        break;
      case "PARCEL_STATUS":
        if (normalized === "in_use" || normalized === "in use") return "in-use";
        break;
      case "PRODUCTION_STATUS":
        if (normalized === "in_progress" || normalized === "in progress")
          return "in-progress";
        break;
      case "ACTIVITY_TYPE":
        if (
          normalized === "soil_preparation" ||
          normalized === "soil preparation"
        )
          return "soil-preparation";
        if (normalized === "pest_control" || normalized === "pest control")
          return "pest-control";
        break;
      case "REPORT_TYPE":
        if (
          normalized === "multiplier_performance" ||
          normalized === "multiplier performance"
        )
          return "multiplier-performance";
        break;
    }

    // ✅ Si aucune correspondance trouvée, retourner la valeur originale
    return value;
  }

  /**
   * ✅ Obtient des suggestions pour une valeur d'enum invalide
   */
  static getSuggestions(
    value: string,
    enumType: keyof typeof EnumValidationService.UI_ENUM_VALUES
  ): string[] {
    if (!value || typeof value !== "string") return [];

    const validValues = this.getValidUIValues(enumType);
    const normalized = value.toLowerCase();

    // ✅ Recherche de correspondances partielles
    const suggestions = validValues.filter(
      (validValue) =>
        validValue.toLowerCase().includes(normalized) ||
        normalized.includes(validValue.toLowerCase()) ||
        this.calculateSimilarity(normalized, validValue.toLowerCase()) > 0.6
    );

    return suggestions.slice(0, 3); // Maximum 3 suggestions
  }

  /**
   * ✅ Calcule la similarité entre deux chaînes (algorithme Jaro-Winkler simplifié)
   */
  private static calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const matches = [];
    const aChars = a.split("");
    const bChars = b.split("");

    for (let i = 0; i < aChars.length; i++) {
      const char = aChars[i];
      const index = bChars.indexOf(char);
      if (index !== -1) {
        matches.push(char);
        bChars[index] = null as any;
      }
    }

    return matches.length / Math.max(a.length, b.length);
  }

  /**
   * ✅ Middleware de validation pour Express
   */
  static createValidationMiddleware(entityType?: string) {
    return (req: any, res: any, next: any) => {
      let validation: {
        isValid: boolean;
        errors: string[];
        entityType?: string;
      };

      if (entityType) {
        // Validation spécifique selon le type d'entité
        switch (entityType) {
          case "seedLot":
            validation = this.validateSeedLotEnums(req.body);
            break;
          case "variety":
            validation = this.validateVarietyEnums(req.body);
            break;
          case "multiplier":
            validation = this.validateMultiplierEnums(req.body);
            break;
          case "qualityControl":
            validation = this.validateQualityControlEnums(req.body);
            break;
          case "production":
            validation = this.validateProductionEnums(req.body);
            break;
          case "user":
            validation = this.validateUserEnums(req.body);
            break;
          default:
            validation = this.validateObjectEnums(req.body);
        }
      } else {
        // Validation automatique
        validation = this.validateEntityEnums(req.body);
      }

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: Invalid enum values",
          errors: validation.errors,
          entityType: validation.entityType,
        });
      }

      next();
    };
  }
}
