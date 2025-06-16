// backend/src/middleware/transformationMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
// Importer depuis le nouveau fichier transformers.ts
import {
  transformObjectUIToDB,
  transformObjectDBToUI,
  transformQueryParams,
} from "../utils/transformers";

// ===== OPTIONS DE TRANSFORMATION =====
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

/**
 * Middleware pour les contrats
 */
export const contractTransformation = createTransformationMiddleware({
  input: true,
  output: true,
  query: true,
  logTransformations: process.env.NODE_ENV === "development",
});

// Log de chargement du middleware
if (process.env.NODE_ENV === "development") {
  logger.info("🔧 Transformation middleware loaded");
}
