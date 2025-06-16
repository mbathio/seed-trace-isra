// backend/src/middleware/transformationMiddleware.ts - VERSION CORRIGÉE
import { Request, Response, NextFunction } from "express";

/**
 * Helper pour nettoyer les paramètres de requête
 */
const cleanQueryParams = (query: any): any => {
  const cleaned: any = {};

  for (const key in query) {
    if (query[key] !== undefined && query[key] !== null && query[key] !== "") {
      cleaned[key] = query[key];
    }
  }

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
  }

  // Transformation UI → DB pour les catégories
  if (req.body?.category) {
    const uiToDbMap: Record<string, string> = {
      cereal: "CEREAL",
      legume: "LEGUME",
      vegetable: "VEGETABLE",
      tuber: "TUBER",
      industrial: "INDUSTRIAL",
      forage: "FORAGE",
    };

    if (uiToDbMap[req.body.category]) {
      req.body.category = uiToDbMap[req.body.category];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const dbToUiMap: Record<string, string> = {
      CEREAL: "cereal",
      LEGUME: "legume",
      VEGETABLE: "vegetable",
      TUBER: "tuber",
      INDUSTRIAL: "industrial",
      FORAGE: "forage",
    };

    // Fonction helper pour transformer une variété
    const transformVariety = (variety: any) => {
      if (!variety || !variety.category || typeof variety !== "object")
        return variety;

      if (dbToUiMap[variety.category]) {
        return {
          ...variety,
          category: dbToUiMap[variety.category],
        };
      }

      return variety;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de variétés
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformVariety);
      }
      // Transformer une seule variété
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformVariety(transformedData.data);
      }
    }

    return originalJson(transformedData);
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

  // Transformation UI → DB pour les niveaux et statuts
  if (req.body?.level) {
    const uiToDbMap: Record<string, string> = {
      g0: "G0",
      g1: "G1",
      g2: "G2",
      g3: "G3",
      g4: "G4",
      r1: "R1",
      r2: "R2",
    };

    if (uiToDbMap[req.body.level.toLowerCase()]) {
      req.body.level = uiToDbMap[req.body.level.toLowerCase()];
    }
  }

  if (req.body?.status) {
    const statusUiToDbMap: Record<string, string> = {
      available: "AVAILABLE",
      reserved: "RESERVED",
      distributed: "DISTRIBUTED",
      expired: "EXPIRED",
    };

    if (statusUiToDbMap[req.body.status]) {
      req.body.status = statusUiToDbMap[req.body.status];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const levelDbToUiMap: Record<string, string> = {
      G0: "g0",
      G1: "g1",
      G2: "g2",
      G3: "g3",
      G4: "g4",
      R1: "r1",
      R2: "r2",
    };

    const statusDbToUiMap: Record<string, string> = {
      AVAILABLE: "available",
      RESERVED: "reserved",
      DISTRIBUTED: "distributed",
      EXPIRED: "expired",
    };

    // Fonction helper pour transformer un lot
    const transformSeedLot = (lot: any) => {
      if (!lot || typeof lot !== "object") return lot;

      const transformed = { ...lot };

      if (lot.level && levelDbToUiMap[lot.level]) {
        transformed.level = levelDbToUiMap[lot.level];
      }

      if (lot.status && statusDbToUiMap[lot.status]) {
        transformed.status = statusDbToUiMap[lot.status];
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de lots
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformSeedLot);
      }
      // Transformer un seul lot
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformSeedLot(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Transforme les énumérations entre UI et DB pour les utilisateurs
 * IMPORTANT: Ce middleware ne doit transformer que les données, pas les routes d'auth
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

  // Transformation UI → DB pour les rôles UNIQUEMENT dans le body
  if (req.body?.role && req.path !== "/login" && req.path !== "/register") {
    const uiToDbMap: Record<string, string> = {
      admin: "ADMIN",
      manager: "MANAGER",
      researcher: "RESEARCHER",
      technician: "TECHNICIAN",
      inspector: "INSPECTOR",
      multiplier: "MULTIPLIER",
      guest: "GUEST",
    };

    if (uiToDbMap[req.body.role]) {
      req.body.role = uiToDbMap[req.body.role];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const dbToUiMap: Record<string, string> = {
      ADMIN: "admin",
      MANAGER: "manager",
      RESEARCHER: "researcher",
      TECHNICIAN: "technician",
      INSPECTOR: "inspector",
      MULTIPLIER: "multiplier",
      GUEST: "guest",
    };

    // Fonction helper pour transformer un utilisateur
    const transformUser = (user: any) => {
      if (!user || !user.role || typeof user !== "object") return user;

      if (dbToUiMap[user.role]) {
        return {
          ...user,
          role: dbToUiMap[user.role],
        };
      }

      return user;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données selon la structure de la réponse
    if (transformedData?.data) {
      // Pour les réponses d'authentification avec structure { user, tokens }
      if (transformedData.data.user && transformedData.data.tokens) {
        transformedData.data.user = transformUser(transformedData.data.user);
      }
      // Pour un tableau d'utilisateurs
      else if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformUser);
      }
      // Pour un seul utilisateur
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformUser(transformedData.data);
      }
    }

    return originalJson(transformedData);
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

  // Transformation UI → DB pour les types
  if (req.body?.type) {
    const uiToDbMap: Record<string, string> = {
      individual: "INDIVIDUAL",
      cooperative: "COOPERATIVE",
      company: "COMPANY",
    };

    if (uiToDbMap[req.body.type]) {
      req.body.type = uiToDbMap[req.body.type];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const dbToUiMap: Record<string, string> = {
      INDIVIDUAL: "individual",
      COOPERATIVE: "cooperative",
      COMPANY: "company",
    };

    // Fonction helper pour transformer un multiplicateur
    const transformMultiplier = (multiplier: any) => {
      if (!multiplier || !multiplier.type || typeof multiplier !== "object")
        return multiplier;

      if (dbToUiMap[multiplier.type]) {
        return {
          ...multiplier,
          type: dbToUiMap[multiplier.type],
        };
      }

      return multiplier;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de multiplicateurs
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformMultiplier);
      }
      // Transformer un seul multiplicateur
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformMultiplier(transformedData.data);
      }
    }

    return originalJson(transformedData);
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
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const dbToUiMap: Record<string, string> = {
      PASSED: "passed",
      FAILED: "failed",
      PENDING: "pending",
    };

    // Fonction helper pour transformer un contrôle qualité
    const transformQualityControl = (qc: any) => {
      if (!qc || !qc.testResult || typeof qc !== "object") return qc;

      if (dbToUiMap[qc.testResult]) {
        return {
          ...qc,
          testResult: dbToUiMap[qc.testResult],
        };
      }

      return qc;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de contrôles qualité
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(
          transformQualityControl
        );
      }
      // Transformer un seul contrôle qualité
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformQualityControl(transformedData.data);
      }
    }

    return originalJson(transformedData);
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
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const dbToUiMap: Record<string, string> = {
      AVAILABLE: "available",
      OCCUPIED: "occupied",
      MAINTENANCE: "maintenance",
    };

    // Fonction helper pour transformer une parcelle
    const transformParcel = (parcel: any) => {
      if (!parcel || !parcel.status || typeof parcel !== "object")
        return parcel;

      if (dbToUiMap[parcel.status]) {
        return {
          ...parcel,
          status: dbToUiMap[parcel.status],
        };
      }

      return parcel;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de parcelles
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformParcel);
      }
      // Transformer une seule parcelle
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformParcel(transformedData.data);
      }
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * Transforme les énumérations entre UI et DB pour les productions
 */
export const productionTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour les statuts et types
  if (req.body?.status) {
    const statusUiToDbMap: Record<string, string> = {
      planned: "PLANNED",
      "in-progress": "IN_PROGRESS",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    };

    if (statusUiToDbMap[req.body.status]) {
      req.body.status = statusUiToDbMap[req.body.status];
    }
  }

  if (req.body?.type) {
    const typeUiToDbMap: Record<string, string> = {
      "soil-preparation": "SOIL_PREPARATION",
      sowing: "SOWING",
      fertilization: "FERTILIZATION",
      irrigation: "IRRIGATION",
      weeding: "WEEDING",
      "pest-control": "PEST_CONTROL",
      harvest: "HARVEST",
      other: "OTHER",
    };

    if (typeUiToDbMap[req.body.type]) {
      req.body.type = typeUiToDbMap[req.body.type];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const statusDbToUiMap: Record<string, string> = {
      PLANNED: "planned",
      IN_PROGRESS: "in-progress",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    };

    const typeDbToUiMap: Record<string, string> = {
      SOIL_PREPARATION: "soil-preparation",
      SOWING: "sowing",
      FERTILIZATION: "fertilization",
      IRRIGATION: "irrigation",
      WEEDING: "weeding",
      PEST_CONTROL: "pest-control",
      HARVEST: "harvest",
      OTHER: "other",
    };

    // Fonction helper pour transformer une production
    const transformProduction = (production: any) => {
      if (!production || typeof production !== "object") return production;

      const transformed = { ...production };

      if (production.status && statusDbToUiMap[production.status]) {
        transformed.status = statusDbToUiMap[production.status];
      }

      // Transformer les activités si présentes
      if (production.activities && Array.isArray(production.activities)) {
        transformed.activities = production.activities.map((activity: any) => {
          if (activity.type && typeDbToUiMap[activity.type]) {
            return {
              ...activity,
              type: typeDbToUiMap[activity.type],
            };
          }
          return activity;
        });
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de productions
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformProduction);
      }
      // Transformer une seule production
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformProduction(transformedData.data);
      }
    }

    return originalJson(transformedData);
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
  // Appliquer toutes les transformations séquentiellement
  const middlewares = [
    varietyTransformation,
    seedLotTransformation,
    userTransformation,
    multiplierTransformation,
    qualityControlTransformation,
    parcelTransformation,
    productionTransformation, // Ajouté ici aussi
  ];

  // Fonction récursive pour appliquer les middlewares
  const applyMiddleware = (index: number) => {
    if (index >= middlewares.length) {
      next();
      return;
    }

    middlewares[index](req, res, () => {
      applyMiddleware(index + 1);
    });
  };

  applyMiddleware(0);
};
