// frontend/src/services/seedLotService.ts
import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../types/api";
import { DataTransformer } from "../utils/transformers";

export const seedLotService = {
  async getAll(params?: PaginationParams & FilterParams) {
    const response = await api.get<ApiResponse<any>>("/seed-lots", {
      params,
    });

    // Gérer la structure de réponse
    const seedLots = response.data.data || [];
    const meta = response.data.meta || null;

    // Transformer les données si nécessaire
    const transformedSeedLots = seedLots.map((lot: any) => ({
      ...lot,
      // Transformer les enums si nécessaire
      status: lot.status?.toLowerCase().replace(/_/g, "-"),
      level: lot.level,
    }));

    return {
      data: {
        data: transformedSeedLots,
        meta: meta,
      },
    };
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<SeedLot>>(`/seed-lots/${id}`);
    if (response.data.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
    return response;
  },

  async create(data: any) {
    const transformedData = DataTransformer.transformSeedLotForAPI(data);
    const response = await api.post<ApiResponse<SeedLot>>(
      "/seed-lots",
      transformedData
    );
    if (response.data.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
    return response;
  },

  async update(id: string, data: any) {
    const transformedData = DataTransformer.transformSeedLotForAPI(data);
    const response = await api.put<ApiResponse<SeedLot>>(
      `/seed-lots/${id}`,
      transformedData
    );
    if (response.data.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
    return response;
  },

  async delete(id: string) {
    return await api.delete(`/seed-lots/${id}`);
  },

  async getGenealogy(id: string) {
    const response = await api.get<ApiResponse<any>>(
      `/seed-lots/${id}/genealogy`
    );
    // Transformer récursivement l'arbre généalogique
    if (response.data.data) {
      const transformTree = (node: any): any => {
        const transformed = DataTransformer.transformSeedLotFromAPI(node);
        if (node.children && Array.isArray(node.children)) {
          transformed.children = node.children.map(transformTree);
        }
        return transformed;
      };
      response.data.data = transformTree(response.data.data);
    }
    return response;
  },

  async getQRCode(id: string) {
    return await api.get<ApiResponse<string>>(`/seed-lots/${id}/qr-code`);
  },

  // ✅ NOUVELLES MÉTHODES
  async createChildLot(parentId: string, data: any) {
    const transformedData = DataTransformer.transformSeedLotForAPI(data);
    const response = await api.post<ApiResponse<SeedLot>>(
      `/seed-lots/${parentId}/child-lots`,
      transformedData
    );
    if (response.data.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
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
    if (response.data.data) {
      response.data.data = DataTransformer.transformSeedLotFromAPI(
        response.data.data
      );
    }
    return response;
  },

  // Méthode utilitaire pour l'export
  async export(format: "csv" | "xlsx" | "json" = "csv", params?: FilterParams) {
    const response = await api.get(`/export/seed-lots`, {
      params: { format, ...params },
      responseType: "blob",
    });
    return response.data;
  },

  // Méthode pour obtenir les statistiques
  async getStatistics(params?: FilterParams) {
    const response = await api.get<ApiResponse<any>>("/seed-lots/statistics", {
      params,
    });
    return response.data;
  },
};
