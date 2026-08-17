import { describe, expect, it } from "vitest";
import { getSafeLoginReturnTo } from "./loginRedirect";

describe("getSafeLoginReturnTo", () => {
  it("allows only the admin route as a post-login destination", () => {
    expect(getSafeLoginReturnTo("/admin")).toBe("/admin");
  });

  it("falls back to the home page for missing or unsafe destinations", () => {
    expect(getSafeLoginReturnTo(null)).toBe("/");
    expect(getSafeLoginReturnTo("/staff")).toBe("/");
    expect(getSafeLoginReturnTo("https://example.com")).toBe("/");
  });
});
