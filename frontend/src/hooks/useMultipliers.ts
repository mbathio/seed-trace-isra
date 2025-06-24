// frontend/src/hooks/useMultipliers.ts - NOUVEAU HOOK SPÉCIALISÉ
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { Multiplier } from "../types/entities";
import { ApiResponse } from "../types/api";
import { toast } from "react-toastify";

export const useMultipliers = (params?: any) => {
  return useQuery<ApiResponse<Multiplier[]>>({
    queryKey: ["multipliers", params],
    queryFn: async () => {
      const response = await api.get("/multipliers", { params });
      return response.data;
    },
  });
};

export const useMultiplierById = (id: string | undefined) => {
  return useQuery<Multiplier>({
    queryKey: ["multiplier", id],
    queryFn: async () => {
      const response = await api.get(`/multipliers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateMultiplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/multipliers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multipliers"] });
      toast.success("Multiplicateur créé avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la création";
      toast.error(message);
    },
  });
};

export const useUpdateMultiplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/multipliers/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["multipliers"] });
      queryClient.invalidateQueries({ queryKey: ["multiplier", variables.id] });
      toast.success("Multiplicateur mis à jour avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(message);
    },
  });
};

export const useDeleteMultiplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/multipliers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multipliers"] });
      toast.success("Multiplicateur supprimé avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la suppression";
      toast.error(message);
    },
  });
};

export const useMultiplierContracts = (multiplierId: string | undefined) => {
  return useQuery({
    queryKey: ["multiplier-contracts", multiplierId],
    queryFn: async () => {
      const response = await api.get(`/multipliers/${multiplierId}/contracts`);
      return response.data.data;
    },
    enabled: !!multiplierId,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      multiplierId,
      data,
    }: {
      multiplierId: number;
      data: any;
    }) => {
      const response = await api.post(
        `/multipliers/${multiplierId}/contracts`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["multiplier-contracts", variables.multiplierId],
      });
      toast.success("Contrat créé avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la création du contrat";
      toast.error(message);
    },
  });
};
