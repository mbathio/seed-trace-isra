import { Request, Response, NextFunction } from "express";
import { StatisticsService } from "../services/StatisticsService";
import { ResponseHandler } from "../utils/response";

export class StatisticsController {
  static async getDashboardStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const stats = await StatisticsService.getDashboardStats();
      return ResponseHandler.success(
        res,
        stats,
        "Statistiques récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const trends = await StatisticsService.getMonthlyTrends(months);
      return ResponseHandler.success(
        res,
        trends,
        "Tendances récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }
}
