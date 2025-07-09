// backend/src/middleware/errorHandler.ts - CORRIGÉ
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";
import { Prisma } from "@prisma/client";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  // Log de l'erreur
  logger.error("Error caught by error handler", {
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      user: (req as any).user,
    },
  });

  // Gestion des erreurs Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return ResponseHandler.conflict(
          res,
          "Un enregistrement avec ces données existe déjà"
        );
      case "P2025":
        return ResponseHandler.notFound(res, "Enregistrement non trouvé");
      case "P2003":
        return ResponseHandler.badRequest(
          res,
          "Référence à un enregistrement inexistant"
        );
      default:
        return ResponseHandler.serverError(res, "Erreur de base de données");
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return ResponseHandler.validationError(
      res,
      ["Données invalides"],
      "Erreur de validation"
    );
  }

  // Gestion des erreurs de validation Zod
  if (error.name === "ZodError") {
    const errors = error.errors.map(
      (err: any) => `${err.path.join(".")}: ${err.message}`
    );
    return ResponseHandler.validationError(res, errors);
  }

  // Gestion des erreurs JWT
  if (error.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(res, "Token invalide");
  }

  if (error.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(res, "Token expiré");
  }

  // Gestion des erreurs multer
  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return ResponseHandler.badRequest(res, "Fichier trop volumineux");
    }
    return ResponseHandler.badRequest(
      res,
      "Erreur de téléchargement de fichier"
    );
  }

  // Gestion des erreurs personnalisées
  if (error.name === "ValidationError") {
    return ResponseHandler.validationError(
      res,
      [error.message],
      "Erreur de validation"
    );
  }

  if (error.name === "UnauthorizedError") {
    return ResponseHandler.unauthorized(res, error.message);
  }

  if (error.name === "ForbiddenError") {
    return ResponseHandler.forbidden(res, error.message);
  }

  if (error.name === "NotFoundError") {
    return ResponseHandler.notFound(res, error.message);
  }

  // Erreur par défaut
  const message =
    process.env.NODE_ENV === "production"
      ? "Une erreur interne s'est produite"
      : error.message || "Une erreur interne s'est produite";

  return ResponseHandler.serverError(res, message);
}
