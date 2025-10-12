// frontend/src/services/seedLotService.ts - VERSION COMPLÈTE ET MISE À JOUR
import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, SeedLotFilters } from "../types/api";
import { DataTransformer } from "../utils/transformers";
import { formatDateForAPI } from "../utils/formatters";
import { toast } from "react-toastify";

// Interfaces
export interface CreateSeedLotData {
  varietyId: number;
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  notes?: string;
  batchNumber?: string;
  multiplierId?: number;
  parentLotId?: number;
}

export interface UpdateSeedLotData {
  quantity?: number;
  status?: string;
  notes?: string;
  multiplierId?: number | null;
  parcelId?: number | null;
  expiryDate?: string | null;
  batchNumber?: string | null;
}

export const seedLotService = {
  // 🔹 Créer un nouveau lot
  async create(data: CreateSeedLotData): Promise<ApiResponse<SeedLot>> {
    try {
      const payload = {
        ...data,
        productionDate: formatDateForAPI(data.productionDate),
        expiryDate: data.expiryDate ? formatDateForAPI(data.expiryDate) : null,
        level: data.level?.toUpperCase(),
      };

      const response = await api.post<ApiResponse<SeedLot>>(
        "/seed-lots",
        payload
      );
      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }
      return response.data;
    } catch (error: any) {
      toast.error("Erreur lors de la création du lot");
      throw error;
    }
  },

  // 🔹 Mise à jour d’un lot
  async update(
    id: string,
    data: UpdateSeedLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const updatePayload: any = {};
      for (const key in data) {
        if (data[key as keyof UpdateSeedLotData] !== undefined) {
          updatePayload[key] = data[key as keyof UpdateSeedLotData];
        }
      }

      if (data.expiryDate) {
        updatePayload.expiryDate = formatDateForAPI(data.expiryDate);
      }

      const response = await api.put<ApiResponse<SeedLot>>(
        `/seed-lots/${id}`,
        updatePayload
      );
      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }
      return response.data;
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du lot");
      throw error;
    }
  },

  // 🔹 Suppression d’un lot
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/seed-lots/${id}`);
    } catch (error) {
      toast.error("Erreur lors de la suppression du lot");
      throw error;
    }
  },

  // 🔹 Nettoyer et transformer les paramètres
  cleanParams: (params: any): any => {
    if (!params) return {};
    const cleaned: any = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "status") {
          const mapping: Record<string, string> = {
            pending: "PENDING",
            certified: "CERTIFIED",
            rejected: "REJECTED",
            "in-stock": "IN_STOCK",
            sold: "SOLD",
            active: "ACTIVE",
            distributed: "DISTRIBUTED",
          };
          cleaned[key] = mapping[value as string] || value;
        } else if (key === "level") {
          cleaned[key] = value.toString().toUpperCase();
        } else {
          cleaned[key] = value;
        }
      }
    });

    if (!cleaned.page) cleaned.page = 1;
    if (!cleaned.pageSize) cleaned.pageSize = 10;

    return cleaned;
  },

  // 🔹 Récupération de tous les lots
  async getAll(
    params?: Partial<SeedLotFilters> & PaginationParams
  ): Promise<ApiResponse<SeedLot[]>> {
    const response = await api.get<ApiResponse<SeedLot[]>>("/seed-lots", {
      params: seedLotService.cleanParams(params),
    });

    if (response.data?.data) {
      response.data.data = response.data.data.map((lot) =>
        DataTransformer.transformSeedLotFromAPI(lot)
      );
    }
    return response.data;
  },

  // 🔹 Récupération d’un lot par ID
  async getById(id: string): Promise<ApiResponse<SeedLot>> {
    const response = await api.get<ApiResponse<SeedLot>>(`/seed-lots/${id}`, {
      params: { includeRelations: true },
    });

    if (response.data?.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
    return response.data;
  },

  // 🔹 Statistiques d’un lot
  async getStats(id: string): Promise<ApiResponse<any>> {
    const res = await api.get(`/seed-lots/${id}/stats`);
    return res.data;
  },

  // 🔹 Statistiques globales
  async getStatistics(params?: any): Promise<ApiResponse<any>> {
    const res = await api.get(`/seed-lots/statistics`, { params });
    return res.data;
  },

  // 🔹 Recherche globale
  async search(query: string, params?: any): Promise<ApiResponse<SeedLot[]>> {
    const res = await api.get(`/seed-lots/search`, {
      params: { q: query, ...params },
    });
    return res.data;
  },

  // 🔹 Lots par variété
  async getByVariety(varietyId: number): Promise<ApiResponse<SeedLot[]>> {
    const res = await api.get(`/seed-lots/variety/${varietyId}`);
    return res.data;
  },

  // 🔹 Lots par multiplicateur
  async getByMultiplier(multiplierId: number): Promise<ApiResponse<SeedLot[]>> {
    const res = await api.get(`/seed-lots/multiplier/${multiplierId}`);
    return res.data;
  },

  // 🔹 Lots par parcelle
  async getByParcel(parcelId: number): Promise<ApiResponse<SeedLot[]>> {
    const res = await api.get(`/seed-lots/parcel/${parcelId}`);
    return res.data;
  },

  // 🔹 Lots expirant bientôt
  async getExpiring(days: number = 30): Promise<ApiResponse<SeedLot[]>> {
    const res = await api.get(`/seed-lots/expiring`, { params: { days } });
    return res.data;
  },

  // 🔹 Mise à jour du statut
  async updateStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<SeedLot>> {
    const response = await api.patch<ApiResponse<SeedLot>>(
      `/seed-lots/${id}/status`,
      { status, notes }
    );
    if (response.data?.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
    return response.data;
  },

  // 🔹 Exportation
  async export(
    format: "csv" | "xlsx" | "json",
    filters?: Partial<SeedLotFilters>
  ): Promise<Blob> {
    const params = seedLotService.cleanParams({ ...filters, format });
    const res = await api.get(`/seed-lots/export`, {
      params,
      responseType: "blob",
    });
    return res.data;
  },

  // 🔹 Génération de rapport
  async generateReport(
    id: string,
    type: "certificate" | "history" | "quality"
  ): Promise<Blob> {
    const res = await api.get(`/seed-lots/${id}/report/${type}`, {
      responseType: "blob",
    });
    return res.data;
  },

  // 🔹 Généalogie du lot
  async getGenealogy(id: string): Promise<ApiResponse<any>> {
    const res = await api.get(`/seed-lots/${id}/genealogy`);
    return res.data;
  },

  // 🔹 QR Code
  async getQRCode(id: string): Promise<ApiResponse<{ qrCode: string }>> {
    const res = await api.get(`/seed-lots/${id}/qr-code`);
    return res.data;
  },

  // 🔹 Créer un lot enfant
  async createChildLot(
    parentId: string,
    data: any
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const payload = {
        ...data,
        parentLotId: parentId,
        productionDate: formatDateForAPI(data.productionDate),
        expiryDate: data.expiryDate ? formatDateForAPI(data.expiryDate) : null,
        level: data.level?.toUpperCase(),
      };

      const response = await api.post<ApiResponse<SeedLot>>(
        `/seed-lots/${parentId}/child`,
        payload
      );

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }
      return response.data;
    } catch (error: any) {
      toast.error("Erreur lors de la création du lot enfant");
      throw error;
    }
  },

  // 🔹 Transférer un lot à un autre multiplicateur
  async transferLot(
    id: string,
    data: { targetMultiplierId: number; quantity: number; notes?: string }
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>(
        `/seed-lots/${id}/transfer`,
        data
      );

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      return response.data;
    } catch (error: any) {
      toast.error("Erreur lors du transfert du lot");
      throw error;
    }
  },
};
