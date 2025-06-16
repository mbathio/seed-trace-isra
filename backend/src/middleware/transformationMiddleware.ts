// backend/src/middleware/transformationMiddleware.ts - ✅ MIDDLEWARE DE TRANSFORMATION AUTOMATIQUE CORRIGÉ

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import {
  transformObjectUIToDB,
  transformObjectDBToUI,
} from "../utils/transformers";

// ===== MAPPINGS DE TRANSFORMATION CENTRALISÉS AVEC TYPES STRICTS =====

const ENUM_MAPPINGS = {
  // Statuts de lots (UI ↔ DB)
  lotStatus: {
    uiToDb: {
      pending: "PENDING",
      certified: "CERTIFIED",
      rejected: "REJECTED",
      "in-stock": "IN_STOCK",
      sold: "SOLD",
      active: "ACTIVE",
      distributed: "DISTRIBUTED",
    } as Record<string, string>,
    dbToUi: {
      PENDING: "pending",
      CERTIFIED: "certified",
      REJECTED: "rejected",
      IN_STOCK: "in-stock",
      SOLD: "sold",
      ACTIVE: "active",
      DISTRIBUTED: "distributed",
    } as Record<string, string>,
  },

  // Rôles utilisateurs (UI ↔ DB)
  role: {
    uiToDb: {
      admin: "ADMIN",
      manager: "MANAGER",
      inspector: "INSPECTOR",
      multiplier: "MULTIPLIER",
      guest: "GUEST",
      technician: "TECHNICIAN",
      researcher: "RESEARCHER",
    } as Record<string, string>,
    dbToUi: {
      ADMIN: "admin",
      MANAGER: "manager",
      INSPECTOR: "inspector",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
      TECHNICIAN: "technician",
      RESEARCHER: "researcher",
    } as Record<string, string>,
  },

  // Types de culture (UI ↔ DB)
  cropType: {
    uiToDb: {
      rice: "RICE",
      maize: "MAIZE",
      peanut: "PEANUT",
      sorghum: "SORGHUM",
      cowpea: "COWPEA",
      millet: "MILLET",
      wheat: "WHEAT",
    } as Record<string, string>,
    dbToUi: {
      RICE: "rice",
      MAIZE: "maize",
      PEANUT: "peanut",
      SORGHUM: "sorghum",
      COWPEA: "cowpea",
      MILLET: "millet",
      WHEAT: "wheat",
    } as Record<string, string>,
  },

  // Statuts multiplicateurs (UI ↔ DB)
  multiplierStatus: {
    uiToDb: {
      active: "ACTIVE",
      inactive: "INACTIVE",
    } as Record<string, string>,
    dbToUi: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    } as Record<string, string>,
  },

  // Niveaux de certification (UI ↔ DB)
  certificationLevel: {
    uiToDb: {
      beginner: "BEGINNER",
      intermediate: "INTERMEDIATE",
      expert: "EXPERT",
    } as Record<string, string>,
    dbToUi: {
      BEGINNER: "beginner",
      INTERMEDIATE: "intermediate",
      EXPERT: "expert",
    } as Record<string, string>,
  },

  // Statuts parcelles (UI ↔ DB)
  parcelStatus: {
    uiToDb: {
      available: "AVAILABLE",
      "in-use": "IN_USE",
      resting: "RESTING",
    } as Record<string, string>,
    dbToUi: {
      AVAILABLE: "available",
      IN_USE: "in-use",
      RESTING: "resting",
    } as Record<string, string>,
  },

  // Statuts production (UI ↔ DB)
  productionStatus: {
    uiToDb: {
      planned: "PLANNED",
      "in-progress": "IN_PROGRESS",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    } as Record<string, string>,
    dbToUi: {
      PLANNED: "planned",
      IN_PROGRESS: "in-progress",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    } as Record<string, string>,
  },

  // Types d'activité (UI ↔ DB)
  activityType: {
    uiToDb: {
      "soil-preparation": "SOIL_PREPARATION",
      sowing: "SOWING",
      fertilization: "FERTILIZATION",
      irrigation: "IRRIGATION",
      weeding: "WEEDING",
      "pest-control": "PEST_CONTROL",
      harvest: "HARVEST",
      other: "OTHER",
    } as Record<string, string>,
    dbToUi: {
      SOIL_PREPARATION: "soil-preparation",
      SOWING: "sowing",
      FERTILIZATION: "fertilization",
      IRRIGATION: "irrigation",
      WEEDING: "weeding",
      PEST_CONTROL: "pest-control",
      HARVEST: "harvest",
      OTHER: "other",
    } as Record<string, string>,
  },

  // Types de problèmes (UI ↔ DB)
  issueType: {
    uiToDb: {
      disease: "DISEASE",
      pest: "PEST",
      weather: "WEATHER",
      management: "MANAGEMENT",
      other: "OTHER",
    } as Record<string, string>,
    dbToUi: {
      DISEASE: "disease",
      PEST: "pest",
      WEATHER: "weather",
      MANAGEMENT: "management",
      OTHER: "other",
    } as Record<string, string>,
  },

  // Sévérité des problèmes (UI ↔ DB)
  issueSeverity: {
    uiToDb: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    } as Record<string, string>,
    dbToUi: {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
    } as Record<string, string>,
  },

  // Résultats de test (UI ↔ DB)
  testResult: {
    uiToDb: {
      pass: "PASS",
      fail: "FAIL",
    } as Record<string, string>,
    dbToUi: {
      PASS: "pass",
      FAIL: "fail",
    } as Record<string, string>,
  },

  // Types de rapport (UI ↔ DB)
  reportType: {
    uiToDb: {
      production: "PRODUCTION",
      quality: "QUALITY",
      inventory: "INVENTORY",
      "multiplier-performance": "MULTIPLIER_PERFORMANCE",
      custom: "CUSTOM",
    } as Record<string, string>,
    dbToUi: {
      PRODUCTION: "production",
      QUALITY: "quality",
      INVENTORY: "inventory",
      MULTIPLIER_PERFORMANCE: "multiplier-performance",
      CUSTOM: "custom",
    } as Record<string, string>,
  },

  // Statuts de contrat (UI ↔ DB)
  contractStatus: {
    uiToDb: {
      draft: "DRAFT",
      active: "ACTIVE",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    } as Record<string, string>,
    dbToUi: {
      DRAFT: "draft",
      ACTIVE: "active",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    } as Record<string, string>,
  },
};

// Niveaux de semences (identiques UI/DB)
const SEED_LEVELS = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];

// ===== FONCTIONS DE TRANSFORMATION AVEC TYPE SAFETY =====

/**
 * Transforme une valeur selon un mapping donné avec vérification de type
 */
function transformValue(value: any, mapping: Record<string, string>): any {
  if (!value || typeof value !== "string") return value;
  return mapping[value] || value;
}

/**
 * Obtient le mapping sécurisé pour un champ donné
 */
function getMapping(
  fieldName: string,
  direction: "uiToDb" | "dbToUi"
): Record<string, string> {
  const enumMapping = ENUM_MAPPINGS[fieldName as keyof typeof ENUM_MAPPINGS];
  if (!enumMapping) {
    return {};
  }
  return enumMapping[direction] || {};
}

/**
 * Transforme un objet de manière récursive (UI → DB)
 */
function transformObjectUIToDB(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformObjectUIToDB(item));
  }

  const transformed: any = {};

  for (const [key, value] of Object.entries(data)) {
    let transformedValue = value;

    // Transformer selon le nom du champ
    switch (key) {
      case "status":
        // Déterminer le type de statut selon le contexte
        if (typeof value === "string") {
          // Essayer différents mappings
          transformedValue =
            transformValue(value, getMapping("lotStatus", "uiToDb")) ||
            transformValue(value, getMapping("multiplierStatus", "uiToDb")) ||
            transformValue(value, getMapping("parcelStatus", "uiToDb")) ||
            transformValue(value, getMapping("productionStatus", "uiToDb")) ||
            transformValue(value, getMapping("contractStatus", "uiToDb")) ||
            value;
        }
        break;

      case "role":
        transformedValue = transformValue(value, getMapping("role", "uiToDb"));
        break;

      case "cropType":
        transformedValue = transformValue(
          value,
          getMapping("cropType", "uiToDb")
        );
        break;

      case "certificationLevel":
        transformedValue = transformValue(
          value,
          getMapping("certificationLevel", "uiToDb")
        );
        break;

      case "type":
        // Peut être activityType ou issueType
        if (typeof value === "string") {
          transformedValue =
            transformValue(value, getMapping("activityType", "uiToDb")) ||
            transformValue(value, getMapping("issueType", "uiToDb")) ||
            transformValue(value, getMapping("reportType", "uiToDb")) ||
            value;
        }
        break;

      case "severity":
        transformedValue = transformValue(
          value,
          getMapping("issueSeverity", "uiToDb")
        );
        break;

      case "result":
        transformedValue = transformValue(
          value,
          getMapping("testResult", "uiToDb")
        );
        break;

      case "specialization":
        // Array de crop types
        if (Array.isArray(value)) {
          transformedValue = value.map((item) =>
            transformValue(item, getMapping("cropType", "uiToDb"))
          );
        }
        break;

      case "activities":
        // Array d'activités
        if (Array.isArray(value)) {
          transformedValue = value.map((activity) =>
            transformObjectUIToDB(activity)
          );
        }
        break;

      case "issues":
        // Array de problèmes
        if (Array.isArray(value)) {
          transformedValue = value.map((issue) => transformObjectUIToDB(issue));
        }
        break;

      default:
        // Transformation récursive pour les objets imbriqués
        if (value && typeof value === "object") {
          transformedValue = transformObjectUIToDB(value);
        }
        break;
    }

    transformed[key] = transformedValue;
  }

  return transformed;
}

/**
 * Transforme un objet de manière récursive (DB → UI)
 */
function transformObjectDBToUI(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformObjectDBToUI(item));
  }

  const transformed: any = {};

  for (const [key, value] of Object.entries(data)) {
    let transformedValue = value;

    // Transformer selon le nom du champ
    switch (key) {
      case "status":
        // Déterminer le type de statut selon le contexte
        if (typeof value === "string") {
          // Essayer différents mappings
          transformedValue =
            transformValue(value, getMapping("lotStatus", "dbToUi")) ||
            transformValue(value, getMapping("multiplierStatus", "dbToUi")) ||
            transformValue(value, getMapping("parcelStatus", "dbToUi")) ||
            transformValue(value, getMapping("productionStatus", "dbToUi")) ||
            transformValue(value, getMapping("contractStatus", "dbToUi")) ||
            value;
        }
        break;

      case "role":
        transformedValue = transformValue(value, getMapping("role", "dbToUi"));
        break;

      case "cropType":
        transformedValue = transformValue(
          value,
          getMapping("cropType", "dbToUi")
        );
        break;

      case "certificationLevel":
        transformedValue = transformValue(
          value,
          getMapping("certificationLevel", "dbToUi")
        );
        break;

      case "type":
        // Peut être activityType ou issueType
        if (typeof value === "string") {
          transformedValue =
            transformValue(value, getMapping("activityType", "dbToUi")) ||
            transformValue(value, getMapping("issueType", "dbToUi")) ||
            transformValue(value, getMapping("reportType", "dbToUi")) ||
            value;
        }
        break;

      case "severity":
        transformedValue = transformValue(
          value,
          getMapping("issueSeverity", "dbToUi")
        );
        break;

      case "result":
        transformedValue = transformValue(
          value,
          getMapping("testResult", "dbToUi")
        );
        break;

      case "specialization":
        // Array de crop types
        if (Array.isArray(value)) {
          transformedValue = value.map((item) =>
            transformValue(item, getMapping("cropType", "dbToUi"))
          );
        }
        break;

      case "activities":
        // Array d'activités
        if (Array.isArray(value)) {
          transformedValue = value.map((activity) =>
            transformObjectDBToUI(activity)
          );
        }
        break;

      case "issues":
        // Array de problèmes
        if (Array.isArray(value)) {
          transformedValue = value.map((issue) => transformObjectDBToUI(issue));
        }
        break;

      case "variety":
      case "multiplier":
      case "parcel":
      case "seedLot":
      case "inspector":
      case "user":
        // Relations imbriquées
        if (value && typeof value === "object") {
          transformedValue = transformObjectDBToUI(value);
        }
        break;

      case "childLots":
      case "qualityControls":
      case "productions":
      case "parcels":
      case "contracts":
      case "seedLots":
        // Arrays de relations
        if (Array.isArray(value)) {
          transformedValue = value.map((item) => transformObjectDBToUI(item));
        }
        break;

      default:
        // Transformation récursive pour les objets imbriqués
        if (value && typeof value === "object") {
          transformedValue = transformObjectDBToUI(value);
        }
        break;
    }

    transformed[key] = transformedValue;
  }

  return transformed;
}

/**
 * Transforme les paramètres de requête (query params)
 */
function transformQueryParams(query: any): any {
  if (!query || typeof query !== "object") return query;

  const transformed: any = {};

  for (const [key, value] of Object.entries(query)) {
    let transformedValue = value;

    switch (key) {
      case "status":
        if (typeof value === "string") {
          // Essayer tous les mappings possibles
          transformedValue =
            transformValue(value, getMapping("lotStatus", "uiToDb")) ||
            transformValue(value, getMapping("multiplierStatus", "uiToDb")) ||
            transformValue(value, getMapping("parcelStatus", "uiToDb")) ||
            transformValue(value, getMapping("productionStatus", "uiToDb")) ||
            transformValue(value, getMapping("contractStatus", "uiToDb")) ||
            value;
        }
        break;

      case "role":
        transformedValue = transformValue(value, getMapping("role", "uiToDb"));
        break;

      case "cropType":
        transformedValue = transformValue(
          value,
          getMapping("cropType", "uiToDb")
        );
        break;

      case "certificationLevel":
        transformedValue = transformValue(
          value,
          getMapping("certificationLevel", "uiToDb")
        );
        break;

      case "result":
        transformedValue = transformValue(
          value,
          getMapping("testResult", "uiToDb")
        );
        break;

      case "type":
        if (typeof value === "string") {
          transformedValue =
            transformValue(value, getMapping("activityType", "uiToDb")) ||
            transformValue(value, getMapping("issueType", "uiToDb")) ||
            transformValue(value, getMapping("reportType", "uiToDb")) ||
            value;
        }
        break;

      default:
        transformedValue = value;
        break;
    }

    transformed[key] = transformedValue;
  }

  return transformed;
}

// ===== MIDDLEWARE PRINCIPAL =====

interface TransformationOptions {
  input?: boolean; // Transformer les données d'entrée (UI → DB)
  output?: boolean; // Transformer les données de sortie (DB → UI)
  query?: boolean; // Transformer les query parameters
  logTransformations?: boolean;
}

/**
 * Middleware de transformation automatique
 */
export function createTransformationMiddleware(
  options: TransformationOptions = {}
) {
  const {
    input = true,
    output = true,
    query = true,
    logTransformations = process.env.NODE_ENV === "development",
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // ===== TRANSFORMATION DES DONNÉES D'ENTRÉE (UI → DB) =====
      if (input && req.body && Object.keys(req.body).length > 0) {
        const originalBody = { ...req.body };
        req.body = transformObjectUIToDB(req.body);

        if (logTransformations) {
          logger.debug("🔄 Body transformation (UI → DB)", {
            route: `${req.method} ${req.path}`,
            original: originalBody,
            transformed: req.body,
          });
        }
      }

      // ===== TRANSFORMATION DES QUERY PARAMETERS =====
      if (query && req.query && Object.keys(req.query).length > 0) {
        const originalQuery = { ...req.query };
        req.query = transformQueryParams(req.query);

        if (logTransformations) {
          logger.debug("🔄 Query transformation (UI → DB)", {
            route: `${req.method} ${req.path}`,
            original: originalQuery,
            transformed: req.query,
          });
        }
      }

      // ===== TRANSFORMATION DES DONNÉES DE SORTIE (DB → UI) =====
      if (output) {
        const originalJson = res.json.bind(res);

        res.json = function (data: any) {
          try {
            if (data && typeof data === "object") {
              let transformedData = data;

              if (logTransformations) {
                logger.debug("🔄 Response transformation (DB → UI) - Before", {
                  route: `${req.method} ${req.path}`,
                  originalData: data,
                });
              }

              // Transformer selon la structure de la réponse
              if (data.success !== undefined && data.data !== undefined) {
                // Réponse API standard { success, message, data, meta }
                transformedData = {
                  ...data,
                  data: data.data
                    ? transformObjectDBToUI(data.data)
                    : data.data,
                };
              } else {
                // Réponse directe
                transformedData = transformObjectDBToUI(data);
              }

              if (logTransformations) {
                logger.debug("🔄 Response transformation (DB → UI) - After", {
                  route: `${req.method} ${req.path}`,
                  transformedData: transformedData,
                });
              }

              return originalJson.call(this, transformedData);
            } else {
              return originalJson.call(this, data);
            }
          } catch (error) {
            logger.error("❌ Error in response transformation", {
              route: `${req.method} ${req.path}`,
              error: error instanceof Error ? error.message : String(error),
              originalData: data,
            });

            // En cas d'erreur, retourner les données originales
            return originalJson.call(this, data);
          }
        };
      }

      next();
    } catch (error) {
      logger.error("❌ Error in transformation middleware", {
        route: `${req.method} ${req.path}`,
        error: error instanceof Error ? error.message : String(error),
      });

      // En cas d'erreur, continuer sans transformation
      next();
    }
  };
}

// ===== MIDDLEWARES PRÊTS À UTILISER =====

/**
 * Middleware complet avec transformation entrée/sortie
 */
export const fullTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

/**
 * Middleware pour transformation des entrées seulement
 */
export const inputTransformation = createTransformationMiddleware({
  input: true,
  output: false,
  query: true,
  logTransformations: false,
});

/**
 * Middleware pour transformation des sorties seulement
 */
export const outputTransformation = createTransformationMiddleware({
  input: false,
  output: true,
  query: false,
  logTransformations: false,
});

/**
 * Middleware pour transformation des query parameters seulement
 */
export const queryTransformation = createTransformationMiddleware({
  input: false,
  output: false,
  query: true,
  logTransformations: false,
});

// ===== MIDDLEWARES SPÉCIALISÉS PAR ENTITÉ =====

/**
 * Middleware pour les lots de semences
 */

/**
 * Middleware pour les variétés
 */
export const varietyTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformer les données d'entrée
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = transformObjectUIToDB(req.body);
  }

  // Intercepter la réponse pour transformer les données de sortie
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (data && typeof data === "object") {
      if (data.success !== undefined && data.data !== undefined) {
        data.data = transformObjectDBToUI(data.data);
      } else {
        data = transformObjectDBToUI(data);
      }
    }
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Middleware pour les multiplicateurs
 */
export const multiplierTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

/**
 * Middleware pour les contrôles qualité
 */

/**
 * Middleware pour les productions
 */
export const productionTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

/**
 * Middleware pour les parcelles
 */
export const parcelTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

/**
 * Middleware pour les utilisateurs
 */
export const userTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

// ===== FONCTIONS UTILITAIRES D'EXPORT =====

export {
  transformObjectUIToDB,
  transformObjectDBToUI,
  transformQueryParams,
  ENUM_MAPPINGS,
  SEED_LEVELS,
};

// Log de chargement du middleware
if (process.env.NODE_ENV === "development") {
  logger.info("🔧 Transformation middleware loaded", {
    enumMappings: Object.keys(ENUM_MAPPINGS).length,
    seedLevels: SEED_LEVELS.length,
  });
}

export const seedLotTransformation = varietyTransformation;
export const qualityControlTransformation = varietyTransformation;
