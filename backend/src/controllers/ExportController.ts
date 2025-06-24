// backend/src/controllers/ExportController.ts - CONTRÔLEUR D'EXPORT CORRIGÉ
import { Request, Response, NextFunction } from "express";
import { ExportService } from "../services/ExportService";
import { SeedLotService } from "../services/SeedLotService";
import { QualityControlService } from "../services/QualityControlService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

export class ExportController {
  /**
   * Obtenir les formats d'export disponibles
   * GET /api/export/formats
   */
  static async getAvailableFormats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const formats = {
        seedLots: ["csv", "xlsx", "json"],
        qualityReport: ["html", "pdf", "json", "xlsx"],
        productionStats: ["xlsx", "csv", "json"],
        inventory: ["csv", "xlsx", "pdf"],
      };

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
   * Export des lots de semences
   * GET /api/export/seed-lots?format=csv&level=G1&status=certified
   */
  static async exportSeedLots(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "csv", ...filters } = req.query;

      // Validation du format
      const validFormats = ["csv", "xlsx", "json"];
      if (!validFormats.includes(format as string)) {
        return ResponseHandler.error(
          res,
          "Format non supporté. Utilisez csv, xlsx ou json",
          400
        );
      }

      logger.info(`Export des lots de semences demandé`, {
        format,
        filters,
        userId: req.user?.userId,
      });

      // Récupérer les données des lots
      const seedLotsData = await SeedLotService.getSeedLots({
        ...filters,
        pageSize: 1000, // Limiter pour éviter la surcharge
      });

      if (!seedLotsData.data || seedLotsData.data.length === 0) {
        return ResponseHandler.error(res, "Aucun lot de semences trouvé", 404);
      }

      // Utiliser le service d'export approprié selon le format
      let exportResult;
      switch (format) {
        case "csv":
          exportResult = await ExportService.exportSeedLotsToCSV(
            seedLotsData.data
          );
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="lots_semences.csv"'
          );
          break;

        case "xlsx":
          exportResult = await ExportService.exportSeedLotsToExcel(
            seedLotsData.data
          );
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="lots_semences.xlsx"'
          );
          break;

        case "json":
          return ResponseHandler.success(
            res,
            seedLotsData.data,
            "Export JSON des lots de semences"
          );

        default:
          return ResponseHandler.error(res, "Format non supporté", 400);
      }

      // Envoyer le fichier
      return res.send(exportResult);
    } catch (error) {
      logger.error("Erreur lors de l'export des lots de semences:", {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.userId,
      });
      next(error);
    }
  }

  /**
   * Export du rapport de qualité
   * GET /api/export/quality-report?format=html&startDate=2024-01-01
   */
  static async exportQualityReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "html", ...filters } = req.query;

      // Validation du format
      const validFormats = ["html", "pdf", "json", "xlsx"];
      if (!validFormats.includes(format as string)) {
        return ResponseHandler.error(
          res,
          "Format non supporté. Utilisez html, pdf, json ou xlsx",
          400
        );
      }

      logger.info(`Export du rapport de qualité demandé`, {
        format,
        filters,
        userId: req.user?.userId,
      });

      // Récupérer les données du rapport de qualité
      const reportData = await QualityControlService.getQualityControls({
        ...filters,
        pageSize: 1000, // Limiter pour éviter la surcharge
      });

      // ✅ CORRIGÉ: Utiliser reportData.data au lieu de reportData.controls
      if (!reportData.data || reportData.data.length === 0) {
        return ResponseHandler.error(res, "Aucun contrôle qualité trouvé", 404);
      }

      // Restructurer les données pour l'export
      const exportData = {
        statistics: {
          totalControls: reportData.total,
          passedControls: reportData.data.filter(
            (qc: any) => qc.result === "PASS"
          ).length,
          failedControls: reportData.data.filter(
            (qc: any) => qc.result === "FAIL"
          ).length,
        },
        summary: {
          passRate:
            reportData.total > 0
              ? (reportData.data.filter((qc: any) => qc.result === "PASS")
                  .length /
                  reportData.total) *
                100
              : 0,
          averageGerminationRate:
            reportData.data.length > 0
              ? reportData.data.reduce(
                  (sum: number, qc: any) => sum + qc.germinationRate,
                  0
                ) / reportData.data.length
              : 0,
          averageVarietyPurity:
            reportData.data.length > 0
              ? reportData.data.reduce(
                  (sum: number, qc: any) => sum + qc.varietyPurity,
                  0
                ) / reportData.data.length
              : 0,
        },
        qualityControls: reportData.data,
      };

      // Générer l'export selon le format
      switch (format) {
        case "html":
          const htmlReport = ExportService.generateReportHTML(exportData);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${ExportService.generateFilename(
              "rapport_qualite",
              "html"
            )}"`
          );
          return res.send(htmlReport);

        case "pdf":
          const pdfReport = await ExportService.exportQualityReportToPDF(
            exportData
          );
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${ExportService.generateFilename(
              "rapport_qualite",
              "pdf"
            )}"`
          );
          return res.send(pdfReport);

        case "json":
          const jsonReport = await ExportService.exportQualityReportToJSON(
            exportData
          );
          return ResponseHandler.success(
            res,
            JSON.parse(jsonReport),
            "Export JSON du rapport de qualité"
          );

        case "xlsx":
          // Transformer les données pour Excel
          const excelData = reportData.data.map((qc: any) => [
            qc.lotId,
            qc.seedLot?.variety?.name || "N/A",
            new Date(qc.controlDate).toLocaleDateString("fr-FR"),
            qc.result === "PASS" ? "RÉUSSI" : "ÉCHEC",
            qc.germinationRate,
            qc.varietyPurity,
            qc.moistureContent || "N/A",
            qc.seedHealth || "N/A",
            qc.inspector?.name || "N/A",
            qc.observations || "",
          ]);

          // Ajouter les headers
          excelData.unshift([
            "ID Lot",
            "Variété",
            "Date de contrôle",
            "Résultat",
            "Taux de germination (%)",
            "Pureté variétale (%)",
            "Teneur en humidité (%)",
            "Santé des semences (%)",
            "Inspecteur",
            "Observations",
          ]);

          const excelReport = await ExportService.exportSeedLotsToExcel(
            excelData
          );
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${ExportService.generateFilename(
              "rapport_qualite",
              "xlsx"
            )}"`
          );
          return res.send(excelReport);

        default:
          return ResponseHandler.error(res, "Format non supporté", 400);
      }
    } catch (error) {
      logger.error("Erreur lors de l'export du rapport de qualité:", {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.userId,
      });
      next(error);
    }
  }

  /**
   * Export des statistiques de production
   * GET /api/export/production-stats?format=xlsx&year=2024
   */
  static async exportProductionStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "xlsx", ...filters } = req.query;

      // Validation du format
      const validFormats = ["xlsx", "csv", "json"];
      if (!validFormats.includes(format as string)) {
        return ResponseHandler.error(
          res,
          "Format non supporté. Utilisez xlsx, csv ou json",
          400
        );
      }

      logger.info(`Export des statistiques de production demandé`, {
        format,
        filters,
        userId: req.user?.userId,
      });

      // TODO: Implémenter la récupération des statistiques de production
      // Pour l'instant, retourner une erreur 501 (Non implémenté)
      return ResponseHandler.error(
        res,
        "Fonctionnalité d'export des statistiques de production en cours de développement",
        501
      );
    } catch (error) {
      logger.error("Erreur lors de l'export des statistiques de production:", {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.userId,
      });
      next(error);
    }
  }
}
