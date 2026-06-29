import "../../test/setup";

import { describe, expect, it } from "vitest";

import { getSignupErrorMessage, getVerificationStatusMessage } from "./authErrorMessages";

function axiosLikeError(code: string, detail = "server detail") {
  return {
    response: {
      data: { code, detail },
    },
  };
}

describe("authErrorMessages", () => {
  it("maps Google duplicate signup errors by backend code", () => {
    expect(getSignupErrorMessage(axiosLikeError("AUTH007", "ignored"))).toBe(
      "이미 Google 계정으로 가입된 이메일입니다. Google로 로그인해 주세요.",
    );
  });

  it("maps duplicate local email signup errors by backend code", () => {
    expect(getSignupErrorMessage(axiosLikeError("BIZ-01-002", "ignored"))).toBe(
      "이미 사용 중인 이메일입니다.",
    );
  });

  it("falls back to backend detail for unknown signup errors", () => {
    expect(getSignupErrorMessage(axiosLikeError("UNKNOWN", "서버 메시지"))).toBe("서버 메시지");
  });

  it("maps verification result error codes", () => {
    expect(getVerificationStatusMessage("expired", "AUTH015")).toBe(
      "인증 링크가 만료되었습니다. 인증 메일을 다시 받아 주세요.",
    );
    expect(getVerificationStatusMessage("invalid", "VAL003")).toBe(
      "인증 링크가 올바르지 않습니다. 회원가입 후 받은 메일의 버튼을 다시 열어 주세요.",
    );
  });
});
