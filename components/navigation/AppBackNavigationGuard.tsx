"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getBackNavigationTarget,
  shouldConfirmExitOnBack,
} from "@/lib/navigation/backNavigation";
import { layout } from "@/styles/tokens";

const APP_BACK_GUARD_KEY = "__geumjeong_app_back_guard__";
const APP_BACK_SKIP_ONCE_KEY = "__geumjeong_app_back_skip_once__";

function isMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(`(max-width: ${layout.breakpointMobile})`).matches;
}

function getUrlKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

function pushGuardState(urlKey: string) {
  const nextState =
    typeof window.history.state === "object" && window.history.state !== null
      ? window.history.state
      : {};

  if (nextState[APP_BACK_GUARD_KEY] === urlKey) {
    return;
  }

  window.history.pushState(
    {
      ...nextState,
      [APP_BACK_GUARD_KEY]: urlKey,
    },
    "",
    urlKey,
  );
}

function replaceGuardState(urlKey: string) {
  const nextState =
    typeof window.history.state === "object" && window.history.state !== null
      ? window.history.state
      : {};

  if (nextState[APP_BACK_GUARD_KEY] === urlKey) {
    return;
  }

  window.history.replaceState(
    {
      ...nextState,
      [APP_BACK_GUARD_KEY]: urlKey,
    },
    "",
    urlKey,
  );
}

function consumeSkipDuplicate(urlKey: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = window.sessionStorage.getItem(APP_BACK_SKIP_ONCE_KEY);

  if (stored !== urlKey) {
    return false;
  }

  window.sessionStorage.removeItem(APP_BACK_SKIP_ONCE_KEY);
  return true;
}

function attemptAppExit() {
  window.close();
}

export default function AppBackNavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const urlKey = getUrlKey(pathname, search);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (consumeSkipDuplicate(urlKey)) {
      replaceGuardState(urlKey);
      return;
    }

    pushGuardState(urlKey);
  }, [urlKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handlePopState() {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search.startsWith("?")
        ? window.location.search.slice(1)
        : window.location.search;
      const currentUrlKey = getUrlKey(currentPath, currentSearch);
      const backTarget = getBackNavigationTarget(currentPath);

      if (shouldConfirmExitOnBack(currentPath, isMobileViewport())) {
        attemptAppExit();
        window.setTimeout(() => {
          if (document.visibilityState === "visible") {
            pushGuardState(currentUrlKey);
          }
        }, 200);
        return;
      }

      if (!backTarget) {
        pushGuardState(currentUrlKey);
        return;
      }

      window.sessionStorage.setItem(APP_BACK_SKIP_ONCE_KEY, backTarget);
      router.replace(backTarget);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return null;
}
