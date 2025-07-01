// frontend/src/services/parcelService.ts

import { api } from "./api";
import { Parcel } from "../types/entities";
import { ApiResponse, FilterParams } from "../types/api";

export const parcelService = {
  // Récupérer toutes les parcelles
  async getAll(params?: FilterParams) {
    const response = await api.get<ApiResponse<Parcel[]>>("/parcels", {
      params,
    });
    return response.data;
  },

  // Récupérer une parcelle par ID
  async getById(id: number) {
    const response = await api.get<Parcel>(`/parcels/${id}`);
    return response.data;
  },

  // Créer une nouvelle parcelle
  async create(data: Partial<Parcel>) {
    const response = await api.post<Parcel>("/parcels", data);
    return response.data;
  },

  // Mettre à jour une parcelle
  async update(id: number, data: Partial<Parcel>) {
    const response = await api.put<Parcel>(`/parcels/${id}`, data);
    return response.data;
  },

  // Supprimer une parcelle
  async delete(id: number) {
    const response = await api.delete(`/parcels/${id}`);
    return response.data;
  },

  // Ajouter une analyse de sol
  async addSoilAnalysis(parcelId: number, data: any) {
    const response = await api.post(`/parcels/${parcelId}/soil-analysis`, data);
    return response.data;
  },

  // Récupérer les analyses de sol d'une parcelle
  async getSoilAnalyses(parcelId: number) {
    const response = await api.get(`/parcels/${parcelId}/soil-analyses`);
    return response.data;
  },

  // Récupérer les productions d'une parcelle
  async getProductions(parcelId: number) {
    const response = await api.get(`/productions?parcelId=${parcelId}`);
    return response.data;
  },

  // Récupérer l'historique d'une parcelle
  async getHistory(parcelId: number) {
    const response = await api.get(`/parcels/${parcelId}/history`);
    return response.data;
  },

  // Exporter les données des parcelles
  async export(format: "csv" | "xlsx" | "pdf", filters?: FilterParams) {
    const response = await api.get(`/parcels/export`, {
      params: { format, ...filters },
      responseType: "blob",
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `parcelles_${new Date().toISOString()}.${format}`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Récupérer les statistiques des parcelles
  async getStatistics() {
    const response = await api.get("/parcels/statistics");
    return response.data;
  },

  // Vérifier la disponibilité d'une parcelle
  async checkAvailability(
    parcelId: number,
    startDate: string,
    endDate: string
  ) {
    const response = await api.post(`/parcels/${parcelId}/check-availability`, {
      startDate,
      endDate,
    });
    return response.data;
  },

  // Assigner un multiplicateur à une parcelle
  async assignMultiplier(parcelId: number, multiplierId: number) {
    const response = await api.post(`/parcels/${parcelId}/assign-multiplier`, {
      multiplierId,
    });
    return response.data;
  },

  // Calculer l'itinéraire vers une parcelle
  async getRoute(from: { lat: number; lng: number }, parcelId: number) {
    const response = await api.post(`/parcels/${parcelId}/route`, {
      from,
    });
    return response.data;
  },
};
