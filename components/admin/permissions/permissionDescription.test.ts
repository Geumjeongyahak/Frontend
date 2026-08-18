import { describe, expect, it } from "vitest";
import { getPermissionDescription } from "./permissionDescription";

describe("getPermissionDescription", () => {
  it("uses a consistent global label for a known permission", () => {
    expect(
      getPermissionDescription("user:manage:*", [
        {
          permissionCode: "user:manage:*",
          resourceCode: "user",
          actionCode: "manage",
          description: "사용자 계정과 직접 권한을 관리할 수 있습니다.",
        },
      ]),
    ).toBe("전체 사용자 관리");
  });

  it("uses a consistent target label even when the API includes a generic description", () => {
    expect(
      getPermissionDescription(
        "user:manage:15",
        [{ resourceCode: "user", actionCode: "manage", label: "사용자 관리" }],
        { permissionCode: "user:manage:15", description: "사용자 계정 전체를 관리할 수 있습니다." },
      ),
    ).toBe("사용자 관리 (ID: 15)");
  });

  it("creates an understandable fallback for a permission code", () => {
    expect(getPermissionDescription("user:manage:*")).toBe(
      "전체 사용자 관리",
    );
    expect(getPermissionDescription("department:read:3")).toBe(
      "부서 조회 (ID: 3)",
    );
  });

  it("uses registry resource and action labels when a description is unavailable", () => {
    expect(
      getPermissionDescription("event:manage:*", [
        {
          resourceCode: "event",
          resourceLabel: "행사",
          actionCode: "manage",
          actionLabel: "관리",
        },
      ]),
    ).toBe("전체 행사 관리");
  });

  it("does not expose a permission code sent as an assigned permission name", () => {
    expect(
      getPermissionDescription("channel:manage:15", [], {
        name: "channel:manage:*",
      }),
    ).toBe("채널 관리 (ID: 15)");
  });

  it("labels global and target grant permissions consistently", () => {
    expect(getPermissionDescription("department:grant:*")).toBe(
      "전체 부서 권한 부여 또는 변경",
    );
    expect(getPermissionDescription("department:grant:10")).toBe(
      "부서 권한 부여 또는 변경 (ID: 10)",
    );
  });

  it("describes write permissions as creation", () => {
    expect(getPermissionDescription("subject:write:*")).toBe("전체 과목 생성");
  });

  it("covers every permission resource used by the current admin registry and mocks", () => {
    expect(getPermissionDescription("channel:write:1")).toContain("채널");
    expect(getPermissionDescription("post:manage:*")).toContain("게시글");
    expect(getPermissionDescription("purchase-request:review:*")).toContain("구매 요청");
    expect(getPermissionDescription("subject:write:*")).toContain("과목");
    expect(getPermissionDescription("user:manage:*")).toContain("사용자");
  });
});
