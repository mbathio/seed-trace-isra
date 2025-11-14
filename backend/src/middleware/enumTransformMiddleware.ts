// backend/src/middleware/enumTransformMiddleware.ts - VERSION CORRIGÉE CONTEXTUELLE

import { Request, Response, NextFunction } from "express";
import {
  transformEnum,
  ENUM_MAPPINGS,
  debugTransformation,
} from "../config/enumMappings";

/**
 * ✅ MIDDLEWARE DE TRANSFORMATION PRINCIPALE (UI⇄DB) AVEC CONTEXTE DE ROUTE
 * - Status des productions → PRODUCTION_STATUS
 * - Status des parcelles → PARCEL_STATUS
 * - Status des lots → LOT_STATUS (fallback)
 * - /productions/:id/issues    → type = ISSUE_TYPE
 * - /productions/:id/activities→ type = ACTIVITY_TYPE
 */
export const enumTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("🔄 [MIDDLEWARE] Starting enum transformation");

  // Rendre le path disponible aux helpers de mapping
  (global as any).__current_request_path = req.path || "";

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

  // ✅ SECTION 1: Transformation du body (UI → DB)
  if (req.body && typeof req.body === "object") {
    console.log("🔄 [MIDDLEWARE] Transforming request body:", req.body);
    req.body = transformRequestData(req.body);
    console.log("✅ [MIDDLEWARE] Transformed body:", req.body);
  }

  // ✅ SECTION 2: Transformation des query params (UI → DB)
  if (req.query && typeof req.query === "object") {
    console.log("🔄 [MIDDLEWARE] Transforming query params:", req.query);

    const transformedQuery: any = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (systemParams.includes(key)) {
        transformedQuery[key] = handleSystemParam(key, value);
      } else if (
        [
          "varietyId",
          "multiplierId",
          "parcelId",
          "inspectorId",
          "productionId",
        ].includes(key)
      ) {
        transformedQuery[key] = parseId(value);
      } else {
        transformedQuery[key] = transformQueryParam(key, value);
      }
    }

    req.query = transformedQuery;
    console.log("✅ [MIDDLEWARE] Transformed query:", req.query);
  }

  // ✅ SECTION 3: Intercepter la réponse (DB → UI)
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer les erreurs de validation structurées
    if (data && data.success === false && data.errors) {
      return originalJson(data);
    }

    if (data && typeof data === "object") {
      console.log("🔄 [MIDDLEWARE] Transforming response data");
      data = transformResponseData(data);
      console.log("✅ [MIDDLEWARE] Transformed response data");
    }
    return originalJson(data);
  };

  next();
};

/* -------------------------- Helpers de contexte -------------------------- */

function getPath(): string {
  return (global as any).__current_request_path || "";
}

function isProductions(): boolean {
  return getPath().includes("/productions");
}

function isProductionIssues(): boolean {
  const p = getPath();
  return p.includes("/productions") && p.includes("/issues");
}

function isProductionActivities(): boolean {
  const p = getPath();
  return p.includes("/productions") && p.includes("/activities");
}

function isParcels(): boolean {
  return getPath().includes("/parcels");
}

function isSeedLots(): boolean {
  return getPath().includes("/seed-lots") || getPath().includes("/seedlots");
}

/* ----------------------- Gestion des paramètres système ------------------ */

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

/* -------------------- Transformation des query params -------------------- */

function transformQueryParam(key: string, value: any): any {
  const actualValue = Array.isArray(value) ? value[0] : value;
  if (!actualValue || typeof actualValue !== "string") return actualValue;

  switch (key) {
    case "status": {
      // ✅ Contexte de status
      if (isProductions()) {
        return transformEnum(actualValue, "PRODUCTION_STATUS", "UI_TO_DB");
      }
      if (isParcels()) {
        return transformEnum(actualValue, "PARCEL_STATUS", "UI_TO_DB");
      }
      if (isSeedLots()) {
        return transformEnum(actualValue, "LOT_STATUS", "UI_TO_DB");
      }
      // Fallback (historique)
      return transformEnum(actualValue, "LOT_STATUS", "UI_TO_DB");
    }

    case "level":
    case "seedLevel":
      return actualValue.toUpperCase();

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

/* --------------- Transformation du body (UI → DB) contextuel ------------- */

function transformRequestData(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data))
    return data.map((item) => transformRequestData(item));

  const transformed = { ...data };

  // Table générique (sera surchargée par contexte ci-dessous)
  const fieldMappings: Record<
    string,
    { enumType: keyof typeof ENUM_MAPPINGS; specialHandling?: boolean }
  > = {
    status: { enumType: "LOT_STATUS" }, // Fallback
    level: { enumType: "SEED_LEVEL", specialHandling: true },
    seedLevel: { enumType: "SEED_LEVEL", specialHandling: true },
    cropType: { enumType: "CROP_TYPE" },
    role: { enumType: "USER_ROLE" },
    type: { enumType: "ACTIVITY_TYPE" }, // Fallback
    activityType: { enumType: "ACTIVITY_TYPE" },
    issueType: { enumType: "ISSUE_TYPE" },
    reportType: { enumType: "REPORT_TYPE" },
    result: { enumType: "TEST_RESULT" },
    testResult: { enumType: "TEST_RESULT" },
    certificationLevel: { enumType: "CERTIFICATION_LEVEL" },
    severity: { enumType: "ISSUE_SEVERITY" },
    issueSeverity: { enumType: "ISSUE_SEVERITY" },
  };

  // ✅ Surcharges contextuelles
  if (isProductions()) {
    fieldMappings.status.enumType = "PRODUCTION_STATUS";
    if (isProductionIssues()) fieldMappings.type.enumType = "ISSUE_TYPE";
    if (isProductionActivities()) fieldMappings.type.enumType = "ACTIVITY_TYPE";
  } else if (isParcels()) {
    fieldMappings.status.enumType = "PARCEL_STATUS";
  } else if (isSeedLots()) {
    fieldMappings.status.enumType = "LOT_STATUS";
  }

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
            transformed[field] = valueToTransform.toUpperCase();
          } else {
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
        transformed[field] = originalValue;
      }
    }
  }

  // Seed level alias
  if (transformed.seedLevel && !transformed.level) {
    transformed.level = transformed.seedLevel;
    delete transformed.seedLevel;
  }

  // Récursif sûr
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

/* --------------- Transformation de la réponse (DB → UI) contextuelle ----- */

function transformResponseData(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data))
    return data.map((item) => transformResponseData(item));

  const transformed = { ...data };

  // Adaptation pour enveloppes { data, ... }
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

  // Mapping contextuel pour chaque champ
  for (const field of Object.keys(transformed)) {
    const originalValue = transformed[field];
    if (originalValue === undefined || originalValue === null) continue;
    if (typeof originalValue !== "string") continue;

    const enumType = getEnumTypeForResponse(field);
    if (!enumType) continue;

    try {
      transformed[field] = transformEnum(
        originalValue,
        enumType as any,
        "DB_TO_UI"
      );
    } catch (error) {
      console.warn(
        `Failed to transform response field "${field}" with value "${originalValue}":`,
        error
      );
      transformed[field] = originalValue;
    }
  }

  // Récursif sûr
  const visited = new WeakSet();
  for (const key in transformed) {
    const value = transformed[key];
    if (
      typeof value === "object" &&
      value !== null &&
      key !== "data" &&
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

/** Retourne l’enum approprié pour un champ de réponse selon le contexte */
function getEnumTypeForResponse(
  field: string
): keyof typeof ENUM_MAPPINGS | undefined {
  if (isProductions()) {
    if (field === "status") return "PRODUCTION_STATUS";
    if (isProductionIssues() && field === "type") return "ISSUE_TYPE";
    if (isProductionActivities() && field === "type") return "ACTIVITY_TYPE";
  } else if (isParcels()) {
    if (field === "status") return "PARCEL_STATUS";
  } else if (isSeedLots()) {
    if (field === "status") return "LOT_STATUS";
  }

  // Fallback générique pour autres champs connus
  switch (field) {
    case "level":
    case "seedLevel":
      return "SEED_LEVEL";
    case "cropType":
      return "CROP_TYPE";
    case "role":
      return "USER_ROLE";
    case "result":
    case "testResult":
      return "TEST_RESULT";
    case "certificationLevel":
      return "CERTIFICATION_LEVEL";
    case "severity":
    case "issueSeverity":
      return "ISSUE_SEVERITY";
    case "activityType":
      return "ACTIVITY_TYPE";
    case "issueType":
      return "ISSUE_TYPE";
    case "reportType":
      return "REPORT_TYPE";
    default:
      return undefined;
  }
}

/* ------------------------------ Utilitaires ------------------------------ */

function parseBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (Array.isArray(value))
    return !!value[0] && String(value[0]).toLowerCase() === "true";
  return Boolean(value);
}

function parseNumber(key: string, value: any): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numValue =
    typeof rawValue === "string" ? parseInt(rawValue, 10) : rawValue;

  const defaults: Record<string, number> = {
    page: 1,
    pageSize: 10,
    size: 300,
    maxDepth: 10,
  };

  if (isNaN(numValue)) return defaults[key] || 1;

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

/* --------------------------- Exports spécialisés ------------------------- */

export const seedLotTransformMiddleware = enumTransformMiddleware;
export const varietyTransformMiddleware = enumTransformMiddleware;
export const multiplierTransformMiddleware = enumTransformMiddleware;
export const parcelTransformMiddleware = enumTransformMiddleware;
export const productionTransformMiddleware = enumTransformMiddleware;
export const qualityControlTransformMiddleware = enumTransformMiddleware;
export const userTransformMiddleware = enumTransformMiddleware;
export const fullTransformation = enumTransformMiddleware;

/* -------------------------- Debug (dev only) ------------------------------ */

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
