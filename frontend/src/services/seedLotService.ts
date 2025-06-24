// frontend/src/services/seedLotService.ts - VERSION CORRIGÉE
import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../types/api";

export const seedLotService = {
  async getAll(params?: PaginationParams & FilterParams) {
    const response = await api.get<ApiResponse<SeedLot[]>>("/seed-lots", {
      params,
    });
    return response;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<SeedLot>>(`/seed-lots/${id}`);
    return response;
  },

  async create(data: any) {
    const response = await api.post<ApiResponse<SeedLot>>("/seed-lots", data);
    return response;
  },

  async update(id: string, data: any) {
    const response = await api.put<ApiResponse<SeedLot>>(
      `/seed-lots/${id}`,
      data
    );
    return response;
  },

  async delete(id: string) {
    return await api.delete(`/seed-lots/${id}`);
  },

  async getGenealogy(id: string) {
    const response = await api.get<ApiResponse<any>>(
      `/seed-lots/${id}/genealogy`
    );
    return response;
  },

  async getQRCode(id: string) {
    return await api.get<ApiResponse<string>>(`/seed-lots/${id}/qr-code`);
  },

  async createChildLot(parentId: string, data: any) {
    const response = await api.post<ApiResponse<SeedLot>>(
      `/seed-lots/${parentId}/child-lots`,
      data
    );
    return response;
  },

  async transferLot(
    id: string,
    data: {
      targetMultiplierId: number;
      quantity: number;
      notes?: string;
    }
  ) {
    const response = await api.post<ApiResponse<SeedLot>>(
      `/seed-lots/${id}/transfer`,
      data
    );
    return response;
  },

  async export(format: "csv" | "xlsx" | "json" = "csv", params?: FilterParams) {
    const response = await api.get(`/export/seed-lots`, {
      params: { format, ...params },
      responseType: "blob",
    });
    return response.data;
  },

  async getStatistics(params?: FilterParams) {
    const response = await api.get<ApiResponse<any>>("/seed-lots/statistics", {
      params,
    });
    return response.data;
  },
};
