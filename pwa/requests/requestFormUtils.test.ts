import { describe, expect, it } from "vitest";
import {
  buildPurchaseRequestContent,
  formatCompactDateTime,
  getAssignmentClassNames,
} from "./requestFormUtils";

describe("requestFormUtils", () => {
  it("builds purchase request content with item lines", () => {
    expect(
      buildPurchaseRequestContent({
        classroomName: "한글반",
        applicantName: "홍길동",
        items: [
          {
            name: "공책",
            quantity: 2,
            reason: "학습용",
            paymentType: "ACTUAL",
          },
          {
            name: "화이트보드",
            quantity: 1,
            paymentType: "PREPAID",
          },
        ],
      }),
    ).toBe(
      "소속: 한글반\n신청자: 홍길동\n\n1. 공책 2개 / 실 결제 - 학습용\n2. 화이트보드 1개 / 선금 결제",
    );
  });

  it("deduplicates assignment classroom names", () => {
    expect(
      getAssignmentClassNames([
        { classroomName: "한글반" },
        { classroomName: "  한글반 " },
        { classroomName: "기초반" },
        { classroomName: "" },
      ]),
    ).toEqual(["한글반", "기초반"]);
  });

  it("formats compact date-time text for request detail", () => {
    expect(formatCompactDateTime("2026-06-21T23:59:00")).toBe("2026-06-21 23:59");
    expect(formatCompactDateTime("2026-06-21T23:59:00Z")).toBe("2026-06-21 23:59");
  });
});
