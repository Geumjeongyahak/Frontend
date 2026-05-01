import { describe, expect, it } from "vitest";

import {
  koreanShortDateToLocalDateTime,
  parseKoreanShortDateToIsoDate,
} from "./kstShortDate";

describe("kstShortDate", () => {
  it("parses yy.mm.dd to ISO date", () => {
    expect(parseKoreanShortDateToIsoDate("26.06.01")).toBe("2026-06-01");
    expect(parseKoreanShortDateToIsoDate(" 26.06.01 ")).toBe("2026-06-01");
    expect(parseKoreanShortDateToIsoDate("bad")).toBeNull();
  });

  it("builds API expiresAt-style datetime", () => {
    expect(koreanShortDateToLocalDateTime("26.06.01")).toBe("2026-06-01T22:00:00");
    expect(koreanShortDateToLocalDateTime("26.06.01", "15:30:00")).toBe("2026-06-01T15:30:00");
  });
});
