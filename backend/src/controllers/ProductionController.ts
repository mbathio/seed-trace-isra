// backend/src/controllers/ProductionController.ts - VERSION TYPESCRIPT CORRIGÉE

import { Request, Response, NextFunction } from "express";
import { ProductionService } from "../services/ProductionService";
import { ResponseHandler } from "../utils/response";
import { logger, LoggerUtils } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export class ProductionController {
  /**
   * ✅ POST /api/productions - Créer une nouvelle production
   */
  static async createProduction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      logger.info("Création d'une nouvelle production", {
        userId: req.user?.userId,
        data: req.body,
      });

      const production = await ProductionService.createProduction(req.body);

      LoggerUtils.audit("Production créée", req.user?.userId, {
        productionId: production.id,
        lotId: production.lotId,
        status: production.status,
      });

      return ResponseHandler.created(
        res,
        production,
        "Production créée avec succès"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ GET /api/productions - Récupérer toutes les productions
   */
  static async getProductions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string, 10)
          : 10,
        search: req.query.search as string,
        status: req.query.status as string,
        multiplierId: req.query.multiplierId as string,
        sortBy: (req.query.sortBy as string) || "startDate",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
        // ✅ NOUVEAU : filtre par parcelle
        parcelId: req.query.parcelId
          ? parseInt(req.query.parcelId as string, 10)
          : undefined,
      };

      logger.info("Récupération des productions", { filters });

      const result = await ProductionService.getProductions(filters);

      return ResponseHandler.success(
        res,
        result,
        "Productions récupérées avec succès"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ GET /api/productions/:id - Récupérer une production par ID
   */
  static async getProductionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const production = await ProductionService.getProductionById(Number(id));

      if (!production) {
        return ResponseHandler.notFound(res, "Production introuvable");
      }

      return ResponseHandler.success(
        res,
        production,
        "Production récupérée avec succès"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ PUT /api/productions/:id - Mettre à jour une production
   */
  static async updateProduction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      logger.info("Mise à jour d'une production", {
        userId: req.user?.userId,
        productionId: id,
        updates: req.body,
      });

      const updated = await ProductionService.updateProduction(
        Number(id),
        req.body
      );

      LoggerUtils.audit("Production mise à jour", req.user?.userId, {
        productionId: id,
        changes: Object.keys(req.body),
      });

      return ResponseHandler.updated(
        res,
        updated,
        "Production mise à jour avec succès"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ DELETE /api/productions/:id - Supprimer une production
   */
  static async deleteProduction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      logger.warn("Suppression d'une production", {
        userId: req.user?.userId,
        productionId: id,
      });

      await ProductionService.deleteProduction(Number(id));

      LoggerUtils.audit("Production supprimée", req.user?.userId, {
        productionId: id,
      });

      return ResponseHandler.noContent(res);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ POST /api/productions/:id/activities - Ajouter une activité
   */
  static async addActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const activity = await ProductionService.addActivity(
        Number(id),
        req.body
      );

      return ResponseHandler.created(
        res,
        activity,
        "Activité ajoutée avec succès"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ POST /api/productions/:id/issues - Ajouter un problème
   */
  static async addIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const issue = await ProductionService.addIssue(Number(id), req.body);

      return ResponseHandler.created(res, issue, "Problème ajouté avec succès");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * ✅ POST /api/productions/:id/weather - Ajouter une donnée météo
   */
  static async addWeatherData(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const weather = await ProductionService.addWeatherData(
        Number(id),
        req.body
      );

      return ResponseHandler.created(
        res,
        weather,
        "Donnée météorologique ajoutée avec succès"
      );
    } catch (error) {
      return next(error);
    }
  }
}
