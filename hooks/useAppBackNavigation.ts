"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  getBackNavigationTarget,
  shouldConfirmExitOnBack,
} from "@/lib/navigation/backNavigation";
import { layout } from "@/styles/tokens";

function isMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(`(max-width: ${layout.breakpointMobile})`).matches;
}

function attemptAppExit() {
  if (typeof window === "undefined") {
    return;
  }

  window.close();
}

type UseAppBackNavigationOptions = {
  fallbackHref?: string;
};

export function useAppBackNavigation(options?: UseAppBackNavigationOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const backTarget = options?.fallbackHref ?? getBackNavigationTarget(pathname);

  function handleBack() {
    if (shouldConfirmExitOnBack(pathname, isMobileViewport())) {
      if (!window.confirm("종료하시겠습니까?")) {
        return;
      }

      attemptAppExit();
      return;
    }

    if (!backTarget) {
      return;
    }

    router.replace(backTarget);
  }

  return {
    backTarget,
    handleBack,
  };
}
