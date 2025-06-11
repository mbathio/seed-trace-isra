// frontend/src/hooks/useApi.ts - VERSION CORRIGÉE
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { DEFAULT_QUERY_CONFIG, ERROR_MESSAGES } from "../constants";

// ✅ AJOUT: Type pour les options de requête étendues
interface ExtendedQueryOptions {
  enabled?: boolean;
  retry?: number | boolean;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// ✅ CORRIGÉ: Hook de requête API générique avec gestion d'erreur améliorée
export const useApiQuery = <T>(
  key: (string | number)[],
  url: string,
  params?: Record<string, any>,
  options?: ExtendedQueryOptions
) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      try {
        const response = await api.get(url, { params });
        return response.data.data || response.data;
      } catch (error: any) {
        // Gestion d'erreur spécifique pour les requêtes
        console.error(`API Query Error (${url}):`, error);

        if (error.response?.status === 404) {
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        } else if (error.response?.status === 401) {
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        } else if (error.response?.status === 403) {
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        } else if (error.response?.status >= 500) {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        } else if (!error.response) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }

        throw error;
      }
    },
    retry: options?.retry ?? DEFAULT_QUERY_CONFIG.RETRY_ATTEMPTS,
    retryDelay: options?.retryDelay ?? 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? DEFAULT_QUERY_CONFIG.STALE_TIME,
    cacheTime: options?.cacheTime ?? DEFAULT_QUERY_CONFIG.CACHE_TIME,
    onSuccess: options?.onSuccess,
    onError: (error: any) => {
      console.error("Query error:", error);
      options?.onError?.(error);
    },
    ...options,
  });
};

// ✅ CORRIGÉ: Hook de mutation API avec gestion d'erreur améliorée
export const useApiMutation = <TData, TVariables>(
  url: string,
  method: "post" | "put" | "patch" | "delete" = "post",
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
    invalidateQueries?: (string | number)[][];
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await api[method](url, variables);
        return response.data.data || response.data;
      } catch (error: any) {
        // Gestion d'erreur spécifique pour les mutations
        console.error(
          `API Mutation Error (${method.toUpperCase()} ${url}):`,
          error
        );

        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.response?.status === 400) {
          throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
        } else if (error.response?.status === 401) {
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        } else if (error.response?.status === 403) {
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        } else if (error.response?.status === 404) {
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        } else if (error.response?.status >= 500) {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        } else if (!error.response) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }

        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    },
    onSuccess: (data) => {
      // Invalider les requêtes spécifiées
      options?.invalidateQueries?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Afficher le toast de succès si demandé
      if (options?.showSuccessToast !== false) {
        const message = options?.successMessage || "Opération réussie !";
        toast.success(message);
      }

      // Callback de succès
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);

      // Afficher le toast d'erreur si demandé
      if (options?.showErrorToast !== false) {
        toast.error(error.message);
      }

      // Callback d'erreur
      options?.onError?.(error);
    },
  });
};

// ✅ AJOUT: Hook spécialisé pour les requêtes paginées
export const usePaginatedQuery = <T>(
  key: (string | number)[],
  url: string,
  params?: Record<string, any>,
  options?: ExtendedQueryOptions
) => {
  return useApiQuery<{
    data: T[];
    meta: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(key, url, params, options);
};

// ✅ AJOUT: Hook pour les requêtes en temps réel (avec polling)
export const useRealtimeQuery = <T>(
  key: (string | number)[],
  url: string,
  params?: Record<string, any>,
  intervalMs: number = 30000, // 30 secondes par défaut
  options?: ExtendedQueryOptions
) => {
  return useApiQuery<T>(key, url, params, {
    ...options,
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
  });
};

// ✅ AJOUT: Hook pour les requêtes conditionnelles
export const useConditionalQuery = <T>(
  key: (string | number)[],
  url: string,
  condition: boolean,
  params?: Record<string, any>,
  options?: ExtendedQueryOptions
) => {
  return useApiQuery<T>(key, url, params, {
    ...options,
    enabled: condition && options?.enabled !== false,
  });
};

// ✅ AJOUT: Hook pour les requêtes de recherche avec debounce
export const useSearchQuery = <T>(
  key: (string | number)[],
  url: string,
  searchTerm: string,
  debounceMs: number = 300,
  params?: Record<string, any>,
  options?: ExtendedQueryOptions
) => {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useApiQuery<T>(
    [...key, debouncedTerm],
    url,
    { ...params, search: debouncedTerm },
    {
      ...options,
      enabled: options?.enabled !== false && debouncedTerm.length >= 2,
    }
  );
};

// ✅ AJOUT: Hook pour invalider des requêtes spécifiques
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateByKey: (key: (string | number)[]) =>
      queryClient.invalidateQueries({ queryKey: key }),
    invalidateByPrefix: (prefix: string) =>
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === prefix,
      }),
    refetchAll: () => queryClient.refetchQueries(),
    refetchByKey: (key: (string | number)[]) =>
      queryClient.refetchQueries({ queryKey: key }),
  };
};

// ✅ AJOUT: Import React pour les hooks
import React from "react";
