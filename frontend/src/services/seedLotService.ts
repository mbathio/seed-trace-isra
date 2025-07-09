// frontend/src/services/seedLotService.ts - VERSION COMPLÈTE ET CORRIGÉE

import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, SeedLotFilters } from "../types/api";
import { DataTransformer } from "../utils/transformers";

// Interface pour les données de création d'un lot
export interface CreateSeedLotData {
  varietyId: number;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status?: string;
  batchNumber?: string;
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
}

// Interface pour les données de mise à jour d'un lot
export interface UpdateSeedLotData {
  quantity?: number;
  status?: string;
  notes?: string;
  multiplierId?: number;
  parcelId?: number;
  expiryDate?: string;
  batchNumber?: string;
}

// Interface pour le transfert de lot
export interface TransferSeedLotData {
  targetMultiplierId: number;
  quantity: number;
  notes?: string;
}

// Interface pour la création d'un lot enfant
export interface CreateChildLotData {
  varietyId: number;
  quantity: number;
  productionDate: string;
  multiplierId?: number;
  parcelId?: number;
  notes?: string;
  batchNumber?: string;
}

// Interface pour l'arbre généalogique
export interface GenealogyNode {
  id: string;
  varietyName: string;
  level: string;
  quantity: number;
  productionDate: Date;
  status: string;
  multiplierName?: string;
  parentLotId?: string;
  children: GenealogyNode[];
  depth: number;
  isCurrentLot: boolean;
}

// Service principal pour les lots de semences
export const seedLotService = {
  /**
   * Récupère la liste des lots avec pagination et filtres
   */
  async getAll(
    params?: Partial<SeedLotFilters> & PaginationParams
  ): Promise<ApiResponse<SeedLot[]>> {
    try {
      // Nettoyer les paramètres
      const cleanParams: any = {};

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          // Ne pas inclure les valeurs undefined ou null
          if (value !== undefined && value !== null && value !== "") {
            cleanParams[key] = value;
          }
        });
      }

      const response = await api.get("/seed-lots", { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching seed lots:", error);
      throw error;
    }
  },

  /**
   * Récupère un lot par son ID
   */
  async getById(id: string): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.get<ApiResponse<SeedLot>>(`/seed-lots/${id}`, {
        params: {
          includeRelations: true,
          includeSources: true,
          includeProductions: true,
        },
      });

      // Transformer les données si nécessaire
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching seed lot by id:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau lot de semences
   */
  async create(data: CreateSeedLotData): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>("/seed-lots", data);
      return response.data;
    } catch (error) {
      console.error("Error creating seed lot:", error);
      throw error;
    }
  },

  /**
   * Met à jour un lot existant
   */
  async update(
    id: string,
    data: UpdateSeedLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.put<ApiResponse<SeedLot>>(
        `/seed-lots/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating seed lot:", error);
      throw error;
    }
  },

  /**
   * Supprime un lot
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/seed-lots/${id}`);
    } catch (error) {
      console.error("Error deleting seed lot:", error);
      throw error;
    }
  },

  /**
   * Récupère l'arbre généalogique d'un lot
   */
  async getGenealogy(id: string): Promise<ApiResponse<GenealogyNode>> {
    try {
      const response = await api.get<ApiResponse<GenealogyNode>>(
        `/seed-lots/${id}/genealogy`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching genealogy:", error);
      throw error;
    }
  },

  /**
   * Récupère le QR code d'un lot
   */
  async getQRCode(id: string): Promise<ApiResponse<{ qrCode: string }>> {
    try {
      const response = await api.get<ApiResponse<{ qrCode: string }>>(
        `/seed-lots/${id}/qr-code`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching QR code:", error);
      throw error;
    }
  },

  /**
   * Crée un lot enfant
   */
  async createChildLot(
    parentId: string,
    data: CreateChildLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>(
        `/seed-lots/${parentId}/child-lots`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating child lot:", error);
      throw error;
    }
  },

  /**
   * Transfère un lot vers un autre multiplicateur
   */
  async transferLot(
    id: string,
    data: TransferSeedLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>(
        `/seed-lots/${id}/transfer`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error transferring lot:", error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques d'un lot
   */
  async getStats(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/seed-lots/${id}/stats`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lot stats:", error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques globales des lots
   */
  async getStatistics(
    params?: Partial<SeedLotFilters>
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/seed-lots/statistics`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  },

  /**
   * Récupère les lots expirant bientôt
   */
  async getExpiring(days: number = 30): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/seed-lots/expiring`,
        { params: { days } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching expiring lots:", error);
      throw error;
    }
  },

  /**
   * Recherche des lots
   */
  async search(
    query: string,
    params?: Partial<SeedLotFilters>
  ): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/seed-lots/search`,
        {
          params: {
            q: query,
            ...params,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching seed lots:", error);
      throw error;
    }
  },

  /**
   * Exporte les lots
   */
  async export(
    format: "csv" | "xlsx" | "json",
    filters?: Partial<SeedLotFilters>
  ): Promise<Blob> {
    try {
      const response = await api.get(`/seed-lots/export`, {
        params: {
          format,
          ...filters,
        },
        responseType: "blob",
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `seed-lots-export-${new Date().toISOString()}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error("Error exporting seed lots:", error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'un lot
   */
  async updateStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.patch<ApiResponse<SeedLot>>(
        `/seed-lots/${id}/status`,
        { status, notes }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating lot status:", error);
      throw error;
    }
  },

  /**
   * Récupère les lots d'une variété
   */
  async getByVariety(varietyId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/seed-lots/variety/${varietyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lots by variety:", error);
      throw error;
    }
  },

  /**
   * Récupère les lots d'un multiplicateur
   */
  async getByMultiplier(multiplierId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/seed-lots/multiplier/${multiplierId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lots by multiplier:", error);
      throw error;
    }
  },

  /**
   * Récupère les lots d'une parcelle
   */
  async getByParcel(parcelId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/seed-lots/parcel/${parcelId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lots by parcel:", error);
      throw error;
    }
  },

  /**
   * Génère un rapport pour un lot
   */
  async generateReport(
    id: string,
    type: "certificate" | "history" | "quality"
  ): Promise<Blob> {
    try {
      const response = await api.get(`/seed-lots/${id}/report/${type}`, {
        responseType: "blob",
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `seed-lot-${type}-${id}-${new Date().toISOString()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },
};

// Export par défaut pour compatibilité
export default seedLotService;
