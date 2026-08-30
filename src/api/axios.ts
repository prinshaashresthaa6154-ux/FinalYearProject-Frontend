import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorDetails, ApiResponse, ValidationErrors } from "../types/api";

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

type ApiAxiosError = AxiosError<ApiResponse<unknown>> & {
  apiError?: ApiErrorDetails;
};

export const AUTH_SESSION_UPDATED_EVENT = "auth-session-updated";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");
const publicAuthPaths = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/admin/register",
  "/api/auth/guides/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/verify",
  "/api/auth/resend-otp",
]);

const getRequestPath = (url?: string) => {
  if (!url) return "";

  try {
    return new URL(url, API_BASE_URL).pathname;
  } catch {
    return url.split("?")[0];
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<string> | null = null;

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_SESSION_UPDATED_EVENT));
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

const getValidationErrors = (errors: unknown): ValidationErrors => {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return {};

  return Object.entries(errors).reduce<ValidationErrors>(
    (result, [field, message]) => {
      if (typeof message === "string") result[field] = message;
      return result;
    },
    {},
  );
};

const createApiErrorDetails = (error: ApiAxiosError): ApiErrorDetails => {
  const status = error.response?.status;
  const responseData = error.response?.data;
  const rawMessage = responseData?.message ?? error.message ?? "Request failed";
  const message = /lazyinitializationexception|could not initialize proxy|failed to lazily initialize/i.test(rawMessage)
    ? "The server could not load a related guide verification record. The verification action was not completed; backend Hibernate transaction handling needs to be fixed."
    : rawMessage;
  const validationErrors = getValidationErrors(responseData?.errors);
  if (Object.keys(validationErrors).length === 0 && responseData?.data) {
    Object.assign(validationErrors, getValidationErrors(responseData.data));
  }

  let kind: ApiErrorDetails["kind"] = "unknown";
  if (status === 401) kind = "unauthorized";
  else if (status === 403) kind = "forbidden";
  else if (status === 404) kind = "not-found";
  else if (status === 400)
    kind = Object.keys(validationErrors).length > 0 ? "validation" : "bad-request";
  else if (status === 409) kind = "conflict";
  else if (status === 410) kind = "gone";
  else if (status === 413) kind = "payload-too-large";
  else if (status !== undefined && status >= 500) kind = "server";

  return { status, message, validationErrors, kind };
};

export const getApiError = (error: unknown): ApiErrorDetails => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiAxiosError;
    return axiosError.apiError ?? createApiErrorDetails(axiosError);
  }

  if (error instanceof Error && (error.message === "Network Error" || error.message === "Failed to fetch")) {
    return {
      message: `Could not connect to ${API_BASE_URL || "the API server"}. Check that the backend is running and that the frontend URL is allowed by backend CORS.`,
      validationErrors: {},
      kind: "unknown",
    };
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      message: "Could not connect to the registration server. Confirm that the backend is running and try again.",
      validationErrors: {},
      kind: "unknown",
    };
  }

  return {
    message: error instanceof Error ? error.message : "Something went wrong",
    validationErrors: {},
    kind: "unknown",
  };
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const requestPath = getRequestPath(config.url);

  // Let the browser set the multipart boundary. An inherited content-type
  // can make Spring reject the request when it includes a charset parameter.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  if (
    token &&
    !publicAuthPaths.has(requestPath) &&
    !config.headers.Authorization
  ) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = error as ApiAxiosError;
    apiError.apiError = createApiErrorDetails(apiError);
    const originalRequest = apiError.config as RetryableRequestConfig | undefined;
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
        clearAuthSession();
        window.location.href = "/login";
      }
    } else if (error.response?.status === 401 && !isPublicAuthRequest) {
      clearAuthSession();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
export default api;
