// backend/src/utils/response.ts
import { Response } from "express";

/**
 * Interface standard pour toutes les réponses API
 */
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  errors?: string[];
}

/**
 * Classe utilitaire pour générer des réponses API uniformes
 */
export class ResponseHandler {
  /**
   * Réponse de succès générique
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = "Opération réussie",
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(200).json(response);
  }

  /**
   * Réponse pour une création réussie
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = "Ressource créée avec succès"
  ): Response {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Réponse pour une mise à jour réussie
   */
  static updated<T>(
    res: Response,
    data: T,
    message: string = "Ressource mise à jour avec succès"
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Réponse pour une suppression réussie
   */
  static deleted(
    res: Response,
    message: string = "Ressource supprimée avec succès"
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data: null,
    });
  }

  /**
   * Réponse d'erreur générique
   */
  static error(
    res: Response,
    message: string = "Une erreur est survenue",
    statusCode: number = 400,
    errors?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse pour ressource non trouvée
   */
  static notFound(
    res: Response,
    message: string = "Ressource non trouvée"
  ): Response {
    return res.status(404).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Réponse pour accès non autorisé
   */
  static unauthorized(
    res: Response,
    message: string = "Accès non autorisé"
  ): Response {
    return res.status(401).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Réponse pour accès interdit
   */
  static forbidden(
    res: Response,
    message: string = "Accès interdit"
  ): Response {
    return res.status(403).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Réponse pour validation échouée
   */
  static validationError(
    res: Response,
    errors: any[],
    message: string = "Erreur de validation"
  ): Response {
    return res.status(422).json({
      success: false,
      message,
      errors,
    });
  }

  /**
   * Réponse pour conflit (ex: duplication)
   */
  static conflict(
    res: Response,
    message: string = "Conflit avec une ressource existante"
  ): Response {
    return res.status(409).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Réponse pour erreur serveur
   */
  static serverError(
    res: Response,
    message: string = "Erreur interne du serveur",
    error?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
    };

    // En développement, inclure les détails de l'erreur
    if (process.env.NODE_ENV === "development" && error) {
      response.data = {
        error: error.message || error,
        stack: error.stack,
      };
    }

    return res.status(500).json(response);
  }

  /**
   * Réponse pour liste paginée
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    },
    message: string = "Liste récupérée avec succès"
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        pagination: {
          ...pagination,
          hasNextPage: pagination.page < pagination.totalPages,
          hasPreviousPage: pagination.page > 1,
        },
      },
    });
  }

  /**
   * Réponse pour opération sans contenu
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Réponse pour requête mal formée
   */
  static badRequest(
    res: Response,
    message: string = "Requête invalide",
    errors?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(400).json(response);
  }

  /**
   * Réponse pour limite de taux dépassée
   */
  static tooManyRequests(
    res: Response,
    message: string = "Trop de requêtes, veuillez réessayer plus tard"
  ): Response {
    return res.status(429).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Réponse personnalisée
   */
  static custom(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data?: any,
    meta?: any
  ): Response {
    const response: ApiResponse = {
      success,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }
}
