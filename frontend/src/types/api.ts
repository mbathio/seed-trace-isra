// frontend/src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  level?: string;
  status?: string;
  varietyId?: string | number;
  multiplierId?: number;
  startDate?: string;
  endDate?: string;
  cropType?: string; // Propriété manquante ajoutée
}
