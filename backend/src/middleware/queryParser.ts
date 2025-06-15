import { Request, Response, NextFunction } from "express";

export interface ParsedQuery {
  page: number;
  pageSize: number;
  search?: string;
  [key: string]: any;
}

// Étendre le type Request localement
export interface RequestWithParsedQuery extends Request {
  parsedQuery: ParsedQuery;
}

export function parseQueryParams(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Créer un objet parsedQuery
    const parsedQuery: ParsedQuery = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100),
      search: (req.query.search as string) || undefined,
    };

    // Ajouter d'autres paramètres
    Object.keys(req.query).forEach((key) => {
      if (!["page", "pageSize", "search"].includes(key)) {
        parsedQuery[key] = req.query[key];
      }
    });

    // Attacher à la requête
    (req as RequestWithParsedQuery).parsedQuery = parsedQuery;

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Paramètres de requête invalides",
      data: null,
    });
  }
}
