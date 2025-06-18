// backend/src/controllers/SeedLotController.ts
import { Request, Response, NextFunction } from "express";
import { SeedLotService } from "../services/SeedLotService";
import { ResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";
import QRCode from "qrcode";

// Interface étendue pour les requêtes authentifiées (si nécessaire)
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export class SeedLotController {
  /**
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

      // Retourner les données dans le format standard
      return ResponseHandler.success(
        res,
        result.data, // Changé de result.lots à result.data
        "Lots récupérés avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  /**
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

      // Utiliser noContent pour les suppressions
      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
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
        productionDate: seedLot.productionDate,
        quantity: seedLot.quantity,
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
        qrCodeDataUrl,
        "QR Code généré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
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
   * Transfère un lot
   */
  static async transferLot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { targetMultiplierId, quantity, notes } = req.body;

      const transferredLot = await SeedLotService.transferLot(
        id,
        targetMultiplierId,
        quantity,
        notes
      );

      return ResponseHandler.success(
        res,
        transferredLot,
        "Lot transféré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
