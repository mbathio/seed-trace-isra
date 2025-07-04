// frontend/src/services/seedLotService.ts - VERSION COMPLÈTE ET CORRIGÉE

import { api } from "./api";
import { SeedLot } from "../types/entities";
import {
  ApiResponse,
  PaginationParams,
  FilterParams,
  SeedLotFilters,
} from "../types/api";
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
          // Assurer que les relations sont incluses si demandé
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
      // Transformer les données pour l'API
      const transformedData = DataTransformer.transformSeedLotForAPI(data);

      const response = await api.put<ApiResponse<SeedLot>>(
        `${this.basePath}/${id}`,
        transformedData
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      // Notification de succès
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
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `${this.basePath}/${id}`
      );

      // Notification de succès
      toast.success(response.data?.message || "Lot supprimé avec succès");

      return (
        response.data || {
          success: true,
          message: "Lot supprimé",
          data: undefined,
        }
      );
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la suppression du lot");
      throw error;
    }
  }

  /**
   * Récupère l'arbre généalogique d'un lot
   */
  async getGenealogy(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
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
   * Récupère le QR Code d'un lot
   */
  async getQRCode(id: string): Promise<ApiResponse<string>> {
    try {
      const response = await api.get<ApiResponse<string>>(
        `${this.basePath}/${id}/qr-code`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la génération du QR Code");
      throw error;
    }
  }

  /**
   * Crée un lot enfant à partir d'un lot parent
   */
  async createChildLot(
    parentId: string,
    data: CreateChildLotData
  ): Promise<ApiResponse<SeedLot>> {
    try {
      // Transformer les données pour l'API
      const transformedData = DataTransformer.transformSeedLotForAPI(data);

      const response = await api.post<ApiResponse<SeedLot>>(
        `${this.basePath}/${parentId}/child-lots`,
        transformedData
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      // Notification de succès
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

      // Notification de succès
      toast.success(response.data.message || "Lot transféré avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors du transfert du lot");
      throw error;
    }
  }

  /**
   * Exporte les lots dans le format spécifié
   */
  async export(
    format: "csv" | "xlsx" | "json" = "csv",
    params?: Partial<SeedLotFilters>
  ): Promise<Blob> {
    try {
      const response = await api.get(`/export/seed-lots`, {
        params: { format, ...params },
        responseType: "blob",
      });

      // Créer un nom de fichier avec timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `lots_semences_${timestamp}.${format}`;

      // Déclencher le téléchargement
      this.downloadBlob(response.data, filename);

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de l'export des lots");
      throw error;
    }
  }

  /**
   * Récupère les statistiques des lots
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
   * Recherche des lots par code ou variété
   */
  async search(
    query: string,
    params?: FilterParams
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
   * Vérifie si un lot peut avoir des enfants
   */
  async canHaveChildren(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.get<ApiResponse<boolean>>(
        `${this.basePath}/${id}/can-have-children`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la vérification");
      throw error;
    }
  }

  /**
   * Récupère les lots expirés ou proches de l'expiration
   */
  async getExpiring(days: number = 30): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/expiring`,
        {
          params: { days },
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
      this.handleError(
        error,
        "Erreur lors de la récupération des lots expirés"
      );
      throw error;
    }
  }

  /**
   * Récupère les lots par niveau
   */
  async getByLevel(level: string): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/by-level/${level}`
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
        `Erreur lors de la récupération des lots ${level}`
      );
      throw error;
    }
  }

  /**
   * Récupère les lots par variété
   */
  async getByVariety(varietyId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `${this.basePath}/by-variety/${varietyId}`
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
        "Erreur lors de la récupération des lots par variété"
      );
      throw error;
    }
  }

  /**
   * Récupère les lots par multiplicateur
   */
  async getByMultiplier(multiplierId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/multipliers/${multiplierId}/seed-lots`
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
   * Récupère les lots par parcelle
   */
  async getByParcel(parcelId: number): Promise<ApiResponse<SeedLot[]>> {
    try {
      const response = await api.get<ApiResponse<SeedLot[]>>(
        `/parcels/${parcelId}/seed-lots`
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

      // Notification de succès
      toast.success(response.data.message || "Statut mis à jour avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la mise à jour du statut");
      throw error;
    }
  }

  /**
   * Ajoute une note à un lot
   */
  async addNote(id: string, note: string): Promise<ApiResponse<SeedLot>> {
    try {
      const response = await api.post<ApiResponse<SeedLot>>(
        `${this.basePath}/${id}/notes`,
        { note }
      );

      // Transformer la réponse
      if (response.data.data) {
        response.data.data = DataTransformer.transformSeedLotFromAPI(
          response.data.data
        );
      }

      // Notification de succès
      toast.success("Note ajoutée avec succès");

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de l'ajout de la note");
      throw error;
    }
  }

  /**
   * Génère un rapport pour un lot
   */
  async generateReport(
    id: string,
    type: "certificate" | "history" | "quality" = "certificate"
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.basePath}/${id}/report/${type}`, {
        responseType: "blob",
      });

      // Créer un nom de fichier
      const filename = `lot_${id}_${type}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      // Déclencher le téléchargement
      this.downloadBlob(response.data, filename);

      return response.data;
    } catch (error: any) {
      this.handleError(error, "Erreur lors de la génération du rapport");
      throw error;
    }
  }

  /**
   * Valide les données d'un lot avant création/mise à jour
   */
  async validate(
    data: CreateSeedLotData | UpdateSeedLotData
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/validate`,
        data
      );

      return response.data;
    } catch (error: any) {
      // Ne pas afficher de toast pour la validation
      throw error;
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: any, defaultMessage: string): void {
    console.error(`[SeedLotService] ${defaultMessage}:`, error);

    // Extraire le message d'erreur
    let errorMessage = defaultMessage;

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        errorMessage = errors.join(", ");
      } else if (typeof errors === "object") {
        errorMessage = Object.values(errors).flat().join(", ");
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Notification d'erreur
    toast.error(errorMessage);

    // Logger l'erreur complète en développement
    if (import.meta.env.DEV) {
      console.error("Détails de l'erreur:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
  }

  /**
   * Utilitaire pour télécharger un blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Méthodes utilitaires pour la transformation des données
   */
  transformForAPI(data: any): any {
    return DataTransformer.transformSeedLotForAPI(data);
  }

  transformFromAPI(data: any): any {
    return DataTransformer.transformSeedLotFromAPI(data);
  }
}

// Instance unique du service (Singleton)
export const seedLotService = new SeedLotService();

// Export par défaut
export default seedLotService;
