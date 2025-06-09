// backend/src/utils/response.ts - ✅ CORRIGÉ pour supporter les paramètres optionnels
import { Response } from "express";
import { ApiResponse } from "../types/api";

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = "Succès",
    statusCode = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message = "Erreur",
    statusCode = 400,
    errors?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      data: null,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Créé avec succès"
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message = "Aucun contenu"): Response {
    return this.success(res, null, message, 204);
  }

  static notFound(res: Response, message = "Ressource non trouvée"): Response {
    return this.error(res, message, 404);
  }

  // ✅ CORRECTION: unauthorized ne devrait accepter que res et message
  static unauthorized(res: Response, message = "Non autorisé"): Response {
    return this.error(res, message, 401);
  }

  // ✅ CORRECTION: forbidden ne devrait accepter que res et message
  static forbidden(res: Response, message = "Accès interdit"): Response {
    return this.error(res, message, 403);
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
    message = "Erreur interne du serveur"
  ): Response {
    return this.error(res, message, 500);
  }

  // ✅ NOUVELLE MÉTHODE: Pour les cas où on veut passer des erreurs spécifiques avec unauthorized
  static unauthorizedWithErrors(
    res: Response,
    message = "Non autorisé",
    errors?: string[]
  ): Response {
    return this.error(res, message, 401, errors);
  }

  // ✅ NOUVELLE MÉTHODE: Pour les cas où on veut passer des erreurs spécifiques avec forbidden
  static forbiddenWithErrors(
    res: Response,
    message = "Accès interdit",
    errors?: string[]
  ): Response {
    return this.error(res, message, 403, errors);
  }
}
