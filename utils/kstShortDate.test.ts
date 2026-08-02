import { describe, expect, it } from "vitest";

import {
  getLessonExchangeExpiresDateForApi,
  isValidIsoDate,
  parseKoreanShortDateToIsoDate,
} from "./kstShortDate";

describe("kstShortDate", () => {
  it("parses yy.mm.dd to ISO date", () => {
    expect(parseKoreanShortDateToIsoDate("26.06.01")).toBe("2026-06-01");
    expect(parseKoreanShortDateToIsoDate(" 26.06.01 ")).toBe("2026-06-01");
    expect(parseKoreanShortDateToIsoDate("bad")).toBeNull();
  });

  it("validates strict ISO date input", () => {
    expect(isValidIsoDate("2026-06-07")).toBe(true);
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2026-6-07")).toBe(false);
  });

  it("sends expiresDate only when it precedes the lesson date", () => {
    expect(getLessonExchangeExpiresDateForApi("", "2026-06-10")).toBeUndefined();
    expect(getLessonExchangeExpiresDateForApi("2026-06-10", "2026-06-10")).toBeUndefined();
    expect(getLessonExchangeExpiresDateForApi("2026-06-11", "2026-06-10")).toBeUndefined();
    expect(getLessonExchangeExpiresDateForApi("2026-06-09", "2026-06-10")).toBe("2026-06-09");
    expect(getLessonExchangeExpiresDateForApi("2026-02-29", "2026-06-10")).toBeUndefined();
  });
});
