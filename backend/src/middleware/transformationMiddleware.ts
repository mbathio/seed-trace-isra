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
    const uiToDbStatusMap: Record<string, string> = {
      pending: "PENDING",
      certified: "CERTIFIED",
      rejected: "REJECTED",
      in_stock: "IN_STOCK",
      sold: "SOLD",
      active: "ACTIVE",
      distributed: "DISTRIBUTED",
    };

    if (uiToDbStatusMap[req.body.status]) {
      req.body.status = uiToDbStatusMap[req.body.status];
    }
  }

  // Intercepter la réponse pour transformation DB → UI
  const originalJson = res.json;
  res.json = function (data: any) {
    if (data?.data) {
      const dbToUiStatusMap: Record<string, string> = {
        PENDING: "pending",
        CERTIFIED: "certified",
        REJECTED: "rejected",
        IN_STOCK: "in_stock",
        SOLD: "sold",
        ACTIVE: "active",
        DISTRIBUTED: "distributed",
      };

      // Transformer un tableau
      if (Array.isArray(data.data)) {
        data.data = data.data.map((item: any) => {
          if (item.status && dbToUiStatusMap[item.status]) {
            return {
              ...item,
              status: dbToUiStatusMap[item.status],
            };
          }
          return item;
        });
      }
      // Transformer un seul objet
      else if (data.data.status && dbToUiStatusMap[data.data.status]) {
        data.data.status = dbToUiStatusMap[data.data.status];
      }
    }

    return originalJson.call(this, data);
  };

  next();
};
