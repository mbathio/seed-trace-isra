// backend/src/controllers/ExportController.ts
import { Request, Response, NextFunction } from "express";
import { ExportService } from "../services/ExportService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

export class ExportController {
  /**
   * GET /api/export/formats
   * Récupère les formats d'export disponibles
   */
  static async getAvailableFormats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const formats = ExportService.getAvailableFormats();
      return ResponseHandler.success(
        res,
        formats,
        "Formats d'export disponibles"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/export/seed-lots
   * Exporte les lots de semences selon les filtres et le format
   */
  static async exportSeedLots(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "csv", ...filters } = req.query;

      logger.info("Export des lots de semences", {
        format,
        filters,
        userId: req.user?.userId,
      });

      const exportData = await ExportService.exportSeedLots(
        filters,
        format as string
      );

      // Définir les headers selon le format
      switch (format) {
        case "csv":
          res.setHeader("Content-Type", "text/csv; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="lots-semences-${Date.now()}.csv"`
          );
          break;
        case "xlsx":
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="lots-semences-${Date.now()}.xlsx"`
          );
          break;
        case "json":
          res.setHeader("Content-Type", "application/json");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="lots-semences-${Date.now()}.json"`
          );
          break;
      }

      return res.send(exportData);
    } catch (error) {
      logger.error("Erreur lors de l'export des lots:", error);
      next(error);
    }
  }

  /**
   * GET /api/export/quality-report
   * Génère un rapport de contrôle qualité
   */
  static async exportQualityReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "html", ...filters } = req.query;

      logger.info("Export du rapport qualité", {
        format,
        filters,
        userId: req.user?.userId,
      });

      const reportData = await ExportService.exportQualityReport(
        filters,
        format as string
      );

      // Définir les headers selon le format
      switch (format) {
        case "html":
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          break;
        case "pdf":
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="rapport-qualite-${Date.now()}.pdf"`
          );
          break;
        case "json":
          res.setHeader("Content-Type", "application/json");
          break;
        case "xlsx":
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="rapport-qualite-${Date.now()}.xlsx"`
          );
          break;
      }

      return res.send(reportData);
    } catch (error) {
      logger.error("Erreur lors de l'export du rapport qualité:", error);
      next(error);
    }
  }

  /**
   * GET /api/export/production-stats
   * Exporte les statistiques de production
   */
  static async exportProductionStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "xlsx", year, ...filters } = req.query;

      logger.info("Export des statistiques de production", {
        format,
        year,
        filters,
        userId: req.user?.userId,
      });

      const statsData = await ExportService.exportProductionStats(
        {
          year: year ? parseInt(year as string) : new Date().getFullYear(),
          ...filters,
        },
        format as string
      );

      // Définir les headers selon le format
      switch (format) {
        case "xlsx":
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="stats-production-${
              year || new Date().getFullYear()
            }.xlsx"`
          );
          break;
        case "csv":
          res.setHeader("Content-Type", "text/csv; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="stats-production-${
              year || new Date().getFullYear()
            }.csv"`
          );
          break;
        case "json":
          res.setHeader("Content-Type", "application/json");
          break;
      }

      return res.send(statsData);
    } catch (error) {
      logger.error("Erreur lors de l'export des statistiques:", error);
      next(error);
    }
  }

  /**
   * POST /api/export/custom
   * Export personnalisé avec paramètres avancés
   */
  static async customExport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { entityType, format, fields, filters, includeRelations } =
        req.body;

      logger.info("Export personnalisé", {
        entityType,
        format,
        fieldsCount: fields?.length,
        userId: req.user?.userId,
      });

      const exportData = await ExportService.customExport({
        entityType,
        format,
        fields,
        filters,
        includeRelations,
      });

      // Définir le content-type approprié
      const contentTypeMap: Record<string, string> = {
        csv: "text/csv; charset=utf-8",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        json: "application/json",
        xml: "application/xml",
      };

      res.setHeader(
        "Content-Type",
        contentTypeMap[format] || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="export-${entityType}-${Date.now()}.${format}"`
      );

      return res.send(exportData);
    } catch (error) {
      logger.error("Erreur lors de l'export personnalisé:", error);
      next(error);
    }
  }

  /**
   * GET /api/export/templates/:type
   * Télécharge un modèle d'import
   */
  static async downloadTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { type } = req.params;
      const { format = "csv" } = req.query;

      logger.info("Téléchargement de modèle", { type, format });

      const template = await ExportService.generateImportTemplate(
        type,
        format as string
      );

      const formatExtension = format === "xlsx" ? "xlsx" : "csv";
      const contentType =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv; charset=utf-8";

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="modele-${type}.${formatExtension}"`
      );

      return res.send(template);
    } catch (error) {
      logger.error("Erreur lors du téléchargement du modèle:", error);
      next(error);
    }
  }

  /**
   * GET /api/export/genealogy/:lotId
   * Exporte l'arbre généalogique d'un lot
   */
  static async exportGenealogy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { lotId } = req.params;
      const { format = "json" } = req.query;

      logger.info("Export de l'arbre généalogique", { lotId, format });

      const genealogyData = await ExportService.exportGenealogy(
        lotId,
        format as string
      );

      switch (format) {
        case "json":
          res.setHeader("Content-Type", "application/json");
          break;
        case "pdf":
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="genealogie-${lotId}.pdf"`
          );
          break;
        case "dot":
          res.setHeader("Content-Type", "text/plain");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="genealogie-${lotId}.dot"`
          );
          break;
      }

      return res.send(genealogyData);
    } catch (error) {
      logger.error("Erreur lors de l'export de la généalogie:", error);
      next(error);
    }
  }

  /**
   * POST /api/export/bulk
   * Export en masse de plusieurs entités
   */
  static async bulkExport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { exports } = req.body;

      logger.info("Export en masse", {
        exportsCount: exports?.length,
        userId: req.user?.userId,
      });

      const zipData = await ExportService.bulkExport(exports);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="export-bulk-${Date.now()}.zip"`
      );

      return res.send(zipData);
    } catch (error) {
      logger.error("Erreur lors de l'export en masse:", error);
      next(error);
    }
  }

  /**
   * GET /api/export/certificates/:lotId
   * Génère un certificat pour un lot
   */
  static async generateCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { lotId } = req.params;
      const { format = "pdf", language = "fr" } = req.query;

      logger.info("Génération de certificat", { lotId, format, language });

      const certificate = await ExportService.generateCertificate(lotId, {
        format: format as string,
        language: language as string,
      });

      if (format === "pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="certificat-${lotId}.pdf"`
        );
      } else {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }

      return res.send(certificate);
    } catch (error) {
      logger.error("Erreur lors de la génération du certificat:", error);
      next(error);
    }
  }

  /**
   * GET /api/export/qr-labels/:lotId
   * Génère des étiquettes QR pour un lot
   */
  static async generateQRLabels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { lotId } = req.params;
      const { quantity = 1, format = "pdf" } = req.query;

      logger.info("Génération d'étiquettes QR", { lotId, quantity, format });

      const labels = await ExportService.generateQRLabels(
        lotId,
        parseInt(quantity as string),
        format as string
      );

      if (format === "pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="etiquettes-qr-${lotId}.pdf"`
        );
      } else {
        res.setHeader("Content-Type", "image/png");
      }

      return res.send(labels);
    } catch (error) {
      logger.error("Erreur lors de la génération des étiquettes QR:", error);
      next(error);
    }
  }
}
