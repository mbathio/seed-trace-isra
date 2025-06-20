import { useState, useCallback } from "react";

interface PaginationState {
  page: number;
  pageSize: number;
}

interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: (totalPages: number) => void;
  reset: () => void;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  actions: PaginationActions;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback((totalPages: number) => {
    setPage(totalPages);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  }, []);

  return {
    pagination: {
      page,
      pageSize,
    },
    actions: {
      setPage,
      setPageSize: handleSetPageSize,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
      reset,
    },
  };
}
