// backend/src/middleware/transformationMiddleware.ts
import { Request, Response, NextFunction } from "express";

/**
 * Nettoie les paramètres de requête en supprimant les valeurs "undefined" (string)
 * et les valeurs vides
 */
const cleanQueryParams = (params: any): any => {
  const cleaned: any = {};

  Object.keys(params).forEach((key) => {
    const value = params[key];

    // Ignorer les valeurs qui sont littéralement "undefined" (string)
    // ou undefined (type) ou null ou vides
    if (
      value !== "undefined" &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

/**
 * Transforme les énumérations entre UI et DB pour les variétés
 */
export const varietyTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
    console.log("🔄 Query après nettoyage:", req.query);
  }

  // Transformation UI → DB pour les requêtes
  if (req.body?.cropType) {
    const uiToDbMap: Record<string, string> = {
      rice: "RICE",
      maize: "MAIZE",
      peanut: "PEANUT",
      sorghum: "SORGHUM",
      cowpea: "COWPEA",
      millet: "MILLET",
      wheat: "WHEAT",
    };

    if (uiToDbMap[req.body.cropType]) {
      req.body.cropType = uiToDbMap[req.body.cropType];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    if (data?.data) {
      const dbToUiMap: Record<string, string> = {
        RICE: "rice",
        MAIZE: "maize",
        PEANUT: "peanut",
        SORGHUM: "sorghum",
        COWPEA: "cowpea",
        MILLET: "millet",
        WHEAT: "wheat",
      };

      // Transformer un tableau de variétés
      if (Array.isArray(data.data)) {
        data.data = data.data.map((variety: any) => {
          if (variety.cropType && dbToUiMap[variety.cropType]) {
            return {
              ...variety,
              cropType: dbToUiMap[variety.cropType],
            };
          }
          return variety;
        });
      }
      // Transformer une seule variété
      else if (data.data.cropType && dbToUiMap[data.data.cropType]) {
        data.data.cropType = dbToUiMap[data.data.cropType];
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Transforme les énumérations entre UI et DB pour les lots de semences
 */
export const seedLotTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour les statuts
  if (req.body?.status) {
    const uiToDbMap: Record<string, string> = {
      available: "AVAILABLE",
      reserved: "RESERVED",
      sold: "SOLD",
      planted: "PLANTED",
      expired: "EXPIRED",
    };

    if (uiToDbMap[req.body.status]) {
      req.body.status = uiToDbMap[req.body.status];
    }
  }

  // Transformation UI → DB pour les niveaux de génération
  if (req.body?.generationLevel) {
    const uiToDbMap: Record<string, string> = {
      g0: "G0",
      g1: "G1",
      g2: "G2",
      g3: "G3",
      g4: "G4",
      r1: "R1",
      r2: "R2",
    };

    if (uiToDbMap[req.body.generationLevel]) {
      req.body.generationLevel = uiToDbMap[req.body.generationLevel];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    const statusDbToUiMap: Record<string, string> = {
      AVAILABLE: "available",
      RESERVED: "reserved",
      SOLD: "sold",
      PLANTED: "planted",
      EXPIRED: "expired",
    };

    const generationDbToUiMap: Record<string, string> = {
      G0: "g0",
      G1: "g1",
      G2: "g2",
      G3: "g3",
      G4: "g4",
      R1: "r1",
      R2: "r2",
    };

    // Fonction helper pour transformer un lot
    const transformLot = (lot: any) => {
      if (!lot) return lot;

      const transformed = { ...lot };

      if (lot.status && statusDbToUiMap[lot.status]) {
        transformed.status = statusDbToUiMap[lot.status];
      }

      if (lot.generationLevel && generationDbToUiMap[lot.generationLevel]) {
        transformed.generationLevel = generationDbToUiMap[lot.generationLevel];
      }

      return transformed;
    };

    // Transformer les données
    if (data?.data) {
      // Transformer un tableau de lots
      if (Array.isArray(data.data)) {
        data.data = data.data.map(transformLot);
      }
      // Transformer un seul lot
      else {
        data.data = transformLot(data.data);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Transforme les rôles entre UI et DB pour les utilisateurs
 */
export const userTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour les rôles
  if (req.body?.role) {
    const uiToDbMap: Record<string, string> = {
      admin: "ADMIN",
      manager: "MANAGER",
      inspector: "INSPECTOR",
      multiplier: "MULTIPLIER",
      guest: "GUEST",
      technician: "TECHNICIAN",
      researcher: "RESEARCHER",
    };

    if (uiToDbMap[req.body.role]) {
      req.body.role = uiToDbMap[req.body.role];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    const dbToUiMap: Record<string, string> = {
      ADMIN: "admin",
      MANAGER: "manager",
      INSPECTOR: "inspector",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
      TECHNICIAN: "technician",
      RESEARCHER: "researcher",
    };

    // Fonction helper pour transformer un utilisateur
    const transformUser = (user: any) => {
      if (!user || !user.role) return user;

      if (dbToUiMap[user.role]) {
        return {
          ...user,
          role: dbToUiMap[user.role],
        };
      }

      return user;
    };

    // Transformer les données utilisateur dans différents formats de réponse
    if (data?.user) {
      data.user = transformUser(data.user);
    }

    if (data?.data) {
      // Transformer un tableau d'utilisateurs
      if (Array.isArray(data.data)) {
        data.data = data.data.map(transformUser);
      }
      // Transformer un seul utilisateur
      else {
        data.data = transformUser(data.data);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Transforme les énumérations entre UI et DB pour les multiplicateurs
 */
export const multiplierTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour les statuts
  if (req.body?.status) {
    const uiToDbMap: Record<string, string> = {
      active: "ACTIVE",
      inactive: "INACTIVE",
      suspended: "SUSPENDED",
    };

    if (uiToDbMap[req.body.status]) {
      req.body.status = uiToDbMap[req.body.status];
    }
  }

  // Transformation UI → DB pour les niveaux de certification
  if (req.body?.certificationLevel) {
    const uiToDbMap: Record<string, string> = {
      basic: "BASIC",
      intermediate: "INTERMEDIATE",
      advanced: "ADVANCED",
    };

    if (uiToDbMap[req.body.certificationLevel]) {
      req.body.certificationLevel = uiToDbMap[req.body.certificationLevel];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    const statusDbToUiMap: Record<string, string> = {
      ACTIVE: "active",
      INACTIVE: "inactive",
      SUSPENDED: "suspended",
    };

    const certificationDbToUiMap: Record<string, string> = {
      BASIC: "basic",
      INTERMEDIATE: "intermediate",
      ADVANCED: "advanced",
    };

    // Fonction helper pour transformer un multiplicateur
    const transformMultiplier = (multiplier: any) => {
      if (!multiplier) return multiplier;

      const transformed = { ...multiplier };

      if (multiplier.status && statusDbToUiMap[multiplier.status]) {
        transformed.status = statusDbToUiMap[multiplier.status];
      }

      if (
        multiplier.certificationLevel &&
        certificationDbToUiMap[multiplier.certificationLevel]
      ) {
        transformed.certificationLevel =
          certificationDbToUiMap[multiplier.certificationLevel];
      }

      return transformed;
    };

    // Transformer les données
    if (data?.data) {
      // Transformer un tableau de multiplicateurs
      if (Array.isArray(data.data)) {
        data.data = data.data.map(transformMultiplier);
      }
      // Transformer un seul multiplicateur
      else {
        data.data = transformMultiplier(data.data);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Transforme les énumérations entre UI et DB pour les contrôles qualité
 */
export const qualityControlTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour les résultats de test
  if (req.body?.testResult) {
    const uiToDbMap: Record<string, string> = {
      passed: "PASSED",
      failed: "FAILED",
      pending: "PENDING",
    };

    if (uiToDbMap[req.body.testResult]) {
      req.body.testResult = uiToDbMap[req.body.testResult];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    const dbToUiMap: Record<string, string> = {
      PASSED: "passed",
      FAILED: "failed",
      PENDING: "pending",
    };

    // Fonction helper pour transformer un contrôle qualité
    const transformQualityControl = (qc: any) => {
      if (!qc || !qc.testResult) return qc;

      if (dbToUiMap[qc.testResult]) {
        return {
          ...qc,
          testResult: dbToUiMap[qc.testResult],
        };
      }

      return qc;
    };

    // Transformer les données
    if (data?.data) {
      // Transformer un tableau de contrôles qualité
      if (Array.isArray(data.data)) {
        data.data = data.data.map(transformQualityControl);
      }
      // Transformer un seul contrôle qualité
      else {
        data.data = transformQualityControl(data.data);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Transforme les énumérations entre UI et DB pour les parcelles
 */
export const parcelTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour les statuts
  if (req.body?.status) {
    const uiToDbMap: Record<string, string> = {
      available: "AVAILABLE",
      occupied: "OCCUPIED",
      maintenance: "MAINTENANCE",
    };

    if (uiToDbMap[req.body.status]) {
      req.body.status = uiToDbMap[req.body.status];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    const dbToUiMap: Record<string, string> = {
      AVAILABLE: "available",
      OCCUPIED: "occupied",
      MAINTENANCE: "maintenance",
    };

    // Fonction helper pour transformer une parcelle
    const transformParcel = (parcel: any) => {
      if (!parcel || !parcel.status) return parcel;

      if (dbToUiMap[parcel.status]) {
        return {
          ...parcel,
          status: dbToUiMap[parcel.status],
        };
      }

      return parcel;
    };

    // Transformer les données
    if (data?.data) {
      // Transformer un tableau de parcelles
      if (Array.isArray(data.data)) {
        data.data = data.data.map(transformParcel);
      }
      // Transformer une seule parcelle
      else {
        data.data = transformParcel(data.data);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Middleware de transformation complet pour toutes les entités
 * Utile pour les routes qui manipulent plusieurs types d'entités
 */
export const fullTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête une seule fois
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Créer une chaîne de middlewares
  const middlewares = [
    varietyTransformation,
    seedLotTransformation,
    userTransformation,
    multiplierTransformation,
    qualityControlTransformation,
    parcelTransformation,
  ];

  // Appliquer chaque transformation
  let originalJson = res.json;
  const transformedJsonFunctions: Function[] = [];

  middlewares.forEach((middleware) => {
    // Créer un mock response pour capturer la transformation
    const mockRes = {
      ...res,
      json: function (data: any) {
        return data;
      },
    };

    // Appliquer le middleware
    middleware(req, mockRes as any, () => {});

    // Capturer la fonction json transformée
    if (mockRes.json !== res.json) {
      transformedJsonFunctions.push(mockRes.json);
    }
  });

  // Combiner toutes les transformations
  res.json = function (data: any) {
    let result = data;

    // Appliquer toutes les transformations dans l'ordre
    transformedJsonFunctions.forEach((transformFn) => {
      result = transformFn.call(this, result);
    });

    // Appeler la fonction originale
    return originalJson.call(this, result);
  };

  next();
};
