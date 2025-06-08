// backend/src/controllers/UserController.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class UserController {
  static async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await UserService.getUsers(req.query);
      return ResponseHandler.success(
        res,
        result.users,
        "Utilisateurs récupérés avec succès",
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = await UserService.getUserById(parseInt(req.params.id));
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

  static async createUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = await UserService.createUser(req.body);
      return ResponseHandler.created(res, user, "Utilisateur créé avec succès");
    } catch (error) {
      if (error instanceof Error && error.message.includes("existe déjà")) {
        return ResponseHandler.error(res, error.message, 409);
      }
      next(error);
    }
  }

  static async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = await UserService.updateUser(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.success(
        res,
        user,
        "Utilisateur mis à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await UserService.deleteUser(parseInt(req.params.id));
      return ResponseHandler.noContent(res, "Utilisateur supprimé avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await UserService.updatePassword(
        parseInt(req.params.id),
        req.body.currentPassword,
        req.body.newPassword
      );
      return ResponseHandler.success(
        res,
        null,
        "Mot de passe mis à jour avec succès"
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("incorrect")) {
        return ResponseHandler.error(res, error.message, 400);
      }
      next(error);
    }
  }
}
