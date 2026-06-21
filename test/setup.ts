import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

import { clearTokens } from "../api/client/tokenStorage";
import { server } from "../mocks/server";

process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearTokens();
});

afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearTokens();
});

afterAll(() => {
  server.close();
});
