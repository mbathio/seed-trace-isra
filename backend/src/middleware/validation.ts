// backend/src/middleware/validation.ts - VERSION SIMPLIFIÉE

import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";

/**
 * Middleware de validation Zod simplifié
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
 * Middleware de validation optionnelle
 * Valide si les données sont présentes mais n'échoue pas si elles sont absentes
 */
export function validateRequestOptional(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      // Validation optionnelle du body
      if (schema.body && req.body && Object.keys(req.body).length > 0) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          const errors = result.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );
          logger.warn("Optional body validation failed", { errors });
          return ResponseHandler.validationError(res, errors);
        }
        req.body = result.data;
      }

      // Validation optionnelle des query params
      if (schema.query && req.query && Object.keys(req.query).length > 0) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          const errors = result.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );
          logger.warn("Optional query validation failed", { errors });
          return ResponseHandler.validationError(res, errors);
        }
        req.query = result.data;
      }

      next();
    } catch (error) {
      logger.error("Optional validation middleware error", { error });
      return ResponseHandler.serverError(res, "Erreur de validation");
    }
  };
}

/**
 * Middleware pour valider les IDs dans les paramètres d'URL
 */
export function validateId(paramName: string = "id") {
  const schema = z.object({
    [paramName]: z.string().min(1, `${paramName} requis`),
  });

  return validateRequest({ params: schema });
}

/**
 * Middleware pour valider les IDs numériques
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
 * Middleware pour valider la pagination
 */
export function validatePagination() {
  const paginationSchema = z.object({
    page: z
      .union([z.string(), z.number()])
      .transform((val) => {
        const num = typeof val === "string" ? parseInt(val, 10) : val;
        return Math.max(1, isNaN(num) ? 1 : num);
      })
      .optional(),
    pageSize: z
      .union([z.string(), z.number()])
      .transform((val) => {
        const num = typeof val === "string" ? parseInt(val, 10) : val;
        return Math.min(Math.max(1, isNaN(num) ? 10 : num), 100);
      })
      .optional(),
    search: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  });

  return validateRequestOptional({ query: paginationSchema });
}

/**
 * Utilitaire pour créer des validateurs personnalisés
 */
export function createCustomValidator<T>(
  validationFn: (data: any) => { success: boolean; data?: T; errors?: string[] }
) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      const result = validationFn(req.body);

      if (!result.success) {
        return ResponseHandler.validationError(res, result.errors || []);
      }

      if (result.data) {
        req.body = result.data;
      }

      next();
    } catch (error) {
      logger.error("Custom validation error", { error });
      return ResponseHandler.serverError(
        res,
        "Erreur de validation personnalisée"
      );
    }
  };
}

/**
 * Middleware pour nettoyer les données d'entrée
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
 * Fonction utilitaire pour nettoyer récursivement un objet
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

/**
 * Middleware pour valider les uploads de fichiers
 */
export function validateFileUpload(
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    required?: boolean;
  } = {}
) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB par défaut
    allowedTypes = ["jpg", "jpeg", "png", "pdf", "csv", "xlsx"],
    required = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      const file = (req as any).file || (req as any).files?.[0];

      if (!file) {
        if (required) {
          return ResponseHandler.badRequest(res, "Fichier requis");
        }
        return next();
      }

      // Vérifier la taille
      if (file.size > maxSize) {
        return ResponseHandler.badRequest(
          res,
          `Fichier trop volumineux (max: ${Math.round(
            maxSize / 1024 / 1024
          )}MB)`
        );
      }

      // Vérifier le type
      const fileExtension = file.originalname?.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedTypes.includes(fileExtension)) {
        return ResponseHandler.badRequest(
          res,
          `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(
            ", "
          )}`
        );
      }

      next();
    } catch (error) {
      logger.error("File validation error", { error });
      return ResponseHandler.serverError(
        res,
        "Erreur de validation du fichier"
      );
    }
  };
}

export default validateRequest;
