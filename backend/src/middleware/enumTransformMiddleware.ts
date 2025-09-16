// backend/src/middleware/enumTransformMiddleware.ts - VERSION CORRIGÉE FINALE

import { Request, Response, NextFunction } from "express";
import { ENUM_MAPPINGS, transformEnum } from "../config/enumMappings";

/**
 * ✅ CORRECTION: Middleware de transformation générique et robuste
 * Transforme automatiquement les enums entre les formats UI et DB
 */
export const enumTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Paramètres système à ne jamais transformer
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

  // ✅ CORRECTION: Transformation robuste des données de requête (UI -> DB)
  if (req.body && typeof req.body === "object") {
    req.body = transformRequestData(req.body);
  }

  // ✅ CORRECTION: Transformation robuste des query parameters
  if (req.query && typeof req.query === "object") {
    const transformedQuery: any = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (systemParams.includes(key)) {
        // ✅ CORRECTION: Gérer les paramètres système spécialement
        transformedQuery[key] = handleSystemParam(key, value);
      } else if (
        ["varietyId", "multiplierId", "parcelId", "inspectorId"].includes(key)
      ) {
        // ✅ CORRECTION: Convertir les IDs en nombres
        const numValue = Array.isArray(value)
          ? parseInt(value[0] as string, 10)
          : parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          transformedQuery[key] = numValue;
        }
      } else {
        // ✅ CORRECTION: Transformer les enums seulement
        transformedQuery[key] = transformRequestData({ [key]: value })[key];
      }
    }

    req.query = transformedQuery;
  }

  // ✅ CORRECTION: Intercepter la réponse pour transformer (DB -> UI)
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer les erreurs de validation
    if (data && data.success === false && data.errors) {
      return originalJson(data);
    }

    // Transformer toutes les réponses sauf les erreurs
    if (data && typeof data === "object") {
      data = transformResponseData(data);
    }
    return originalJson(data);
  };

  next();
};

/**
 * ✅ CORRECTION: Gestion spécialisée des paramètres système
 */
function handleSystemParam(key: string, value: any): any {
  switch (key) {
    case "includeRelations":
    case "includeExpired":
    case "includeInactive":
    case "full":
      // ✅ CORRECTION: Conversion robuste string -> boolean
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        return value.toLowerCase() === "true";
      }
      if (Array.isArray(value)) {
        return value[0] && String(value[0]).toLowerCase() === "true";
      }
      return Boolean(value);

    case "page":
    case "pageSize":
    case "size":
    case "maxDepth":
      // ✅ CORRECTION: Conversion robuste string/array -> number
      const rawValue = Array.isArray(value) ? value[0] : value;
      const numValue =
        typeof rawValue === "string" ? parseInt(rawValue, 10) : rawValue;
      if (key === "page") return isNaN(numValue) || numValue < 1 ? 1 : numValue;
      if (key === "pageSize")
        return isNaN(numValue) || numValue < 1 ? 10 : Math.min(numValue, 100);
      if (key === "maxDepth")
        return isNaN(numValue) || numValue < 1 ? 10 : Math.min(numValue, 20);
      if (key === "size")
        return isNaN(numValue) || numValue < 50
          ? 300
          : Math.min(numValue, 1000);
      return isNaN(numValue) ? undefined : numValue;

    default:
      // ✅ CORRECTION: Gérer les arrays de query params
      return Array.isArray(value) ? value[0] : value;
  }
}

/**
 * ✅ CORRECTION: Transformer les données de requête (UI -> DB) de façon récursive
 */
function transformRequestData(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformRequestData(item));
  }

  const transformed = { ...data };

  // ✅ CORRECTION: Mapping complet des champs d'enum avec gestion d'erreurs
  const enumFieldMappings: Record<string, string[]> = {
    status: [
      "LOT_STATUS",
      "PARCEL_STATUS",
      "PRODUCTION_STATUS",
      "CONTRACT_STATUS",
      "MULTIPLIER_STATUS",
    ],
    level: ["SEED_LEVEL"],
    seedLevel: ["SEED_LEVEL"],
    cropType: ["CROP_TYPE"],
    role: ["USER_ROLE"],
    type: ["ACTIVITY_TYPE", "ISSUE_TYPE", "REPORT_TYPE"],
    activityType: ["ACTIVITY_TYPE"],
    issueType: ["ISSUE_TYPE"],
    reportType: ["REPORT_TYPE"],
    result: ["TEST_RESULT"],
    testResult: ["TEST_RESULT"],
    certificationLevel: ["CERTIFICATION_LEVEL"],
    severity: ["ISSUE_SEVERITY"],
    issueSeverity: ["ISSUE_SEVERITY"],
  };

  for (const [field, enumTypes] of Object.entries(enumFieldMappings)) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      const originalValue = transformed[field];

      try {
        // ✅ CORRECTION: Gérer les arrays de query params
        const valueToTransform = Array.isArray(originalValue)
          ? originalValue[0]
          : originalValue;

        if (typeof valueToTransform === "string") {
          // ✅ CORRECTION: Pour les seed levels, toujours en majuscules
          if (field === "level" || field === "seedLevel") {
            transformed[field] = valueToTransform.toUpperCase();
          } else {
            // ✅ CORRECTION: Essayer chaque type d'enum jusqu'à trouver une correspondance
            let transformedValue = valueToTransform;
            for (const enumType of enumTypes) {
              const mappedValue = transformEnum(
                valueToTransform,
                enumType as keyof typeof ENUM_MAPPINGS,
                "UI_TO_DB"
              );
              if (mappedValue !== valueToTransform) {
                transformedValue = mappedValue;
                break;
              }
            }
            transformed[field] = transformedValue;
          }
        }
      } catch (error) {
        // ✅ CORRECTION: En cas d'erreur, garder la valeur originale et logger
        console.warn(
          `Failed to transform enum field "${field}" with value "${originalValue}":`,
          error
        );
        transformed[field] = originalValue;
      }
    }
  }

  // ✅ CORRECTION: Gérer le cas spécial seedLevel -> level pour compatibilité
  if (transformed.seedLevel && !transformed.level) {
    transformed.level = transformed.seedLevel;
    delete transformed.seedLevel;
  }

  // ✅ CORRECTION: Transformation récursive avec protection contre les cycles
  const visitedObjects = new WeakSet();

  for (const key in transformed) {
    const value = transformed[key];
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !visitedObjects.has(value)
    ) {
      visitedObjects.add(value);
      transformed[key] = transformRequestData(value);
    }
  }

  return transformed;
}

/**
 * ✅ CORRECTION: Transformer les données de réponse (DB -> UI) de façon récursive
 */
function transformResponseData(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformResponseData(item));
  }

  const transformed = { ...data };

  // ✅ CORRECTION: Transformer spécifiquement la structure de réponse API
  if (transformed.data !== undefined) {
    if (Array.isArray(transformed.data)) {
      transformed.data = (transformed.data as Record<string, any>[]).map(
        (item: Record<string, any>) => transformResponseData(item)
      );
    } else if (
      typeof transformed.data === "object" &&
      transformed.data !== null
    ) {
      transformed.data = transformResponseData(transformed.data);
    }
  }

  // ✅ CORRECTION: Mapping complet des champs d'enum pour les réponses
  const enumFieldMappings: Record<string, string[]> = {
    status: [
      "LOT_STATUS",
      "PARCEL_STATUS",
      "PRODUCTION_STATUS",
      "CONTRACT_STATUS",
      "MULTIPLIER_STATUS",
    ],
    level: ["SEED_LEVEL"],
    seedLevel: ["SEED_LEVEL"],
    cropType: ["CROP_TYPE"],
    role: ["USER_ROLE"],
    type: ["ACTIVITY_TYPE", "ISSUE_TYPE", "REPORT_TYPE"],
    activityType: ["ACTIVITY_TYPE"],
    issueType: ["ISSUE_TYPE"],
    reportType: ["REPORT_TYPE"],
    result: ["TEST_RESULT"],
    testResult: ["TEST_RESULT"],
    certificationLevel: ["CERTIFICATION_LEVEL"],
    severity: ["ISSUE_SEVERITY"],
    issueSeverity: ["ISSUE_SEVERITY"],
  };

  for (const [field, enumTypes] of Object.entries(enumFieldMappings)) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      const originalValue = transformed[field];

      try {
        if (typeof originalValue === "string") {
          // ✅ CORRECTION: Les seed levels restent identiques (déjà corrects)
          if (field === "level" || field === "seedLevel") {
            transformed[field] = originalValue;
          } else {
            // ✅ CORRECTION: Essayer chaque type d'enum jusqu'à trouver une correspondance
            let transformedValue = originalValue;
            for (const enumType of enumTypes) {
              const mappedValue = transformEnum(
                originalValue,
                enumType as keyof typeof ENUM_MAPPINGS,
                "DB_TO_UI"
              );
              if (mappedValue !== originalValue) {
                transformedValue = mappedValue;
                break;
              }
            }
            transformed[field] = transformedValue;
          }
        }
      } catch (error) {
        // ✅ CORRECTION: En cas d'erreur, garder la valeur originale et logger
        console.warn(
          `Failed to transform response enum field "${field}" with value "${originalValue}":`,
          error
        );
        transformed[field] = originalValue;
      }
    }
  }

  // ✅ CORRECTION: Transformation récursive avec protection contre les cycles
  const visitedObjects = new WeakSet();

  for (const key in transformed) {
    const value = transformed[key];
    if (
      typeof value === "object" &&
      value !== null &&
      key !== "data" && // Éviter la double transformation de data
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !visitedObjects.has(value)
    ) {
      visitedObjects.add(value);
      transformed[key] = transformResponseData(value);
    }
  }

  return transformed;
}

// ✅ CORRECTION: Exports spécialisés pour chaque module (alias pour compatibilité)
export const seedLotTransformMiddleware = enumTransformMiddleware;
export const varietyTransformMiddleware = enumTransformMiddleware;
export const multiplierTransformMiddleware = enumTransformMiddleware;
export const parcelTransformMiddleware = enumTransformMiddleware;
export const productionTransformMiddleware = enumTransformMiddleware;
export const qualityControlTransformMiddleware = enumTransformMiddleware;
export const userTransformMiddleware = enumTransformMiddleware;
export const fullTransformation = enumTransformMiddleware;

// ✅ CORRECTION: Middleware de debug pour le développement
export const debugTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔄 [Transform Debug] Original Query:", req.query);
    console.log("🔄 [Transform Debug] Original Body:", req.body);

    // Appliquer la transformation
    enumTransformMiddleware(req, res, () => {
      console.log("✅ [Transform Debug] Transformed Query:", req.query);
      console.log("✅ [Transform Debug] Transformed Body:", req.body);
      next();
    });
  } else {
    enumTransformMiddleware(req, res, next);
  }
};
