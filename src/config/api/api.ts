import axios from "axios";
import { environment } from "../environment";
import { AuthStorage } from "@/storages";

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired = error.response?.status === 403;
    const isRetryAttempted = originalRequest._retry;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh-token");

    if (isTokenExpired && !isRetryAttempted && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = AuthStorage.getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token não encontrado.");

        const { data } = await api.post("/auth/refresh-token", { refreshToken });
        const { accessToken, expiresIn } = data;

        AuthStorage.set(accessToken, expiresIn, refreshToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        AuthStorage.remove();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
