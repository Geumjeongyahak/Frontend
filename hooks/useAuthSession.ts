"use client";

import { useCallback, useEffect, useState } from "react";
import { logout as requestLogout } from "@/api/auth/auth.api";
import {
  AUTH_TOKEN_CHANGE_EVENT,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "@/api/client/tokenStorage";
import { getCurrentUser } from "@/api/user/user.api";
import type { UserResponseDto } from "@/api/user/user.dto";

export type AuthSessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthSessionState = {
  status: AuthSessionStatus;
  user: UserResponseDto | null;
};

const initialState: AuthSessionState = {
  status: "loading",
  user: null,
};

function hasStoredToken() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>(initialState);

  const refreshSession = useCallback(async () => {
    if (!hasStoredToken()) {
      setState({ status: "unauthenticated", user: null });
      return;
    }

    setState((current) => ({
      status: current.status === "authenticated" ? "authenticated" : "loading",
      user: current.user,
    }));

    try {
      const user = await getCurrentUser();
      setState({ status: "authenticated", user });
    } catch {
      setState({ status: hasStoredToken() ? "error" : "unauthenticated", user: null });
    }
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      setState({ status: "unauthenticated", user: null });
      return;
    }

    try {
      await requestLogout({ refreshToken });
    } catch {
      clearTokens();
    } finally {
      setState({ status: "unauthenticated", user: null });
    }
  }, []);

  useEffect(() => {
    refreshSession();

    function handleTokenChange() {
      refreshSession();
    }

    window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, handleTokenChange);
    window.addEventListener("storage", handleTokenChange);

    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, handleTokenChange);
      window.removeEventListener("storage", handleTokenChange);
    };
  }, [refreshSession]);

  return {
    ...state,
    refreshSession,
    signOut,
  };
}

