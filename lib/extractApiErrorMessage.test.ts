import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { extractApiErrorMessage } from "./extractApiErrorMessage";

function apiError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  });
}

describe("extractApiErrorMessage", () => {
  it("shows the field message instead of the generic validation detail", () => {
    const error = apiError(400, {
      title: "COMMON001",
      detail: "입력값 검증에 실패했습니다.",
      errors: [{ field: "password", message: "비밀번호는 8자 이상이어야 합니다." }],
    });

    expect(extractApiErrorMessage(error, "실패")).toBe("비밀번호는 8자 이상이어야 합니다.");
  });

  it("uses detail when there are no field errors", () => {
    const error = apiError(409, { title: "SUB003", detail: "교사 수업 시간이 겹칩니다." });

    expect(extractApiErrorMessage(error, "실패")).toBe("교사 수업 시간이 겹칩니다.");
  });
});
