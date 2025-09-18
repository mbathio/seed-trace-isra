// backend/src/middleware/validation.ts - VERSION SIMPLIFIÉE UNIFIÉE

import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";

/**
 * ✅ MIDDLEWARE DE VALIDATION SIMPLIFIÉ
 * Valide les données sans transformation - utilise les enums Prisma directement
 */
export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      // Validation du body
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          const errors = result.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );
          logger.warn("Body validation failed", {
            errors,
            body: req.body,
            path: req.path,
          });
          return ResponseHandler.validationError(res, errors);
        }
        // ✅ ASSIGNATION DIRECTE - plus de transformation
        req.body = result.data;
      }

      // Validation des query params
      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          const errors = result.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );
          logger.warn("Query validation failed", {
            errors,
            query: req.query,
            path: req.path,
          });
          return ResponseHandler.validationError(res, errors);
        }
        // ✅ ASSIGNATION DIRECTE
        req.query = result.data;
      }

      // Validation des paramètres d'URL
      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          const errors = result.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );
          logger.warn("Params validation failed", {
            errors,
            params: req.params,
            path: req.path,
          });
          return ResponseHandler.validationError(res, errors);
        }
        req.params = result.data;
      }

      next();
    } catch (error) {
      logger.error("Validation middleware error", { error, path: req.path });
      return ResponseHandler.serverError(res, "Erreur de validation");
    }
  };
}

/**
 * ✅ MIDDLEWARE POUR VALIDER LES IDs NUMÉRIQUES
 */
export function validateNumericId(paramName: string = "id") {
  const schema = z.object({
    [paramName]: z.string().transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        throw new z.ZodError([
          {
            code: "custom",
            message: `${paramName} doit être un nombre positif`,
            path: [paramName],
          },
        ]);
      }
      return parsed;
    }),
  });

  return validateRequest({ params: schema });
}

/**
 * ✅ MIDDLEWARE POUR VALIDER LA PAGINATION (simplifié)
 */
export function validatePagination() {
  const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    search: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  });

  return validateRequest({ query: paginationSchema });
}

/**
 * ✅ VALIDATION DES COORDONNÉES GPS
 */
export function validateCoordinates() {
  const coordinatesSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  });

  return validateRequest({ body: coordinatesSchema });
}

/**
 * ✅ VALIDATION DES DATES
 */
export function validateDates(fields: string[]) {
  const dateFields = fields.reduce((acc, field) => {
    acc[field] = z
      .string()
      .refine(
        (date) => !isNaN(Date.parse(date)),
        `${field} doit être une date valide`
      );
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);

  return validateRequest({ body: z.object(dateFields) });
}

/**
 * ✅ SANITISATION SIMPLE DES INPUTS
 */
export function sanitizeInput() {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Nettoyer les strings dans le body
      if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
      }

      // Nettoyer les query parameters
      if (req.query && typeof req.query === "object") {
        req.query = sanitizeObject(req.query);
      }

      next();
    } catch (error) {
      logger.error("Input sanitization error", { error });
      next();
    }
  };
}

/**
 * ✅ FONCTION UTILITAIRE POUR NETTOYER LES OBJETS
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  if (typeof obj === "string") {
    return obj
      .trim()
      .replace(/\s+/g, " ") // Remplacer les espaces multiples par un seul
      .slice(0, 10000); // Limiter la taille
  }

  return obj;
}

export default validateRequest;
