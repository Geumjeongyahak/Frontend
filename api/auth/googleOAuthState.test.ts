import "../../test/setup";

import { describe, expect, it } from "vitest";

import {
  clearGoogleOAuthIntent,
  getGoogleOAuthIntent,
  setGoogleOAuthIntent,
} from "./googleOAuthState";

describe("googleOAuthState", () => {
  it("stores and reads the OAuth intent", () => {
    setGoogleOAuthIntent("login");

    expect(getGoogleOAuthIntent()).toBe("login");
  });

  it("clears the stored OAuth intent", () => {
    setGoogleOAuthIntent("connect");

    clearGoogleOAuthIntent();

    expect(getGoogleOAuthIntent()).toBeNull();
  });
});
