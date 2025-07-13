import { Request, Response, NextFunction } from "express";

export interface ParsedQuery {
  page: number;
  pageSize: number;
  search?: string;
  [key: string]: any;
}

export interface RequestWithParsedQuery extends Request {
  parsedQuery: ParsedQuery;
}

export const parseQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Créer un nouvel objet pour les paramètres transformés
  const transformedQuery: any = {};

  // Parser les booléens
  const booleanFields = [
    "includeRelations",
    "includeExpired",
    "includeInactive",
  ];

  // Parser les nombres
  const numberFields = [
    "page",
    "pageSize",
    "varietyId",
    "multiplierId",
    "parcelId",
  ];

  // Copier tous les paramètres existants
  Object.keys(req.query).forEach((key) => {
    transformedQuery[key] = req.query[key];
  });

  // Transformer les booléens
  booleanFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      transformedQuery[field] = req.query[field] === "true";
    }
  });

  // Transformer les nombres
  numberFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      const value = parseInt(req.query[field] as string, 10);
      if (!isNaN(value)) {
        transformedQuery[field] = value;
      }
    }
  });

  // Remplacer req.query avec l'objet transformé
  req.query = transformedQuery;

  next();
};
