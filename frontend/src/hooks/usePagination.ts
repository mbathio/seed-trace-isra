import { useState, useMemo } from "react";

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options: PaginationOptions = {}) {
  const [page, setPage] = useState(options.initialPage || 1);
  const [pageSize, setPageSize] = useState(options.initialPageSize || 10);

  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      offset: (page - 1) * pageSize,
    }),
    [page, pageSize]
  );

  const actions = {
    setPage,
    setPageSize,
    nextPage: () => setPage((prev) => prev + 1),
    previousPage: () => setPage((prev) => Math.max(1, prev - 1)),
    goToPage: (targetPage: number) => setPage(Math.max(1, targetPage)),
    reset: () => {
      setPage(1);
      setPageSize(options.initialPageSize || 10);
    },
  };

  return { pagination, actions };
}
