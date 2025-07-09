// backend/src/middleware/enumTransformMiddleware-fixed.ts
import { Request, Response, NextFunction } from "express";
import { EnumTransformer } from "../utils/enumHelpers";

// Middleware de transformation générique pour toutes les requêtes
export const enumTransformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const systemParams = [
    "page",
    "pageSize",
    "sortBy",
    "sortOrder",
    "search",
    "includeRelations",
  ];

  // Transformer les données de requête (UI -> DB)
  if (req.body) {
    req.body = transformRequestData(req.body);
  }

  if (req.query) {
    const transformedQuery: any = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (systemParams.includes(key)) {
        // Garder les paramètres système tels quels
        transformedQuery[key] = value;
      } else {
        // Transformer les autres paramètres
        transformedQuery[key] = transformRequestData({ [key]: value })[key];
      }
    }

    req.query = transformedQuery;
  }

  // Intercepter la réponse pour transformer (DB -> UI)
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    // Ne pas transformer les erreurs de validation
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

  // Transformer les champs connus
  for (const key in transformed) {
    const value = transformed[key];

    if (typeof value === "string") {
      // Transformation des rôles
      if (key === "role") {
        const dbValue = EnumTransformer.transformRole(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation des types de cultures
      else if (key === "cropType") {
        const dbValue = EnumTransformer.transformCropType(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation des statuts
      else if (key === "status") {
        // Essayer différents types de statuts selon le contexte
        const lotStatus = EnumTransformer.transformLotStatus(value, "toDb");
        const parcelStatus = EnumTransformer.transformParcelStatus(
          value,
          "toDb"
        );
        const productionStatus = EnumTransformer.transformProductionStatus(
          value,
          "toDb"
        );
        const multiplierStatus = EnumTransformer.transformMultiplierStatus(
          value,
          "toDb"
        );
        const contractStatus = EnumTransformer.transformContractStatus(
          value,
          "toDb"
        );

        if (lotStatus) transformed[key] = lotStatus;
        else if (parcelStatus) transformed[key] = parcelStatus;
        else if (productionStatus) transformed[key] = productionStatus;
        else if (multiplierStatus) transformed[key] = multiplierStatus;
        else if (contractStatus) transformed[key] = contractStatus;
      }

      // Transformation des résultats de tests
      else if (key === "result") {
        const dbValue = EnumTransformer.transformTestResult(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation des niveaux de certification
      else if (key === "certificationLevel") {
        const dbValue = EnumTransformer.transformCertificationLevel(
          value,
          "toDb"
        );
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation des types d'activités
      else if (key === "type" && transformed.hasOwnProperty("activityDate")) {
        const dbValue = EnumTransformer.transformActivityType(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation des types de problèmes
      else if (key === "type" && transformed.hasOwnProperty("severity")) {
        const dbValue = EnumTransformer.transformIssueType(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation de la sévérité
      else if (key === "severity") {
        const dbValue = EnumTransformer.transformIssueSeverity(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }

      // Transformation des types de rapports
      else if (key === "type" && transformed.hasOwnProperty("title")) {
        const dbValue = EnumTransformer.transformReportType(value, "toDb");
        if (dbValue) transformed[key] = dbValue;
      }
    }

    // Transformer récursivement les objets imbriqués
    else if (typeof value === "object" && value !== null) {
      transformed[key] = transformRequestData(value);
    }
  }

  // Gérer le cas spécial seedLevel -> level
  if (transformed.seedLevel && !transformed.level) {
    transformed.level = transformed.seedLevel;
    delete transformed.seedLevel;
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

  // Transformer les champs connus
  for (const key in transformed) {
    const value = transformed[key];

    if (typeof value === "string") {
      // Transformation des rôles
      if (key === "role") {
        const uiValue = EnumTransformer.transformRole(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation des types de cultures
      else if (key === "cropType") {
        const uiValue = EnumTransformer.transformCropType(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation des statuts
      else if (key === "status") {
        // Déterminer le type de statut selon le contexte
        if (EnumTransformer.isDbEnum(value, "lotStatus")) {
          const uiValue = EnumTransformer.transformLotStatus(value, "toUi");
          if (uiValue) transformed[key] = uiValue;
        } else if (EnumTransformer.isDbEnum(value, "parcelStatus")) {
          const uiValue = EnumTransformer.transformParcelStatus(value, "toUi");
          if (uiValue) transformed[key] = uiValue;
        } else if (EnumTransformer.isDbEnum(value, "productionStatus")) {
          const uiValue = EnumTransformer.transformProductionStatus(
            value,
            "toUi"
          );
          if (uiValue) transformed[key] = uiValue;
        } else if (EnumTransformer.isDbEnum(value, "multiplierStatus")) {
          const uiValue = EnumTransformer.transformMultiplierStatus(
            value,
            "toUi"
          );
          if (uiValue) transformed[key] = uiValue;
        } else if (EnumTransformer.isDbEnum(value, "contractStatus")) {
          const uiValue = EnumTransformer.transformContractStatus(
            value,
            "toUi"
          );
          if (uiValue) transformed[key] = uiValue;
        }
      }

      // Transformation des résultats de tests
      else if (key === "result") {
        const uiValue = EnumTransformer.transformTestResult(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation des niveaux de certification
      else if (key === "certificationLevel") {
        const uiValue = EnumTransformer.transformCertificationLevel(
          value,
          "toUi"
        );
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation des types d'activités
      else if (
        key === "type" &&
        EnumTransformer.isDbEnum(value, "activityType")
      ) {
        const uiValue = EnumTransformer.transformActivityType(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation des types de problèmes
      else if (key === "type" && EnumTransformer.isDbEnum(value, "issueType")) {
        const uiValue = EnumTransformer.transformIssueType(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation de la sévérité
      else if (key === "severity") {
        const uiValue = EnumTransformer.transformIssueSeverity(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }

      // Transformation des types de rapports
      else if (
        key === "type" &&
        EnumTransformer.isDbEnum(value, "reportType")
      ) {
        const uiValue = EnumTransformer.transformReportType(value, "toUi");
        if (uiValue) transformed[key] = uiValue;
      }
    }

    // Transformer récursivement les objets imbriqués
    else if (typeof value === "object" && value !== null && key !== "data") {
      transformed[key] = transformResponseData(value);
    }
  }

  return transformed;
}

// Middlewares spécifiques pour chaque module (gardés pour compatibilité)
export const seedLotTransformMiddleware = enumTransformMiddleware;
export const varietyTransformMiddleware = enumTransformMiddleware;
export const multiplierTransformMiddleware = enumTransformMiddleware;
export const parcelTransformMiddleware = enumTransformMiddleware;
export const productionTransformMiddleware = enumTransformMiddleware;
export const qualityControlTransformMiddleware = enumTransformMiddleware;
export const userTransformMiddleware = enumTransformMiddleware;

// Alias pour les imports dans les routes
export const seedLotTransformation = enumTransformMiddleware;
export const varietyTransformation = enumTransformMiddleware;
export const multiplierTransformation = enumTransformMiddleware;
export const parcelTransformation = enumTransformMiddleware;
export const productionTransformation = enumTransformMiddleware;
export const qualityControlTransformation = enumTransformMiddleware;
export const userTransformation = enumTransformMiddleware;
export const fullTransformation = enumTransformMiddleware;
