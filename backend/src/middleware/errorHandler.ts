// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger";
import { ResponseHandler } from "../utils/response";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  logger.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return ResponseHandler.error(res, "Cette ressource existe déjà", 409, [
          "Contrainte d'unicité violée",
        ]);
      case "P2025":
        return ResponseHandler.notFound(res, "Ressource non trouvée");
      case "P2003":
        return ResponseHandler.error(res, "Référence invalide", 400, [
          "La ressource référencée n'existe pas",
        ]);
      default:
        return ResponseHandler.error(res, "Erreur de base de données", 500);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return ResponseHandler.validationError(
      res,
      ["Données invalides"],
      "Erreur de validation"
    );
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(res, "Token invalide");
  }

  if (error.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(res, "Token expiré");
  }

  // Validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return ResponseHandler.validationError(res, errors);
  }

  // Default error
  return ResponseHandler.serverError(
    res,
    process.env.NODE_ENV === "development"
      ? error.message
      : "Erreur interne du serveur"
  );
}
