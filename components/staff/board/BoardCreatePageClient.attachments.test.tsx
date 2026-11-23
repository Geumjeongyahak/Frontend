import "../../../test/setup";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { setAccessToken } from "@/api/client/tokenStorage";
import { useAuthSession } from "@/hooks/useAuthSession";
import { API_BASE_URL, VALID_ACCESS_TOKEN } from "@/mocks/handlers/auth.handlers";
import { server } from "@/mocks/server";

import BoardCreatePageClient from "./BoardCreatePageClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/staff/board",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/hooks/useAuthSession", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/components/admin/posts/ToastEditorField", () => ({ default: () => null }));

const channelId = 5;
const postId = 9;
const postUrl = `${API_BASE_URL}/api/v1/channels/${channelId}/posts/${postId}`;

let calls: string[];
let root: Root;
let client: QueryClient;
let container: HTMLDivElement;

function mockPost(authorId: number) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/channels`, () =>
      HttpResponse.json([{ id: channelId, name: "공지사항", channelType: "NOTICE" }]),
    ),
    http.get(postUrl, () =>
      HttpResponse.json({
        id: postId,
        channelId,
        channelType: "NOTICE",
        title: "수정할 게시글",
        contentHtml: "<p>본문</p>",
        authorId,
        status: "PUBLISHED",
        allowComment: true,
        isPinned: false,
        attachments: [{ fileId: "file-1", originalName: "a.pdf", downloadUrl: "" }],
      }),
    ),
    http.put(postUrl, async ({ request }) => {
      const body = (await request.json()) as { status?: string };
      calls.push(`PUT post ${body.status}`);
      return HttpResponse.json({ id: postId, channelId, status: body.status });
    }),
    http.delete(`${postUrl}/attachments/:fileId`, ({ params }) => {
      calls.push(`DELETE post attachment ${String(params.fileId)}`);
      return new HttpResponse(null, { status: 204 });
    }),
    http.put(`${postUrl}/publish`, () => {
      calls.push("PUT publish");
      return HttpResponse.json({ id: postId, channelId, status: "PUBLISHED" });
    }),
    http.delete(`${API_BASE_URL}/api/v1/files/attachments/:fileId`, ({ params }) => {
      calls.push(`DELETE admin-only file ${String(params.fileId)}`);
      return new HttpResponse(null, { status: 204 });
    }),
  );
}

async function renderEditPage() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  flushSync(() => {
    root.render(
      <QueryClientProvider client={client}>
        <BoardCreatePageClient editPostId={postId} editChannelId={channelId} />
      </QueryClientProvider>,
    );
  });
  await vi.waitFor(() => expect(button("a.pdf 삭제")).not.toBeNull());
}

function button(label: string) {
  return container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
}

function submitButton() {
  return [...container.querySelectorAll<HTMLButtonElement>('button[type="submit"]')].at(0) ?? null;
}

beforeEach(() => {
  setAccessToken(VALID_ACCESS_TOKEN);
  calls = [];
});

afterEach(() => {
  flushSync(() => root.unmount());
  container.remove();
  client.clear();
});

it("removes an attachment only on save, by detaching it from the draft before republishing", async () => {
  vi.mocked(useAuthSession).mockReturnValue({
    user: { id: 7, role: "VOLUNTEER" },
    status: "authenticated",
  } as ReturnType<typeof useAuthSession>);
  mockPost(7);
  await renderEditPage();

  flushSync(() => button("a.pdf 삭제")?.click());
  // 삭제 버튼을 눌러도 저장 전에는 서버에 아무 요청도 가지 않는다.
  expect(calls).toEqual([]);

  await vi.waitFor(() => expect(submitButton()?.disabled).toBe(false));
  flushSync(() => submitButton()?.click());

  await vi.waitFor(() => expect(calls).toContain("PUT publish"));
  expect(calls).toEqual(["PUT post DRAFT", "DELETE post attachment file-1", "PUT publish"]);
  expect(calls.some((call) => call.includes("admin-only"))).toBe(false);
});

it("refuses to change attachments on someone else's post before turning it into a draft", async () => {
  vi.mocked(useAuthSession).mockReturnValue({
    user: { id: 1, role: "ADMIN" },
    status: "authenticated",
  } as ReturnType<typeof useAuthSession>);
  mockPost(99);
  await renderEditPage();

  flushSync(() => button("a.pdf 삭제")?.click());
  await vi.waitFor(() => expect(submitButton()?.disabled).toBe(false));
  flushSync(() => submitButton()?.click());

  await vi.waitFor(() =>
    expect(container.textContent).toContain("다른 사람이 작성한 글의 첨부파일은 변경할 수 없습니다."),
  );
  expect(calls).toEqual([]);
});
