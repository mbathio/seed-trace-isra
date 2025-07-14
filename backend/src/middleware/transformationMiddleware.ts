// backend/src/middleware/transformationMiddleware.ts - VERSION CORRIGÉE
import { Request, Response, NextFunction } from "express";
import { transformEnum, ENUM_MAPPINGS } from "../config/enumMappings";

export const enumTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Paramètres système à ne pas transformer
  const systemParams = [
    "page",
    "pageSize",
    "sortBy",
    "sortOrder",
    "search",
    "includeRelations",
    "includeExpired",
    "includeInactive",
  ];

  // Transformer les données de requête (UI -> DB)
  if (req.body) {
    req.body = transformRequestData(req.body);
  }

  if (req.query) {
    const transformedQuery: any = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (systemParams.includes(key)) {
        // Gérer les paramètres système spécialement
        if (
          key === "includeRelations" ||
          key === "includeExpired" ||
          key === "includeInactive"
        ) {
          // Convertir string en boolean
          transformedQuery[key] = value === "true";
        } else if (key === "page" || key === "pageSize") {
          // Convertir en nombre
          const numValue = parseInt(value as string, 10);
          transformedQuery[key] = isNaN(numValue)
            ? key === "page"
              ? 1
              : 10
            : numValue;
        } else {
          transformedQuery[key] = value;
        }
      } else if (
        key === "varietyId" ||
        key === "multiplierId" ||
        key === "parcelId"
      ) {
        // Convertir les IDs en nombres
        const numValue = parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          transformedQuery[key] = numValue;
        }
      } else {
        // Transformer les enums
        transformedQuery[key] = transformRequestData({ [key]: value })[key];
      }
    }

    req.query = transformedQuery;
  }

  // Intercepter la réponse pour transformer (DB -> UI)
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (data && data.success === false && data.errors) {
      return originalJson(data);
    }

    if (data && typeof data === "object") {
      data = transformResponseData(data);
    }
    return originalJson(data);
  };

  next();
};

// Transformer les données de requête (UI -> DB)
function transformRequestData(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformRequestData(item));
  }

  const transformed = { ...data };

  // Transformer les champs d'enum connus
  const enumFields = {
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
    result: ["TEST_RESULT"],
    certificationLevel: ["CERTIFICATION_LEVEL"],
    severity: ["ISSUE_SEVERITY"],
  };

  for (const [field, enumTypes] of Object.entries(enumFields)) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      // Pour les niveaux de semences, toujours en majuscules
      if (field === "level" || field === "seedLevel") {
        transformed[field] = String(transformed[field]).toUpperCase();
      } else {
        // Essayer chaque type d'enum jusqu'à trouver une correspondance
        for (const enumType of enumTypes) {
          const mappedValue = transformEnum(
            transformed[field],
            enumType as keyof typeof ENUM_MAPPINGS,
            "UI_TO_DB"
          );
          if (mappedValue !== transformed[field]) {
            transformed[field] = mappedValue;
            break;
          }
        }
      }
    }
  }

  // Transformer récursivement les objets imbriqués
  for (const key in transformed) {
    if (
      typeof transformed[key] === "object" &&
      transformed[key] !== null &&
      !Array.isArray(transformed[key]) &&
      !(transformed[key] instanceof Date)
    ) {
      transformed[key] = transformRequestData(transformed[key]);
    }
  }

  return transformed;
}

// Transformer les données de réponse (DB -> UI)
function transformResponseData(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformResponseData(item));
  }

  const transformed = { ...data };

  // Transformer spécifiquement la structure de réponse API
  if (transformed.data) {
    transformed.data = transformResponseData(transformed.data);
  }

  // Transformer les champs d'enum connus
  const enumFields = {
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
    result: ["TEST_RESULT"],
    certificationLevel: ["CERTIFICATION_LEVEL"],
    severity: ["ISSUE_SEVERITY"],
  };

  for (const [field, enumTypes] of Object.entries(enumFields)) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      // Les niveaux de semences restent identiques (déjà en majuscules)
      if (field === "level" || field === "seedLevel") {
        transformed[field] = String(transformed[field]);
      } else {
        // Essayer chaque type d'enum jusqu'à trouver une correspondance
        for (const enumType of enumTypes) {
          const mappedValue = transformEnum(
            transformed[field],
            enumType as keyof typeof ENUM_MAPPINGS,
            "DB_TO_UI"
          );
          if (mappedValue !== transformed[field]) {
            transformed[field] = mappedValue;
            break;
          }
        }
      }
    }
  }

  // Transformer récursivement les objets imbriqués
  for (const key in transformed) {
    if (
      typeof transformed[key] === "object" &&
      transformed[key] !== null &&
      key !== "data" &&
      !Array.isArray(transformed[key]) &&
      !(transformed[key] instanceof Date)
    ) {
      transformed[key] = transformResponseData(transformed[key]);
    }
  }

  return transformed;
}

export const seedLotTransformMiddleware = enumTransformMiddleware;
export const varietyTransformMiddleware = enumTransformMiddleware;
export const multiplierTransformMiddleware = enumTransformMiddleware;
export const parcelTransformMiddleware = enumTransformMiddleware;
export const productionTransformMiddleware = enumTransformMiddleware;
export const qualityControlTransformMiddleware = enumTransformMiddleware;
export const userTransformMiddleware = enumTransformMiddleware;
export const fullTransformation = enumTransformMiddleware;
