import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../utils/env";

export const http = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 15000
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as RetryableRequestConfig | undefined;
    const requestUrl = config?.url ?? "";

    const skipRefresh =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (status !== 401 || !config || config._retry || skipRefresh) {
      return Promise.reject(error);
    }

    try {
      config._retry = true;

      if (!refreshPromise) {
        refreshPromise = http.post("/auth/refresh").then(() => undefined);
      }

      await refreshPromise;
      refreshPromise = null;

      return http.request(config);
    } catch (refreshError) {
      refreshPromise = null;
      return Promise.reject(refreshError);
    }
  }
);
