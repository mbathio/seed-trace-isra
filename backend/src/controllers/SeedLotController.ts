import { Request, Response, NextFunction } from "express";
import { SeedLotService } from "../services/SeedLotService";
import { ResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";
import QRCode from "qrcode";

export class SeedLotController {
  /**
   * GET /api/seed-lots
   * Récupère la liste des lots avec pagination et filtres
   */
  static async getSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      logger.info("Getting seed lots with params:", req.query);

      const result = await SeedLotService.getSeedLots(req.query);

      return ResponseHandler.success(
        res,
        result.data,
        "Lots récupérés avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id
   * Récupère un lot par son ID
   */
  static async getSeedLotById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const seedLot = await SeedLotService.getSeedLotById(id);

      return ResponseHandler.success(res, seedLot, "Lot récupéré avec succès");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/seed-lots
   * Crée un nouveau lot
   */
  static async createSeedLot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      logger.info("Creating seed lot with data:", req.body);

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

  /**
   * PUT /api/seed-lots/:id
   * Met à jour un lot
   */
  static async updateSeedLot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const seedLot = await SeedLotService.updateSeedLot(id, req.body);

      return ResponseHandler.updated(
        res,
        seedLot,
        "Lot mis à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/seed-lots/:id
   * Supprime un lot
   */
  static async deleteSeedLot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      await SeedLotService.deleteSeedLot(id);

      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/genealogy
   * Récupère l'arbre généalogique d'un lot
   */
  static async getGenealogyTree(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const genealogyTree = await SeedLotService.getGenealogyTree(id);

      return ResponseHandler.success(
        res,
        genealogyTree,
        "Arbre généalogique récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/qr-code
   * Génère le QR Code d'un lot
   */
  static async getQRCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const seedLot = await SeedLotService.getSeedLotById(id);

      // Données à encoder dans le QR Code
      const qrData = {
        id: seedLot.id,
        variety: seedLot.variety.name,
        level: seedLot.level,
        quantity: seedLot.quantity,
        productionDate: seedLot.productionDate,
        status: seedLot.status,
        parentLotId: seedLot.parentLotId,
      };

      // Générer le QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return ResponseHandler.success(
        res,
        { qrCode: qrCodeDataUrl },
        "QR Code généré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/seed-lots/:id/child-lots
   * Crée un lot enfant
   */
  static async createChildLot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const childLot = await SeedLotService.createChildLot(id, req.body);

      return ResponseHandler.created(
        res,
        childLot,
        "Lot enfant créé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/seed-lots/:id/transfer
   * Transfère un lot vers un autre multiplicateur
   */
  static async transferLot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { targetMultiplierId, quantity, notes } = req.body;

      const result = await SeedLotService.transferLot(
        id,
        targetMultiplierId,
        quantity,
        notes
      );

      return ResponseHandler.success(res, result, "Lot transféré avec succès");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/stats
   * Récupère les statistiques d'un lot
   */
  static async getSeedLotStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const stats = await SeedLotService.getSeedLotStats(id);

      return ResponseHandler.success(
        res,
        stats,
        "Statistiques récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
