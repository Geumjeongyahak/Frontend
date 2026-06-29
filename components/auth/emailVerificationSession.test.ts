import "../../test/setup";

import { describe, expect, it } from "vitest";

import {
  clearPendingEmailVerificationEmail,
  getPendingEmailVerificationEmail,
  setPendingEmailVerificationEmail,
} from "./emailVerificationSession";

describe("emailVerificationSession", () => {
  it("stores pending email in sessionStorage instead of the URL", () => {
    setPendingEmailVerificationEmail("user@example.com");

    expect(getPendingEmailVerificationEmail()).toBe("user@example.com");
  });

  it("clears pending email after verification succeeds", () => {
    setPendingEmailVerificationEmail("user@example.com");

    clearPendingEmailVerificationEmail();

    expect(getPendingEmailVerificationEmail()).toBeNull();
  });
});
