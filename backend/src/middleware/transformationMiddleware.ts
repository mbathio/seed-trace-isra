// backend/src/middleware/transformationMiddleware.ts

import { Request, Response, NextFunction } from "express";

/**
 * Nettoie les paramètres de requête en convertissant
 * les strings en types appropriés
 */
const cleanQueryParams = (query: any): any => {
  const cleaned = { ...query };

  // Convertir les paramètres booléens
  ["includeRelations", "includeSources", "includeProductions"].forEach(
    (param) => {
      if (cleaned[param] === "true") cleaned[param] = true;
      else if (cleaned[param] === "false") cleaned[param] = false;
    }
  );

  // Convertir les paramètres numériques
  [
    "page",
    "limit",
    "pageSize",
    "multiplierId",
    "parcelId",
    "inspectorId",
    "year",
  ].forEach((param) => {
    if (cleaned[param]) {
      const num = parseInt(cleaned[param], 10);
      if (!isNaN(num)) cleaned[param] = num;
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
  }

  // Transformation UI → DB pour les catégories et types
  if (req.body?.category) {
    const uiToDbMap: Record<string, string> = {
      cereal: "CEREAL",
      vegetable: "VEGETABLE",
      leguminous: "LEGUMINOUS",
      tuber: "TUBER",
      industrial: "INDUSTRIAL",
      forage: "FORAGE",
    };

    if (uiToDbMap[req.body.category]) {
      req.body.category = uiToDbMap[req.body.category];
    }
  }

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
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer si pas de données
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const categoryDbToUiMap: Record<string, string> = {
      CEREAL: "cereal",
      VEGETABLE: "vegetable",
      LEGUMINOUS: "leguminous",
      TUBER: "tuber",
      INDUSTRIAL: "industrial",
      FORAGE: "forage",
    };

    const cropTypeDbToUiMap: Record<string, string> = {
      RICE: "rice",
      MAIZE: "maize",
      PEANUT: "peanut",
      SORGHUM: "sorghum",
      COWPEA: "cowpea",
      MILLET: "millet",
      WHEAT: "wheat",
    };

    // Fonction helper pour transformer une variété
    const transformVariety = (variety: any) => {
      if (!variety || typeof variety !== "object") return variety;

      const transformed = { ...variety };

      if (variety.category && categoryDbToUiMap[variety.category]) {
        transformed.category = categoryDbToUiMap[variety.category];
      }

      if (variety.cropType && cropTypeDbToUiMap[variety.cropType]) {
        transformed.cropType = cropTypeDbToUiMap[variety.cropType];
      }

      return transformed;
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
    req.body.level = req.body.level.toUpperCase();
  }

  if (req.body?.status) {
    const uiToDbMap: Record<string, string> = {
      pending: "PENDING",
      certified: "CERTIFIED",
      rejected: "REJECTED",
      "in-stock": "IN_STOCK",
      sold: "SOLD",
      active: "ACTIVE",
      distributed: "DISTRIBUTED",
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

    const statusDbToUiMap: Record<string, string> = {
      PENDING: "pending",
      CERTIFIED: "certified",
      REJECTED: "rejected",
      IN_STOCK: "in-stock",
      SOLD: "sold",
      ACTIVE: "active",
      DISTRIBUTED: "distributed",
    };

    const levelDbToUiMap: Record<string, string> = {
      GO: "go",
      G1: "g1",
      G2: "g2",
      G3: "g3",
      G4: "g4",
      R1: "r1",
      R2: "r2",
      N: "n",
    };

    // Fonction helper pour transformer un lot
    const transformLot = (lot: any): any => {
      if (!lot || typeof lot !== "object") return lot;

      const transformed = { ...lot };

      if (lot.status && statusDbToUiMap[lot.status]) {
        transformed.status = statusDbToUiMap[lot.status];
      }

      if (lot.level && levelDbToUiMap[lot.level.toUpperCase()]) {
        transformed.level = levelDbToUiMap[lot.level.toUpperCase()];
      }

      return transformed;
    };

    // Cloner les données pour éviter les mutations
    const transformedData = JSON.parse(JSON.stringify(data));

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau de lots
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformLot);
      }
      // Transformer un seul lot
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformLot(transformedData.data);
      }
    }

    return originalJson(transformedData);
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
      technician: "TECHNICIAN",
      inspector: "INSPECTOR",
      researcher: "RESEARCHER",
      multiplier: "MULTIPLIER",
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
      TECHNICIAN: "technician",
      INSPECTOR: "inspector",
      RESEARCHER: "researcher",
      MULTIPLIER: "multiplier",
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

    // Transformer les données
    if (transformedData?.data) {
      // Transformer un tableau d'utilisateurs
      if (Array.isArray(transformedData.data)) {
        transformedData.data = transformedData.data.map(transformUser);
      }
      // Transformer un seul utilisateur
      else if (typeof transformedData.data === "object") {
        transformedData.data = transformUser(transformedData.data);
      }
    }

    // Gérer aussi le cas où l'utilisateur est dans un objet auth (login)
    if (transformedData?.user) {
      transformedData.user = transformUser(transformedData.user);
    }

    return originalJson(transformedData);
  };

  next();
};

/**
 * ✅ CORRIGÉ: Transforme les énumérations entre UI et DB pour les multiplicateurs
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

  // Transformation UI → DB pour le statut
  if (req.body?.status) {
    const uiToDbMap: Record<string, string> = {
      active: "ACTIVE",
      inactive: "INACTIVE",
    };

    if (uiToDbMap[req.body.status]) {
      req.body.status = uiToDbMap[req.body.status];
    }
  }

  // Transformation UI → DB pour le niveau de certification
  if (req.body?.certificationLevel) {
    const uiToDbMap: Record<string, string> = {
      beginner: "BEGINNER",
      intermediate: "INTERMEDIATE",
      expert: "EXPERT",
    };

    if (uiToDbMap[req.body.certificationLevel]) {
      req.body.certificationLevel = uiToDbMap[req.body.certificationLevel];
    }
  }

  // Transformation UI → DB pour la spécialisation
  if (req.body?.specialization && Array.isArray(req.body.specialization)) {
    const uiToDbMap: Record<string, string> = {
      rice: "RICE",
      maize: "MAIZE",
      peanut: "PEANUT",
      sorghum: "SORGHUM",
      cowpea: "COWPEA",
      millet: "MILLET",
      wheat: "WHEAT",
    };

    req.body.specialization = req.body.specialization.map(
      (spec: string) => uiToDbMap[spec] || spec
    );
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const statusDbToUiMap: Record<string, string> = {
      ACTIVE: "active",
      INACTIVE: "inactive",
    };

    const certLevelDbToUiMap: Record<string, string> = {
      BEGINNER: "beginner",
      INTERMEDIATE: "intermediate",
      EXPERT: "expert",
    };

    const cropDbToUiMap: Record<string, string> = {
      RICE: "rice",
      MAIZE: "maize",
      PEANUT: "peanut",
      SORGHUM: "sorghum",
      COWPEA: "cowpea",
      MILLET: "millet",
      WHEAT: "wheat",
    };

    const transformMultiplier = (multiplier: any) => {
      if (!multiplier || typeof multiplier !== "object") return multiplier;

      const transformed = { ...multiplier };

      if (multiplier.status && statusDbToUiMap[multiplier.status]) {
        transformed.status = statusDbToUiMap[multiplier.status];
      }

      if (
        multiplier.certificationLevel &&
        certLevelDbToUiMap[multiplier.certificationLevel]
      ) {
        transformed.certificationLevel =
          certLevelDbToUiMap[multiplier.certificationLevel];
      }

      if (
        multiplier.specialization &&
        Array.isArray(multiplier.specialization)
      ) {
        transformed.specialization = multiplier.specialization.map(
          (spec: string) => cropDbToUiMap[spec] || spec
        );
      }

      return transformed;
    };

    const transformedData = JSON.parse(JSON.stringify(data));

    if (transformedData?.data) {
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
 * ✅ CORRIGÉ: Transforme les énumérations entre UI et DB pour les contrôles qualité
 */
export const qualityControlTransformation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.query) {
    req.query = cleanQueryParams(req.query);
  }

  // Transformation UI → DB pour le résultat
  if (req.body?.result) {
    const uiToDbMap: Record<string, string> = {
      passed: "PASS",
      failed: "FAIL",
      pending: "PENDING",
    };

    if (uiToDbMap[req.body.result]) {
      req.body.result = uiToDbMap[req.body.result];
    }
  }

  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (!data || typeof data !== "object") {
      return originalJson(data);
    }

    const dbToUiMap: Record<string, string> = {
      PASS: "passed",
      FAIL: "failed",
      PENDING: "pending",
    };

    const transformQualityControl = (qc: any) => {
      if (!qc || typeof qc !== "object") return qc;

      const transformed = { ...qc };

      if (qc.result && dbToUiMap[qc.result]) {
        transformed.result = dbToUiMap[qc.result];
      }

      return transformed;
    };

    const transformedData = JSON.parse(JSON.stringify(data));

    if (transformedData?.data) {
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
      "in-use": "IN_USE",
      resting: "RESTING",
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
      IN_USE: "in-use",
      RESTING: "resting",
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
    productionTransformation,
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
