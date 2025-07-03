import { Request, Response, NextFunction } from "express";
import { QualityControlService } from "../services/QualityControlService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class QualityControlController {
  static async createQualityControl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) {
        return ResponseHandler.unauthorized(res);
      }

      const qualityControl = await QualityControlService.createQualityControl({
        ...req.body,
        inspectorId: req.user.userId,
      });

      return ResponseHandler.created(
        res,
        qualityControl,
        "Contrôle qualité créé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ CORRIGÉ: Utilise result.data au lieu de result.controls
   */
  static async getQualityControls(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await QualityControlService.getQualityControls(req.query);
      return ResponseHandler.success(
        res,
        result.data, // ✅ CHANGÉ de result.controls à result.data
        "Contrôles qualité récupérés avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getQualityControlById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const qualityControl = await QualityControlService.getQualityControlById(
        parseInt(req.params.id)
      );

      if (!qualityControl) {
        return ResponseHandler.notFound(res, "Contrôle qualité non trouvé");
      }

      return ResponseHandler.success(
        res,
        qualityControl,
        "Contrôle qualité récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateQualityControl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const qualityControl = await QualityControlService.updateQualityControl(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.success(
        res,
        qualityControl,
        "Contrôle qualité mis à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteQualityControl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await QualityControlService.deleteQualityControl(parseInt(req.params.id));
      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }
}
