// frontend/src/services/api.ts - SERVICE API PRINCIPAL CORRIGÉ

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";

// Configuration de base
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Instance Axios principale
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête - Ajouter le token d'authentification
// 🔐 Intercepteur de requête - Ajout automatique du token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log clair uniquement en mode développement
    if (import.meta.env.DEV) {
      console.log(`🚀 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Erreur de configuration de requête:", error);
    return Promise.reject(error);
  }
);

// ⚙️ Intercepteur de réponse - Gestion automatique du refresh token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(`✅ [RESPONSE] ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (import.meta.env.DEV) {
      console.error(`❌ [ERROR] ${error.config?.url}`, {
        status: error.response?.status,
        message: error.response?.data?.message,
      });
    }

    // ✅ Si le token a expiré → tenter un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { timeout: 10000 }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Mise à jour des tokens dans le localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Rejouer la requête initiale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("🔒 Échec du renouvellement du token:", refreshError);

        // Nettoyage et redirection
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        toast.error("Session expirée. Veuillez vous reconnecter.");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // ✅ Gestion propre des autres erreurs
    const errorMessage =
      error.response?.data?.message || getErrorMessage(error.response?.status);

    const shouldShowToast =
      !originalRequest?.silent &&
      error.response?.status !== 404 &&
      !originalRequest?.url?.includes("/auth/me");

    if (shouldShowToast) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);


// Fonction utilitaire pour obtenir un message d'erreur approprié
function getErrorMessage(status?: number): string {
  switch (status) {
    case 400:
      return "Données invalides";
    case 401:
      return "Non autorisé";
    case 403:
      return "Accès interdit";
    case 404:
      return "Ressource non trouvée";
    case 422:
      return "Erreur de validation";
    case 429:
      return "Trop de requêtes. Veuillez patienter.";
    case 500:
      return "Erreur serveur";
    case 503:
      return "Service temporairement indisponible";
    default:
      return "Une erreur s'est produite";
  }
}

// Service API générique avec méthodes de base
export const apiService = {
  // Méthodes CRUD de base
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, config);
    return response.data;
  },

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  },

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  },

  // Méthodes spécialisées
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    const response = await api.post<T>(url, formData, config);
    return response.data;
  },

  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Requêtes silencieuses (sans toast d'erreur)
  async silentGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, { ...config, silent: true } as any);
    return response.data;
  },

  // Méthodes pour l'authentification
  auth: {
    async login(email: string, password: string) {
      return apiService.post("/auth/login", { email, password });
    },

    async register(data: any) {
      return apiService.post("/auth/register", data);
    },

    async logout(refreshToken?: string) {
      return apiService.post("/auth/logout", { refreshToken });
    },

    async refreshToken(refreshToken: string) {
      return apiService.post("/auth/refresh", { refreshToken });
    },

    async getCurrentUser() {
      return apiService.get("/auth/me");
    },

    async updateProfile(data: any) {
      return apiService.put("/auth/profile", data);
    },

    async changePassword(oldPassword: string, newPassword: string) {
      return apiService.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
    },

    async requestPasswordReset(email: string) {
      return apiService.post("/auth/request-password-reset", { email });
    },

    async resetPassword(token: string, newPassword: string) {
      return apiService.post("/auth/reset-password", { token, newPassword });
    },
  },

  // Méthodes pour les variétés
  varieties: {
    async getAll(params?: any) {
      return apiService.get("/varieties", { params });
    },

    async getById(id: string | number) {
      return apiService.get(`/varieties/${id}`);
    },

    async create(data: any) {
      return apiService.post("/varieties", data);
    },

    async update(id: string | number, data: any) {
      return apiService.put(`/varieties/${id}`, data);
    },

    async delete(id: string | number) {
      return apiService.delete(`/varieties/${id}`);
    },

    async getStats(id: string | number) {
      return apiService.get(`/varieties/${id}/statistics`);
    },
  },

  // Méthodes pour les multiplicateurs
  multipliers: {
    async getAll(params?: any) {
      return apiService.get("/multipliers", { params });
    },

    async getById(id: number) {
      return apiService.get(`/multipliers/${id}`);
    },

    async create(data: any) {
      return apiService.post("/multipliers", data);
    },

    async update(id: number, data: any) {
      return apiService.put(`/multipliers/${id}`, data);
    },

    async delete(id: number) {
      return apiService.delete(`/multipliers/${id}`);
    },

    async getContracts(id: number, params?: any) {
      return apiService.get(`/multipliers/${id}/contracts`, { params });
    },

    async getSeedLots(id: number, params?: any) {
      return apiService.get(`/multipliers/${id}/seed-lots`, { params });
    },

    async getProductions(id: number, params?: any) {
      return apiService.get(`/multipliers/${id}/productions`, { params });
    },

    async getStats(id: number) {
      return apiService.get(`/multipliers/${id}/statistics`);
    },
  },

  // Méthodes pour les parcelles
  parcels: {
    async getAll(params?: any) {
      return apiService.get("/parcels", { params });
    },

    async getById(id: number) {
      return apiService.get(`/parcels/${id}`);
    },

    async create(data: any) {
      return apiService.post("/parcels", data);
    },

    async update(id: number, data: any) {
      return apiService.put(`/parcels/${id}`, data);
    },

    async delete(id: number) {
      return apiService.delete(`/parcels/${id}`);
    },

    async addSoilAnalysis(id: number, data: any) {
      return apiService.post(`/parcels/${id}/soil-analysis`, data);
    },

    async getSoilAnalyses(id: number, params?: any) {
      return apiService.get(`/parcels/${id}/soil-analyses`, { params });
    },

    async getProductions(id: number, params?: any) {
      return apiService.get(`/parcels/${id}/productions`, { params });
    },
  },

  // Méthodes pour les productions
  productions: {
    async getAll(params?: any) {
      return apiService.get("/productions", { params });
    },

    async getById(id: number) {
      return apiService.get(`/productions/${id}`);
    },

    async create(data: any) {
      return apiService.post("/productions", data);
    },

    async update(id: number, data: any) {
      return apiService.put(`/productions/${id}`, data);
    },

    async delete(id: number) {
      return apiService.delete(`/productions/${id}`);
    },

    async addActivity(id: number, data: any) {
      return apiService.post(`/productions/${id}/activities`, data);
    },

    async updateActivity(productionId: number, activityId: number, data: any) {
      return apiService.put(
        `/productions/${productionId}/activities/${activityId}`,
        data
      );
    },

    async deleteActivity(productionId: number, activityId: number) {
      return apiService.delete(
        `/productions/${productionId}/activities/${activityId}`
      );
    },

    async addIssue(id: number, data: any) {
      return apiService.post(`/productions/${id}/issues`, data);
    },

    async updateIssue(productionId: number, issueId: number, data: any) {
      return apiService.put(
        `/productions/${productionId}/issues/${issueId}`,
        data
      );
    },

    async resolveIssue(productionId: number, issueId: number, notes?: string) {
      return apiService.patch(
        `/productions/${productionId}/issues/${issueId}/resolve`,
        { notes }
      );
    },

    async addWeatherData(id: number, data: any) {
      return apiService.post(`/productions/${id}/weather-data`, data);
    },

    async getStats(id: number) {
      return apiService.get(`/productions/${id}/statistics`);
    },
  },

  // Méthodes pour les contrôles qualité
  qualityControls: {
    async getAll(params?: any) {
      return apiService.get("/quality-controls", { params });
    },

    async getById(id: number) {
      return apiService.get(`/quality-controls/${id}`);
    },

    async create(data: any) {
      return apiService.post("/quality-controls", data);
    },

    async update(id: number, data: any) {
      return apiService.put(`/quality-controls/${id}`, data);
    },

    async delete(id: number) {
      return apiService.delete(`/quality-controls/${id}`);
    },

    async uploadCertificate(id: number, file: File) {
      return apiService.uploadFile(`/quality-controls/${id}/certificate`, file);
    },

    async downloadCertificate(id: number) {
      return apiService.downloadFile(
        `/quality-controls/${id}/certificate`,
        `certificat_controle_${id}.pdf`
      );
    },

    async getStats(params?: any) {
      return apiService.get("/quality-controls/statistics", { params });
    },
  },

  // Méthodes pour les rapports
  reports: {
    async getAll(params?: any) {
      return apiService.get("/reports", { params });
    },

    async getById(id: number) {
      return apiService.get(`/reports/${id}`);
    },

    async create(data: any) {
      return apiService.post("/reports", data);
    },

    async delete(id: number) {
      return apiService.delete(`/reports/${id}`);
    },

    async generate(type: string, params?: any) {
      return apiService.post(`/reports/generate/${type}`, params);
    },

    async download(id: number, format: string = "pdf") {
      return apiService.downloadFile(
        `/reports/${id}/download?format=${format}`,
        `rapport_${id}.${format}`
      );
    },

    async getProduction(params?: any) {
      return apiService.get("/reports/production", { params });
    },

    async getQuality(params?: any) {
      return apiService.get("/reports/quality", { params });
    },

    async getInventory(params?: any) {
      return apiService.get("/reports/inventory", { params });
    },

    async getMultiplierPerformance(params?: any) {
      return apiService.get("/reports/multiplier-performance", { params });
    },
  },

  // Méthodes pour les statistiques
  statistics: {
    async getDashboard() {
      return apiService.get("/statistics/dashboard");
    },

    async getTrends(months?: number) {
      return apiService.get("/statistics/trends", {
        params: { months: months || 6 },
      });
    },

    async getProductionStats(params?: any) {
      return apiService.get("/statistics/production", { params });
    },

    async getQualityStats(params?: any) {
      return apiService.get("/statistics/quality", { params });
    },

    async getInventoryStats(params?: any) {
      return apiService.get("/statistics/inventory", { params });
    },

    async getGeographicDistribution() {
      return apiService.get("/statistics/geographic-distribution");
    },
  },

  // Méthodes pour les utilisateurs
  users: {
    async getAll(params?: any) {
      return apiService.get("/users", { params });
    },

    async getById(id: number) {
      return apiService.get(`/users/${id}`);
    },

    async create(data: any) {
      return apiService.post("/users", data);
    },

    async update(id: number, data: any) {
      return apiService.put(`/users/${id}`, data);
    },

    async delete(id: number) {
      return apiService.delete(`/users/${id}`);
    },

    async updatePassword(id: number, data: any) {
      return apiService.put(`/users/${id}/password`, data);
    },

    async toggleStatus(id: number) {
      return apiService.patch(`/users/${id}/toggle-status`);
    },

    async updateRole(id: number, role: string) {
      return apiService.patch(`/users/${id}/role`, { role });
    },

    async uploadAvatar(id: number, file: File) {
      return apiService.uploadFile(`/users/${id}/avatar`, file);
    },
  },

  // Méthodes pour les contrats
  contracts: {
    async getAll(params?: any) {
      return apiService.get("/contracts", { params });
    },

    async getById(id: number) {
      return apiService.get(`/contracts/${id}`);
    },

    async create(data: any) {
      return apiService.post("/contracts", data);
    },

    async update(id: number, data: any) {
      return apiService.put(`/contracts/${id}`, data);
    },

    async delete(id: number) {
      return apiService.delete(`/contracts/${id}`);
    },

    async sign(id: number, signature: string) {
      return apiService.post(`/contracts/${id}/sign`, { signature });
    },

    async cancel(id: number, reason: string) {
      return apiService.post(`/contracts/${id}/cancel`, { reason });
    },

    async complete(id: number, notes?: string) {
      return apiService.post(`/contracts/${id}/complete`, { notes });
    },

    async downloadPDF(id: number) {
      return apiService.downloadFile(
        `/contracts/${id}/pdf`,
        `contrat_${id}.pdf`
      );
    },
  },

  // Méthodes pour l'export
  export: {
    async getFormats() {
      return apiService.get("/export/formats");
    },

    async seedLots(format: string = "csv", _params?: any) {
      return apiService.downloadFile(
        `/export/seed-lots?format=${format}`,
        `lots_semences.${format}`
      );
    },

    async varieties(format: string = "csv", _params?: any) {
      return apiService.downloadFile(
        `/export/varieties?format=${format}`,
        `varietes.${format}`
      );
    },

    async multipliers(format: string = "csv", _params?: any) {
      return apiService.downloadFile(
        `/export/multipliers?format=${format}`,
        `multiplicateurs.${format}`
      );
    },

    async qualityReport(_params?: any) {
      return apiService.downloadFile(
        "/export/quality-report",
        "rapport_qualite.pdf"
      );
    },

    async productionReport(_params?: any) {
      return apiService.downloadFile(
        "/export/production-report",
        "rapport_production.pdf"
      );
    },
  },

  // Méthodes pour les notifications
  notifications: {
    async getAll(params?: any) {
      return apiService.get("/notifications", { params });
    },

    async markAsRead(id: number) {
      return apiService.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead() {
      return apiService.patch("/notifications/read-all");
    },

    async delete(id: number) {
      return apiService.delete(`/notifications/${id}`);
    },

    async getUnreadCount() {
      return apiService.get("/notifications/unread-count");
    },

    async updatePreferences(preferences: any) {
      return apiService.put("/notifications/preferences", preferences);
    },
  },

  // Méthodes pour les activités/logs
  activities: {
    async getAll(params?: any) {
      return apiService.get("/activities", { params });
    },

    async getByEntity(entityType: string, entityId: string | number) {
      return apiService.get(`/activities/${entityType}/${entityId}`);
    },
  },

  // Méthode pour vérifier la santé de l'API
  async health() {
    return apiService.get("/health");
  },
};

// Export de l'instance axios pour une utilisation directe si nécessaire
export { api };

// Export du service principal
export default apiService;

// Export des services spécialisés (ils utilisent apiService en interne)
export { seedLotService } from "./seedLotService";
