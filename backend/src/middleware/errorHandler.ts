// backend/src/middleware/errorHandler.ts - ✅ CORRIGÉ avec gestion uniforme
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger";
import { ResponseHandler } from "../utils/response";
import { SeedLotError } from "../services/SeedLotService";

// ✅ CORRECTION: Interface pour les erreurs personnalisées
interface CustomError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  // ✅ CORRECTION: Logging structuré avec plus de détails
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    url: req.url,
    method: req.method,
    body: req.method !== "GET" ? req.body : undefined,
    params: req.params,
    query: req.query,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  logger.error("Error handled:", errorInfo);

  // ✅ CORRECTION: Gestion des erreurs personnalisées de l'application
  if (error instanceof SeedLotError) {
    switch (error.code) {
      case "VARIETY_NOT_FOUND":
      case "PARENT_LOT_NOT_FOUND":
      case "LOT_NOT_FOUND":
      case "SOURCE_LOT_NOT_FOUND":
        return ResponseHandler.notFound(res, error.message);

      case "INVALID_HIERARCHY":
      case "INSUFFICIENT_QUANTITY":
      case "HAS_CHILD_LOTS":
        return ResponseHandler.error(res, error.message, 400);

      default:
        return ResponseHandler.error(res, error.message, 400);
    }
  }
  if (
    error.message.includes("transformation") ||
    error.message.includes("enum")
  ) {
    return ResponseHandler.validationError(res, [
      "Erreur de transformation des données. Vérifiez les valeurs envoyées.",
    ]);
  }
  // ✅ CORRECTION: Gestion améliorée des erreurs Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Violation de contrainte d'unicité
        const target = (error.meta?.target as string[]) || [];
        const field = target[0] || "champ";
        return ResponseHandler.error(
          res,
          `Cette valeur existe déjà pour le champ: ${field}`,
          409,
          [`Contrainte d'unicité violée sur: ${target.join(", ")}`]
        );

      case "P2025":
        // Enregistrement non trouvé
        return ResponseHandler.notFound(res, "Ressource non trouvée");

      case "P2003":
        // Violation de contrainte de clé étrangère
        const foreignKey = (error.meta?.field_name as string) || "référence";
        return ResponseHandler.error(
          res,
          `Référence invalide: ${foreignKey}`,
          400,
          ["La ressource référencée n'existe pas"]
        );

      case "P2014":
        // Violation de contrainte de relation
        return ResponseHandler.error(
          res,
          "Impossible de supprimer: des éléments liés existent",
          400,
          ["Supprimez d'abord les éléments dépendants"]
        );

      case "P2021":
        // Table n'existe pas
        return ResponseHandler.serverError(
          res,
          "Erreur de structure de base de données"
        );

      case "P2022":
        // Colonne n'existe pas
        return ResponseHandler.serverError(
          res,
          "Erreur de structure de base de données"
        );

      default:
        logger.error(`Prisma error code not handled: ${error.code}`, error);
        return ResponseHandler.error(res, "Erreur de base de données", 500);
    }
  }

  // ✅ CORRECTION: Gestion des erreurs de validation Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    return ResponseHandler.validationError(
      res,
      ["Données invalides - vérifiez le format des champs"],
      "Erreur de validation des données"
    );
  }

  // ✅ CORRECTION: Gestion des erreurs de connexion Prisma
  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error("Database initialization error:", error);
    return ResponseHandler.serverError(
      res,
      "Erreur de connexion à la base de données"
    );
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    logger.error("Database panic error:", error);
    return ResponseHandler.serverError(
      res,
      "Erreur critique de base de données"
    );
  }

  // ✅ CORRECTION: Gestion améliorée des erreurs JWT
  if (error.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(
      res,
      "Token d'authentification invalide"
    );
  }

  if (error.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(res, "Token d'authentification expiré");
  }

  if (error.name === "NotBeforeError") {
    return ResponseHandler.unauthorized(
      res,
      "Token d'authentification pas encore valide"
    );
  }

  // ✅ CORRECTION: Gestion des erreurs de validation Zod
  if (error.name === "ZodError") {
    const zodError = error as any;
    const errors = zodError.errors?.map(
      (err: any) => `${err.path.join(".")}: ${err.message}`
    ) || ["Erreur de validation"];

    return ResponseHandler.validationError(res, errors, "Données invalides");
  }

  // ✅ CORRECTION: Gestion des erreurs de validation personnalisées
  if (error.name === "ValidationError") {
    const errors = (error as any).errors
      ? Object.values((error as any).errors).map((err: any) => err.message)
      : [error.message];
    return ResponseHandler.validationError(res, errors);
  }

  // ✅ CORRECTION: Gestion des erreurs de multer (upload de fichiers)
  if (error.code === "LIMIT_FILE_SIZE") {
    return ResponseHandler.error(res, "Fichier trop volumineux", 400, [
      "La taille du fichier dépasse la limite autorisée",
    ]);
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return ResponseHandler.error(res, "Trop de fichiers", 400, [
      "Le nombre de fichiers dépasse la limite autorisée",
    ]);
  }

  // ✅ CORRECTION: Gestion des erreurs de syntaxe JSON
  if (error instanceof SyntaxError && "body" in error) {
    return ResponseHandler.error(res, "Format JSON invalide", 400, [
      "Vérifiez la syntaxe de votre requête JSON",
    ]);
  }

  // ✅ CORRECTION: Gestion des erreurs de timeout
  if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
    return ResponseHandler.error(res, "Timeout de la requête", 408, [
      "La requête a pris trop de temps",
    ]);
  }

  // ✅ CORRECTION: Gestion des erreurs avec statusCode personnalisé
  if (error.statusCode) {
    return ResponseHandler.error(res, error.message, error.statusCode);
  }

  // ✅ CORRECTION: Gestion des erreurs par défaut avec message sécurisé
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment
    ? error.message
    : "Une erreur interne s'est produite";

  const details = isDevelopment
    ? {
        stack: error.stack,
        code: error.code,
        name: error.name,
      }
    : undefined;

  // Log pour debug en développement
  if (isDevelopment) {
    console.error("Unhandled error:", error);
  }

  return ResponseHandler.serverError(res, message);
}

// ✅ CORRECTION: Middleware pour gérer les promesses rejetées
export function asyncErrorHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ✅ CORRECTION: Gestionnaire d'erreurs pour les routes non trouvées
export function notFoundHandler(req: Request, res: Response): Response {
  return ResponseHandler.notFound(
    res,
    `Route non trouvée: ${req.method} ${req.originalUrl}`
  );
}
