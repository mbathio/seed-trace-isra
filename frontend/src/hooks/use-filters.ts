import { useState, useMemo } from "react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "boolean";
  options?: { value: string; label: string }[];
}

export function useFilters<T extends Record<string, any>>(
  initialFilters: Partial<T> = {}
) {
  const [filters, setFilters] = useState<Partial<T>>(initialFilters);

  const setFilter = (key: keyof T, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: keyof T) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
    setFilters,
  };
}
