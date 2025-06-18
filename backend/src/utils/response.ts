// backend/src/utils/response.ts
import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[];
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = "Opération réussie",
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Ressource créée avec succès"
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(201).json(response);
  }

  static updated<T>(
    res: Response,
    data: T,
    message = "Ressource mise à jour avec succès"
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(200).json(response);
  }

  static noContent(res: Response, message?: string): Response {
    // 204 No Content ne doit pas avoir de body selon la spec HTTP
    // Si un message est fourni, on le log en développement
    if (message && process.env.NODE_ENV === "development") {
      console.log(`204 No Content: ${message}`);
    }
    return res.status(204).send();
  }

  static error(
    res: Response,
    message = "Une erreur s'est produite",
    statusCode = 500,
    errors?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      data: null,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(
    res: Response,
    message = "Requête invalide",
    errors?: string[]
  ): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message = "Non autorisé"): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = "Accès interdit"): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = "Ressource non trouvée"): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message = "Conflit de données"): Response {
    return this.error(res, message, 409);
  }

  static validationError(
    res: Response,
    errors: string[],
    message = "Erreur de validation"
  ): Response {
    return this.error(res, message, 422, errors);
  }

  static serverError(
    res: Response,
    message = "Erreur serveur interne"
  ): Response {
    return this.error(res, message, 500);
  }
}
