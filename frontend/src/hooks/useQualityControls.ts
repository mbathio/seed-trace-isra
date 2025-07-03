import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { QualityControl } from "../types/entities";
import { ApiResponse } from "../types/api";
import { toast } from "react-toastify";

export const useQualityControls = (params?: any) => {
  return useQuery<ApiResponse<QualityControl[]>>({
    queryKey: ["quality-controls", params],
    queryFn: async () => {
      const response = await api.get("/quality-controls", { params });
      return response.data;
    },
  });
};

export const useQualityControlById = (id: string | undefined) => {
  return useQuery<QualityControl>({
    queryKey: ["quality-control", id],
    queryFn: async () => {
      const response = await api.get(`/quality-controls/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateQualityControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/quality-controls", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quality-controls"] });
      queryClient.invalidateQueries({
        queryKey: ["seed-lot", data.data.lotId],
      });
      toast.success("Contrôle qualité créé avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la création";
      toast.error(message);
    },
  });
};

export const useUpdateQualityControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/quality-controls/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quality-controls"] });
      queryClient.invalidateQueries({
        queryKey: ["quality-control", variables.id],
      });
      toast.success("Contrôle qualité mis à jour avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(message);
    },
  });
};

export const useDeleteQualityControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/quality-controls/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-controls"] });
      toast.success("Contrôle qualité supprimé avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la suppression";
      toast.error(message);
    },
  });
};

export const useQualityControlsByLot = (lotId: string | undefined) => {
  return useQuery({
    queryKey: ["quality-controls-by-lot", lotId],
    queryFn: async () => {
      const response = await api.get("/quality-controls", {
        params: { lotId },
      });
      return response.data.data;
    },
    enabled: !!lotId,
  });
};
