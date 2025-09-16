// frontend/src/services/seedLotService.ts - MÉTHODE UPDATE CORRIGÉE

import { api } from "./api";
import { SeedLot } from "../types/entities";
import { ApiResponse, PaginationParams, SeedLotFilters } from "../types/api";
import { DataTransformer } from "../utils/transformers";
import { formatDateForAPI } from "../utils/formatters";
import { toast } from "react-toastify";

// Interface pour les données de mise à jour d'un lot
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
  // ... autres méthodes ...

  /**
   * Met à jour un lot existant
   */
  async update(
    id: string,
    data: UpdateSeedLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      console.log("Updating seed lot with ID:", id);
      console.log("Update data received:", data);

      // Préparer les données pour l'API
      const updatePayload: any = {};

      // Copier seulement les champs définis
      if (data.quantity !== undefined) {
        updatePayload.quantity = data.quantity;
      }

      if (data.status !== undefined) {
        updatePayload.status = data.status;
      }

      if (data.notes !== undefined) {
        updatePayload.notes = data.notes || null;
      }

      if (data.batchNumber !== undefined) {
        updatePayload.batchNumber = data.batchNumber || null;
      }

      if (data.multiplierId !== undefined) {
        updatePayload.multiplierId = data.multiplierId;
      }

      if (data.parcelId !== undefined) {
        updatePayload.parcelId = data.parcelId;
      }

      // Gérer spécialement la date d'expiration
      if (data.expiryDate !== undefined) {
        if (data.expiryDate && data.expiryDate.trim() !== "") {
          // Convertir la date au format ISO pour l'API
          updatePayload.expiryDate = formatDateForAPI(data.expiryDate);
        } else {
          updatePayload.expiryDate = null;
        }
      }

      console.log("Final update payload:", updatePayload);

      // Envoyer la requête de mise à jour
      const response = await api.put<ApiResponse<SeedLot>>(
        `/seed-lots/${id}`,
        updatePayload
      );

      console.log("Update response:", response.data);

      // Transformer les données de réponse si nécessaire
      if (response.data?.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Error updating seed lot:", error);

      // Gestion détaillée des erreurs
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors || [];
        const errorMessage =
          validationErrors.length > 0
            ? validationErrors
                .map((e: any) => `${e.field}: ${e.message}`)
                .join("\n")
            : "Erreur de validation des données";

        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        toast.error("Lot de semences non trouvé");
      } else if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les permissions pour modifier ce lot");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }

      throw error;
    }
  },

  // Fonction utilitaire pour nettoyer les paramètres
  cleanParams: (params: any): any => {
    if (!params) return {};

    const cleaned: any = {};

    Object.entries(params).forEach(([key, value]) => {
      // Ne pas inclure les valeurs undefined, null ou chaînes vides (sauf pour search)
      if (
        value !== undefined &&
        value !== null &&
        (value !== "" || key === "search")
      ) {
        // Gérer les cas spéciaux
        if (key === "page" || key === "pageSize") {
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue > 0) {
            cleaned[key] = numValue;
          }
        } else if (
          key === "includeRelations" ||
          key === "includeExpired" ||
          key === "includeInactive"
        ) {
          // Envoyer comme string, le backend convertira
          cleaned[key] = value === true || value === "true" ? "true" : "false";
        } else if (
          key === "sortOrder" &&
          (value === "asc" || value === "desc")
        ) {
          cleaned[key] = value;
        } else if (key === "level" && typeof value === "string") {
          cleaned[key] = value.toUpperCase();
        } else if (
          key === "varietyId" ||
          key === "multiplierId" ||
          key === "parcelId"
        ) {
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue > 0) {
            cleaned[key] = numValue;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });

    // Ajouter des valeurs par défaut si nécessaire
    if (!cleaned.page) cleaned.page = 1;
    if (!cleaned.pageSize) cleaned.pageSize = 10;
    if (!cleaned.hasOwnProperty("includeRelations"))
      cleaned.includeRelations = "true";

    return cleaned;
  },

  /**
   * Récupère la liste des lots avec pagination et filtres
   */
  async getAll(
    params?: Partial<SeedLotFilters> & PaginationParams
  ): Promise<ApiResponse<SeedLot[]>> {
    try {
      // Nettoyer et valider les paramètres
      const validParams = this.cleanParams(params);

      // Toujours inclure les relations par défaut
      validParams.includeRelations = true;

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
                .map((e: any) => e.message || e)
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
  async create(data: any): Promise<ApiResponse<SeedLot>> {
    try {
      // Préparer les données avec formatage des dates
      const createPayload = {
        ...data,
        productionDate: data.productionDate
          ? formatDateForAPI(data.productionDate)
          : undefined,
        expiryDate: data.expiryDate
          ? formatDateForAPI(data.expiryDate)
          : undefined,
        level: data.level?.toUpperCase(), // S'assurer que le niveau est en majuscules
      };

      console.log("Creating seed lot with payload:", createPayload);

      const response = await api.post<ApiResponse<SeedLot>>(
        "/seed-lots",
        createPayload
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

  // Autres méthodes du service (getGenealogy, getQRCode, etc.)
  async getGenealogy(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/seed-lots/${id}/genealogy`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching genealogy:", error);
      throw error;
    }
  },

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

  async transferLot(id: string, data: any): Promise<ApiResponse<SeedLot>> {
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

  async createChildLot(
    parentId: string,
    data: any
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

  async export(
    format: "csv" | "xlsx" | "json",
    filters?: Partial<SeedLotFilters>
  ): Promise<Blob> {
    try {
      const validParams = this.cleanParams({ ...filters, format });
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
};
