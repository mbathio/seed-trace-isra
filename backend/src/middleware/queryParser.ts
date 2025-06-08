// backend/src/middleware/queryParser.ts - NOUVEAU
import { Request, Response, NextFunction } from "express";

export interface ParsedQuery {
  page: number;
  pageSize: number;
  search?: string;
  [key: string]: any;
}

export function parseQueryParams(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Parser les paramètres de pagination
    req.parsedQuery = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100), // Limiter à 100
      search: (req.query.search as string) || undefined,
    };

    // Ajouter d'autres paramètres en les parsant si nécessaire
    Object.keys(req.query).forEach((key) => {
      if (!["page", "pageSize", "search"].includes(key)) {
        req.parsedQuery[key] = req.query[key];
      }
    });

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Paramètres de requête invalides",
      data: null,
    });
  }
}

// Étendre le type Request pour inclure parsedQuery
declare global {
  namespace Express {
    interface Request {
      parsedQuery?: ParsedQuery;
    }
  }
}
