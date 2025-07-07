// backend/src/controllers/SeedLotController.ts - VERSION CORRIGÉE

import { Request, Response, NextFunction } from "express";
import { SeedLotService } from "../services/SeedLotService";
import { ResponseHandler } from "../utils/response";
import { logger, LoggerUtils } from "../utils/logger"; // Import corrigé
import { AuthenticatedRequest } from "../middleware/auth";
import QRCode from "qrcode";

export class SeedLotController {
  /**
   * POST /api/seed-lots
   * Créer un nouveau lot
   */
  static async createSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      logger.info("Creating seed lot", {
        userId: req.user?.userId,
        data: req.body,
      });

      const seedLot = await SeedLotService.createSeedLot(req.body);

      // Log d'audit - Utiliser LoggerUtils au lieu de logger.audit
      LoggerUtils.audit("Seed lot created", req.user?.userId, {
        seedLotId: seedLot.id,
        variety: seedLot.variety.name,
        level: seedLot.level,
        quantity: seedLot.quantity,
      });

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
   * GET /api/seed-lots
   * Récupérer la liste des lots avec pagination et filtres
   */
  static async getSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string)
          : undefined,
        search: req.query.search as string,
        level: req.query.level as string,
        status: req.query.status as string,
        varietyId: req.query.varietyId
          ? parseInt(req.query.varietyId as string)
          : undefined,
        multiplierId: req.query.multiplierId
          ? parseInt(req.query.multiplierId as string)
          : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
        includeRelations: req.query.includeRelations === "true",
      };

      const result = await SeedLotService.getSeedLots(filters);

      // Correction: Accéder correctement aux propriétés du résultat
      if (
        result &&
        typeof result === "object" &&
        "data" in result &&
        "message" in result &&
        "meta" in result
      ) {
        return ResponseHandler.success(
          res,
          result.data,
          result.message,
          result.meta
        );
      } else {
        // Si la structure est différente, adapter
        return ResponseHandler.success(
          res,
          result,
          "Lots récupérés avec succès"
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id
   * Récupérer un lot par son ID
   */
  static async getSeedLotById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const includeFullDetails = req.query.full !== "false";

      const seedLot = await SeedLotService.getSeedLotById(
        id,
        includeFullDetails
      );

      return ResponseHandler.success(res, seedLot, "Lot récupéré avec succès");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/seed-lots/:id
   * Mettre à jour un lot
   */
  static async updateSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      logger.info("Updating seed lot", {
        userId: req.user?.userId,
        seedLotId: id,
        updates: req.body,
      });

      const seedLot = await SeedLotService.updateSeedLot(id, req.body);

      // Log d'audit - Utiliser LoggerUtils
      LoggerUtils.audit("Seed lot updated", req.user?.userId, {
        seedLotId: id,
        changes: Object.keys(req.body),
      });

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
   * Supprimer un lot
   */
  static async deleteSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const hardDelete = req.query.hard === "true";

      logger.warn("Deleting seed lot", {
        userId: req.user?.userId,
        seedLotId: id,
        hardDelete,
      });

      await SeedLotService.deleteSeedLot(id, hardDelete);

      // Log d'audit - Utiliser LoggerUtils
      LoggerUtils.audit("Seed lot deleted", req.user?.userId, {
        seedLotId: id,
        hardDelete,
      });

      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/seed-lots/bulk-update
   * Mise à jour en masse
   */
  static async bulkUpdateSeedLots(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { ids, updateData } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return ResponseHandler.badRequest(res, "Liste d'IDs requise");
      }

      const result = await SeedLotService.bulkUpdateSeedLots(ids, updateData);

      LoggerUtils.audit("Bulk seed lots update", req.user?.userId, {
        count: result.count,
        ids: ids.slice(0, 10), // Log seulement les 10 premiers
      });

      return ResponseHandler.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/search
   * Recherche avancée
   */
  static async searchSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const searchCriteria = {
        query: req.query.q as string,
        filters: req.query.filters
          ? JSON.parse(req.query.filters as string)
          : undefined,
        dateRange: req.query.dateRange
          ? JSON.parse(req.query.dateRange as string)
          : undefined,
        includeExpired: req.query.includeExpired === "true",
        includeInactive: req.query.includeInactive === "true",
      };

      const results = await SeedLotService.searchSeedLots(searchCriteria);

      return ResponseHandler.success(
        res,
        results,
        `${results.length} lots trouvés`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/export
   * Export des données
   */
  static async exportSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const format = (req.query.format as string) || "csv";
      const filters = {
        ...req.query,
        format: undefined, // Retirer format des filtres
      };

      const data = await SeedLotService.exportSeedLots(
        filters as any,
        format as "csv" | "json" | "xlsx"
      );

      // Définir les headers selon le format
      switch (format) {
        case "csv":
          res.setHeader("Content-Type", "text/csv; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="seed-lots-${Date.now()}.csv"`
          );
          break;
        case "json":
          res.setHeader("Content-Type", "application/json");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="seed-lots-${Date.now()}.json"`
          );
          break;
        case "xlsx":
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="seed-lots-${Date.now()}.xlsx"`
          );
          break;
      }

      return res.send(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/qr-code
   * Générer le QR Code d'un lot
   */
  static async getQRCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const size = parseInt(req.query.size as string) || 300;

      const seedLot = await SeedLotService.getSeedLotById(id, false);

      // Vérifier que le lot a les propriétés nécessaires
      if (!seedLot || typeof seedLot !== "object") {
        return ResponseHandler.notFound(res, "Lot non trouvé");
      }

      // Créer un type safe pour le lot
      const safeSeedLot = seedLot as any;

      // Données à encoder dans le QR Code
      const qrData = {
        id: safeSeedLot.id,
        variety: safeSeedLot.variety?.code || "N/A",
        level: safeSeedLot.level,
        quantity: safeSeedLot.quantity,
        productionDate: safeSeedLot.productionDate,
        status: safeSeedLot.status,
        url: `${process.env.CLIENT_URL}/seed-lots/${id}`,
      };

      // Options de génération
      const qrOptions = {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

      // Générer selon le format demandé
      const format = req.query.format || "dataurl";

      if (format === "png") {
        const buffer = await QRCode.toBuffer(JSON.stringify(qrData), qrOptions);
        res.setHeader("Content-Type", "image/png");
        return res.send(buffer);
      } else {
        const qrCodeDataUrl = await QRCode.toDataURL(
          JSON.stringify(qrData),
          qrOptions
        );
        return ResponseHandler.success(
          res,
          { qrCode: qrCodeDataUrl },
          "QR Code généré avec succès"
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/genealogy
   * Récupérer l'arbre généalogique
   */
  static async getGenealogyTree(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const maxDepth = parseInt(req.query.maxDepth as string) || 10;

      const genealogyTree = await SeedLotService.getGenealogyTree(id, maxDepth);

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
   * POST /api/seed-lots/:id/child-lots
   * Créer un lot enfant
   */
  static async createChildLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const childLotData = {
        ...req.body,
        parentLotId: id,
      };

      const childLot = await SeedLotService.createChildLot(id, childLotData);

      LoggerUtils.audit("Child lot created", req.user?.userId, {
        parentLotId: id,
        childLotId: childLot.id,
        quantity: childLot.quantity,
      });

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
   * Transférer un lot
   */
  static async transferLot(
    req: AuthenticatedRequest,
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

      LoggerUtils.audit("Lot transferred", req.user?.userId, {
        sourceLotId: id,
        targetMultiplierId,
        quantity,
      });

      return ResponseHandler.success(res, result, "Lot transféré avec succès");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/stats
   * Récupérer les statistiques d'un lot
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

  /**
   * GET /api/seed-lots/:id/history
   * Récupérer l'historique des modifications
   */
  static async getSeedLotHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const history = await SeedLotService.getSeedLotHistory(id);

      return ResponseHandler.success(
        res,
        history,
        "Historique récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/seed-lots/:id/validate
   * Valider un lot
   */
  static async validateSeedLot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const validation = await SeedLotService.validateSeedLot(id);

      if (!validation.isValid) {
        return ResponseHandler.badRequest(
          res,
          "Lot invalide",
          validation.errors
        );
      }

      return ResponseHandler.success(res, validation, "Lot valide");
    } catch (error) {
      next(error);
    }
  }
}
