// backend/src/utils/transformers.ts
import { logger } from "./logger";
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
  MAPPING_REGISTRY,
} from "../config/enums";

// ===== TYPES =====
type MappingType = keyof typeof MAPPING_REGISTRY;
type TransformDirection = "UI_TO_DB" | "DB_TO_UI";

// ===== FONCTIONS DE TRANSFORMATION GÉNÉRIQUES =====

/**
 * Transforme une valeur enum selon le mapping fourni
 */
function transformEnum(
  value: string | undefined | null,
  mapping: Record<string, string>
): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  return mapping[value] || value;
}

/**
 * Obtient le mapping approprié pour une transformation
 */
function getMapping(
  type: MappingType,
  direction: TransformDirection
): Record<string, string> {
  const mappings = MAPPING_REGISTRY[type];
  if (!mappings) {
    logger.warn(`No mapping found for type: ${type}`);
    return {};
  }
  return mappings[direction] || {};
}

/**
 * Détermine le type d'entité basé sur les propriétés de l'objet
 */
function detectEntityType(obj: any): string {
  if (!obj || typeof obj !== "object") return "unknown";

  // Détection basée sur les propriétés uniques
  if (obj.level !== undefined && obj.varietyId !== undefined) return "seedLot";
  if (obj.cropType !== undefined && obj.maturityDays !== undefined)
    return "variety";
  if (
    obj.certificationLevel !== undefined &&
    obj.registrationNumber !== undefined
  )
    return "multiplier";
  if (obj.parcelCode !== undefined) return "parcel";
  if (obj.sowingDate !== undefined && obj.productionId !== undefined)
    return "production";
  if (obj.controlDate !== undefined && obj.seedLotId !== undefined)
    return "qualityControl";
  if (obj.contractNumber !== undefined) return "contract";
  if (obj.email !== undefined && obj.role !== undefined) return "user";
  if (obj.activityDate !== undefined) return "activity";
  if (obj.issueDate !== undefined && obj.severity !== undefined) return "issue";

  return "unknown";
}

/**
 * Transforme les query parameters de l'UI vers le format DB
 */
export function transformQueryParams(query: any): any {
  if (!query || typeof query !== "object") return query;

  const transformed: any = { ...query };

  // Transformer les enums dans les query params
  Object.keys(transformed).forEach((key) => {
    const value = transformed[key];
    if (!value || typeof value !== "string") return;

    switch (key) {
      case "status":
        // Essayer différents mappings selon le contexte
        transformed[key] =
          transformEnum(value, LOT_STATUS_MAPPINGS.UI_TO_DB) ||
          transformEnum(value, PARCEL_STATUS_MAPPINGS.UI_TO_DB) ||
          transformEnum(value, PRODUCTION_STATUS_MAPPINGS.UI_TO_DB) ||
          transformEnum(value, CONTRACT_STATUS_MAPPINGS.UI_TO_DB) ||
          transformEnum(value, MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB) ||
          value;
        break;

      case "role":
        transformed[key] = transformEnum(value, ROLE_MAPPINGS.UI_TO_DB);
        break;

      case "cropType":
        transformed[key] = transformEnum(value, CROP_TYPE_MAPPINGS.UI_TO_DB);
        break;

      case "level":
        // Les niveaux de semences restent identiques
        transformed[key] = transformEnum(value, SEED_LEVEL_MAPPINGS.UI_TO_DB);
        break;

      case "type":
        // Essayer différents mappings selon le contexte
        transformed[key] =
          transformEnum(value, ACTIVITY_TYPE_MAPPINGS.UI_TO_DB) ||
          transformEnum(value, ISSUE_TYPE_MAPPINGS.UI_TO_DB) ||
          transformEnum(value, REPORT_TYPE_MAPPINGS.UI_TO_DB) ||
          value;
        break;

      case "severity":
        transformed[key] = transformEnum(
          value,
          ISSUE_SEVERITY_MAPPINGS.UI_TO_DB
        );
        break;

      case "result":
        transformed[key] = transformEnum(value, TEST_RESULT_MAPPINGS.UI_TO_DB);
        break;

      case "certificationLevel":
        transformed[key] = transformEnum(
          value,
          CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB
        );
        break;
    }
  });

  return transformed;
}

/**
 * Transforme un objet de l'UI vers le format DB
 */
export function transformObjectUIToDB(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => transformObjectUIToDB(item));
  }

  const transformed: any = {};
  const entityType = detectEntityType(obj);

  for (const [key, value] of Object.entries(obj)) {
    // Transformer selon le type de champ et le contexte
    switch (key) {
      case "status":
        // Déterminer le bon mapping selon l'entité
        if (entityType === "seedLot") {
          transformed[key] = transformEnum(
            value as string,
            LOT_STATUS_MAPPINGS.UI_TO_DB
          );
        } else if (entityType === "parcel") {
          transformed[key] = transformEnum(
            value as string,
            PARCEL_STATUS_MAPPINGS.UI_TO_DB
          );
        } else if (entityType === "production") {
          transformed[key] = transformEnum(
            value as string,
            PRODUCTION_STATUS_MAPPINGS.UI_TO_DB
          );
        } else if (entityType === "contract") {
          transformed[key] = transformEnum(
            value as string,
            CONTRACT_STATUS_MAPPINGS.UI_TO_DB
          );
        } else if (entityType === "multiplier") {
          transformed[key] = transformEnum(
            value as string,
            MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB
          );
        } else {
          transformed[key] = value;
        }
        break;

      case "role":
        transformed[key] = transformEnum(
          value as string,
          ROLE_MAPPINGS.UI_TO_DB
        );
        break;

      case "cropType":
        transformed[key] = transformEnum(
          value as string,
          CROP_TYPE_MAPPINGS.UI_TO_DB
        );
        break;

      case "certificationLevel":
        transformed[key] = transformEnum(
          value as string,
          CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB
        );
        break;

      case "type":
        if (entityType === "activity") {
          transformed[key] = transformEnum(
            value as string,
            ACTIVITY_TYPE_MAPPINGS.UI_TO_DB
          );
        } else if (entityType === "issue") {
          transformed[key] = transformEnum(
            value as string,
            ISSUE_TYPE_MAPPINGS.UI_TO_DB
          );
        } else if (obj.reportType !== undefined) {
          transformed[key] = transformEnum(
            value as string,
            REPORT_TYPE_MAPPINGS.UI_TO_DB
          );
        } else {
          transformed[key] = value;
        }
        break;

      case "severity":
        transformed[key] = transformEnum(
          value as string,
          ISSUE_SEVERITY_MAPPINGS.UI_TO_DB
        );
        break;

      case "result":
        transformed[key] = transformEnum(
          value as string,
          TEST_RESULT_MAPPINGS.UI_TO_DB
        );
        break;

      case "level":
        transformed[key] = transformEnum(
          value as string,
          SEED_LEVEL_MAPPINGS.UI_TO_DB
        );
        break;

      case "specialization":
        if (Array.isArray(value)) {
          transformed[key] = value.map((v: string) =>
            transformEnum(v, CROP_TYPE_MAPPINGS.UI_TO_DB)
          );
        } else {
          transformed[key] = value;
        }
        break;

      default:
        // Récursion sur les objets imbriqués
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          transformed[key] = transformObjectUIToDB(value);
        } else if (Array.isArray(value)) {
          transformed[key] = value.map((item) =>
            typeof item === "object" ? transformObjectUIToDB(item) : item
          );
        } else {
          transformed[key] = value;
        }
    }
  }

  return transformed;
}

/**
 * Transforme un objet du format DB vers l'UI
 */
export function transformObjectDBToUI(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => transformObjectDBToUI(item));
  }

  const transformed: any = {};
  const entityType = detectEntityType(obj);

  for (const [key, value] of Object.entries(obj)) {
    // Transformer selon le type de champ et le contexte
    switch (key) {
      case "status":
        // Déterminer le bon mapping selon l'entité
        if (entityType === "seedLot") {
          transformed[key] = transformEnum(
            value as string,
            LOT_STATUS_MAPPINGS.DB_TO_UI
          );
        } else if (entityType === "parcel") {
          transformed[key] = transformEnum(
            value as string,
            PARCEL_STATUS_MAPPINGS.DB_TO_UI
          );
        } else if (entityType === "production") {
          transformed[key] = transformEnum(
            value as string,
            PRODUCTION_STATUS_MAPPINGS.DB_TO_UI
          );
        } else if (entityType === "contract") {
          transformed[key] = transformEnum(
            value as string,
            CONTRACT_STATUS_MAPPINGS.DB_TO_UI
          );
        } else if (entityType === "multiplier") {
          transformed[key] = transformEnum(
            value as string,
            MULTIPLIER_STATUS_MAPPINGS.DB_TO_UI
          );
        } else {
          transformed[key] = value;
        }
        break;

      case "role":
        transformed[key] = transformEnum(
          value as string,
          ROLE_MAPPINGS.DB_TO_UI
        );
        break;

      case "cropType":
        transformed[key] = transformEnum(
          value as string,
          CROP_TYPE_MAPPINGS.DB_TO_UI
        );
        break;

      case "certificationLevel":
        transformed[key] = transformEnum(
          value as string,
          CERTIFICATION_LEVEL_MAPPINGS.DB_TO_UI
        );
        break;

      case "type":
        if (entityType === "activity") {
          transformed[key] = transformEnum(
            value as string,
            ACTIVITY_TYPE_MAPPINGS.DB_TO_UI
          );
        } else if (entityType === "issue") {
          transformed[key] = transformEnum(
            value as string,
            ISSUE_TYPE_MAPPINGS.DB_TO_UI
          );
        } else if (obj.reportType !== undefined) {
          transformed[key] = transformEnum(
            value as string,
            REPORT_TYPE_MAPPINGS.DB_TO_UI
          );
        } else {
          transformed[key] = value;
        }
        break;

      case "severity":
        transformed[key] = transformEnum(
          value as string,
          ISSUE_SEVERITY_MAPPINGS.DB_TO_UI
        );
        break;

      case "result":
        transformed[key] = transformEnum(
          value as string,
          TEST_RESULT_MAPPINGS.DB_TO_UI
        );
        break;

      case "level":
        transformed[key] = transformEnum(
          value as string,
          SEED_LEVEL_MAPPINGS.DB_TO_UI
        );
        break;

      case "specialization":
        if (Array.isArray(value)) {
          transformed[key] = value.map((v: string) =>
            transformEnum(v, CROP_TYPE_MAPPINGS.DB_TO_UI)
          );
        } else {
          transformed[key] = value;
        }
        break;

      default:
        // Récursion sur les objets imbriqués
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          transformed[key] = transformObjectDBToUI(value);
        } else if (Array.isArray(value)) {
          transformed[key] = value.map((item) =>
            typeof item === "object" ? transformObjectDBToUI(item) : item
          );
        } else {
          transformed[key] = value;
        }
    }
  }

  return transformed;
}

// ===== HELPERS POUR DEBUGGING =====

/**
 * Log les transformations en développement
 */
export function logTransformation(
  original: any,
  transformed: any,
  direction: TransformDirection
): void {
  if (process.env.NODE_ENV === "development") {
    logger.debug(`🔄 Transformation ${direction}:`, {
      original,
      transformed,
      entityType: detectEntityType(original),
    });
  }
}

/**
 * Valide qu'une transformation est réversible
 */
export function validateTransformation(obj: any): boolean {
  try {
    const toDb = transformObjectUIToDB(obj);
    const backToUi = transformObjectDBToUI(toDb);

    // Vérifier que les transformations sont réversibles
    const isValid = JSON.stringify(obj) === JSON.stringify(backToUi);

    if (!isValid && process.env.NODE_ENV === "development") {
      logger.warn("⚠️ Transformation non réversible détectée:", {
        original: obj,
        afterRoundTrip: backToUi,
      });
    }

    return isValid;
  } catch (error) {
    logger.error("❌ Erreur lors de la validation de transformation:", error);
    return false;
  }
}

// ===== EXPORTS =====
export default {
  transformObjectUIToDB,
  transformObjectDBToUI,
  transformQueryParams,
  logTransformation,
  validateTransformation,
};
