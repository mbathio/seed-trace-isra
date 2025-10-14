// frontend/src/services/MultiplierService.ts
import { api } from "./api";
import type { Multiplier } from "../types/entities";
import type { ApiResponse } from "../types/api";

export const MultiplierService = {
  /**
   * 🔹 Créer un nouveau multiplicateur
   */
  async createMultiplier(
    data: Omit<Multiplier, "id" | "createdAt" | "updatedAt">
  ): Promise<Multiplier> {
    const response = await api.post<ApiResponse<Multiplier>>(
      "/multipliers",
      data
    );
    return response.data.data;
  },

  /**
   * 🔹 Récupérer la liste des multiplicateurs
   */
  async getAll(): Promise<Multiplier[]> {
    const response = await api.get<ApiResponse<Multiplier[]>>("/multipliers");
    return response.data.data;
  },

  /**
   * 🔹 Récupérer un multiplicateur par son ID
   */
  async getById(id: string | number): Promise<Multiplier> {
    const response = await api.get<ApiResponse<Multiplier>>(
      `/multipliers/${id}`
    );
    return response.data.data;
  },

  /**
   * 🔹 Mettre à jour un multiplicateur
   */
  async update(
    id: string | number,
    data: Partial<Multiplier>
  ): Promise<Multiplier> {
    const response = await api.put<ApiResponse<Multiplier>>(
      `/multipliers/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * 🔹 Supprimer un multiplicateur
   */
  async delete(id: string | number): Promise<void> {
    await api.delete(`/multipliers/${id}`);
  },
};
