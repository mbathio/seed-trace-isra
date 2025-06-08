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

// ✅ CORRECTION: Intercepteur amélioré pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // ✅ CORRECTION: S'assurer que le format Bearer est correct
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ CORRECTION: Intercepteur amélioré pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          // ✅ CORRECTION: Rafraîchir le token sans Authorization header dans cette requête
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              // Ne pas utiliser l'intercepteur pour cette requête
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            refreshResponse.data.data;

          // ✅ CORRECTION: Sauvegarder les nouveaux tokens
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // ✅ CORRECTION: Relancer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // ✅ CORRECTION: Nettoyer les tokens et rediriger
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        }
      } else {
        // ✅ CORRECTION: Rediriger si pas de refresh token
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
    }

    // ✅ CORRECTION: Gestion d'erreur améliorée
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 401) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
    } else if (error.response?.status >= 500) {
      toast.error("Erreur serveur. Veuillez réessayer plus tard.");
    } else {
      toast.error("Une erreur inattendue s'est produite");
    }

    return Promise.reject(error);
  }
);

export default api;
