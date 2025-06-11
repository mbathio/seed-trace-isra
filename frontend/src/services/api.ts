// frontend/src/services/api.ts - VERSION CORRIGÉE
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ CORRECTION: Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ CORRECTION: Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            refreshResponse.data.data;

          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
    }

    // Gestion d'erreur améliorée
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 401) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
    } else if (error.response?.status >= 500) {
      toast.error("Erreur serveur. Veuillez réessayer plus tard.");
    } else if (error.response?.status === 404) {
      toast.error("Ressource non trouvée.");
    } else {
      toast.error("Une erreur inattendue s'est produite");
    }

    return Promise.reject(error);
  }
);

export default api;

// ✅ AJOUT: Services API spécialisés pour chaque ressource
export const seedLotService = {
  getAll: (params?: any) => api.get("/seed-lots", { params }),
  getById: (id: string) => api.get(`/seed-lots/${id}`),
  create: (data: any) => api.post("/seed-lots", data),
  update: (id: string, data: any) => api.put(`/seed-lots/${id}`, data),
  delete: (id: string) => api.delete(`/seed-lots/${id}`),
  getGenealogy: (id: string) => api.get(`/seed-lots/${id}/genealogy`),
  getQRCode: (id: string) => api.get(`/seed-lots/${id}/qr-code`),
};

export const varietyService = {
  getAll: (params?: any) => api.get("/varieties", { params }),
  getById: (id: string) => api.get(`/varieties/${id}`),
  create: (data: any) => api.post("/varieties", data),
  update: (id: string, data: any) => api.put(`/varieties/${id}`, data),
  delete: (id: string) => api.delete(`/varieties/${id}`),
};

export const multiplierService = {
  getAll: (params?: any) => api.get("/multipliers", { params }),
  getById: (id: number) => api.get(`/multipliers/${id}`),
  create: (data: any) => api.post("/multipliers", data),
  update: (id: number, data: any) => api.put(`/multipliers/${id}`, data),
  delete: (id: number) => api.delete(`/multipliers/${id}`),
};

export const parcelService = {
  getAll: (params?: any) => api.get("/parcels", { params }),
  getById: (id: number) => api.get(`/parcels/${id}`),
  create: (data: any) => api.post("/parcels", data),
  update: (id: number, data: any) => api.put(`/parcels/${id}`, data),
  delete: (id: number) => api.delete(`/parcels/${id}`),
};

export const qualityControlService = {
  getAll: (params?: any) => api.get("/quality-controls", { params }),
  getById: (id: number) => api.get(`/quality-controls/${id}`),
  create: (data: any) => api.post("/quality-controls", data),
  update: (id: number, data: any) => api.put(`/quality-controls/${id}`, data),
  delete: (id: number) => api.delete(`/quality-controls/${id}`),
};

export const productionService = {
  getAll: (params?: any) => api.get("/productions", { params }),
  getById: (id: number) => api.get(`/productions/${id}`),
  create: (data: any) => api.post("/productions", data),
  update: (id: number, data: any) => api.put(`/productions/${id}`, data),
  delete: (id: number) => api.delete(`/productions/${id}`),
};

export const statisticsService = {
  getDashboard: () => api.get("/statistics/dashboard"),
  getProduction: () => api.get("/statistics/production"),
  getQuality: () => api.get("/statistics/quality"),
};

export const authService = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  me: () => api.get("/auth/me"),
  register: (data: any) => api.post("/auth/register", data),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};
