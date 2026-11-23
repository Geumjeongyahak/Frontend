import "../../../test/setup";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { StudentResponseDto } from "@/api/student/student.dto";
import { setAccessToken } from "@/api/client/tokenStorage";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { API_BASE_URL, VALID_ACCESS_TOKEN } from "@/mocks/handlers/auth.handlers";
import { server } from "@/mocks/server";
import AdminDashboardPage from "../AdminDashboardPage";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/hooks/useAuthSession", () => ({ useAuthSession: vi.fn() }));

const studentsUrl = API_BASE_URL + "/api/v1/students";
const classroom = { id: 1, name: "Blue Room" };
let students: StudentResponseDto[];
let queries: URLSearchParams[];
let root: Root;
let client: QueryClient;
let container: HTMLDivElement;

beforeEach(() => {
  setAccessToken(VALID_ACCESS_TOKEN);
  students = [
    { id: 11, name: "가영", phoneNumber: "010-1111-1111", classrooms: [classroom] },
    {
      id: 12,
      name: "민수",
      phoneNumber: "010-2222-2222",
      classrooms: [{ id: 2, name: "장미반" }],
      status: "ON_LEAVE",
    },
    { id: 13, name: "민수", phoneNumber: "010-3333-3333", classrooms: [], status: "COMPLETED" },
  ];
  queries = [];
  server.use(
    http.get(studentsUrl, ({ request }) => {
      const params = new URL(request.url).searchParams;
      queries.push(params);
      return HttpResponse.json(
        students
          .filter(
            (student) =>
              student.name?.includes(params.get("name") ?? "") &&
              (!params.has("classroomId") ||
                student.classrooms?.some((item) => item.id === Number(params.get("classroomId")))),
          )
          .reverse(),
      );
    }),
    http.get(API_BASE_URL + "/api/v1/permission-registry", () => HttpResponse.json([])),
    http.get(API_BASE_URL + "/api/v1/admin/purchase-requests", () =>
      HttpResponse.json({ content: [] }),
    ),
    http.get(API_BASE_URL + "/api/v1/admin/teacher-applications", () =>
      HttpResponse.json({ content: [] }),
    ),
  );
  vi.stubGlobal("PerformanceNavigationTiming", class {});
  Object.defineProperty(window.performance, "getEntriesByType", {
    configurable: true,
    value: () => [],
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
});

afterEach(() => {
  root.unmount();
  client.clear();
  container.remove();
  vi.unstubAllGlobals();
});

function button(label: string, scope: ParentNode = container) {
  const found = Array.from(scope.querySelectorAll("button")).find(
    (item) => item.textContent?.trim() === label,
  );
  if (!found) throw new Error("Button missing: " + label);
  return found;
}

function dialog() {
  const found = container.querySelector<HTMLElement>('[role="dialog"]');
  if (!found) throw new Error("Dialog missing");
  return found;
}

function fill(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function openClassroom(permission?: string) {
  vi.mocked(useAuthSession).mockReturnValue({
    status: "authenticated",
    user: {
      role: permission ? "MANAGER" : "ADMIN",
      permissions: permission ? [{ permissionCode: permission }] : [],
    },
    refreshSession: vi.fn(),
    signOut: vi.fn(),
  });
  flushSync(() =>
    root.render(
      <QueryClientProvider client={client}>
        <AdminDashboardPage />
      </QueryClientProvider>,
    ),
  );
  button("분반 관리").click();
  const row = await vi.waitFor(() => {
    const found = Array.from(container.querySelectorAll("tr")).find((item) =>
      item.textContent?.includes("Blue Room"),
    );
    if (!found) throw new Error("Classroom missing");
    return found;
  });
  row.click();
  await vi.waitFor(() => expect(container.textContent).toContain("가영"));
}

async function openPicker() {
  button("학생 등록").click();
  await vi.waitFor(() => expect(dialog().textContent).toContain("010-3333-3333"));
}

it("keeps keyboard focus in the student picker and returns it to the registration button", async () => {
  await openClassroom();
  const trigger = button("학생 등록");
  trigger.focus();
  await openPicker();
  const picker = dialog();
  expect(document.activeElement).toBe(picker.querySelector('input[aria-label="학생 이름 검색"]'));

  const first = button("닫기", picker);
  const last = Array.from(picker.querySelectorAll<HTMLButtonElement>("button:enabled")).at(-1)!;
  last.focus();
  const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  last.dispatchEvent(tab);
  expect(tab.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(first);

  const backTab = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  first.dispatchEvent(backTab);
  expect(backTab.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(last);

  last.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  await vi.waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

it("shows students across classrooms and adds the selected student by ID", async () => {
  const add = vi.fn(() => {
    students[1].classrooms!.push(classroom);
    return HttpResponse.json(students[1]);
  });
  const create = vi.fn(() => HttpResponse.json({}, { status: 201 }));
  server.use(http.put(studentsUrl + "/12/classrooms/1", add), http.post(studentsUrl, create));
  await openClassroom("student:manage:*");
  await openPicker();
  expect(queries.some((query) => query.size === 0)).toBe(true);
  expect(dialog().textContent).toContain("장미반");
  expect(dialog().textContent!.indexOf("가영")).toBeLessThan(dialog().textContent!.indexOf("민수"));
  expect(button("이미 소속된 학생", dialog()).disabled).toBe(true);
  expect(dialog().textContent).not.toContain("신규 학생 등록");
  fill(dialog().querySelector("input")!, "없는 학생");
  await vi.waitFor(() => expect(dialog().textContent).toContain("검색된 학생이 없습니다."));
  fill(dialog().querySelector("input")!, "민");
  await vi.waitFor(() => expect(queries.some((query) => query.get("name") === "민")).toBe(true));
  await vi.waitFor(() => expect(dialog().textContent).toContain("010-2222-2222"));
  expect(dialog().textContent).not.toContain("가영");
  const selected = Array.from(dialog().querySelectorAll("li")).find((item) =>
    item.textContent?.includes("010-2222-2222"),
  )!;
  button("추가", selected).click();
  await vi.waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
  await vi.waitFor(() => expect(container.textContent).toContain("민수"));
  expect(add).toHaveBeenCalledTimes(1);
  expect(create).not.toHaveBeenCalled();
  expect(queries.filter((query) => query.get("classroomId") === "1").length).toBeGreaterThan(1);
});

it("handles a duplicate registration by returning to the matching existing students", async () => {
  client.setQueryData(queryKeys.students.list({ name: "민수" }), []);
  const create = vi.fn(() => HttpResponse.json({ code: "BIZ-04-001" }, { status: 409 }));
  server.use(http.post(studentsUrl, create));
  await openClassroom("student:write:*");
  expect(container.textContent).not.toContain("분반 소속 해제");
  await openPicker();
  expect(
    Array.from(dialog().querySelectorAll("button")).filter(
      (item) => item.textContent === "추가" && !item.disabled,
    ),
  ).toHaveLength(0);
  button("신규 학생 등록").click();
  await vi.waitFor(() => expect(dialog().querySelector("form")).toBeTruthy());
  const inputs = dialog().querySelectorAll("input");
  fill(inputs[0], "민수");
  fill(inputs[1], "01022222222");
  button("등록", dialog()).click();
  await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  await vi.waitFor(() => expect(dialog().querySelector("input")?.value).toBe("민수"));
  await vi.waitFor(() => expect(dialog().textContent).toContain("010-2222-2222"));
  expect(container.textContent).toContain("기존 학생");
});

it("registers a new student with the current classroom", async () => {
  let body: unknown;
  server.use(
    http.post(studentsUrl, async ({ request }) => {
      body = await request.json();
      const student = { id: 14, name: "지연", classrooms: [classroom] };
      students.push(student);
      return HttpResponse.json(student, { status: 201 });
    }),
  );
  await openClassroom();
  await openPicker();
  button("신규 학생 등록").click();
  const form = await vi.waitFor(() => {
    const found = dialog().querySelector("form");
    if (!found) throw new Error("Registration form missing");
    return found;
  });
  fill(form.querySelector("input")!, "지연");
  button("등록", form).click();
  await vi.waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
  await vi.waitFor(() => expect(container.textContent).toContain("지연"));
  expect(body).toEqual({ name: "지연", classroomIds: [1] });
});

it("edits a multi-class student and refreshes the cached directory without changing memberships", async () => {
  let body: unknown;
  students[0].classrooms!.push({ id: 2, name: "장미반" });
  server.use(
    http.patch(studentsUrl + "/11", async ({ request }) => {
      body = await request.json();
      Object.assign(students[0], body);
      return HttpResponse.json(students[0]);
    }),
  );
  await openClassroom();
  await openPicker();
  expect(dialog().textContent).toContain("010-1111-1111");
  button("닫기", dialog()).click();
  await vi.waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
  const rosterRow = Array.from(container.querySelectorAll("li")).find((row) =>
    row.textContent?.includes("가영"),
  )!;
  button("수정", rosterRow).click();
  const save = await vi.waitFor(() => button("저장", dialog()));
  fill(
    dialog().querySelector<HTMLInputElement>('input[placeholder="010-0000-0000"]')!,
    "01044444444",
  );
  save.click();
  await vi.waitFor(() => expect(container.textContent).toContain("010-4444-4444"));
  expect(body).toEqual({ name: "가영", phoneNumber: "010-4444-4444", description: "" });
  await openPicker();
  await vi.waitFor(() => expect(dialog().textContent).toContain("010-4444-4444"));
  expect(dialog().textContent).toContain("Blue Room, 장미반");
});

it.each([204, 404])(
  "refreshes the current roster after membership removal (%i)",
  async (status) => {
    const remove = vi.fn(() => {
      students[0].classrooms = [];
      return status === 204
        ? new HttpResponse(null, { status })
        : HttpResponse.json({ code: "RES-04-002" }, { status });
    });
    server.use(http.delete(studentsUrl + "/11/classrooms/1", remove));
    await openClassroom();
    button("분반 소속 해제").click();
    const confirm = await vi.waitFor(() => button("확인", dialog()));
    confirm.click();
    await vi.waitFor(() => expect(container.textContent).toContain("등록된 학생이 없습니다."));
    expect(remove).toHaveBeenCalledTimes(1);
    if (status === 404)
      expect(container.textContent).toContain("이미 해제되었거나 소속되지 않은 학생입니다");
    button("학생 등록").click();
    await vi.waitFor(() => expect(dialog().textContent).toContain("010-1111-1111"));
  },
);
