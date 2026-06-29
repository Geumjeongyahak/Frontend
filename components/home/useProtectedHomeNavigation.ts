"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { useAuthSession } from "@/hooks/useAuthSession";

const LOGIN_REQUIRED_TOAST_ID = "home-login-required";
const LOGIN_REDIRECT_DELAY_MS = 900;

export function useProtectedHomeNavigation() {
  const router = useRouter();
  const { status, user, refreshSession } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());

  function navigateWhenAuthenticated(href: string) {
    if (status === "loading" && hasStoredToken) {
      return;
    }

    if (status === "error" && hasStoredToken) {
      refreshSession().catch(() => undefined);
      return;
    }

    if (!isAuthenticated) {
      toast.info("로그인이 필요합니다.", {
        toastId: LOGIN_REQUIRED_TOAST_ID,
      });

      window.setTimeout(() => {
        router.push("/login");
      }, LOGIN_REDIRECT_DELAY_MS);
      return;
    }

    router.push(href);
  }

  return {
    status,
    isAuthLoading: status === "loading",
    isAuthenticated,
    user,
    navigateWhenAuthenticated,
  };
}
