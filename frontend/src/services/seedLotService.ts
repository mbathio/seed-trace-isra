// frontend/src/services/seedLotService.ts - VERSION COMPLÈTE AVEC TOUTES LES MÉTHODES

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

// Classe de service pour les lots de semences
class SeedLotService {
  private readonly basePath = "/seed-lots";

  /**
   * Récupère la liste des lots avec pagination et filtres
   */
  async getAll(
    params?: PaginationParams & Partial<SeedLotFilters>
  ): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(this.basePath, {
        params: {
          ...params,
          includeRelations: params?.includeRelations ?? true,
        },
      });

      // Transformer les données si nécessaire
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la récupération des lots");
      throw error;
    }
  }

  /**
   * Récupère un lot par son ID
   */
  async getById(id: string): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.get<ApiResponse<SeedLot>>(
        `${this.basePath}/${id}`,
        {
          params: {
            includeRelations: true,
            includeSources: true,
            includeProductions: true,
          },
        }
      );

      // Transformer les données
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la récupération du lot");
      throw error;
    }
  }

  /**
   * Crée un nouveau lot de semences
   */
  async create(data: CreateSeedLotData): Promise<ApiResponse<SeedLot>> {
    try {
      // Transformer les données pour l'API
      const transformedData = DataTransformer.transformSeedLotForAPI(data);

      const response = await api.post<ApiResponse<SeedLot>>(
        this.basePath,
        transformedData
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      // Notification de succès
      toast.success(response.data.message || "Lot créé avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la création du lot");
      throw error;
    }
  }

  /**
   * Met à jour un lot existant
   */
  async update(
    id: string,
    data: UpdateSeedLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.put<ApiResponse<SeedLot>>(
        `${this.basePath}/${id}`,
        data
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      toast.success(response.data.message || "Lot mis à jour avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la mise à jour du lot");
      throw error;
    }
  }

  /**
   * Supprime un lot
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.basePath}/${id}`);
      toast.success("Lot supprimé avec succès");
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la suppression du lot");
      throw error;
    }
  }

  /**
   * Récupère l'arbre généalogique d'un lot
   */
  async getGenealogy(id: string): Promise<ApiResponse<GenealogyNode>> {
    try {
      const response = await api.get<ApiResponse<GenealogyNode>>(
        `${this.basePath}/${id}/genealogy`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération de la généalogie"
      );
      throw error;
    }
  }

  /**
   * Récupère le QR code d'un lot
   */
  async getQRCode(id: string): Promise<ApiResponse<{ qrCode: string }>> {
    try {
      const response = await api.get<ApiResponse<{ qrCode: string }>>(
        `${this.basePath}/${id}/qr-code`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la génération du QR code");
      throw error;
    }
  }

  /**
   * Crée un lot enfant
   */
  async createChildLot(
    parentId: string,
    data: CreateChildLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>(
        `${this.basePath}/${parentId}/child-lots`,
        data
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      toast.success(response.data.message || "Lot enfant créé avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la création du lot enfant");
      throw error;
    }
  }

  /**
   * Transfère un lot vers un autre multiplicateur
   */
  async transferLot(
    id: string,
    data: TransferSeedLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>(
        `${this.basePath}/${id}/transfer`,
        data
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      toast.success(response.data.message || "Lot transféré avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors du transfert du lot");
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un lot
   */
  async getStats(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.basePath}/${id}/stats`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération des statistiques"
      );
      throw error;
    }
  }

  /**
   * Récupère les statistiques globales des lots
   */
  async getStatistics(
    params?: Partial<SeedLotFilters>
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.basePath}/statistics`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération des statistiques"
      );
      throw error;
    }
  }

  /**
   * Récupère les lots expirant bientôt
   */
  async getExpiring(days: number = 30): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/expiring`,
        { params: { days } }
      );

      // Transformer les données
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération des lots expirant"
      );
      throw error;
    }
  }

  /**
   * Recherche des lots
   */
  async search(
    query: string,
    params?: Partial<SeedLotFilters>
  ): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/search`,
        {
          params: {
            q: query,
            ...params,
          },
        }
      );

      // Transformer les données
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la recherche");
      throw error;
    }
  }

  /**
   * Exporte les lots
   */
  async export(
    format: "csv" | "xlsx" | "json",
    filters?: Partial<SeedLotFilters>
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.basePath}/export`, {
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
    } catch (error: any) {
      this.handleError(error, "Erreur lors de l'export");
      throw error;
    }
  }

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
        `${this.basePath}/${id}/status`,
        { status, notes }
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      toast.success(response.data.message || "Statut mis à jour avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la mise à jour du statut");
      throw error;
    }
  }

  /**
   * Récupère les lots d'une variété
   */
  async getByVariety(varietyId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/variety/${varietyId}`
      );

      // Transformer les données
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération des lots de la variété"
      );
      throw error;
    }
  }

  /**
   * Récupère les lots d'un multiplicateur
   */
  async getByMultiplier(multiplierId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/multiplier/${multiplierId}`
      );

      // Transformer les données
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération des lots du multiplicateur"
      );
      throw error;
    }
  }

  /**
   * Récupère les lots d'une parcelle
   */
  async getByParcel(parcelId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/parcel/${parcelId}`
      );

      // Transformer les données
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        );
      }

      return response.data;
    } catch (error: any) {
      this.handleError(
        error,
        "Erreur lors de la récupération des lots de la parcelle"
      );
      throw error;
    }
  }

  /**
   * Génère un rapport pour un lot
   */
  async generateReport(
    id: string,
    type: "certificate" | "history" | "quality"
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.basePath}/${id}/report/${type}`, {
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
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la génération du rapport");
      throw error;
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: any, defaultMessage: string): void {
    const message =
      error.response?.data?.message || error.message || defaultMessage;

    // Ne pas afficher de toast si l'erreur est déjà gérée
    if (!error.response?.data?.handled) {
      toast.error(message);
    }

    // Log de l'erreur pour le débogage
    console.error(defaultMessage, error);
  }
}

// Export de l'instance du service
export const seedLotService = new SeedLotService();

// Export par défaut pour compatibilité
export default seedLotService;
