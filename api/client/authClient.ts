import axios from "axios";
import type {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";

import type { TokenResponseDto } from "../auth/auth.dto";
import { baseClientConfig, publicClient } from "./publicClient";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

const authClient = axios.create(baseClientConfig);

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<TokenResponseDto> | null = null;

function setAuthorizationHeader(headers: AxiosRequestHeaders, accessToken: string) {
  headers.Authorization = `Bearer ${accessToken}`;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new Error("Refresh token not found.");
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await publicClient.post<TokenResponseDto>(
          "/api/v1/auth/refresh",
          { refreshToken },
          {
            _skipAuthRefresh: true,
          } as RetryableRequestConfig,
        );
        const tokens = response.data;

        setTokens(tokens.accessToken, tokens.refreshToken);
        return tokens;
      } catch (error) {
        if (getRefreshToken() === refreshToken) {
          clearTokens();
        }
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

authClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();

  if (!accessToken || !config.headers) {
    return config;
  }

  setAuthorizationHeader(config.headers as AxiosRequestHeaders, accessToken);
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;

      const tokens = await refreshAccessToken();

      if (originalRequest.headers) {
        setAuthorizationHeader(
          originalRequest.headers as AxiosRequestHeaders,
          tokens.accessToken,
        );
      }

      return authClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default authClient;
