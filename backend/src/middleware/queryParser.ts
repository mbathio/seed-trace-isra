import { Request, Response, NextFunction } from "express";

export interface ParsedQuery {
  page: number;
  pageSize: number;
  search?: string;
  [key: string]: any;
}

// Étendre le type Request AVANT la fonction
declare global {
  namespace Express {
    interface Request {
      parsedQuery: ParsedQuery; // ✅ Enlever le ? pour indiquer qu'il sera toujours défini
    }
  }
}

export function parseQueryParams(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // ✅ Initialiser req.parsedQuery directement
    req.parsedQuery = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100),
      search: (req.query.search as string) || undefined,
    };

    // Ajouter d'autres paramètres
    Object.keys(req.query).forEach((key) => {
      if (!["page", "pageSize", "search"].includes(key)) {
        req.parsedQuery![key] = req.query[key]; // ✅ Utiliser ! pour indiquer qu'il est défini
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
