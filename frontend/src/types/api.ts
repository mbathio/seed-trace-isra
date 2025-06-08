// src/types/api.ts - Mise à jour
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  cropType?: string;
  result?: string; // Pour les contrôles qualité
}
