import { Request, Response, NextFunction } from "express";
import { SimpleExportService } from "../services/SimpleExportService";
import { SeedLotService } from "../services/SeedLotService";
import { QualityControlService } from "../services/QualityControlService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ExportController {
  static async exportSeedLots(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "csv" } = req.query;
      const filters = req.query;

      // Récupérer les lots avec les filtres
      const { lots } = await SeedLotService.getSeedLots({
        ...filters,
        pageSize: 1000, // Export limité à 1000 pour éviter la surcharge
      });

      if (format === "csv") {
        const csvData = await SimpleExportService.exportSeedLotsToCSV(lots);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="lots_semences.csv"'
        );
        return res.status(200).send(csvData);
      } else if (format === "json") {
        return ResponseHandler.success(res, lots, "Export JSON réussi");
      } else {
        return ResponseHandler.error(
          res,
          "Format non supporté. Utilisez csv ou json",
          400
        );
      }
    } catch (error) {
      next(error);
    }
  }

  static async exportQualityReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { format = "html" } = req.query;
      const filters = req.query;

      // Récupérer les données du rapport de qualité
      const reportData =
        await QualityControlService.getQualityControls(filters);

      if (format === "html") {
        const htmlReport = SimpleExportService.generateReportHTML(reportData);

        res.setHeader("Content-Type", "text/html");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="rapport_qualite.html"'
        );
        return res.status(200).send(htmlReport);
      } else if (format === "json") {
        const jsonReport =
          await SimpleExportService.exportQualityReportToJSON(reportData);

        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="rapport_qualite.json"'
        );
        return res.status(200).send(jsonReport);
      } else {
        return ResponseHandler.error(
          res,
          "Format non supporté. Utilisez html ou json",
          400
        );
      }
    } catch (error) {
      next(error);
    }
  }
}
