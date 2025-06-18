// backend/src/controllers/MultiplierController.ts - Corrigé
import { Request, Response, NextFunction } from "express";
import { MultiplierService } from "../services/MultiplierService";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class MultiplierController {
  static async createMultiplier(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const multiplier = await MultiplierService.createMultiplier(req.body);
      return ResponseHandler.created(
        res,
        multiplier,
        "Multiplicateur créé avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMultipliers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await MultiplierService.getMultipliers(req.query);
      return ResponseHandler.success(
        res,
        result.multipliers,
        "Multiplicateurs récupérés avec succès",
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMultiplierById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const multiplier = await MultiplierService.getMultiplierById(
        parseInt(req.params.id)
      );
      if (!multiplier) {
        return ResponseHandler.notFound(res, "Multiplicateur non trouvé");
      }
      return ResponseHandler.success(
        res,
        multiplier,
        "Multiplicateur récupéré avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateMultiplier(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const multiplier = await MultiplierService.updateMultiplier(
        parseInt(req.params.id),
        req.body
      );
      return ResponseHandler.success(
        res,
        multiplier,
        "Multiplicateur mis à jour avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteMultiplier(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await MultiplierService.deleteMultiplier(parseInt(req.params.id));
      return ResponseHandler.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  static async getContracts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const contracts = await MultiplierService.getMultiplierContracts(
        parseInt(req.params.id)
      );
      return ResponseHandler.success(
        res,
        contracts,
        "Contrats récupérés avec succès"
      );
    } catch (error) {
      next(error);
    }
  }

  static async createContract(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const contract = await MultiplierService.createContract({
        ...req.body,
        multiplierId: parseInt(req.params.id),
      });
      return ResponseHandler.created(res, contract, "Contrat créé avec succès");
    } catch (error) {
      next(error);
    }
  }
}
