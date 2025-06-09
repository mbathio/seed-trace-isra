// backend/src/controllers/ExportController.ts - Contrôleur d'export corrigé
import { Request, Response, NextFunction } from "express";
import { ExportService } from "../services/ExportService";
import { SeedLotService } from "../services/SeedLotService";
import { QualityControlService } from "../services/QualityControlService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

export class ExportController {
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

      // Récupérer les lots avec les filtres (limité à 5000 pour éviter la surcharge)
      const { lots } = await SeedLotService.getSeedLots({
        ...filters,
        pageSize: 5000,
      });

      if (lots.length === 0) {
        return ResponseHandler.error(
          res,
          "Aucun lot trouvé avec ces critères",
          404
        );
      }

      // Générer le fichier selon le format
      switch (format) {
        case "csv": {
          const csvData = await ExportService.exportSeedLotsToCSV(lots);
          const filename = ExportService.generateFilename(
            "lots_semences",
            "csv"
          );

          res.setHeader("Content-Type", "text/csv; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          res.setHeader("Content-Length", Buffer.byteLength(csvData, "utf8"));

          return res.status(200).send("\uFEFF" + csvData); // BOM pour Excel
        }

        case "xlsx": {
          const excelBuffer = await ExportService.exportSeedLotsToExcel(lots);
          const filename = ExportService.generateFilename(
            "lots_semences",
            "xlsx"
          );

          res.setHeader("Content-Type", ExportService.getMimeType("xlsx"));
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          res.setHeader("Content-Length", excelBuffer.length);

          return res.status(200).send(excelBuffer);
        }

        case "json": {
          const jsonData = {
            metadata: {
              exportDate: new Date().toISOString(),
              totalCount: lots.length,
              filters: filters,
              exportedBy: req.user?.email,
            },
            lots: lots,
          };

          const filename = ExportService.generateFilename(
            "lots_semences",
            "json"
          );
          res.setHeader("Content-Type", "application/json");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );

          return ResponseHandler.success(res, jsonData, "Export JSON réussi");
        }

        default:
          return ResponseHandler.error(res, "Format non supporté", 400);
      }
    } catch (error) {
      logger.error("Erreur lors de l'export des lots", {
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

      if (!reportData.controls || reportData.controls.length === 0) {
        return ResponseHandler.error(res, "Aucun contrôle qualité trouvé", 404);
      }

      // Restructurer les données pour l'export
      const exportData = {
        statistics: {
          totalControls: reportData.total,
          passedControls: reportData.controls.filter(
            (qc) => qc.result === "PASS"
          ).length,
          failedControls: reportData.controls.filter(
            (qc) => qc.result === "FAIL"
          ).length,
        },
        summary: {
          passRate:
            reportData.total > 0
              ? (reportData.controls.filter((qc) => qc.result === "PASS")
                  .length /
                  reportData.total) *
                100
              : 0,
          averageGerminationRate:
            reportData.controls.length > 0
              ? reportData.controls.reduce(
                  (sum, qc) => sum + qc.germinationRate,
                  0
                ) / reportData.controls.length
              : 0,
          averageVarietyPurity:
            reportData.controls.length > 0
              ? reportData.controls.reduce(
                  (sum, qc) => sum + qc.varietyPurity,
                  0
                ) / reportData.controls.length
              : 0,
        },
        qualityControls: reportData.controls,
      };

      // Générer le fichier selon le format
      switch (format) {
        case "html": {
          const htmlReport = ExportService.generateReportHTML(exportData);
          const filename = ExportService.generateFilename(
            "rapport_qualite",
            "html"
          );

          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );

          return res.status(200).send(htmlReport);
        }

        case "pdf": {
          const pdfBuffer =
            await ExportService.exportQualityReportToPDF(exportData);
          const filename = ExportService.generateFilename(
            "rapport_qualite",
            "pdf"
          );

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          res.setHeader("Content-Length", pdfBuffer.length);

          return res.status(200).send(pdfBuffer);
        }

        case "json": {
          const jsonReport =
            await ExportService.exportQualityReportToJSON(exportData);
          const filename = ExportService.generateFilename(
            "rapport_qualite",
            "json"
          );

          res.setHeader("Content-Type", "application/json");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );

          return res.status(200).send(jsonReport);
        }

        case "xlsx": {
          // Préparer les données pour Excel
          const excelData = reportData.controls.map((qc) => ({
            "ID Contrôle": qc.id,
            "Lot ID": qc.lotId,
            Variété: qc.seedLot?.variety?.name || "N/A",
            Multiplicateur: qc.seedLot?.multiplier?.name || "N/A",
            "Date Contrôle": new Date(qc.controlDate).toLocaleDateString(
              "fr-FR"
            ),
            Résultat: qc.result === "PASS" ? "RÉUSSI" : "ÉCHEC",
            "Taux Germination (%)": qc.germinationRate,
            "Pureté Variétale (%)": qc.varietyPurity,
            "Humidité (%)": qc.moistureContent || "N/A",
            "Santé Graines (%)": qc.seedHealth || "N/A",
            Inspecteur: qc.inspector?.name || "N/A",
            Méthode: qc.testMethod || "Standard",
            Observations: qc.observations || "",
          }));

          const excelBuffer =
            await ExportService.exportSeedLotsToExcel(excelData);
          const filename = ExportService.generateFilename(
            "rapport_qualite",
            "xlsx"
          );

          res.setHeader("Content-Type", ExportService.getMimeType("xlsx"));
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );

          return res.status(200).send(excelBuffer);
        }

        default:
          return ResponseHandler.error(res, "Format non supporté", 400);
      }
    } catch (error) {
      logger.error("Erreur lors de l'export du rapport de qualité", {
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
      const { format = "xlsx", year, multiplierId } = req.query;

      // Validation du format
      const validFormats = ["xlsx", "csv", "json"];
      if (!validFormats.includes(format as string)) {
        return ResponseHandler.error(
          res,
          "Format non supporté. Utilisez xlsx, csv ou json",
          400
        );
      }

      // TODO: Implémenter l'export des statistiques de production
      // Ceci nécessitera un service ProductionStatsService

      return ResponseHandler.error(
        res,
        "Fonctionnalité en cours de développement",
        501
      );
    } catch (error) {
      logger.error("Erreur lors de l'export des statistiques", {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.userId,
      });
      next(error);
    }
  }

  /**
   * Obtenir la liste des formats d'export disponibles
   * GET /api/export/formats
   */
  static async getAvailableFormats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const formats = {
        seedLots: {
          formats: ["csv", "xlsx", "json"],
          description: "Export des lots de semences",
        },
        qualityReport: {
          formats: ["html", "pdf", "json", "xlsx"],
          description: "Rapport de contrôle qualité",
        },
        productionStats: {
          formats: ["xlsx", "csv", "json"],
          description: "Statistiques de production (en développement)",
        },
      };

      return ResponseHandler.success(
        res,
        formats,
        "Formats disponibles récupérés"
      );
    } catch (error) {
      next(error);
    }
  }
}
