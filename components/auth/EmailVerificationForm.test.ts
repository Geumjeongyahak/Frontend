import "../../test/setup";

import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("./AuthActionCard", () => ({
  default: () => null,
  ActionButton: "button",
  ActionForm: "div",
  InlineActionButton: "button",
}));

import { buildEmailVerificationTokenConfirmUrl } from "./EmailVerificationForm";

describe("EmailVerificationForm", () => {
  it("builds the backend token confirmation URL from the public API base URL", () => {
    expect(
      buildEmailVerificationTokenConfirmUrl(
        "https://dev.geumjeongschool.com",
        "token+/=",
      ),
    ).toBe(
      "https://dev.geumjeongschool.com/api/v1/auth/email-verification/confirm?token=token%2B%2F%3D",
    );
  });
});
