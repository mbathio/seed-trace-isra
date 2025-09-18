// backend/src/controllers/SeedLotController.ts - VERSION UNIFIÉE (sans transformation)

import { Request, Response, NextFunction } from "express";
import { SeedLotService } from "../services/SeedLotService";
import { ResponseHandler } from "../utils/response";
import { logger, LoggerUtils } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth";
import QRCode from "qrcode";

export class SeedLotController {
  /**
   * ✅ POST /api/seed-lots - Créer un nouveau lot (sans transformation)
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

      // ✅ Les données arrivent déjà validées par Zod et contiennent les enums Prisma
      const seedLot = await SeedLotService.createSeedLot(req.body);

      LoggerUtils.audit("Seed lot created", req.user?.userId, {
        seedLotId: seedLot.id,
        varietyId: seedLot.varietyId,
        level: seedLot.level,
        quantity: seedLot.quantity,
      });

      return ResponseHandler.created(
        res,
        seedLot, // ✅ Données Prisma directes
        "Lot de semences créé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ GET /api/seed-lots - Récupérer la liste avec pagination (sans transformation)
   */
  static async getSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // ✅ Les paramètres arrivent déjà validés par Zod
      const filters = {
        page: req.query.page as number | undefined,
        pageSize: req.query.pageSize as number | undefined,
        search: req.query.search as string,
        level: req.query.level as any, // ✅ Enum Prisma direct
        status: req.query.status as any, // ✅ Enum Prisma direct
        varietyId: req.query.varietyId as number | undefined,
        multiplierId: req.query.multiplierId as number | undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
        includeRelations: req.query.includeRelations === "true",
      };

      logger.info("Getting seed lots with filters", { filters });

      // ✅ Le service retourne déjà les données au bon format
      const result = await SeedLotService.getSeedLots(filters);

      // ✅ Retourne directement le résultat (données Prisma)
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ GET /api/seed-lots/:id - Récupérer un lot par ID (sans transformation)
   */
  static async getSeedLotById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const includeFullDetails =
        req.query.full === undefined ||
        (typeof req.query.full === "string" && req.query.full !== "false");

      // ✅ Le service retourne déjà les données au bon format (Prisma)
      const seedLot = await SeedLotService.getSeedLotById(
        id,
        includeFullDetails
      );

      return ResponseHandler.success(
        res,
        seedLot, // ✅ Données Prisma directes
        "Lot récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ PUT /api/seed-lots/:id - Mettre à jour un lot (sans transformation)
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

      // ✅ Les données arrivent déjà validées avec les enums Prisma
      const seedLot = await SeedLotService.updateSeedLot(id, req.body);

      LoggerUtils.audit("Seed lot updated", req.user?.userId, {
        seedLotId: id,
        changes: Object.keys(req.body),
      });

      return ResponseHandler.success(
        res,
        seedLot, // ✅ Données Prisma directes
        "Lot mis à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ DELETE /api/seed-lots/:id - Supprimer un lot (sans transformation)
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
   * ✅ POST /api/seed-lots/bulk-update - Mise à jour en masse (sans transformation)
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
        ids: ids.slice(0, 10),
      });

      return ResponseHandler.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ GET /api/seed-lots/search - Recherche avancée (sans transformation)
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
        results, // ✅ Données Prisma directes
        `${results.length} lots trouvés`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ GET /api/seed-lots/export - Export des données (sans transformation)
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
        format: undefined,
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
   * ✅ GET /api/seed-lots/:id/qr-code - Générer le QR Code (sans transformation)
   */
  static async getQRCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const size = parseInt(req.query.size as string) || 300;

      // ✅ Le service retourne déjà les données au bon format (Prisma)
      const seedLot = await SeedLotService.getSeedLotById(id, false);

      if (!seedLot || typeof seedLot !== "object") {
        return ResponseHandler.notFound(res, "Lot non trouvé");
      }

      // ✅ Utilise directement les données Prisma
      const qrData = {
        id: seedLot.id,
        variety: seedLot.variety?.code || "N/A",
        level: seedLot.level, // ✅ Valeur Prisma directe
        quantity: seedLot.quantity,
        productionDate: seedLot.productionDate,
        status: seedLot.status, // ✅ Valeur Prisma directe
        url: `${process.env.CLIENT_URL}/seed-lots/${id}`,
      };

      const qrOptions = {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

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
   * ✅ GET /api/seed-lots/:id/genealogy - Arbre généalogique (sans transformation)
   */
  static async getGenealogyTree(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const maxDepth = parseInt(req.query.maxDepth as string) || 10;

      // ✅ Le service retourne déjà les données au bon format (Prisma)
      const genealogyTree = await SeedLotService.getGenealogyTree(id, maxDepth);

      return ResponseHandler.success(
        res,
        genealogyTree, // ✅ Données Prisma directes
        "Arbre généalogique récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ POST /api/seed-lots/:id/child-lots - Créer un lot enfant (sans transformation)
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

      // ✅ Le service gère directement les données Prisma
      const childLot = await SeedLotService.createChildLot(id, childLotData);

      LoggerUtils.audit("Child lot created", req.user?.userId, {
        parentLotId: id,
        childLotId: childLot.id,
        quantity: childLot.quantity,
      });

      return ResponseHandler.created(
        res,
        childLot, // ✅ Données Prisma directes
        "Lot enfant créé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ POST /api/seed-lots/:id/transfer - Transférer un lot (sans transformation)
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

      return ResponseHandler.success(
        res,
        result, // ✅ Données Prisma directes
        "Lot transféré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ GET /api/seed-lots/:id/stats - Statistiques d'un lot (sans transformation)
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
        stats, // ✅ Données directes
        "Statistiques récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ GET /api/seed-lots/:id/history - Historique des modifications (sans transformation)
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
        history, // ✅ Données directes
        "Historique récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ POST /api/seed-lots/:id/validate - Valider un lot (sans transformation)
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

      return ResponseHandler.success(
        res,
        validation, // ✅ Données directes
        "Lot valide"
      );
    } catch (error) {
      next(error);
    }
  }
}
