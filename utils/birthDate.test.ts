import { describe, expect, it } from "vitest";
import {
  formatBirthDate,
  toBirthDateInputValue,
  toResidentRegistrationNumberPrefix,
} from "./birthDate";

describe("birthDate utils", () => {
  it("formats resident registration number prefix to display birth date", () => {
    expect(formatBirthDate("900101")).toBe("1990.01.01");
    expect(formatBirthDate("250315")).toBe("2025.03.15");
    expect(formatBirthDate("1990-01-01")).toBe("1990.01.01");
  });

  it("maps resident registration number prefix to date input value", () => {
    expect(toBirthDateInputValue("900101")).toBe("1990-01-01");
    expect(toBirthDateInputValue("250315")).toBe("2025-03-15");
    expect(toBirthDateInputValue("1990-01-01")).toBe("1990-01-01");
  });

  it("maps date input value to resident registration number prefix", () => {
    expect(toResidentRegistrationNumberPrefix("1990-01-01")).toBe("900101");
    expect(toResidentRegistrationNumberPrefix("2025-03-15")).toBe("250315");
    expect(toResidentRegistrationNumberPrefix("900101")).toBe("900101");
  });
});
