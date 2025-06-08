// src/utils/pagination.ts
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
