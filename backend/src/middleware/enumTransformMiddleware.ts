// backend/src/middleware/enumTransformMiddleware.ts - VERSION CORRIGÉE FINALE

import { Request, Response, NextFunction } from "express";
import {
  transformEnum,
  ENUM_MAPPINGS,
  debugTransformation,
} from "../config/enumMappings";

/**
 * ✅ MIDDLEWARE DE TRANSFORMATION PRINCIPALE - CORRIGÉE
 * Transforme automatiquement les enums entre les formats UI et DB
 */
export const enumTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("🔄 [MIDDLEWARE] Starting enum transformation");

  // ✅ Paramètres système à ne jamais transformer
  const systemParams = [
    "page",
    "pageSize",
    "sortBy",
    "sortOrder",
    "search",
    "includeRelations",
    "includeExpired",
    "includeInactive",
    "full",
    "format",
    "size",
    "maxDepth",
  ];

  // ✅ SECTION 1: Transformation des données de requête (UI → DB)
  if (req.body && typeof req.body === "object") {
    console.log("🔄 [MIDDLEWARE] Transforming request body:", req.body);
    req.body = transformRequestData(req.body);
    console.log("✅ [MIDDLEWARE] Transformed body:", req.body);
  }

  // ✅ SECTION 2: Transformation des query parameters
  if (req.query && typeof req.query === "object") {
    console.log("🔄 [MIDDLEWARE] Transforming query params:", req.query);

    const transformedQuery: any = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (systemParams.includes(key)) {
        // Gérer les paramètres système spécialement
        transformedQuery[key] = handleSystemParam(key, value);
      } else if (
        ["varietyId", "multiplierId", "parcelId", "inspectorId"].includes(key)
      ) {
        // Convertir les IDs en nombres
        transformedQuery[key] = parseId(value);
      } else {
        // ✅ TRANSFORMATION DES ENUMS QUERY
        transformedQuery[key] = transformQueryParam(key, value);
      }
    }

    req.query = transformedQuery;
    console.log("✅ [MIDDLEWARE] Transformed query:", req.query);
  }

  // ✅ SECTION 3: Intercepter la réponse pour transformer (DB → UI)
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer les erreurs de validation
    if (data && data.success === false && data.errors) {
      return originalJson(data);
    }

    // Transformer toutes les réponses sauf les erreurs
    if (data && typeof data === "object") {
      console.log("🔄 [MIDDLEWARE] Transforming response data");
      data = transformResponseData(data);
      console.log("✅ [MIDDLEWARE] Transformed response data");
    }
    return originalJson(data);
  };

  next();
};

/**
 * ✅ GESTION DES PARAMÈTRES SYSTÈME - CORRIGÉE
 */
function handleSystemParam(key: string, value: any): any {
  switch (key) {
    case "includeRelations":
    case "includeExpired":
    case "includeInactive":
    case "full":
      return parseBoolean(value);

    case "page":
    case "pageSize":
    case "size":
    case "maxDepth":
      return parseNumber(key, value);

    default:
      return Array.isArray(value) ? value[0] : value;
  }
}

/**
 * ✅ TRANSFORMATION DES PARAMÈTRES DE REQUÊTE - CORRIGÉE
 */
function transformQueryParam(key: string, value: any): any {
  const actualValue = Array.isArray(value) ? value[0] : value;

  if (!actualValue || typeof actualValue !== "string") {
    return actualValue;
  }

  // ✅ MAPPING SPÉCIFIQUE DES CHAMPS QUERY
  switch (key) {
    case "status":
      // Détecter le contexte pour le bon type de status
      if (key === "status") {
        // Par défaut, considérer comme LOT_STATUS
        return transformEnum(actualValue, "LOT_STATUS", "UI_TO_DB");
      }
      break;

    case "level":
    case "seedLevel":
      return actualValue.toUpperCase(); // Seed levels restent identiques

    case "cropType":
      return transformEnum(actualValue, "CROP_TYPE", "UI_TO_DB");

    case "role":
      return transformEnum(actualValue, "USER_ROLE", "UI_TO_DB");

    case "result":
    case "testResult":
      return transformEnum(actualValue, "TEST_RESULT", "UI_TO_DB");

    case "severity":
    case "issueSeverity":
      return transformEnum(actualValue, "ISSUE_SEVERITY", "UI_TO_DB");

    default:
      return actualValue;
  }
}

/**
 * ✅ TRANSFORMATION DES DONNÉES DE REQUÊTE (UI → DB) - CORRIGÉE
 */
function transformRequestData(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformRequestData(item));
  }

  const transformed = { ...data };

  // ✅ MAPPING COMPLET DES CHAMPS AVEC GESTION D'ERREURS
  const fieldMappings: Record<
    string,
    { enumType: keyof typeof ENUM_MAPPINGS; specialHandling?: boolean }
  > = {
    status: { enumType: "LOT_STATUS" },
    level: { enumType: "SEED_LEVEL", specialHandling: true },
    seedLevel: { enumType: "SEED_LEVEL", specialHandling: true },
    cropType: { enumType: "CROP_TYPE" },
    role: { enumType: "USER_ROLE" },
    type: { enumType: "ACTIVITY_TYPE" }, // Par défaut
    activityType: { enumType: "ACTIVITY_TYPE" },
    issueType: { enumType: "ISSUE_TYPE" },
    reportType: { enumType: "REPORT_TYPE" },
    result: { enumType: "TEST_RESULT" },
    testResult: { enumType: "TEST_RESULT" },
    certificationLevel: { enumType: "CERTIFICATION_LEVEL" },
    severity: { enumType: "ISSUE_SEVERITY" },
    issueSeverity: { enumType: "ISSUE_SEVERITY" },
  };

  // Appliquer les transformations
  for (const [field, config] of Object.entries(fieldMappings)) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      const originalValue = transformed[field];

      try {
        const valueToTransform = Array.isArray(originalValue)
          ? originalValue[0]
          : originalValue;

        if (typeof valueToTransform === "string") {
          if (
            config.specialHandling &&
            (field === "level" || field === "seedLevel")
          ) {
            // Seed levels : toujours en majuscules
            transformed[field] = valueToTransform.toUpperCase();
          } else {
            // Transformation normale
            if (process.env.NODE_ENV === "development") {
              debugTransformation(
                valueToTransform,
                config.enumType,
                "UI_TO_DB"
              );
            }

            transformed[field] = transformEnum(
              valueToTransform,
              config.enumType,
              "UI_TO_DB"
            );
          }
        }
      } catch (error) {
        console.warn(
          `Failed to transform field "${field}" with value "${originalValue}":`,
          error
        );
        transformed[field] = originalValue; // Garder la valeur originale en cas d'erreur
      }
    }
  }

  // ✅ Gérer les cas spéciaux
  if (transformed.seedLevel && !transformed.level) {
    transformed.level = transformed.seedLevel;
    delete transformed.seedLevel;
  }

  // ✅ Transformation récursive avec protection contre les cycles
  const visited = new WeakSet();
  for (const key in transformed) {
    const value = transformed[key];
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !visited.has(value)
    ) {
      visited.add(value);
      transformed[key] = transformRequestData(value);
    }
  }

  return transformed;
}

/**
 * ✅ TRANSFORMATION DES DONNÉES DE RÉPONSE (DB → UI) - CORRIGÉE
 */
function transformResponseData(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformResponseData(item));
  }

  const transformed = { ...data };

  // ✅ Transformer la structure de réponse API
  if (transformed.data !== undefined) {
    if (Array.isArray(transformed.data)) {
      transformed.data = transformed.data.map((item: any) =>
        transformResponseData(item)
      );
    } else if (
      typeof transformed.data === "object" &&
      transformed.data !== null
    ) {
      transformed.data = transformResponseData(transformed.data);
    }
  }

  // ✅ MAPPING COMPLET DES CHAMPS DE RÉPONSE
  const responseFieldMappings: Record<
    string,
    { enumType: keyof typeof ENUM_MAPPINGS; specialHandling?: boolean }
  > = {
    status: { enumType: "LOT_STATUS" },
    level: { enumType: "SEED_LEVEL", specialHandling: true },
    seedLevel: { enumType: "SEED_LEVEL", specialHandling: true },
    cropType: { enumType: "CROP_TYPE" },
    role: { enumType: "USER_ROLE" },
    type: { enumType: "ACTIVITY_TYPE" }, // Par défaut
    activityType: { enumType: "ACTIVITY_TYPE" },
    issueType: { enumType: "ISSUE_TYPE" },
    reportType: { enumType: "REPORT_TYPE" },
    result: { enumType: "TEST_RESULT" },
    testResult: { enumType: "TEST_RESULT" },
    certificationLevel: { enumType: "CERTIFICATION_LEVEL" },
    severity: { enumType: "ISSUE_SEVERITY" },
    issueSeverity: { enumType: "ISSUE_SEVERITY" },
  };

  // Appliquer les transformations de réponse
  for (const [field, config] of Object.entries(responseFieldMappings)) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      const originalValue = transformed[field];

      try {
        if (typeof originalValue === "string") {
          if (
            config.specialHandling &&
            (field === "level" || field === "seedLevel")
          ) {
            // Seed levels restent identiques (déjà en majuscules)
            transformed[field] = originalValue;
          } else {
            // Transformation normale DB → UI
            transformed[field] = transformEnum(
              originalValue,
              config.enumType,
              "DB_TO_UI"
            );
          }
        }
      } catch (error) {
        console.warn(
          `Failed to transform response field "${field}" with value "${originalValue}":`,
          error
        );
        transformed[field] = originalValue;
      }
    }
  }

  // ✅ Transformation récursive des objets imbriqués
  const visited = new WeakSet();
  for (const key in transformed) {
    const value = transformed[key];
    if (
      typeof value === "object" &&
      value !== null &&
      key !== "data" && // Éviter la double transformation
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !visited.has(value)
    ) {
      visited.add(value);
      transformed[key] = transformResponseData(value);
    }
  }

  return transformed;
}

/**
 * ✅ FONCTIONS UTILITAIRES - CORRIGÉES
 */
function parseBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  if (Array.isArray(value)) {
    return value[0] && String(value[0]).toLowerCase() === "true";
  }
  return Boolean(value);
}

function parseNumber(key: string, value: any): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numValue =
    typeof rawValue === "string" ? parseInt(rawValue, 10) : rawValue;

  // Valeurs par défaut selon le type
  const defaults: Record<string, number> = {
    page: 1,
    pageSize: 10,
    size: 300,
    maxDepth: 10,
  };

  if (isNaN(numValue)) {
    return defaults[key] || 1;
  }

  // Contraintes spécifiques
  switch (key) {
    case "page":
      return Math.max(1, numValue);
    case "pageSize":
      return Math.min(Math.max(1, numValue), 100);
    case "size":
      return Math.min(Math.max(50, numValue), 1000);
    case "maxDepth":
      return Math.min(Math.max(1, numValue), 20);
    default:
      return numValue;
  }
}

function parseId(value: any): number | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numValue =
    typeof rawValue === "string" ? parseInt(rawValue, 10) : rawValue;
  return isNaN(numValue) || numValue <= 0 ? undefined : numValue;
}

/**
 * ✅ EXPORTS SPÉCIALISÉS
 */
export const seedLotTransformMiddleware = enumTransformMiddleware;
export const varietyTransformMiddleware = enumTransformMiddleware;
export const multiplierTransformMiddleware = enumTransformMiddleware;
export const parcelTransformMiddleware = enumTransformMiddleware;
export const productionTransformMiddleware = enumTransformMiddleware;
export const qualityControlTransformMiddleware = enumTransformMiddleware;
export const userTransformMiddleware = enumTransformMiddleware;
export const fullTransformation = enumTransformMiddleware;

/**
 * ✅ MIDDLEWARE DE DEBUG POUR LE DÉVELOPPEMENT
 */
export const debugTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [DEBUG] Original Query:", req.query);
    console.log("🔍 [DEBUG] Original Body:", req.body);

    enumTransformMiddleware(req, res, () => {
      console.log("✅ [DEBUG] Transformed Query:", req.query);
      console.log("✅ [DEBUG] Transformed Body:", req.body);
      next();
    });
  } else {
    enumTransformMiddleware(req, res, next);
  }
};
