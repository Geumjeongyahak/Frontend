import axios from "axios";
import type {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";

import type { TokenResponseDto } from "../auth/auth.dto";
import { baseClientConfig, publicClient } from "./publicClient";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getTokenStateVersion,
  setTokens,
} from "./tokenStorage";

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
  const tokenStateAtRequestStart = getTokenStateVersion();

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

        if (
          getTokenStateVersion() !== tokenStateAtRequestStart ||
          getRefreshToken() !== refreshToken
        ) {
          throw new Error("Auth state changed while refreshing token.");
        }

        setTokens(tokens.accessToken, tokens.refreshToken);
        return tokens;
      } catch (error) {
        // 서버가 refresh token을 거부했을 때만 로그아웃한다. 네트워크 오류·5xx는 토큰을 남겨 다음 요청에서 다시 시도한다.
        const isRejectedByServer =
          axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0);
        if (
          isRejectedByServer &&
          getTokenStateVersion() === tokenStateAtRequestStart &&
          getRefreshToken() === refreshToken
        ) {
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

  if (!accessToken) {
    return config;
  }

  config.headers = config.headers ?? new axios.AxiosHeaders();
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

      originalRequest.headers = originalRequest.headers ?? new axios.AxiosHeaders();
      setAuthorizationHeader(
        originalRequest.headers as AxiosRequestHeaders,
        tokens.accessToken,
      );

      return authClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default authClient;
