// frontend/src/services/seedLotService.ts
import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../types/api";
import { DataTransformer } from "../utils/transformers";

export const seedLotService = {
  async getAll(params?: PaginationParams & FilterParams) {
    const response = await api.get<ApiResponse<SeedLot[]>>("/seed-lots", {
      params,
    });
    // Transformer les données reçues
    response.data.data = response.data.data.map((lot) =>
      DataTransformer.transformSeedLotFromAPI(lot)
    );
    return response;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<SeedLot>>(`/seed-lots/${id}`);
    response.data.data = DataTransformer.transformSeedLotFromAPI(
      response.data.data
    );
    return response;
  },

  async create(data: any) {
    const transformedData = DataTransformer.transformSeedLotForAPI(data);
    return await api.post("/seed-lots", transformedData);
  },

  async update(id: string, data: any) {
    const transformedData = DataTransformer.transformSeedLotForAPI(data);
    return await api.put(`/seed-lots/${id}`, transformedData);
  },

  async delete(id: string) {
    return await api.delete(`/seed-lots/${id}`);
  },

  async getGenealogy(id: string) {
    return await api.get(`/seed-lots/${id}/genealogy`);
  },

  async getQRCode(id: string) {
    return await api.get(`/seed-lots/${id}/qr-code`);
  },
};
