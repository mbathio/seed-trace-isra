// backend/src/controllers/ParcelController.ts - Corrigé
import { Request, Response, NextFunction } from "express";
import { ParcelService } from "../services/ParcelService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ParcelController {
  static async createParcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const parcel = await ParcelService.createParcel(req.body);
      return ResponseHandler.created(res, parcel, "Parcelle créée avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async getParcels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await ParcelService.getParcels(req.query);
      return ResponseHandler.success(
        res,
        result.parcels,
        "Parcelles récupérées avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getParcelById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const parcel = await ParcelService.getParcelById(parseInt(req.params.id));
      if (!parcel) {
        return ResponseHandler.notFound(res, "Parcelle non trouvée");
      }
      return ResponseHandler.success(
        res,
        parcel,
        "Parcelle récupérée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateParcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const parcel = await ParcelService.updateParcel(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.success(
        res,
        parcel,
        "Parcelle mise à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteParcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await ParcelService.deleteParcel(parseInt(req.params.id));
      return ResponseHandler.noContent(res, "Parcelle supprimée avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async addSoilAnalysis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const analysis = await ParcelService.addSoilAnalysis(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.created(
        res,
        analysis,
        "Analyse de sol ajoutée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
