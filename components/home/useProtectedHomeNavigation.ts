"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthSession } from "@/hooks/useAuthSession";

export function useProtectedHomeNavigation() {
  const router = useRouter();
  const { status } = useAuthSession();
  const isAuthenticated = status === "authenticated";

  function navigateWhenAuthenticated(href: string) {
    if (!isAuthenticated) {
      toast.info("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    router.push(href);
  }

  return {
    isAuthenticated,
    navigateWhenAuthenticated,
  };
}
