import { describe, expect, it } from "vitest";

import {
  koreanShortDateToLocalDateTime,
  normalizeLessonExchangeExpiresAtForApi,
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

  it("normalizes expiresAt payload for PATCH", () => {
    expect(normalizeLessonExchangeExpiresAtForApi("")).toBeUndefined();
    expect(normalizeLessonExchangeExpiresAtForApi("2026-06-07T22:00")).toBe("2026-06-07T22:00:00");
    expect(normalizeLessonExchangeExpiresAtForApi("2026-06-07T09:05")).toBe(
      "2026-06-07T09:05:00",
    );
    expect(normalizeLessonExchangeExpiresAtForApi("2026-06-07T22:00:59")).toBe(
      "2026-06-07T22:00:59",
    );
    expect(normalizeLessonExchangeExpiresAtForApi("2026-06-07")).toBe("2026-06-07T22:00:00");
    expect(normalizeLessonExchangeExpiresAtForApi("  2026-06-07T08:01  ")).toBe(
      "2026-06-07T08:01:00",
    );
  });
});
