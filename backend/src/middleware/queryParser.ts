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

export const parseQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Parser les booléens
  const booleanFields = [
    "includeRelations",
    "includeExpired",
    "includeInactive",
  ];

  booleanFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      req.query[field] = req.query[field] === ("true" as any);
    }
  });

  // Parser les nombres
  const numberFields = [
    "page",
    "pageSize",
    "varietyId",
    "multiplierId",
    "parcelId",
  ];

  numberFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      const value = parseInt(req.query[field] as string, 10);
      if (!isNaN(value)) {
        req.query[field] = value as any;
      }
    }
  });

  next();
};
