// backend/src/controllers/ProductionController.ts - Corrigé
import { Request, Response, NextFunction } from "express";
import { ProductionService } from "../services/ProductionService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ProductionController {
  static async createProduction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const production = await ProductionService.createProduction(req.body);
      return ResponseHandler.created(
        res,
        production,
        "Production créée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProductions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await ProductionService.getProductions(req.query);
      return ResponseHandler.success(
        res,
        result.productions,
        "Productions récupérées avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProductionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const production = await ProductionService.getProductionById(
        parseInt(req.params.id)
      );
      if (!production) {
        return ResponseHandler.notFound(res, "Production non trouvée");
      }
      return ResponseHandler.success(
        res,
        production,
        "Production récupérée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProduction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const production = await ProductionService.updateProduction(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.success(
        res,
        production,
        "Production mise à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await ProductionService.deleteProduction(parseInt(req.params.id));
      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  static async addActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const activity = await ProductionService.addActivity(
        parseInt(req.params.id),
        { ...req.body, userId: req.user?.userId }
      );
      return ResponseHandler.created(
        res,
        activity,
        "Activité ajoutée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async addIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const issue = await ProductionService.addIssue(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.created(
        res,
        issue,
        "Problème signalé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async addWeatherData(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const weatherData = await ProductionService.addWeatherData(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.created(
        res,
        weatherData,
        "Données météo ajoutées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
