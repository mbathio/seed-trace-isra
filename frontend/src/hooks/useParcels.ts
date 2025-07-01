// frontend/src/hooks/useParcels.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { parcelService } from "../services/parcelService";
import { FilterParams } from "../types/api";

export const useParcels = (params?: FilterParams) => {
  return useQuery({
    queryKey: ["parcels", params],
    queryFn: () => parcelService.getAll(params),
  });
};

export const useParcel = (id: number) => {
  return useQuery({
    queryKey: ["parcel", id],
    queryFn: () => parcelService.getById(id),
    enabled: !!id,
  });
};

export const useCreateParcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parcelService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      toast.success("Parcelle créée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    },
  });
};

export const useUpdateParcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      parcelService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      queryClient.invalidateQueries({ queryKey: ["parcel", variables.id] });
      toast.success("Parcelle mise à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    },
  });
};

export const useDeleteParcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parcelService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      toast.success("Parcelle supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });
};

export const useAddSoilAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parcelId, data }: { parcelId: number; data: any }) =>
      parcelService.addSoilAnalysis(parcelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["parcel", variables.parcelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["parcel-soil-analyses", variables.parcelId],
      });
      toast.success("Analyse de sol ajoutée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    },
  });
};

export const useParcelStatistics = () => {
  return useQuery({
    queryKey: ["parcel-statistics"],
    queryFn: parcelService.getStatistics,
  });
};
