// backend/src/controllers/SeedLotController.ts - VERSION CORRIGÉE COMPLÈTE

import { Request, Response, NextFunction } from "express";
import { SeedLotService } from "../services/SeedLotService";
import { ResponseHandler } from "../utils/response";
import { logger, LoggerUtils } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth";
import QRCode from "qrcode";
import path from "path";

export class SeedLotController {
  /**
   * ✅ CORRECTION: POST /api/seed-lots - Créer un nouveau lot
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

      // ✅ CORRECTION: Les données arrivent déjà transformées par le middleware
      const seedLot = await SeedLotService.createSeedLot(req.body);

      LoggerUtils.audit("Seed lot created", req.user?.userId, {
        seedLotId: seedLot.id,
        varietyId: seedLot.varietyId,
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
   * ✅ CORRECTION: GET /api/seed-lots - Récupérer la liste avec pagination
   */
  static async getSeedLots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // ✅ CORRECTION: Utiliser les paramètres déjà transformés par le middleware
      const filters = {
        page: req.query.page as number | undefined,
        pageSize: req.query.pageSize as number | undefined,
        search: req.query.search as string,
        level: req.query.level as string,
        status: req.query.status as string, // Déjà transformé UI -> DB par middleware
        varietyId: req.query.varietyId as number | undefined,
        multiplierId: req.query.multiplierId as number | undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
        includeRelations: req.query.includeRelations === "true",
      };

      logger.info("Getting seed lots with filters", { filters });

      // ✅ CORRECTION: Le service retourne déjà les données transformées
      const result = await SeedLotService.getSeedLots(filters);

      // Le résultat contient déjà la structure success/message/data/meta
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ CORRECTION: GET /api/seed-lots/:id - Récupérer un lot par ID
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
        (typeof req.query.full === "string" && req.query.full !== "false") ||
        req.query.includeRelations === "true" ||
        req.query.includeRelations === "true";
      // ✅ CORRECTION: Le service retourne déjà les données transformées
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
   * ✅ CORRECTION: PUT /api/seed-lots/:id - Mettre à jour un lot
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

      // ✅ CORRECTION: Les données sont déjà transformées par le middleware
      const seedLot = await SeedLotService.updateSeedLot(id, req.body);

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
   * ✅ CORRECTION: DELETE /api/seed-lots/:id - Supprimer un lot
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
   * ✅ CORRECTION: POST /api/seed-lots/bulk-update - Mise à jour en masse
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
   * ✅ CORRECTION: GET /api/seed-lots/search - Recherche avancée
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
   * ⚠️ CRITIQUE: Cette méthode doit être appelée AVANT getSeedLotById dans les routes
   */
  static exportSeedLots = async (req: Request, res: Response) => {
    try {
      console.log("📄 [CONTROLLER] GET /seed-lots/export", {
        query: req.query,
      });

      // 1. Validation du format
      const format = (req.query.format as string) || "xlsx";

      if (!["csv", "xlsx"].includes(format)) {
        return res.status(422).json({
          success: false,
          message: "Format invalide. Utilisez 'csv' ou 'xlsx'",
          errors: [`Format '${format}' non supporté`],
        });
      }

      // 2. Construire les filtres (transformés par le middleware)
      const filters = {
        level: req.query.level as string | undefined,
        status: req.query.status as string | undefined,
        varietyId: req.query.varietyId
          ? Number(req.query.varietyId)
          : undefined,
        multiplierId: req.query.multiplierId
          ? Number(req.query.multiplierId)
          : undefined,
        search: req.query.search as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      console.log("✅ [CONTROLLER] Export filters:", filters);

      // 3. Appeler le service d'export
      const exportData = await SeedLotService.exportSeedLots(
        filters,
        format as "csv" | "xlsx"
      );

      // 4. Headers pour téléchargement
      const filename = `lots_semences_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      const mimeTypes = {
        csv: "text/csv; charset=utf-8",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      res.setHeader(
        "Content-Type",
        mimeTypes[format as keyof typeof mimeTypes]
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Cache-Control", "no-cache");

      console.log("✅ [CONTROLLER] Export successful:", {
        format,
        filename,
        dataType: typeof exportData,
      });

      // 5. Envoyer les données
      res.send(exportData);
      return;
    } catch (error: any) {
      console.error("❌ [CONTROLLER] Export error:", error);
      logger.error("Error exporting seed lots", {
        error: error.message,
        stack: error.stack,
        query: req.query,
      });

      if (res.headersSent) {
        res.end();
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de l'export",
        errors: [error.message],
      });
      return;
    }
  };

  /**
   * ✅ GET /api/seed-lots/:id/qr-code - Génère un QR code qui ouvre directement la page publique /trace/:id
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
      if (!seedLot) {
        return res
          .status(404)
          .json({ success: false, message: "Lot non trouvé" });
      }

      // ✅ On encode uniquement l’URL vers la page publique /trace/:id
      const serverUrl = process.env.SERVER_URL || "http://localhost:3001";
      const traceUrl = `${serverUrl}/trace/${seedLot.id}`;

      const qrBuffer = await QRCode.toBuffer(traceUrl, {
        width: size,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });

      res.setHeader("Content-Type", "image/png");
      return res.send(qrBuffer);
    } catch (error) {
      console.error("Erreur QR Code:", error);
      next(error);
    }
  }

  /**
   * POST /api/seed-lots/:id/certificate - Téléverser un certificat officiel
   */
  static async uploadOfficialCertificate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.file) {
        return ResponseHandler.badRequest(
          res,
          "Aucun fichier n'a été téléchargé"
        );
      }

      const { id } = req.params;

      const certificate = await SeedLotService.uploadOfficialCertificate(
        id,
        req.file
      );

      logger.info("Certificat officiel téléversé", {
        seedLotId: id,
        userId: req.user?.userId,
        filename: certificate.filename,
      });

      return ResponseHandler.success(
        res,
        certificate,
        "Certificat officiel enregistré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/seed-lots/:id/certificate - Télécharger le certificat officiel
   */
  static async downloadOfficialCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const certificate = await SeedLotService.getOfficialCertificateMetadata(
        id
      );

      if (!certificate) {
        return ResponseHandler.notFound(
          res,
          "Certificat officiel non disponible pour ce lot"
        );
      }

      const downloadName =
        certificate.filename || path.basename(certificate.absolutePath);

      res.setHeader("Content-Type", certificate.mimeType);

      return res.download(certificate.absolutePath, downloadName, (error) => {
        if (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ CORRECTION: GET /api/seed-lots/:id/genealogy - Arbre généalogique
   */
  static async getGenealogyTree(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const maxDepth = parseInt(req.query.maxDepth as string) || 10;

      // ✅ CORRECTION: Le service retourne déjà les données transformées
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
   * ✅ CORRECTION: POST /api/seed-lots/:id/child-lots - Créer un lot enfant
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

      // ✅ CORRECTION: Le service gère la transformation
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
   * ✅ CORRECTION: POST /api/seed-lots/:id/transfer - Transférer un lot
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
   * ✅ CORRECTION: GET /api/seed-lots/:id/stats - Statistiques d'un lot
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
   * ✅ CORRECTION: GET /api/seed-lots/:id/history - Historique des modifications
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
   * ✅ CORRECTION: POST /api/seed-lots/:id/validate - Valider un lot
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
