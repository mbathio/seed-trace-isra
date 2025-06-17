// backend/src/controllers/ReportController.ts - Corrigé
import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/ReportService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ReportController {
  static async getReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await ReportService.getReports(req.query);
      return ResponseHandler.success(
        res,
        result.reports,
        "Rapports récupérés avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getReportById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const report = await ReportService.getReportById(parseInt(req.params.id));
      if (!report) {
        return ResponseHandler.notFound(res, "Rapport non trouvé");
      }
      return ResponseHandler.success(
        res,
        report,
        "Rapport récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async createReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const report = await ReportService.createReport({
        ...req.body,
        createdById: req.user?.userId,
      });
      return ResponseHandler.created(res, report, "Rapport créé avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async getProductionReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = await ReportService.getProductionReport(req.query);
      return ResponseHandler.success(
        res,
        data,
        "Rapport de production généré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getQualityReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = await ReportService.getQualityReport(req.query);
      return ResponseHandler.success(
        res,
        data,
        "Rapport de qualité généré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = await ReportService.getInventoryReport(req.query);
      return ResponseHandler.success(
        res,
        data,
        "Rapport d'inventaire généré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMultiplierPerformanceReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = await ReportService.getMultiplierPerformanceReport(
        req.query
      );
      return ResponseHandler.success(
        res,
        data,
        "Rapport de performance des multiplicateurs généré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
