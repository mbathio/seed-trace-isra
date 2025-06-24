// backend/src/middleware/transformationMiddleware.ts - VERSION CORRIGÉE
import { Request, Response, NextFunction } from "express";
import {
  LOT_STATUS_MAPPINGS,
  SEED_LEVEL_MAPPINGS,
  CROP_TYPE_MAPPINGS,
} from "../config/enums";

/**
 * Middleware de transformation pour les lots de semences
 */
export const seedLotTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body) {
    // Transformer le statut
    if (req.body.status && LOT_STATUS_MAPPINGS.UI_TO_DB[req.body.status]) {
      req.body.status = LOT_STATUS_MAPPINGS.UI_TO_DB[req.body.status];
    }

    // Transformer le niveau (si nécessaire)
    if (req.body.level && SEED_LEVEL_MAPPINGS.UI_TO_DB[req.body.level]) {
      req.body.level = SEED_LEVEL_MAPPINGS.UI_TO_DB[req.body.level];
    }
  }

  // Transformer les query params
  if (req.query) {
    if (req.query.status && typeof req.query.status === "string") {
      const mappedStatus = LOT_STATUS_MAPPINGS.UI_TO_DB[req.query.status];
      if (mappedStatus) {
        req.query.status = mappedStatus;
      }
    }

    if (req.query.level && typeof req.query.level === "string") {
      const mappedLevel = SEED_LEVEL_MAPPINGS.UI_TO_DB[req.query.level];
      if (mappedLevel) {
        req.query.level = mappedLevel;
      }
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer un lot
    const transformSeedLot = (lot: any): any => {
      if (!lot || typeof lot !== "object") return lot;

      const transformed = { ...lot };

      // Transformer le statut
      if (
        transformed.status &&
        LOT_STATUS_MAPPINGS.DB_TO_UI[transformed.status]
      ) {
        transformed.status = LOT_STATUS_MAPPINGS.DB_TO_UI[transformed.status];
      }

      // Transformer le niveau
      if (
        transformed.level &&
        SEED_LEVEL_MAPPINGS.DB_TO_UI[transformed.level]
      ) {
        transformed.level = SEED_LEVEL_MAPPINGS.DB_TO_UI[transformed.level];
      }

      // Transformer les relations
      if (transformed.variety && transformed.variety.cropType) {
        const mappedCropType =
          CROP_TYPE_MAPPINGS.DB_TO_UI[transformed.variety.cropType];
        if (mappedCropType) {
          transformed.variety.cropType = mappedCropType;
        }
      }

      // Transformer les lots enfants
      if (transformed.childLots && Array.isArray(transformed.childLots)) {
        transformed.childLots = transformed.childLots.map(transformSeedLot);
      }

      // Transformer le lot parent
      if (transformed.parentLot) {
        transformed.parentLot = transformSeedLot(transformed.parentLot);
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      // Structure standard de l'API
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformSeedLot);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformSeedLot(transformedData.data);
      }
    } else if (transformedData.data) {
      // Autre structure possible
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformSeedLot);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformSeedLot(transformedData.data);
      }
    } else if (Array.isArray(transformedData)) {
      // Si c'est directement un tableau
      return originalJson(transformedData.map(transformSeedLot));
    } else if (transformedData.id && transformedData.varietyId) {
      // Si c'est directement un objet lot
      return originalJson(transformSeedLot(transformedData));
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Middleware de transformation pour les variétés
 */
export const varietyTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body && req.body.cropType) {
    const mappedCropType = CROP_TYPE_MAPPINGS.UI_TO_DB[req.body.cropType];
    if (mappedCropType) {
      req.body.cropType = mappedCropType;
    }
  }

  // Transformer les query params
  if (
    req.query &&
    req.query.cropType &&
    typeof req.query.cropType === "string"
  ) {
    const mappedCropType = CROP_TYPE_MAPPINGS.UI_TO_DB[req.query.cropType];
    if (mappedCropType) {
      req.query.cropType = mappedCropType;
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer une variété
    const transformVariety = (variety: any): any => {
      if (!variety || typeof variety !== "object") return variety;

      const transformed = { ...variety };

      // Transformer le type de culture
      if (
        transformed.cropType &&
        CROP_TYPE_MAPPINGS.DB_TO_UI[transformed.cropType]
      ) {
        transformed.cropType =
          CROP_TYPE_MAPPINGS.DB_TO_UI[transformed.cropType];
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformVariety);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformVariety(transformedData.data);
      }
    } else if (transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformVariety);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformVariety(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};
