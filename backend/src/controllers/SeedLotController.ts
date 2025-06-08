// backend/src/controllers/SeedLotController.ts
import { Request, Response, NextFunction } from "express";
import { SeedLotService } from "../services/SeedLotService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class SeedLotController {
  static async createSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const seedLot = await SeedLotService.createSeedLot(req.body);
      return ResponseHandler.created(
        res,
        seedLot,
        "Lot de semences créé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await SeedLotService.getSeedLots(req.query);
      return ResponseHandler.success(
        res,
        result.lots,
        "Lots récupérés avec succès",
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSeedLotById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const seedLot = await SeedLotService.getSeedLotById(req.params.id);

      if (!seedLot) {
        return ResponseHandler.notFound(res, "Lot de semences non trouvé");
      }

      return ResponseHandler.success(res, seedLot, "Lot récupéré avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async updateSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const seedLot = await SeedLotService.updateSeedLot(
        req.params.id,
        req.body
      );
      return ResponseHandler.success(
        res,
        seedLot,
        "Lot mis à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await SeedLotService.deleteSeedLot(req.params.id);
      return ResponseHandler.noContent(res, "Lot supprimé avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async getGenealogyTree(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const genealogy = await SeedLotService.getGenealogyTree(req.params.id);

      if (!genealogy) {
        return ResponseHandler.notFound(res, "Lot de semences non trouvé");
      }

      return ResponseHandler.success(
        res,
        genealogy,
        "Généalogie récupérée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getQRCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const seedLot = await SeedLotService.getSeedLotById(req.params.id);

      if (!seedLot) {
        return ResponseHandler.notFound(res, "Lot de semences non trouvé");
      }

      return ResponseHandler.success(
        res,
        { qrCode: seedLot.qrCode },
        "QR Code récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
