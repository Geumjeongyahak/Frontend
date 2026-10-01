"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logout as requestLogout } from "../api/auth/auth.api";
import {
  AUTH_TOKEN_CHANGE_EVENT,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "../api/client/tokenStorage";
import { getCurrentUser } from "../api/user/user.api";
import { queryKeys } from "../lib/queryKeys";

export type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

function hasStoredToken() {
  return Boolean(getAccessToken() || getRefreshToken());
}

function subscribeTokenChange(onChange: () => void) {
  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// 여러 컴포넌트가 이 훅을 써도 /users/me는 queryKeys.user.me() 쿼리 하나를 공유한다.
export function useAuthSession() {
  const queryClient = useQueryClient();
  // null: 서버 렌더·하이드레이션 중이라 아직 브라우저 저장소를 읽지 않음
  const hasToken = useSyncExternalStore<boolean | null>(
    subscribeTokenChange,
    hasStoredToken,
    () => null,
  );

  const meQuery = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: getCurrentUser,
    enabled: hasToken === true,
    retry: false,
  });

  const refreshSession = useCallback(async () => {
    if (!hasStoredToken()) {
      queryClient.removeQueries({ queryKey: queryKeys.user.me() });
      return;
    }

    // cancelRefetch: false — 여러 인스턴스가 동시에 불러도 진행 중인 요청 하나를 공유한다
    await queryClient.invalidateQueries(
      { queryKey: queryKeys.user.me() },
      { cancelRefetch: false },
    );
  }, [queryClient]);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await requestLogout({ refreshToken });
      } catch {
        clearTokens();
      }
    } else {
      clearTokens();
    }

    queryClient.removeQueries({ queryKey: queryKeys.user.me() });
  }, [queryClient]);

  // 로그인·로그아웃·토큰 갱신 때 사용자 정보를 다시 맞춘다
  useEffect(
    () =>
      subscribeTokenChange(() => {
        refreshSession();
      }),
    [refreshSession],
  );

  let status: AuthSessionStatus;
  if (hasToken === null) {
    status = "loading";
  } else if (!hasToken) {
    status = "unauthenticated";
  } else if (meQuery.isError) {
    status = meQuery.isFetching ? "loading" : "error";
  } else if (meQuery.isSuccess) {
    status = "authenticated";
  } else {
    status = "loading";
  }

  return {
    status,
    user: status === "authenticated" ? (meQuery.data ?? null) : null,
    refreshSession,
    signOut,
  };
}
