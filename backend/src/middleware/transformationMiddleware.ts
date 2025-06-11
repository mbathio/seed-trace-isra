// backend/src/middleware/transformationMiddleware.ts - NOUVEAU SYSTÈME DE TRANSFORMATION
import { Request, Response, NextFunction } from "express";
import { DataTransformer } from "../utils/transformers";

export const transformMiddleware = {
  // Transformation pour les lots de semences
  seedLots: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        // Transformation des données entrantes (UI vers DB)
        if (req.body.status) {
          req.body.status = DataTransformer.transformLotStatusUIToDB(
            req.body.status
          );
        }
        if (req.body.variety && req.body.variety.cropType) {
          req.body.variety.cropType = DataTransformer.transformCropTypeUIToDB(
            req.body.variety.cropType
          );
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation pour les variétés
  varieties: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && req.body.cropType) {
        req.body.cropType = DataTransformer.transformCropTypeUIToDB(
          req.body.cropType
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation pour les multiplicateurs
  multipliers: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        if (req.body.status) {
          req.body.status = DataTransformer.transformEnumUIToDB(
            req.body.status,
            DataTransformer["MULTIPLIER_STATUS_UI_TO_DB"]
          );
        }
        if (req.body.certificationLevel) {
          req.body.certificationLevel = DataTransformer.transformEnumUIToDB(
            req.body.certificationLevel,
            DataTransformer["CERTIFICATION_LEVEL_UI_TO_DB"]
          );
        }
        if (req.body.specialization && Array.isArray(req.body.specialization)) {
          req.body.specialization = req.body.specialization.map(
            (spec: string) => DataTransformer.transformCropTypeUIToDB(spec)
          );
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation pour les utilisateurs
  users: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && req.body.role) {
        req.body.role = DataTransformer.transformRoleUIToDB(req.body.role);
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation pour les contrôles qualité
  qualityControls: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && req.body.result) {
        req.body.result = DataTransformer.transformEnumUIToDB(
          req.body.result,
          DataTransformer["TEST_RESULT_UI_TO_DB"]
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation pour les productions
  productions: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        if (req.body.status) {
          req.body.status = DataTransformer.transformEnumUIToDB(
            req.body.status,
            DataTransformer["PRODUCTION_STATUS_UI_TO_DB"]
          );
        }

        // Transformation des activités
        if (req.body.activities && Array.isArray(req.body.activities)) {
          req.body.activities = req.body.activities.map((activity: any) => ({
            ...activity,
            type: activity.type
              ? DataTransformer.transformEnumUIToDB(
                  activity.type,
                  DataTransformer["ACTIVITY_TYPE_UI_TO_DB"]
                )
              : activity.type,
          }));
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation pour les parcelles
  parcels: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && req.body.status) {
        req.body.status = DataTransformer.transformEnumUIToDB(
          req.body.status,
          DataTransformer["PARCEL_STATUS_UI_TO_DB"]
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation générale pour les filtres de recherche
  searchFilters: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query) {
        const query = req.query as any;

        // Transformation des filtres de statut
        if (query.status && typeof query.status === "string") {
          // Déterminer le type d'entité en fonction de l'URL
          if (req.path.includes("seed-lots")) {
            query.status = DataTransformer.transformLotStatusUIToDB(
              query.status
            );
          } else if (req.path.includes("multipliers")) {
            query.status = DataTransformer.transformEnumUIToDB(
              query.status,
              DataTransformer["MULTIPLIER_STATUS_UI_TO_DB"]
            );
          }
          // Ajouter d'autres types selon nécessaire
        }

        // Transformation des types de culture
        if (query.cropType && typeof query.cropType === "string") {
          query.cropType = DataTransformer.transformCropTypeUIToDB(
            query.cropType
          );
        }

        // Transformation des niveaux de semence (généralement déjà en bon format)
        // Les niveaux GO, G1, etc. sont identiques entre UI et DB

        // Transformation des résultats de test
        if (query.result && typeof query.result === "string") {
          query.result = DataTransformer.transformEnumUIToDB(
            query.result,
            DataTransformer["TEST_RESULT_UI_TO_DB"]
          );
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // Transformation des réponses sortantes (DB vers UI)
  transformResponse: (entityType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;

      res.send = function (data: any) {
        try {
          if (data && typeof data === "object") {
            const parsedData =
              typeof data === "string" ? JSON.parse(data) : data;

            if (parsedData.success && parsedData.data) {
              // Transformer les données selon le type d'entité
              if (Array.isArray(parsedData.data)) {
                parsedData.data = parsedData.data.map(
                  (item: any) =>
                    DataTransformer.transformApiResponse(
                      { data: item },
                      entityType
                    ).data
                );
              } else {
                parsedData.data = DataTransformer.transformApiResponse(
                  { data: parsedData.data },
                  entityType
                ).data;
              }

              // Si c'est une réponse paginée
              if (
                parsedData.data &&
                parsedData.data.data &&
                Array.isArray(parsedData.data.data)
              ) {
                parsedData.data.data = parsedData.data.data.map(
                  (item: any) =>
                    DataTransformer.transformApiResponse(
                      { data: item },
                      entityType
                    ).data
                );
              }
            }

            data = JSON.stringify(parsedData);
          }
        } catch (error) {
          console.error("Erreur lors de la transformation de réponse:", error);
        }

        return originalSend.call(this, data);
      };

      next();
    };
  },
};
