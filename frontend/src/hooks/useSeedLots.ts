// frontend/src/hooks/useSeedLots.ts - VERSION CORRIGÉE

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { seedLotService } from "../services/seedLotService";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, SeedLotFilters } from "../types/api";
import {
  CreateSeedLotData,
  UpdateSeedLotData,
} from "../services/seedLotService";
import { toast } from "react-toastify";

// Clés de cache pour React Query
export const SEED_LOT_KEYS = {
  all: ["seedLots"] as const,
  lists: () => [...SEED_LOT_KEYS.all, "list"] as const,
  list: (filters: Partial<SeedLotFilters>) =>
    [...SEED_LOT_KEYS.lists(), filters] as const,
  details: () => [...SEED_LOT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SEED_LOT_KEYS.details(), id] as const,
  genealogy: (id: string) => [...SEED_LOT_KEYS.all, "genealogy", id] as const,
  statistics: () => [...SEED_LOT_KEYS.all, "statistics"] as const,
  expiring: (days: number) => [...SEED_LOT_KEYS.all, "expiring", days] as const,
  qrcode: (id: string) => [...SEED_LOT_KEYS.detail(id), "qrcode"] as const,
};

/**
 * Hook pour récupérer la liste des lots de semences
 */
export function useSeedLots(
  params?: PaginationParams & Partial<SeedLotFilters>,
  options?: UseQueryOptions<ApiResponse<SeedLot[]>>
) {
  return useQuery<ApiResponse<SeedLot[]>>({
    queryKey: SEED_LOT_KEYS.list(params || {}),
    queryFn: async () => {
      const response = await seedLotService.getAll(params);

      // Log pour debug
      if (import.meta.env.DEV) {
        console.log("SeedLots response:", response);
      }

      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook pour récupérer un lot de semences par ID
 */
export function useSeedLot(
  id: string,
  options?: UseQueryOptions<ApiResponse<SeedLot>>
) {
  return useQuery<ApiResponse<SeedLot>>({
    queryKey: SEED_LOT_KEYS.detail(id),
    queryFn: () => seedLotService.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook pour créer un nouveau lot de semences
 */
export function useCreateSeedLot(
  options?: UseMutationOptions<ApiResponse<SeedLot>, Error, CreateSeedLotData>
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<SeedLot>, Error, CreateSeedLotData>({
    mutationFn: (data) => seedLotService.create(data),
    onSuccess: (response) => {
      // Invalider les listes pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.statistics() });

      // Optionnellement, ajouter le nouveau lot au cache
      if (response.data) {
        queryClient.setQueryData(
          SEED_LOT_KEYS.detail(response.data.id),
          response
        );
      }
    },
    ...options,
  });
}

/**
 * Hook pour mettre à jour un lot de semences
 */
export function useUpdateSeedLot(
  options?: UseMutationOptions<
    ApiResponse<SeedLot>,
    Error,
    { id: string; data: UpdateSeedLotData }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SeedLot>,
    Error,
    { id: string; data: UpdateSeedLotData }
  >({
    mutationFn: ({ id, data }) => seedLotService.update(id, data),
    onSuccess: (response, variables) => {
      // Invalider et mettre à jour le cache
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SEED_LOT_KEYS.detail(variables.id),
      });

      // Mettre à jour directement le cache si disponible
      if (response.data) {
        queryClient.setQueryData(SEED_LOT_KEYS.detail(variables.id), response);
      }
    },
    ...options,
  });
}

/**
 * Hook pour supprimer un lot de semences
 * CORRIGÉ: La méthode delete retourne Promise<void>
 */
export function useDeleteSeedLot(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => seedLotService.delete(id),
    onSuccess: (_, id) => {
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.statistics() });

      // Supprimer du cache
      queryClient.removeQueries({ queryKey: SEED_LOT_KEYS.detail(id) });
    },
    ...options,
  });
}

/**
 * Hook pour récupérer la généalogie d'un lot
 */
export function useSeedLotGenealogy(
  id: string,
  options?: UseQueryOptions<ApiResponse<any>>
) {
  return useQuery<ApiResponse<any>>({
    queryKey: SEED_LOT_KEYS.genealogy(id),
    queryFn: () => seedLotService.getGenealogy(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook pour récupérer le QR Code d'un lot
 * CORRIGÉ: Type de retour correct { qrCode: string }
 */
export function useSeedLotQRCode(
  id: string,
  options?: UseQueryOptions<ApiResponse<{ qrCode: string }>>
) {
  return useQuery<ApiResponse<{ qrCode: string }>>({
    queryKey: SEED_LOT_KEYS.qrcode(id),
    queryFn: () => seedLotService.getQRCode(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 heure
    ...options,
  });
}

/**
 * Hook pour créer un lot enfant
 */
export function useCreateChildLot(
  options?: UseMutationOptions<
    ApiResponse<SeedLot>,
    Error,
    { parentId: string; data: any }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SeedLot>,
    Error,
    { parentId: string; data: any }
  >({
    mutationFn: ({ parentId, data }) =>
      seedLotService.createChildLot(parentId, data),
    onSuccess: (_response, variables) => {
      // Invalider les listes et la généalogie du parent
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SEED_LOT_KEYS.genealogy(variables.parentId),
      });
      queryClient.invalidateQueries({
        queryKey: SEED_LOT_KEYS.detail(variables.parentId),
      });
    },
    ...options,
  });
}

/**
 * Hook pour transférer un lot
 */
export function useTransferSeedLot(
  options?: UseMutationOptions<
    ApiResponse<SeedLot>,
    Error,
    { id: string; targetMultiplierId: number; quantity: number; notes?: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SeedLot>,
    Error,
    { id: string; targetMultiplierId: number; quantity: number; notes?: string }
  >({
    mutationFn: ({ id, ...data }) => seedLotService.transferLot(id, data),
    onSuccess: (_response, variables) => {
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SEED_LOT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["multipliers", variables.targetMultiplierId],
      });
    },
    ...options,
  });
}

/**
 * Hook pour récupérer les statistiques des lots
 * CORRIGÉ: Ajout de la méthode getStatistics dans seedLotService
 */
export function useSeedLotStatistics(
  params?: Partial<SeedLotFilters>,
  options?: UseQueryOptions<ApiResponse<any>>
) {
  return useQuery<ApiResponse<any>>({
    queryKey: [...SEED_LOT_KEYS.statistics(), params || {}],
    queryFn: () => seedLotService.getStatistics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook pour récupérer les lots expirant bientôt
 * CORRIGÉ: Ajout de la méthode getExpiring dans seedLotService
 */
export function useExpiringSeedLots(
  days: number = 30,
  options?: UseQueryOptions<ApiResponse<SeedLot[]>>
) {
  return useQuery<ApiResponse<SeedLot[]>>({
    queryKey: SEED_LOT_KEYS.expiring(days),
    queryFn: () => seedLotService.getExpiring(days),
    staleTime: 60 * 60 * 1000, // 1 heure
    ...options,
  });
}

/**
 * Hook pour rechercher des lots
 * CORRIGÉ: Ajout de la méthode search dans seedLotService
 */
export function useSearchSeedLots(
  query: string,
  params?: Partial<SeedLotFilters>,
  options?: UseQueryOptions<ApiResponse<SeedLot[]>>
) {
  return useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [...SEED_LOT_KEYS.all, "search", query, params || {}],
    queryFn: () => seedLotService.search(query, params),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook pour exporter les lots
 * CORRIGÉ: Ajout de la méthode export dans seedLotService
 */
export function useExportSeedLots() {
  return useMutation<
    Blob,
    Error,
    { format: "csv" | "xlsx" | "json"; filters?: Partial<SeedLotFilters> }
  >({
    mutationFn: ({ format, filters }) => seedLotService.export(format, filters),
    onSuccess: () => {
      toast.success("Export terminé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'export");
    },
  });
}

/**
 * Hook pour mettre à jour le statut d'un lot
 * CORRIGÉ: Ajout de la méthode updateStatus dans seedLotService
 */
export function useUpdateSeedLotStatus(
  options?: UseMutationOptions<
    ApiResponse<SeedLot>,
    Error,
    { id: string; status: string; notes?: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SeedLot>,
    Error,
    { id: string; status: string; notes?: string }
  >({
    mutationFn: ({ id, status, notes }) =>
      seedLotService.updateStatus(id, status, notes),
    onSuccess: (response, variables) => {
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SEED_LOT_KEYS.detail(variables.id),
      });

      // Mise à jour optimiste
      if (response.data) {
        queryClient.setQueryData(SEED_LOT_KEYS.detail(variables.id), response);
      }
    },
    ...options,
  });
}

/**
 * Hook pour récupérer les lots d'une variété
 * CORRIGÉ: Ajout de la méthode getByVariety dans seedLotService
 */
export function useSeedLotsByVariety(
  varietyId: number,
  options?: UseQueryOptions<ApiResponse<SeedLot[]>>
) {
  return useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [...SEED_LOT_KEYS.all, "variety", varietyId],
    queryFn: () => seedLotService.getByVariety(varietyId),
    enabled: !!varietyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook pour récupérer les lots d'un multiplicateur
 * CORRIGÉ: Ajout de la méthode getByMultiplier dans seedLotService
 */
export function useSeedLotsByMultiplier(
  multiplierId: number,
  options?: UseQueryOptions<ApiResponse<SeedLot[]>>
) {
  return useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [...SEED_LOT_KEYS.all, "multiplier", multiplierId],
    queryFn: () => seedLotService.getByMultiplier(multiplierId),
    enabled: !!multiplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook pour récupérer les lots d'une parcelle
 * CORRIGÉ: Ajout de la méthode getByParcel dans seedLotService
 */
export function useSeedLotsByParcel(
  parcelId: number,
  options?: UseQueryOptions<ApiResponse<SeedLot[]>>
) {
  return useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [...SEED_LOT_KEYS.all, "parcel", parcelId],
    queryFn: () => seedLotService.getByParcel(parcelId),
    enabled: !!parcelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook pour générer un rapport de lot
 * CORRIGÉ: Ajout de la méthode generateReport dans seedLotService
 */
export function useGenerateSeedLotReport() {
  return useMutation<
    Blob,
    Error,
    { id: string; type: "certificate" | "history" | "quality" }
  >({
    mutationFn: ({ id, type }) => seedLotService.generateReport(id, type),
    onSuccess: () => {
      toast.success("Rapport généré avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la génération du rapport");
    },
  });
}

/**
 * Hook personnalisé pour précharger les données d'un lot
 */
export function usePrefetchSeedLot() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: SEED_LOT_KEYS.detail(id),
      queryFn: () => seedLotService.getById(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };
}

/**
 * Hook pour invalider le cache des lots
 */
export function useInvalidateSeedLots() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.detail(id) }),
    invalidateGenealogy: (id: string) =>
      queryClient.invalidateQueries({ queryKey: SEED_LOT_KEYS.genealogy(id) }),
  };
}
