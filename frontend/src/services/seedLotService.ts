// frontend/src/services/seedLotService.ts - VERSION AVEC GESTION DES PARAMÈTRES CORRIGÉE

import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, SeedLotFilters } from "../types/api";
import { DataTransformer } from "../utils/transformers";
import { toast } from "react-toastify";

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

// Fonction utilitaire pour nettoyer les paramètres
const cleanParams = (params: any): any => {
  if (!params) return {};

  const cleaned: any = {};

  Object.entries(params).forEach(([key, value]) => {
    // Ne pas inclure les valeurs undefined, null ou chaînes vides
    if (value !== undefined && value !== null && value !== "") {
      // Gérer les cas spéciaux
      if (key === "page" || key === "pageSize") {
        // S'assurer que les valeurs de pagination sont des nombres valides
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) {
          cleaned[key] = numValue;
        }
      } else if (key === "includeRelations") {
        // S'assurer que c'est un booléen
        cleaned[key] = Boolean(value);
      } else if (key === "sortOrder" && (value === "asc" || value === "desc")) {
        // Valider l'ordre de tri
        cleaned[key] = value;
      } else if (key === "level" && typeof value === "string") {
        // S'assurer que le niveau est en majuscules
        cleaned[key] = value.toUpperCase();
      } else if (key === "status" && value === "all") {
        // Ne pas envoyer le statut si c'est "all"
        // On ne fait rien, donc on ne l'ajoute pas aux params nettoyés
      } else {
        // Pour tous les autres paramètres
        cleaned[key] = value;
      }
    }
  });

  // Ajouter des valeurs par défaut si nécessaire
  if (!cleaned.page) cleaned.page = 1;
  if (!cleaned.pageSize) cleaned.pageSize = 10;

  return cleaned;
};

// Service principal pour les lots de semences
export const seedLotService = {
  /**
   * Récupère la liste des lots avec pagination et filtres
   */
  async getAll(
    params?: Partial<SeedLotFilters> & PaginationParams
  ): Promise<ApiResponse<SeedLot[]>> {
    try {
      // Nettoyer et valider les paramètres
      const validParams = cleanParams(params);

      console.log("Fetching seed lots with params:", validParams);

      const response = await api.get<ApiResponse<SeedLot[]>>("/seed-lots", {
        params: validParams,
      });

      // Transformer les données si nécessaire
      if (response.data?.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Error fetching seed lots:", error);

      // Gestion spécifique de l'erreur 422
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors || [];
        const errorMessage =
          validationErrors.length > 0
            ? `Erreur de validation: ${validationErrors
                .map((e: any) => e.message)
                .join(", ")}`
            : "Paramètres de requête invalides";

        toast.error(errorMessage);
      }

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
      if (response.data?.data) {
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
      // Nettoyer les données avant envoi
      const cleanedData = {
        ...data,
        level: data.level.toUpperCase() as any, // S'assurer que le niveau est en majuscules
      };

      const response = await api.post<ApiResponse<SeedLot>>(
        "/seed-lots",
        cleanedData
      );

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Error creating seed lot:", error);

      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors || [];
        const errorMessage =
          validationErrors.length > 0
            ? validationErrors
                .map((e: any) => `${e.field}: ${e.message}`)
                .join("\n")
            : "Erreur de validation des données";

        toast.error(errorMessage);
      }

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

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Error updating seed lot:", error);

      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors || [];
        const errorMessage =
          validationErrors.length > 0
            ? validationErrors
                .map((e: any) => `${e.field}: ${e.message}`)
                .join("\n")
            : "Erreur de validation des données";

        toast.error(errorMessage);
      }

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

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

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

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

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
      const validParams = cleanParams(params);
      const response = await api.get<ApiResponse<any>>(
        `/seed-lots/statistics`,
        { params: validParams }
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

      if (response.data?.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

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
      const validParams = cleanParams({ ...params, q: query });
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/seed-lots/search`,
        { params: validParams }
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

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
      const validParams = cleanParams({ ...filters, format });
      const response = await api.get(`/seed-lots/export`, {
        params: validParams,
        responseType: "blob",
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `seed-lots-export-${new Date().toISOString().split("T")[0]}.${format}`
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

      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

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

      if (response.data?.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

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

      if (response.data?.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

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

      if (response.data?.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

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
        `seed-lot-${type}-${id}-${new Date().toISOString().split("T")[0]}.pdf`
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
