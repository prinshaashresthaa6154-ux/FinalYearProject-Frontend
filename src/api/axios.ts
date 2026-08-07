import axios, { type InternalAxiosRequestConfig } from "axios";

type RefreshResponse = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      emailVerified: boolean;
    };
  };
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const AUTH_SESSION_UPDATED_EVENT = "auth-session-updated";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const publicAuthPaths = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify",
  "/api/auth/resend-otp",
]);

const getRequestPath = (url?: string) => {
  if (!url) return "";

  try {
    return new URL(url, baseURL).pathname;
  } catch {
    return url.split("?")[0];
  }
};

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<string> | null = null;

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const setAuthSession = (
  accessToken: string,
  refreshToken?: string,
) => {
  localStorage.setItem("token", accessToken);

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token is available");
  }

  const response = await refreshClient.post<RefreshResponse>(
    "/api/auth/refresh",
    { refreshToken },
  );
  const { accessToken, refreshToken: rotatedRefreshToken, user } =
    response.data.data;

  setAuthSession(accessToken, rotatedRefreshToken);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_SESSION_UPDATED_EVENT));

  return accessToken;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const requestPath = getRequestPath(config.url);

  if (token && !publicAuthPaths.has(requestPath)) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isPublicAuthRequest = publicAuthPaths.has(
      getRequestPath(originalRequest?.url),
    );
    const isRefreshableUnauthorized =
      error.response?.status === 401 &&
      originalRequest &&
      !isPublicAuthRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      Boolean(localStorage.getItem("refreshToken"));

    if (isRefreshableUnauthorized) {
      originalRequest._retry = true;

      try {
        refreshRequest ??= refreshAccessToken().finally(() => {
          refreshRequest = null;
        });
        const accessToken = await refreshRequest;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearSession();
        window.location.href = "/login";
      }
    } else if (error.response?.status === 401 && !isPublicAuthRequest) {
      clearSession();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
export default api;
