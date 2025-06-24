// backend/src/middleware/transformationMiddleware.ts - VERSION CORRIGÉE
import { Request, Response, NextFunction } from "express";
import {
  LOT_STATUS_MAPPINGS,
  SEED_LEVEL_MAPPINGS,
  CROP_TYPE_MAPPINGS,
  ROLE_MAPPINGS,
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
} from "../config/enums";

/**
 * Helper function to safely transform enum values
 */
function transformEnum<T extends Record<string, any>>(
  value: string | undefined,
  mapping: T
): string | undefined {
  if (!value || typeof value !== "string") return value;
  return mapping[value as keyof T] || value;
}

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
    if (req.body.status) {
      req.body.status = transformEnum(
        req.body.status,
        LOT_STATUS_MAPPINGS.UI_TO_DB
      );
    }

    // Transformer le niveau (si nécessaire)
    if (req.body.level) {
      req.body.level = transformEnum(
        req.body.level,
        SEED_LEVEL_MAPPINGS.UI_TO_DB
      );
    }
  }

  // Transformer les query params
  if (req.query) {
    if (req.query.status && typeof req.query.status === "string") {
      const mappedStatus = transformEnum(
        req.query.status,
        LOT_STATUS_MAPPINGS.UI_TO_DB
      );
      if (mappedStatus) {
        req.query.status = mappedStatus;
      }
    }

    if (req.query.level && typeof req.query.level === "string") {
      const mappedLevel = transformEnum(
        req.query.level,
        SEED_LEVEL_MAPPINGS.UI_TO_DB
      );
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
      if (transformed.status) {
        transformed.status =
          transformEnum(transformed.status, LOT_STATUS_MAPPINGS.DB_TO_UI) ||
          transformed.status;
      }

      // Transformer le niveau
      if (transformed.level) {
        transformed.level =
          transformEnum(transformed.level, SEED_LEVEL_MAPPINGS.DB_TO_UI) ||
          transformed.level;
      }

      // Transformer les relations
      if (transformed.variety && transformed.variety.cropType) {
        transformed.variety.cropType =
          transformEnum(
            transformed.variety.cropType,
            CROP_TYPE_MAPPINGS.DB_TO_UI
          ) || transformed.variety.cropType;
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
    req.body.cropType = transformEnum(
      req.body.cropType,
      CROP_TYPE_MAPPINGS.UI_TO_DB
    );
  }

  // Transformer les query params
  if (
    req.query &&
    req.query.cropType &&
    typeof req.query.cropType === "string"
  ) {
    const mappedCropType = transformEnum(
      req.query.cropType,
      CROP_TYPE_MAPPINGS.UI_TO_DB
    );
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
      if (transformed.cropType) {
        transformed.cropType =
          transformEnum(transformed.cropType, CROP_TYPE_MAPPINGS.DB_TO_UI) ||
          transformed.cropType;
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

/**
 * Middleware de transformation pour les utilisateurs
 */
export const userTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body && req.body.role) {
    req.body.role = transformEnum(req.body.role, ROLE_MAPPINGS.UI_TO_DB);
  }

  // Transformer les query params
  if (req.query && req.query.role && typeof req.query.role === "string") {
    const mappedRole = transformEnum(req.query.role, ROLE_MAPPINGS.UI_TO_DB);
    if (mappedRole) {
      req.query.role = mappedRole;
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer un utilisateur
    const transformUser = (user: any): any => {
      if (!user || typeof user !== "object") return user;

      const transformed = { ...user };

      // Transformer le rôle
      if (transformed.role) {
        transformed.role =
          transformEnum(transformed.role, ROLE_MAPPINGS.DB_TO_UI) ||
          transformed.role;
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformUser);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformUser(transformedData.data);
      }
    } else if (transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformUser);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformUser(transformedData.data);
      }
    } else if (transformedData.user) {
      // Pour les réponses d'auth
      transformedData.user = transformUser(transformedData.user);
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Middleware de transformation pour les multiplicateurs
 */
export const multiplierTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body) {
    if (req.body.status) {
      req.body.status = transformEnum(
        req.body.status,
        MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB
      );
    }
    if (req.body.certificationLevel) {
      req.body.certificationLevel = transformEnum(
        req.body.certificationLevel,
        CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB
      );
    }
    if (req.body.specialization && Array.isArray(req.body.specialization)) {
      req.body.specialization = req.body.specialization.map(
        (spec: string) =>
          transformEnum(spec, CROP_TYPE_MAPPINGS.UI_TO_DB) || spec
      );
    }
  }

  // Transformer les query params
  if (req.query) {
    if (req.query.status && typeof req.query.status === "string") {
      const mapped = transformEnum(
        req.query.status,
        MULTIPLIER_STATUS_MAPPINGS.UI_TO_DB
      );
      if (mapped) req.query.status = mapped;
    }
    if (
      req.query.certificationLevel &&
      typeof req.query.certificationLevel === "string"
    ) {
      const mapped = transformEnum(
        req.query.certificationLevel,
        CERTIFICATION_LEVEL_MAPPINGS.UI_TO_DB
      );
      if (mapped) req.query.certificationLevel = mapped;
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer un multiplicateur
    const transformMultiplier = (multiplier: any): any => {
      if (!multiplier || typeof multiplier !== "object") return multiplier;

      const transformed = { ...multiplier };

      if (transformed.status) {
        transformed.status =
          transformEnum(
            transformed.status,
            MULTIPLIER_STATUS_MAPPINGS.DB_TO_UI
          ) || transformed.status;
      }
      if (transformed.certificationLevel) {
        transformed.certificationLevel =
          transformEnum(
            transformed.certificationLevel,
            CERTIFICATION_LEVEL_MAPPINGS.DB_TO_UI
          ) || transformed.certificationLevel;
      }
      if (
        transformed.specialization &&
        Array.isArray(transformed.specialization)
      ) {
        transformed.specialization = transformed.specialization.map(
          (spec: string) =>
            transformEnum(spec, CROP_TYPE_MAPPINGS.DB_TO_UI) || spec
        );
      }

      // Transformer les contrats
      if (transformed.contracts && Array.isArray(transformed.contracts)) {
        transformed.contracts = transformed.contracts.map(transformContract);
      }

      return transformed;
    };

    // Fonction helper pour transformer un contrat
    const transformContract = (contract: any): any => {
      if (!contract || typeof contract !== "object") return contract;

      const transformed = { ...contract };

      if (transformed.status) {
        transformed.status =
          transformEnum(
            transformed.status,
            CONTRACT_STATUS_MAPPINGS.DB_TO_UI
          ) || transformed.status;
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformMultiplier);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformMultiplier(transformedData.data);
      }
    } else if (transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformMultiplier);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformMultiplier(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Middleware de transformation pour les contrôles qualité
 */
export const qualityControlTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body && req.body.result) {
    req.body.result = transformEnum(
      req.body.result,
      TEST_RESULT_MAPPINGS.UI_TO_DB
    );
  }

  // Transformer les query params
  if (req.query && req.query.result && typeof req.query.result === "string") {
    const mapped = transformEnum(
      req.query.result,
      TEST_RESULT_MAPPINGS.UI_TO_DB
    );
    if (mapped) req.query.result = mapped;
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer un contrôle qualité
    const transformQualityControl = (qc: any): any => {
      if (!qc || typeof qc !== "object") return qc;

      const transformed = { ...qc };

      if (transformed.result) {
        transformed.result =
          transformEnum(transformed.result, TEST_RESULT_MAPPINGS.DB_TO_UI) ||
          transformed.result;
      }

      // Transformer les relations
      if (transformed.seedLot) {
        transformed.seedLot = transformSeedLot(transformed.seedLot);
      }

      return transformed;
    };

    // Fonction helper pour transformer un lot (réutilisée)
    const transformSeedLot = (lot: any): any => {
      if (!lot || typeof lot !== "object") return lot;

      const transformed = { ...lot };

      if (transformed.status) {
        transformed.status =
          transformEnum(transformed.status, LOT_STATUS_MAPPINGS.DB_TO_UI) ||
          transformed.status;
      }
      if (transformed.level) {
        transformed.level =
          transformEnum(transformed.level, SEED_LEVEL_MAPPINGS.DB_TO_UI) ||
          transformed.level;
      }
      if (transformed.variety && transformed.variety.cropType) {
        transformed.variety.cropType =
          transformEnum(
            transformed.variety.cropType,
            CROP_TYPE_MAPPINGS.DB_TO_UI
          ) || transformed.variety.cropType;
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(
          transformQualityControl
        );
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformQualityControl(transformedData.data);
      }
    } else if (transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(
          transformQualityControl
        );
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformQualityControl(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Middleware de transformation pour les productions
 */
export const productionTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body) {
    if (req.body.status) {
      req.body.status = transformEnum(
        req.body.status,
        PRODUCTION_STATUS_MAPPINGS.UI_TO_DB
      );
    }

    // Pour les activités
    if (req.body.type && req.path.includes("activities")) {
      req.body.type = transformEnum(
        req.body.type,
        ACTIVITY_TYPE_MAPPINGS.UI_TO_DB
      );
    }

    // Pour les issues
    if (req.body.type && req.path.includes("issues")) {
      req.body.type = transformEnum(
        req.body.type,
        ISSUE_TYPE_MAPPINGS.UI_TO_DB
      );
    }
    if (req.body.severity) {
      req.body.severity = transformEnum(
        req.body.severity,
        ISSUE_SEVERITY_MAPPINGS.UI_TO_DB
      );
    }
  }

  // Transformer les query params
  if (req.query && req.query.status && typeof req.query.status === "string") {
    const mapped = transformEnum(
      req.query.status,
      PRODUCTION_STATUS_MAPPINGS.UI_TO_DB
    );
    if (mapped) req.query.status = mapped;
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer une production
    const transformProduction = (production: any): any => {
      if (!production || typeof production !== "object") return production;

      const transformed = { ...production };

      if (transformed.status) {
        transformed.status =
          transformEnum(
            transformed.status,
            PRODUCTION_STATUS_MAPPINGS.DB_TO_UI
          ) || transformed.status;
      }

      // Transformer les activités
      if (transformed.activities && Array.isArray(transformed.activities)) {
        transformed.activities = transformed.activities.map(
          (activity: any) => ({
            ...activity,
            type:
              transformEnum(activity.type, ACTIVITY_TYPE_MAPPINGS.DB_TO_UI) ||
              activity.type,
          })
        );
      }

      // Transformer les issues
      if (transformed.issues && Array.isArray(transformed.issues)) {
        transformed.issues = transformed.issues.map((issue: any) => ({
          ...issue,
          type:
            transformEnum(issue.type, ISSUE_TYPE_MAPPINGS.DB_TO_UI) ||
            issue.type,
          severity:
            transformEnum(issue.severity, ISSUE_SEVERITY_MAPPINGS.DB_TO_UI) ||
            issue.severity,
        }));
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformProduction);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformProduction(transformedData.data);
      }
    } else if (transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformProduction);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformProduction(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Middleware de transformation pour les parcelles
 */
export const parcelTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body && req.body.status) {
    req.body.status = transformEnum(
      req.body.status,
      PARCEL_STATUS_MAPPINGS.UI_TO_DB
    );
  }

  // Transformer les query params
  if (req.query && req.query.status && typeof req.query.status === "string") {
    const mapped = transformEnum(
      req.query.status,
      PARCEL_STATUS_MAPPINGS.UI_TO_DB
    );
    if (mapped) req.query.status = mapped;
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction helper pour transformer une parcelle
    const transformParcel = (parcel: any): any => {
      if (!parcel || typeof parcel !== "object") return parcel;

      const transformed = { ...parcel };

      if (transformed.status) {
        transformed.status =
          transformEnum(transformed.status, PARCEL_STATUS_MAPPINGS.DB_TO_UI) ||
          transformed.status;
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer selon la structure de la réponse
    if (transformedData.success && transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformParcel);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformParcel(transformedData.data);
      }
    } else if (transformedData.data) {
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformParcel);
      } else if (typeof transformedData.data === "object") {
        transformedData.data = transformParcel(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Middleware de transformation complète (pour les rapports, stats, etc.)
 */
export const fullTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Transformation UI → DB pour les requêtes entrantes
  if (req.body) {
    // Transformer le type de rapport
    if (req.body.type) {
      req.body.type = transformEnum(
        req.body.type,
        REPORT_TYPE_MAPPINGS.UI_TO_DB
      );
    }
  }

  // Transformer les query params
  if (req.query) {
    if (req.query.type && typeof req.query.type === "string") {
      const mapped = transformEnum(
        req.query.type,
        REPORT_TYPE_MAPPINGS.UI_TO_DB
      );
      if (mapped) req.query.type = mapped;
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    // Fonction de transformation récursive
    const transformObject = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(transformObject);

      const transformed = { ...obj };

      // Transformer tous les enums possibles
      if (transformed.status) {
        if (transformed.seedLot || transformed.level) {
          transformed.status =
            transformEnum(transformed.status, LOT_STATUS_MAPPINGS.DB_TO_UI) ||
            transformed.status;
        } else if (transformed.activities || transformed.yield !== undefined) {
          transformed.status =
            transformEnum(
              transformed.status,
              PRODUCTION_STATUS_MAPPINGS.DB_TO_UI
            ) || transformed.status;
        } else if (transformed.area !== undefined) {
          transformed.status =
            transformEnum(
              transformed.status,
              PARCEL_STATUS_MAPPINGS.DB_TO_UI
            ) || transformed.status;
        } else if (transformed.certificationLevel !== undefined) {
          transformed.status =
            transformEnum(
              transformed.status,
              MULTIPLIER_STATUS_MAPPINGS.DB_TO_UI
            ) || transformed.status;
        } else if (transformed.expectedQuantity !== undefined) {
          transformed.status =
            transformEnum(
              transformed.status,
              CONTRACT_STATUS_MAPPINGS.DB_TO_UI
            ) || transformed.status;
        }
      }

      if (transformed.level) {
        transformed.level =
          transformEnum(transformed.level, SEED_LEVEL_MAPPINGS.DB_TO_UI) ||
          transformed.level;
      }

      if (transformed.cropType) {
        transformed.cropType =
          transformEnum(transformed.cropType, CROP_TYPE_MAPPINGS.DB_TO_UI) ||
          transformed.cropType;
      }

      if (transformed.role) {
        transformed.role =
          transformEnum(transformed.role, ROLE_MAPPINGS.DB_TO_UI) ||
          transformed.role;
      }

      if (transformed.result) {
        transformed.result =
          transformEnum(transformed.result, TEST_RESULT_MAPPINGS.DB_TO_UI) ||
          transformed.result;
      }

      if (transformed.certificationLevel) {
        transformed.certificationLevel =
          transformEnum(
            transformed.certificationLevel,
            CERTIFICATION_LEVEL_MAPPINGS.DB_TO_UI
          ) || transformed.certificationLevel;
      }

      if (transformed.type) {
        if (transformed.title !== undefined) {
          transformed.type =
            transformEnum(transformed.type, REPORT_TYPE_MAPPINGS.DB_TO_UI) ||
            transformed.type;
        } else if (transformed.activityDate !== undefined) {
          transformed.type =
            transformEnum(transformed.type, ACTIVITY_TYPE_MAPPINGS.DB_TO_UI) ||
            transformed.type;
        } else if (transformed.severity !== undefined) {
          transformed.type =
            transformEnum(transformed.type, ISSUE_TYPE_MAPPINGS.DB_TO_UI) ||
            transformed.type;
        }
      }

      if (transformed.severity) {
        transformed.severity =
          transformEnum(
            transformed.severity,
            ISSUE_SEVERITY_MAPPINGS.DB_TO_UI
          ) || transformed.severity;
      }

      // Transformer récursivement les propriétés objets
      for (const key in transformed) {
        if (transformed[key] && typeof transformed[key] === "object") {
          transformed[key] = transformObject(transformed[key]);
        }
      }

      return transformed;
    };

    // Cloner et transformer
    const transformedData = transformObject(JSON.parse(JSON.stringify(data)));

    return originalJson(transformedData);
  };

  next();
};
