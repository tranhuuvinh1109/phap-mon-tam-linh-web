import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_URL } from "@/constants";

import { getAppStorage, setAppStorage } from "@/lib/storage";

/**
 * Token management helpers using unified 'phap-mon-tam-linh' storage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const store = getAppStorage();
  return store["access-token"] || null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  setAppStorage({ "access-token": token });
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const store = getAppStorage();
  return store["refresh-token"] || null;
};

export const setRefreshToken = (token: string): void => {
  if (typeof window === "undefined") return;
  setAppStorage({ "refresh-token": token });
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  setAppStorage({
    "access-token": null,
    "refresh-token": null,
    user: null,
  });
};

// Backwards compatibility alias
export const removeAuthToken = clearTokens;

/**
 * Base URL for API requests
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "/api";

/**
 * Axios instance configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request Interceptor: Attach Bearer JWT Token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser/Axios set multipart/form-data boundary automatically for FormData
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Queue management for concurrent 401 requests while refreshing
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor: Global response handling & Auto Refresh Token on 401
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If no config or network error without response, reject immediately
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isRefreshRequest = originalRequest.url?.includes(API_URL.refreshToken);
    const isAuthRoute =
      originalRequest.url?.includes(API_URL.signIn) || originalRequest.url?.includes(API_URL.signUp);

    // If 401 occurred on a normal endpoint and hasn't been retried yet
    if (is401 && !originalRequest._retry && !isRefreshRequest && !isAuthRoute) {
      if (isRefreshing) {
        // If another request is currently refreshing the token, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        return Promise.reject(error);
      }

      try {
        // Use a separate axios call (not apiClient) to avoid recursive interceptor loops
        const response = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(`${BASE_URL}${API_URL.refreshToken}`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        setAuthToken(newAccessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh token is expired/invalid, clear tokens and reject queue
        processQueue(refreshError, null);
        clearTokens();

        // Optional: Dispatch a custom event to notify stores or redirect to login
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred.";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
