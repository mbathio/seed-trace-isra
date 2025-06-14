// src/utils/pagination.ts
// backend/src/utils/pagination.ts
import { PaginationQuery } from "../types/api";

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Parse et valide les paramètres de pagination
 */
export function parsePaginationParams(
  query: PaginationQuery
): PaginationParams {
  // Conversion et validation des paramètres
  let page = 1;
  let pageSize = 10;

  // Gérer page
  if (query.page !== undefined) {
    const pageValue =
      typeof query.page === "string" ? parseInt(query.page, 10) : query.page;
    if (!isNaN(pageValue) && pageValue > 0) {
      page = pageValue;
    }
  }

  // Gérer pageSize
  if (query.pageSize !== undefined) {
    const pageSizeValue =
      typeof query.pageSize === "string"
        ? parseInt(query.pageSize, 10)
        : query.pageSize;
    if (!isNaN(pageSizeValue) && pageSizeValue > 0) {
      pageSize = Math.min(pageSizeValue, 100); // Maximum 100 items par page
    }
  }

  // Calculer skip pour Prisma
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    take: pageSize,
  };
}

/**
 * Génère les métadonnées de pagination
 */
export function generatePaginationMeta(
  params: PaginationParams,
  totalCount: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / params.pageSize);

  return {
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}

/**
 * Parse un paramètre de tri
 */
export function parseSortParams(query: PaginationQuery): {
  orderBy: Record<string, "asc" | "desc">;
} {
  const { sortBy = "createdAt", sortOrder = "desc" } = query;

  // Validation du sortOrder
  const validSortOrder =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

  return {
    orderBy: {
      [sortBy]: validSortOrder,
    },
  };
}

/**
 * Parse les paramètres de recherche
 */
export function parseSearchParams(search?: string): any {
  if (!search || search.trim().length === 0) {
    return undefined;
  }

  const searchTerm = search.trim();

  // Retourner un objet de recherche Prisma
  return {
    OR: [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { code: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ],
  };
}

/**
 * Helper pour créer une réponse paginée
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  params: PaginationParams
): {
  data: T[];
  meta: PaginationMeta;
} {
  return {
    data,
    meta: generatePaginationMeta(params, totalCount),
  };
}

/**
 * Parse un paramètre numérique de manière sûre
 */
export function parseNumberParam(value: any, defaultValue: number = 0): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const parsed = typeof value === "string" ? parseInt(value, 10) : value;
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse un paramètre booléen de manière sûre
 */
export function parseBooleanParam(
  value: any,
  defaultValue: boolean = false
): boolean {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return defaultValue;
}

/**
 * Parse un paramètre de date de manière sûre
 */
export function parseDateParam(value: any): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Crée des filtres de date pour Prisma
 */
export function createDateRangeFilter(
  startDate?: string,
  endDate?: string,
  fieldName: string = "createdAt"
): any {
  const start = parseDateParam(startDate);
  const end = parseDateParam(endDate);

  if (!start && !end) return undefined;

  const filter: any = {};

  if (start) {
    filter.gte = start;
  }

  if (end) {
    // Ajouter un jour pour inclure toute la journée de fin
    const endOfDay = new Date(end);
    endOfDay.setDate(endOfDay.getDate() + 1);
    filter.lt = endOfDay;
  }

  return { [fieldName]: filter };
}

/**
 * Parse les paramètres de filtre multiples (array)
 */
export function parseArrayParam(value: any): string[] | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return value.filter((v) => v && typeof v === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return undefined;
}
interface CursorPagination {
  cursor?: string;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export class PaginationService {
  static async paginateWithCursor<T>(
    model: any,
    options: CursorPagination,
    where: any = {}
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const { cursor, limit, sortBy = "id", sortOrder = "asc" } = options;

    const cursorObj = cursor ? { [sortBy]: cursor } : undefined;
    const orderBy = { [sortBy]: sortOrder };

    const data = await model.findMany({
      where,
      ...(cursorObj && { cursor: cursorObj, skip: 1 }),
      take: limit + 1, // +1 pour détecter s'il y a plus d'éléments
      orderBy,
    });

    const hasMore = data.length > limit;
    if (hasMore) data.pop(); // Retirer l'élément supplémentaire

    const nextCursor =
      hasMore && data.length > 0 ? data[data.length - 1][sortBy] : undefined;

    return {
      data,
      nextCursor,
      hasMore,
    };
  }
}
