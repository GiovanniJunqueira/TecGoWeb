import axios from "axios";
import { environment } from "../environment";
import { AuthStorage } from "@/storages";
import { useAuth } from "@/contexts/auth/auth.context";


export const api = axios.create({
  baseURL: environment.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getAccessToken();
    const isRefreshEndpoint = config.url?.includes("/auth/refresh-token");

    if (token && !isRefreshEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired = error.response?.status === 403;
    const isRetryAttempted = originalRequest._retry;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh-token");

    if (isTokenExpired && !isRetryAttempted && !isRefreshEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = AuthStorage.getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token não encontrado.");

        const { data } = await api.post("/auth/refresh-token", { refreshToken });
        const { accessToken, expiresIn } = data;

        AuthStorage.set(accessToken, expiresIn, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Falha ao atualizar o token:", refreshError);
        AuthStorage.remove();
        const { logout } = useAuth();
        logout();

      }
    }

    return Promise.reject(error);
  }
);
