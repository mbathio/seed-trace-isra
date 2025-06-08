// backend/src/controllers/AuthController.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class AuthController {
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      if (!result) {
        return ResponseHandler.unauthorized(
          res,
          "Email ou mot de passe incorrect"
        );
      }

      return ResponseHandler.success(res, result, "Connexion réussie");
    } catch (error) {
      next(error);
    }
  }

  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userData = req.body;

      const user = await AuthService.register(userData);

      return ResponseHandler.created(res, user, "Utilisateur créé avec succès");
    } catch (error) {
      if (error instanceof Error && error.message.includes("existe déjà")) {
        return ResponseHandler.error(res, error.message, 409);
      }
      next(error);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refreshTokens(refreshToken);

      if (!tokens) {
        return ResponseHandler.unauthorized(
          res,
          "Refresh token invalide ou expiré"
        );
      }

      return ResponseHandler.success(
        res,
        tokens,
        "Tokens renouvelés avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      return ResponseHandler.success(res, null, "Déconnexion réussie");
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) {
        return ResponseHandler.unauthorized(res, "Utilisateur non authentifié");
      }

      const user = await AuthService.getCurrentUser(req.user.userId);

      if (!user) {
        return ResponseHandler.notFound(res, "Utilisateur non trouvé");
      }

      return ResponseHandler.success(
        res,
        user,
        "Utilisateur récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
