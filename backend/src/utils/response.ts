// backend/src/utils/response.ts - VERSION COMPLÈTE CORRIGÉE
import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: any;
  errors?: string[];
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = "Succès",
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };

    // Ajouter les métadonnées si elles sont fournies
    if (meta) {
      response.meta = meta;
    }

    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Ressource créée avec succès"
  ): Response {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res: Response, message = "Succès"): Response {
    return res.status(204).send();
  }

  static badRequest(
    res: Response,
    message = "Requête invalide",
    errors?: string[]
  ): Response {
    return res.status(400).json({
      success: false,
      message,
      data: null,
      errors,
    });
  }

  static unauthorized(res: Response, message = "Non autorisé"): Response {
    return res.status(401).json({
      success: false,
      message,
      data: null,
    });
  }

  static forbidden(res: Response, message = "Accès interdit"): Response {
    return res.status(403).json({
      success: false,
      message,
      data: null,
    });
  }

  static notFound(res: Response, message = "Ressource non trouvée"): Response {
    return res.status(404).json({
      success: false,
      message,
      data: null,
    });
  }

  static conflict(res: Response, message = "Conflit"): Response {
    return res.status(409).json({
      success: false,
      message,
      data: null,
    });
  }

  static validationError(
    res: Response,
    errors: string[],
    message = "Erreur de validation"
  ): Response {
    return res.status(422).json({
      success: false,
      message,
      data: null,
      errors,
    });
  }

  static serverError(
    res: Response,
    message = "Erreur serveur interne",
    error?: any
  ): Response {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message,
      data: null,
      errors:
        process.env.NODE_ENV === "development" && error
          ? [error.message || error.toString()]
          : undefined,
    });
  }

  static customError(
    res: Response,
    statusCode: number,
    message: string,
    data?: any
  ): Response {
    return res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data: data || null,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: string[]
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors,
    });
  }
}
