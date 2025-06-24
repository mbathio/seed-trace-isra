// frontend/src/services/api.ts - SERVICE API CORRIGÉ
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
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log des requêtes en développement
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error("Erreur de configuration de requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Debug en développement
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log des réponses en développement
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
          headers: response.headers,
        }
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log des erreurs en développement
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data,
        }
      );
    }

    // Gestion de l'expiration du token (401)
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

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Refaire la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Échec du renouvellement du token:", refreshError);

        // Déconnexion forcée
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        toast.error("Session expirée. Veuillez vous reconnecter.");
        window.location.href = "/auth/login";

        return Promise.reject(refreshError);
      }
    }

    // Gestion des autres erreurs
    const errorMessage =
      error.response?.data?.message || getErrorMessage(error.response?.status);

    // Ne pas afficher de toast pour certaines routes ou erreurs
    const shouldShowToast =
      !originalRequest.silent &&
      error.response?.status !== 404 &&
      !originalRequest.url?.includes("/auth/me");

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

// Service API avec méthodes typées
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

  // Méthodes pour les entités spécifiques

  // Lots de semences
  seedLots: {
    getAll: (params?: any) => apiService.get("/seed-lots", { params }),
    getById: (id: string) => apiService.get(`/seed-lots/${id}`),
    create: (data: any) => apiService.post("/seed-lots", data),
    update: (id: string, data: any) => apiService.put(`/seed-lots/${id}`, data),
    delete: (id: string) => apiService.delete(`/seed-lots/${id}`),
    getGenealogy: (id: string) => apiService.get(`/seed-lots/${id}/genealogy`),
    getQRCode: (id: string) => apiService.get(`/seed-lots/${id}/qr-code`),
  },

  // Variétés
  varieties: {
    getAll: (params?: any) => apiService.get("/varieties", { params }),
    getById: (id: string | number) => apiService.get(`/varieties/${id}`),
    create: (data: any) => apiService.post("/varieties", data),
    update: (id: string | number, data: any) =>
      apiService.put(`/varieties/${id}`, data),
    delete: (id: string | number) => apiService.delete(`/varieties/${id}`),
  },

  // Multiplicateurs
  multipliers: {
    getAll: (params?: any) => apiService.get("/multipliers", { params }),
    getById: (id: number) => apiService.get(`/multipliers/${id}`),
    create: (data: any) => apiService.post("/multipliers", data),
    update: (id: number, data: any) =>
      apiService.put(`/multipliers/${id}`, data),
    delete: (id: number) => apiService.delete(`/multipliers/${id}`),
    getContracts: (id: number) =>
      apiService.get(`/multipliers/${id}/contracts`),
    createContract: (id: number, data: any) =>
      apiService.post(`/multipliers/${id}/contracts`, data),
  },

  // Parcelles
  parcels: {
    getAll: (params?: any) => apiService.get("/parcels", { params }),
    getById: (id: number) => apiService.get(`/parcels/${id}`),
    create: (data: any) => apiService.post("/parcels", data),
    update: (id: number, data: any) => apiService.put(`/parcels/${id}`, data),
    delete: (id: number) => apiService.delete(`/parcels/${id}`),
    addSoilAnalysis: (id: number, data: any) =>
      apiService.post(`/parcels/${id}/soil-analysis`, data),
  },

  // Productions
  productions: {
    getAll: (params?: any) => apiService.get("/productions", { params }),
    getById: (id: number) => apiService.get(`/productions/${id}`),
    create: (data: any) => apiService.post("/productions", data),
    update: (id: number, data: any) =>
      apiService.put(`/productions/${id}`, data),
    delete: (id: number) => apiService.delete(`/productions/${id}`),
    addActivity: (id: number, data: any) =>
      apiService.post(`/productions/${id}/activities`, data),
    addIssue: (id: number, data: any) =>
      apiService.post(`/productions/${id}/issues`, data),
    addWeatherData: (id: number, data: any) =>
      apiService.post(`/productions/${id}/weather-data`, data),
  },

  // Contrôles qualité
  qualityControls: {
    getAll: (params?: any) => apiService.get("/quality-controls", { params }),
    getById: (id: number) => apiService.get(`/quality-controls/${id}`),
    create: (data: any) => apiService.post("/quality-controls", data),
    update: (id: number, data: any) =>
      apiService.put(`/quality-controls/${id}`, data),
    delete: (id: number) => apiService.delete(`/quality-controls/${id}`),
  },

  // Rapports
  reports: {
    getAll: (params?: any) => apiService.get("/reports", { params }),
    getById: (id: number) => apiService.get(`/reports/${id}`),
    create: (data: any) => apiService.post("/reports", data),
    getProduction: (params?: any) =>
      apiService.get("/reports/production", { params }),
    getQuality: (params?: any) =>
      apiService.get("/reports/quality", { params }),
    getInventory: (params?: any) =>
      apiService.get("/reports/inventory", { params }),
    getMultiplierPerformance: (params?: any) =>
      apiService.get("/reports/multiplier-performance", { params }),
  },

  // Statistiques
  statistics: {
    getDashboard: () => apiService.get("/statistics/dashboard"),
    getTrends: (months?: number) =>
      apiService.get("/statistics/trends", { params: { months } }),
  },

  // Authentification
  auth: {
    login: (email: string, password: string) =>
      apiService.post("/auth/login", { email, password }),
    register: (data: any) => apiService.post("/auth/register", data),
    logout: (refreshToken?: string) =>
      apiService.post("/auth/logout", { refreshToken }),
    refreshToken: (refreshToken: string) =>
      apiService.post("/auth/refresh", { refreshToken }),
    getCurrentUser: () => apiService.get("/auth/me"),
  },

  // Utilisateurs
  users: {
    getAll: (params?: any) => apiService.get("/users", { params }),
    getById: (id: number) => apiService.get(`/users/${id}`),
    create: (data: any) => apiService.post("/users", data),
    update: (id: number, data: any) => apiService.put(`/users/${id}`, data),
    delete: (id: number) => apiService.delete(`/users/${id}`),
    updatePassword: (id: number, data: any) =>
      apiService.put(`/users/${id}/password`, data),
  },

  // Export
  export: {
    async getFormats() {
      return apiService.get("/export/formats");
    },

    async seedLots() {
      return apiService.downloadFile("/export/seed-lots", "lots_semences.csv");
    },

    async qualityReport() {
      return apiService.downloadFile(
        "/export/quality-report",
        "rapport_qualite.pdf"
      );
    },
  },
};

// Export de l'instance axios pour une utilisation directe si nécessaire
export { api };
export default apiService;
export { seedLotService } from "./seedLotService";
