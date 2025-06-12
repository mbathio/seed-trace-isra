// backend/src/middleware/transformationMiddleware.ts - ✅ MIDDLEWARE DE TRANSFORMATION AUTOMATIQUE AMÉLIORÉ

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// ===== MAPPINGS DE TRANSFORMATION CENTRALISÉS =====

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
    },
    dbToUi: {
      PENDING: "pending",
      CERTIFIED: "certified",
      REJECTED: "rejected",
      IN_STOCK: "in-stock",
      SOLD: "sold",
      ACTIVE: "active",
      DISTRIBUTED: "distributed",
    },
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
    },
    dbToUi: {
      ADMIN: "admin",
      MANAGER: "manager",
      INSPECTOR: "inspector",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
      TECHNICIAN: "technician",
      RESEARCHER: "researcher",
    },
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
    },
    dbToUi: {
      RICE: "rice",
      MAIZE: "maize",
      PEANUT: "peanut",
      SORGHUM: "sorghum",
      COWPEA: "cowpea",
      MILLET: "millet",
    },
  },

  // Statuts multiplicateurs (UI ↔ DB)
  multiplierStatus: {
    uiToDb: {
      active: "ACTIVE",
      inactive: "INACTIVE",
    },
    dbToUi: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
  },

  // Niveaux de certification (UI ↔ DB)
  certificationLevel: {
    uiToDb: {
      beginner: "BEGINNER",
      intermediate: "INTERMEDIATE",
      expert: "EXPERT",
    },
    dbToUi: {
      BEGINNER: "beginner",
      INTERMEDIATE: "intermediate",
      EXPERT: "expert",
    },
  },

  // Statuts parcelles (UI ↔ DB)
  parcelStatus: {
    uiToDb: {
      available: "AVAILABLE",
      "in-use": "IN_USE",
      resting: "RESTING",
    },
    dbToUi: {
      AVAILABLE: "available",
      IN_USE: "in-use",
      RESTING: "resting",
    },
  },

  // Statuts production (UI ↔ DB)
  productionStatus: {
    uiToDb: {
      planned: "PLANNED",
      "in-progress": "IN_PROGRESS",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    },
    dbToUi: {
      PLANNED: "planned",
      IN_PROGRESS: "in-progress",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    },
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
    },
    dbToUi: {
      SOIL_PREPARATION: "soil-preparation",
      SOWING: "sowing",
      FERTILIZATION: "fertilization",
      IRRIGATION: "irrigation",
      WEEDING: "weeding",
      PEST_CONTROL: "pest-control",
      HARVEST: "harvest",
      OTHER: "other",
    },
  },

  // Types de problèmes (UI ↔ DB)
  issueType: {
    uiToDb: {
      disease: "DISEASE",
      pest: "PEST",
      weather: "WEATHER",
      management: "MANAGEMENT",
      other: "OTHER",
    },
    dbToUi: {
      DISEASE: "disease",
      PEST: "pest",
      WEATHER: "weather",
      MANAGEMENT: "management",
      OTHER: "other",
    },
  },

  // Sévérité des problèmes (UI ↔ DB)
  issueSeverity: {
    uiToDb: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    },
    dbToUi: {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
    },
  },

  // Résultats de test (UI ↔ DB)
  testResult: {
    uiToDb: {
      pass: "PASS",
      fail: "FAIL",
    },
    dbToUi: {
      PASS: "pass",
      FAIL: "fail",
    },
  },

  // Types de rapport (UI ↔ DB)
  reportType: {
    uiToDb: {
      production: "PRODUCTION",
      quality: "QUALITY",
      inventory: "INVENTORY",
      "multiplier-performance": "MULTIPLIER_PERFORMANCE",
      custom: "CUSTOM",
    },
    dbToUi: {
      PRODUCTION: "production",
      QUALITY: "quality",
      INVENTORY: "inventory",
      MULTIPLIER_PERFORMANCE: "multiplier-performance",
      CUSTOM: "custom",
    },
  },

  // Statuts de contrat (UI ↔ DB)
  contractStatus: {
    uiToDb: {
      draft: "DRAFT",
      active: "ACTIVE",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    },
    dbToUi: {
      DRAFT: "draft",
      ACTIVE: "active",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    },
  },
};

// Niveaux de semences (identiques UI/DB)
const SEED_LEVELS = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];

// ===== FONCTIONS DE TRANSFORMATION =====

/**
 * Transforme une valeur selon un mapping donné
 */
function transformValue(value: any, mapping: Record<string, string>): any {
  if (!value || typeof value !== "string") return value;
  return mapping[value] || value;
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
          if (ENUM_MAPPINGS.lotStatus.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.lotStatus.uiToDb[value];
          } else if (ENUM_MAPPINGS.multiplierStatus.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.multiplierStatus.uiToDb[value];
          } else if (ENUM_MAPPINGS.parcelStatus.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.parcelStatus.uiToDb[value];
          } else if (ENUM_MAPPINGS.productionStatus.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.productionStatus.uiToDb[value];
          } else if (ENUM_MAPPINGS.contractStatus.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.contractStatus.uiToDb[value];
          }
        }
        break;

      case "role":
        transformedValue = transformValue(value, ENUM_MAPPINGS.role.uiToDb);
        break;

      case "cropType":
        transformedValue = transformValue(value, ENUM_MAPPINGS.cropType.uiToDb);
        break;

      case "certificationLevel":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.certificationLevel.uiToDb
        );
        break;

      case "type":
        // Peut être activityType ou issueType
        if (typeof value === "string") {
          if (ENUM_MAPPINGS.activityType.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.activityType.uiToDb[value];
          } else if (ENUM_MAPPINGS.issueType.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.issueType.uiToDb[value];
          } else if (ENUM_MAPPINGS.reportType.uiToDb[value]) {
            transformedValue = ENUM_MAPPINGS.reportType.uiToDb[value];
          }
        }
        break;

      case "severity":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.issueSeverity.uiToDb
        );
        break;

      case "result":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.testResult.uiToDb
        );
        break;

      case "specialization":
        // Array de crop types
        if (Array.isArray(value)) {
          transformedValue = value.map((item) =>
            transformValue(item, ENUM_MAPPINGS.cropType.uiToDb)
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
          if (ENUM_MAPPINGS.lotStatus.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.lotStatus.dbToUi[value];
          } else if (ENUM_MAPPINGS.multiplierStatus.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.multiplierStatus.dbToUi[value];
          } else if (ENUM_MAPPINGS.parcelStatus.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.parcelStatus.dbToUi[value];
          } else if (ENUM_MAPPINGS.productionStatus.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.productionStatus.dbToUi[value];
          } else if (ENUM_MAPPINGS.contractStatus.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.contractStatus.dbToUi[value];
          }
        }
        break;

      case "role":
        transformedValue = transformValue(value, ENUM_MAPPINGS.role.dbToUi);
        break;

      case "cropType":
        transformedValue = transformValue(value, ENUM_MAPPINGS.cropType.dbToUi);
        break;

      case "certificationLevel":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.certificationLevel.dbToUi
        );
        break;

      case "type":
        // Peut être activityType ou issueType
        if (typeof value === "string") {
          if (ENUM_MAPPINGS.activityType.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.activityType.dbToUi[value];
          } else if (ENUM_MAPPINGS.issueType.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.issueType.dbToUi[value];
          } else if (ENUM_MAPPINGS.reportType.dbToUi[value]) {
            transformedValue = ENUM_MAPPINGS.reportType.dbToUi[value];
          }
        }
        break;

      case "severity":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.issueSeverity.dbToUi
        );
        break;

      case "result":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.testResult.dbToUi
        );
        break;

      case "specialization":
        // Array de crop types
        if (Array.isArray(value)) {
          transformedValue = value.map((item) =>
            transformValue(item, ENUM_MAPPINGS.cropType.dbToUi)
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
            ENUM_MAPPINGS.lotStatus.uiToDb[value] ||
            ENUM_MAPPINGS.multiplierStatus.uiToDb[value] ||
            ENUM_MAPPINGS.parcelStatus.uiToDb[value] ||
            ENUM_MAPPINGS.productionStatus.uiToDb[value] ||
            ENUM_MAPPINGS.contractStatus.uiToDb[value] ||
            value;
        }
        break;

      case "role":
        transformedValue = transformValue(value, ENUM_MAPPINGS.role.uiToDb);
        break;

      case "cropType":
        transformedValue = transformValue(value, ENUM_MAPPINGS.cropType.uiToDb);
        break;

      case "certificationLevel":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.certificationLevel.uiToDb
        );
        break;

      case "result":
        transformedValue = transformValue(
          value,
          ENUM_MAPPINGS.testResult.uiToDb
        );
        break;

      case "type":
        if (typeof value === "string") {
          transformedValue =
            ENUM_MAPPINGS.activityType.uiToDb[value] ||
            ENUM_MAPPINGS.issueType.uiToDb[value] ||
            ENUM_MAPPINGS.reportType.uiToDb[value] ||
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
export const seedLotTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

/**
 * Middleware pour les variétés
 */
export const varietyTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

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
export const qualityControlTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

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
