import "../test/setup";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { setTokens } from "../api/client/tokenStorage";
import {
  API_BASE_URL,
  VALID_ACCESS_TOKEN,
  VALID_REFRESH_TOKEN,
} from "../mocks/handlers/auth.handlers";
import { server } from "../mocks/server";

import { useAuthSession } from "./useAuthSession";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const statuses: string[][] = [[], [], []];

function Probe({ index }: { index: number }) {
  const { status } = useAuthSession();
  statuses[index].push(status);
  return null;
}

async function renderProbes() {
  const container = document.createElement("div");
  const root = createRoot(container);
  const queryClient = new QueryClient();

  await act(async () => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <Probe index={0} />
        <Probe index={1} />
        <Probe index={2} />
      </QueryClientProvider>,
    );
  });
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

  return () => act(() => root.unmount());
}

describe("useAuthSession", () => {
  it("훅을 여러 곳에서 써도 /users/me는 한 번만 부른다", async () => {
    setTokens(VALID_ACCESS_TOKEN, VALID_REFRESH_TOKEN);
    let meRequests = 0;
    server.events.on("request:start", ({ request }) => {
      if (request.url === `${API_BASE_URL}/api/v1/users/me`) {
        meRequests += 1;
      }
    });

    const unmount = await renderProbes();

    expect(meRequests).toBe(1);
    expect(statuses.map((list) => list.at(-1))).toEqual([
      "authenticated",
      "authenticated",
      "authenticated",
    ]);

    server.events.removeAllListeners();
    await unmount();
  });

  it("토큰이 없으면 요청 없이 unauthenticated", async () => {
    let meRequests = 0;
    server.events.on("request:start", () => {
      meRequests += 1;
    });

    const unmount = await renderProbes();

    expect(meRequests).toBe(0);
    expect(statuses[0].at(-1)).toBe("unauthenticated");

    server.events.removeAllListeners();
    await unmount();
  });
});
