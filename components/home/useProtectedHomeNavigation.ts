"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthSession } from "@/hooks/useAuthSession";

const LOGIN_REQUIRED_TOAST_ID = "home-login-required";
const LOGIN_REDIRECT_DELAY_MS = 900;

export function useProtectedHomeNavigation() {
  const router = useRouter();
  const { status, user } = useAuthSession();
  const isAuthenticated = status === "authenticated";

  function navigateWhenAuthenticated(href: string) {
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
