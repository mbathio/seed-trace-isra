// backend/src/controllers/ParcelController.ts - VERSION COMPLÈTE
import { Request, Response, NextFunction } from "express";
import { ParcelService } from "../services/ParcelService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ParcelController {
  static async createParcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const parcel = await ParcelService.createParcel(req.body);
      return ResponseHandler.created(res, parcel, "Parcelle créée avec succès");
    } catch (error) {
      next(error);
    }
  }

  static async getParcels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await ParcelService.getParcels(req.query);
      return ResponseHandler.success(
        res,
        result.parcels,
        "Parcelles récupérées avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getParcelById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const parcel = await ParcelService.getParcelById(parseInt(req.params.id));
      if (!parcel) {
        return ResponseHandler.notFound(res, "Parcelle non trouvée");
      }
      return ResponseHandler.success(
        res,
        parcel,
        "Parcelle récupérée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateParcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const parcel = await ParcelService.updateParcel(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.success(
        res,
        parcel,
        "Parcelle mise à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteParcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await ParcelService.deleteParcel(parseInt(req.params.id));
      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  static async addSoilAnalysis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const analysis = await ParcelService.addSoilAnalysis(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.created(
        res,
        analysis,
        "Analyse de sol ajoutée avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Récupérer les analyses de sol
  static async getSoilAnalyses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const analyses = await ParcelService.getSoilAnalyses(
        parseInt(req.params.id)
      );
      return ResponseHandler.success(
        res,
        analyses,
        "Analyses de sol récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Récupérer les statistiques
  static async getStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const statistics = await ParcelService.getStatistics();
      return ResponseHandler.success(
        res,
        statistics,
        "Statistiques récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Vérifier la disponibilité
  static async checkAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { startDate, endDate } = req.body;
      const isAvailable = await ParcelService.checkAvailability(
        parseInt(req.params.id),
        startDate,
        endDate
      );
      return ResponseHandler.success(
        res,
        { available: isAvailable },
        isAvailable
          ? "La parcelle est disponible"
          : "La parcelle n'est pas disponible pour cette période"
      );
    } catch (error) {
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Assigner un multiplicateur
  static async assignMultiplier(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { multiplierId } = req.body;
      const parcel = await ParcelService.assignMultiplier(
        parseInt(req.params.id),
        multiplierId
      );
      return ResponseHandler.success(
        res,
        parcel,
        "Multiplicateur assigné avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Récupérer l'historique
  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const history = await ParcelService.getHistory(parseInt(req.params.id));
      return ResponseHandler.success(
        res,
        history,
        "Historique récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Exporter les parcelles
  static async exportParcels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const format = (req.query.format as string) || "csv";
      const filters = { ...req.query };
      delete filters.format;

      // Récupérer toutes les parcelles selon les filtres
      const result = await ParcelService.getParcels({
        ...filters,
        pageSize: 10000, // Export toutes les parcelles
      });

      switch (format) {
        case "csv":
          const csv = ParcelController.generateCSV(result.parcels);
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="parcelles.csv"'
          );
          return res.send(csv);

        case "xlsx":
          // Implémenter l'export Excel
          return ResponseHandler.error(res, "Format Excel non implémenté", 501);

        case "pdf":
          // Implémenter l'export PDF
          return ResponseHandler.error(res, "Format PDF non implémenté", 501);

        default:
          return ResponseHandler.badRequest(
            res,
            "Format d'export non supporté"
          );
      }
    } catch (error) {
      next(error);
    }
  }

  // Méthode utilitaire pour générer le CSV
  private static generateCSV(parcels: any[]): string {
    const headers = [
      "Code",
      "Nom",
      "Surface (ha)",
      "Statut",
      "Type de sol",
      "Système d'irrigation",
      "Adresse",
      "Latitude",
      "Longitude",
      "Multiplicateur",
      "Date de création",
    ];

    const rows = parcels.map((parcel) => [
      parcel.code,
      parcel.name || "",
      parcel.area,
      parcel.status,
      parcel.soilType || "",
      parcel.irrigationSystem || "",
      parcel.address || "",
      parcel.latitude,
      parcel.longitude,
      parcel.multiplier?.name || "",
      new Date(parcel.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  }
}
