import { describe, expect, it } from "vitest";

import { formatPhoneNumber, getPhoneNumberDigits } from "./phoneNumber";

describe("phoneNumber", () => {
  it("removes non-numeric input and limits phone number digits", () => {
    expect(getPhoneNumberDigits("010-abcd-1234-5678-999")).toBe("01012345678");
  });

  it("formats mobile phone numbers while typing", () => {
    expect(formatPhoneNumber("010")).toBe("010");
    expect(formatPhoneNumber("0101")).toBe("010-1");
    expect(formatPhoneNumber("0101234")).toBe("010-1234");
    expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678");
  });

  it("formats Seoul area numbers with the 02 prefix", () => {
    expect(formatPhoneNumber("02")).toBe("02");
    expect(formatPhoneNumber("02123")).toBe("02-123");
    expect(formatPhoneNumber("021234567")).toBe("02-123-4567");
    expect(formatPhoneNumber("0212345678")).toBe("02-1234-5678");
  });

  it("keeps deletion-friendly partial values", () => {
    expect(formatPhoneNumber("010-1234-")).toBe("010-1234");
    expect(formatPhoneNumber("010-")).toBe("010");
  });
});

