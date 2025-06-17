// backend/src/controllers/VarietyController.ts - Corrigé
import { Request, Response, NextFunction } from "express";
import { VarietyService } from "../services/VarietyService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class VarietyController {
  static async createVariety(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const variety = await VarietyService.createVariety(req.body);
      return ResponseHandler.created(res, variety, "Variété créée avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async getVarieties(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await VarietyService.getVarieties(req.query);
      return ResponseHandler.success(
        res,
        result.varieties,
        "Variétés récupérées avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getVarietyById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const variety = await VarietyService.getVarietyById(req.params.id);

      if (!variety) {
        return ResponseHandler.notFound(res, "Variété non trouvée");
      }

      return ResponseHandler.success(
        res,
        variety,
        "Variété récupérée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateVariety(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const variety = await VarietyService.updateVariety(
        req.params.id,
        req.body
      );
      return ResponseHandler.success(
        res,
        variety,
        "Variété mise à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteVariety(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await VarietyService.deleteVariety(req.params.id);
      return ResponseHandler.noContent(res, "Variété supprimée avec succès");
    } catch (error) {
      next(error);
    }
  }
}
