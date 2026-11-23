import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import { extractApiErrorMessage } from "./extractApiErrorMessage";

function axiosErrorWith(data: unknown, status = 400) {
  const error = new AxiosError("Request failed");
  error.response = { data, status, statusText: "", headers: {}, config: {} } as AxiosResponse;
  return error;
}

describe("extractApiErrorMessage", () => {
  it("shows the field validation message before the generic detail", () => {
    const error = axiosErrorWith({
      detail: "입력값 검증에 실패했습니다.",
      errors: [{ field: "password", message: "비밀번호는 8자 이상이어야 합니다." }],
    });

    expect(extractApiErrorMessage(error, "fallback")).toBe("비밀번호는 8자 이상이어야 합니다.");
  });

  it("falls back to detail when there are no field errors", () => {
    const error = axiosErrorWith({ detail: "이미 존재하는 이메일입니다." });

    expect(extractApiErrorMessage(error, "fallback")).toBe("이미 존재하는 이메일입니다.");
  });

  it("uses the fallback when the server gives nothing usable", () => {
    expect(extractApiErrorMessage(axiosErrorWith({}), "fallback")).toBe("fallback");
    expect(extractApiErrorMessage(null, "fallback")).toBe("fallback");
  });

  it("uses a plain Error message", () => {
    expect(extractApiErrorMessage(new Error("직접 던진 오류"), "fallback")).toBe("직접 던진 오류");
  });
});
