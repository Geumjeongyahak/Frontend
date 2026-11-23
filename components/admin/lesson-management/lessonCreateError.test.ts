import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import { resolveLessonCreateErrorMessage } from "./lessonCreateError";

function axiosErrorWith(status: number, data: unknown) {
  const error = new AxiosError("Request failed");
  error.response = { data, status, statusText: "", headers: {}, config: {} } as AxiosResponse;
  return error;
}

describe("resolveLessonCreateErrorMessage", () => {
  it("shows the server message for a 409 instead of always claiming a time overlap", () => {
    const error = axiosErrorWith(409, { detail: "이미 같은 교시에 배정된 교사입니다." });

    expect(resolveLessonCreateErrorMessage(error)).toBe("이미 같은 교시에 배정된 교사입니다.");
  });

  it("falls back to the time overlap notice when a 409 has no message", () => {
    expect(resolveLessonCreateErrorMessage(axiosErrorWith(409, {}))).toBe(
      "시간대가 겹치는 수업이 존재합니다",
    );
  });

  it("uses the generic failure message for other errors", () => {
    expect(resolveLessonCreateErrorMessage(axiosErrorWith(500, {}))).toBe("수업 생성에 실패했습니다.");
  });
});
