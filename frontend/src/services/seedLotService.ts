import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../types/api";

export const seedLotService = {
  getAll: async (
    params?: PaginationParams & FilterParams
  ): Promise<{ data: ApiResponse<SeedLot[]> }> => {
    return api.get("/seed-lots", { params });
  },

  getById: async (id: string): Promise<{ data: { data: SeedLot } }> => {
    return api.get(`/seed-lots/${id}`);
  },

  create: async (data: any): Promise<{ data: any }> => {
    return api.post("/seed-lots", data);
  },

  update: async (id: string, data: any): Promise<{ data: any }> => {
    return api.put(`/seed-lots/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/seed-lots/${id}`);
  },

  getGenealogy: async (id: string): Promise<{ data: { data: any } }> => {
    return api.get(`/seed-lots/${id}/genealogy`);
  },

  getQRCode: async (id: string): Promise<{ data: any }> => {
    return api.get(`/seed-lots/${id}/qr-code`);
  },
};
