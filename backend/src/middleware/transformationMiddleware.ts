// backend/src/middleware/transformationMiddleware.ts - ✅ SYSTÈME DE TRANSFORMATION STANDARDISÉ COMPLET
import { Request, Response, NextFunction } from "express";
import { DataTransformer } from "../utils/transformers";

export interface TransformationMiddlewareOptions {
  direction: "ui-to-db" | "db-to-ui" | "both";
  entityType?:
    | "user"
    | "seedLot"
    | "variety"
    | "multiplier"
    | "parcel"
    | "qualityControl"
    | "production";
  strict?: boolean; // Si true, throw en cas d'erreur de transformation
  logTransformations?: boolean; // Si true, log les transformations
}

// ===== FONCTIONS UTILITAIRES POUR LES TRANSFORMATIONS =====

function getUIToDBTransformer(entityType: string) {
  const transformers: Record<string, (data: any) => any> = {
    user: (data: any) => {
      if (data.role) {
        data.role = DataTransformer.transformRoleUIToDB(data.role);
      }
      return data;
    },
    seedLot: (data: any) => {
      if (data.status) {
        data.status = DataTransformer.transformLotStatusUIToDB(data.status);
      }
      if (data.variety?.cropType) {
        data.variety.cropType = DataTransformer.transformCropTypeUIToDB(
          data.variety.cropType
        );
      }
      return data;
    },
    variety: (data: any) => {
      if (data.cropType) {
        data.cropType = DataTransformer.transformCropTypeUIToDB(data.cropType);
      }
      return data;
    },
    multiplier: (data: any) => {
      if (data.status) {
        data.status = DataTransformer.transformMultiplierStatusUIToDB(
          data.status
        );
      }
      if (data.certificationLevel) {
        data.certificationLevel =
          DataTransformer.transformCertificationLevelUIToDB(
            data.certificationLevel
          );
      }
      if (data.specialization && Array.isArray(data.specialization)) {
        data.specialization = data.specialization.map((spec: string) =>
          DataTransformer.transformCropTypeUIToDB(spec)
        );
      }
      return data;
    },
    parcel: (data: any) => {
      if (data.status) {
        data.status = DataTransformer.transformParcelStatusUIToDB(data.status);
      }
      return data;
    },
    qualityControl: (data: any) => {
      if (data.result) {
        data.result = DataTransformer.transformTestResultUIToDB(data.result);
      }
      return data;
    },
    production: (data: any) => {
      if (data.status) {
        data.status = DataTransformer.transformProductionStatusUIToDB(
          data.status
        );
      }
      if (data.activities && Array.isArray(data.activities)) {
        data.activities = data.activities.map((activity: any) => ({
          ...activity,
          type: activity.type
            ? activity.type.toUpperCase().replace(/-/g, "_")
            : activity.type,
        }));
      }
      return data;
    },
  };

  return transformers[entityType] || ((data: any) => data);
}

function getDBToUITransformer(entityType: string) {
  const transformers: Record<string, (data: any) => any> = {
    user: (data: any) => DataTransformer.transformUser(data),
    seedLot: (data: any) => DataTransformer.transformSeedLot(data),
    variety: (data: any) => DataTransformer.transformVariety(data),
    multiplier: (data: any) => DataTransformer.transformMultiplier(data),
    parcel: (data: any) => DataTransformer.transformParcel(data),
    qualityControl: (data: any) =>
      DataTransformer.transformQualityControl(data),
    production: (data: any) => DataTransformer.transformProduction(data),
  };

  return transformers[entityType] || ((data: any) => data);
}

function autoTransformUIToDB(data: any): any {
  if (!data || typeof data !== "object") return data;

  // Transformation automatique basée sur les noms de champs
  const transformed = { ...data };

  // Statuts courants
  if (transformed.status && typeof transformed.status === "string") {
    if (transformed.status.includes("-")) {
      // Convertir kebab-case vers UPPER_CASE
      transformed.status = transformed.status.toUpperCase().replace(/-/g, "_");
    }
  }

  // Types de culture
  if (transformed.cropType && typeof transformed.cropType === "string") {
    transformed.cropType = transformed.cropType.toUpperCase();
  }

  // Rôles
  if (transformed.role && typeof transformed.role === "string") {
    transformed.role = transformed.role.toUpperCase();
  }

  return transformed;
}

function autoTransformDBToUI(data: any): any {
  if (!data || typeof data !== "object") return data;

  const transformed = { ...data };

  // Transformation automatique des statuts
  if (transformed.status && typeof transformed.status === "string") {
    transformed.status = transformed.status.toLowerCase().replace(/_/g, "-");
  }

  // Types de culture
  if (transformed.cropType && typeof transformed.cropType === "string") {
    transformed.cropType = transformed.cropType.toLowerCase();
  }

  // Rôles
  if (transformed.role && typeof transformed.role === "string") {
    transformed.role = transformed.role.toLowerCase();
  }

  return transformed;
}

// ===== MIDDLEWARE PRINCIPAL =====

export const transformMiddleware = {
  // ===== MIDDLEWARE GÉNÉRIQUE =====

  /**
   * Middleware de transformation générique
   */
  generic: (options: TransformationMiddlewareOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          direction,
          entityType,
          strict = false,
          logTransformations = false,
        } = options;

        // Transformation des données entrantes (UI → DB)
        if ((direction === "ui-to-db" || direction === "both") && req.body) {
          if (logTransformations) {
            console.log(
              `🔄 Transforming ${entityType || "unknown"} UI→DB:`,
              req.body
            );
          }

          if (entityType) {
            const transformer = getUIToDBTransformer(entityType);
            req.body = transformer(req.body);
          } else {
            req.body = autoTransformUIToDB(req.body);
          }

          if (logTransformations) {
            console.log(
              `✅ Transformed ${entityType || "unknown"} UI→DB:`,
              req.body
            );
          }
        }

        // Transformation des données sortantes (DB → UI) - intercepter res.json
        if (direction === "db-to-ui" || direction === "both") {
          const originalSend = res.json;

          res.json = function (data: any) {
            try {
              if (data && typeof data === "object") {
                if (logTransformations) {
                  console.log(
                    `🔄 Transforming ${entityType || "unknown"} DB→UI:`,
                    data
                  );
                }

                let transformedData = data;

                if (data.success && data.data) {
                  // Réponse API standard
                  if (Array.isArray(data.data)) {
                    transformedData = {
                      ...data,
                      data: entityType
                        ? data.data.map((item: any) =>
                            getDBToUITransformer(entityType)(item)
                          )
                        : data.data.map((item: any) =>
                            autoTransformDBToUI(item)
                          ),
                    };
                  } else {
                    const transformer = entityType
                      ? getDBToUITransformer(entityType)
                      : autoTransformDBToUI;
                    transformedData = {
                      ...data,
                      data: transformer(data.data),
                    };
                  }
                } else {
                  // Transformation directe
                  if (Array.isArray(data)) {
                    transformedData = entityType
                      ? data.map((item: any) =>
                          getDBToUITransformer(entityType)(item)
                        )
                      : data.map((item: any) => autoTransformDBToUI(item));
                  } else {
                    const transformer = entityType
                      ? getDBToUITransformer(entityType)
                      : autoTransformDBToUI;
                    transformedData = transformer(data);
                  }
                }

                if (logTransformations) {
                  console.log(
                    `✅ Transformed ${entityType || "unknown"} DB→UI:`,
                    transformedData
                  );
                }

                data = transformedData;
              }
            } catch (error) {
              console.error(
                `❌ Transformation error for ${entityType}:`,
                error
              );
              if (strict) {
                return originalSend.call(this, {
                  success: false,
                  message: "Transformation error",
                  data: null,
                  errors: [(error as Error).message],
                });
              }
              // En mode non-strict, continuer avec les données originales
            }

            return originalSend.call(this, data);
          };
        }

        next();
      } catch (error) {
        console.error("Transformation middleware error:", error);
        if (strict) {
          return next(error);
        }
        // En mode non-strict, continuer sans transformation
        next();
      }
    };
  },

  // ===== MIDDLEWARES SPÉCIALISÉS =====

  seedLots: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "seedLot",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  varieties: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "variety",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  multipliers: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "multiplier",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  users: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "user",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  qualityControls: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "qualityControl",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  productions: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "production",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  parcels: (req: Request, res: Response, next: NextFunction) => {
    return transformMiddleware.generic({
      direction: "both",
      entityType: "parcel",
      logTransformations: process.env.NODE_ENV === "development",
    })(req, res, next);
  },

  // ===== MIDDLEWARE POUR FILTRES DE RECHERCHE =====

  searchFilters: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query) {
        const query = req.query as any;

        // Transformation des filtres de statut selon l'URL
        if (query.status && typeof query.status === "string") {
          if (req.path.includes("seed-lots")) {
            query.status = DataTransformer.transformLotStatusUIToDB(
              query.status
            );
          } else if (req.path.includes("multipliers")) {
            query.status = DataTransformer.transformMultiplierStatusUIToDB(
              query.status
            );
          } else if (req.path.includes("parcels")) {
            query.status = DataTransformer.transformParcelStatusUIToDB(
              query.status
            );
          } else if (req.path.includes("productions")) {
            query.status = DataTransformer.transformProductionStatusUIToDB(
              query.status
            );
          }
        }

        // Transformation des types de culture
        if (query.cropType && typeof query.cropType === "string") {
          query.cropType = DataTransformer.transformCropTypeUIToDB(
            query.cropType
          );
        }

        // Transformation des résultats de test
        if (query.result && typeof query.result === "string") {
          query.result = DataTransformer.transformTestResultUIToDB(
            query.result
          );
        }

        // Transformation des niveaux de certification
        if (
          query.certificationLevel &&
          typeof query.certificationLevel === "string"
        ) {
          query.certificationLevel =
            DataTransformer.transformCertificationLevelUIToDB(
              query.certificationLevel
            );
        }

        // Transformation des rôles
        if (query.role && typeof query.role === "string") {
          query.role = DataTransformer.transformRoleUIToDB(query.role);
        }
      }
      next();
    } catch (error) {
      console.error("Search filters transformation error:", error);
      next(); // Continue même en cas d'erreur
    }
  },

  // ===== MIDDLEWARE POUR RÉPONSES SEULEMENT =====

  responseOnly: (entityType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      return transformMiddleware.generic({
        direction: "db-to-ui",
        entityType: entityType as any,
        logTransformations: process.env.NODE_ENV === "development",
      })(req, res, next);
    };
  },

  // ===== MIDDLEWARE POUR REQUÊTES SEULEMENT =====

  requestOnly: (entityType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      return transformMiddleware.generic({
        direction: "ui-to-db",
        entityType: entityType as any,
        logTransformations: process.env.NODE_ENV === "development",
      })(req, res, next);
    };
  },

  // ===== MIDDLEWARE POUR TRANSFORMATION PERSONNALISÉE =====

  custom: (transformFunction: (data: any) => any) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.body) {
          req.body = transformFunction(req.body);
        }
        next();
      } catch (error) {
        console.error("Custom transformation error:", error);
        next(error);
      }
    };
  },
};

// Export des types pour réutilisation
export type TransformationDirection = "ui-to-db" | "db-to-ui" | "both";
export type EntityType =
  | "user"
  | "seedLot"
  | "variety"
  | "multiplier"
  | "parcel"
  | "qualityControl"
  | "production";
