import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { POST_DETAIL_RESPONSE, POST_LIST_RESPONSE } from "../../mocks/handlers/post.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  attachPostAttachment,
  attachPostImage,
  createPost,
  getChannelPosts,
  getPost,
  getPosts,
  updatePost,
} from "./post.api";

describe("post.api", () => {
  it("returns integrated posts with query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/posts`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(POST_LIST_RESPONSE);
      }),
    );

    const response = await getPosts({ title: "notice", page: 0, size: 10 });

    expect(response).toEqual(POST_LIST_RESPONSE);
    expect(observedQueryString).toContain("title=notice");
    expect(observedQueryString).toContain("page=0");
    expect(observedQueryString).toContain("size=10");
  });

  it("returns channel posts from the nested route", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const response = await getChannelPosts({ channelId: 3 }, { status: "PUBLISHED" });

    expect(response.content?.[0]).toMatchObject({ channelId: 3 });
  });

  it("creates and updates posts with the expected request body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedUpdateBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/channels/1/posts`, async ({ request }) => {
        observedCreateBody = await request.json();
        return HttpResponse.json({ ...POST_DETAIL_RESPONSE, id: 2 });
      }),
      http.put(`${API_BASE_URL}/api/v1/channels/1/posts/2`, async ({ request }) => {
        observedUpdateBody = await request.json();
        return HttpResponse.json({ ...POST_DETAIL_RESPONSE, id: 2, title: "Updated" });
      }),
    );

    const createBody = {
      title: "New post",
      contentHtml: "<p>Body</p>",
      isPinned: true,
    };
    const updateBody = { title: "Updated" };

    await expect(createPost({ channelId: 1 }, createBody)).resolves.toMatchObject({ id: 2 });
    await expect(updatePost({ channelId: 1, postId: 2 }, updateBody)).resolves.toMatchObject({
      id: 2,
      title: "Updated",
    });
    expect(observedCreateBody).toEqual(createBody);
    expect(observedUpdateBody).toEqual(updateBody);
  });

  it("returns a post detail", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    await expect(getPost({ channelId: 1, postId: 1 })).resolves.toEqual(POST_DETAIL_RESPONSE);
  });

  it("uploads post images and attachments as multipart form data", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const uploadedFile = { fileId: "file-1", originalName: "notice.png" };
    let observedImageContentType = "";
    let observedAttachmentContentType = "";

    server.use(
      http.post(`${API_BASE_URL}/api/v1/channels/1/posts/2/images`, ({ request }) => {
        observedImageContentType = request.headers.get("content-type") ?? "";
        return HttpResponse.json(uploadedFile);
      }),
      http.post(`${API_BASE_URL}/api/v1/channels/1/posts/2/attachments`, ({ request }) => {
        observedAttachmentContentType = request.headers.get("content-type") ?? "";
        return HttpResponse.json(uploadedFile);
      }),
    );

    const file = new Blob(["file-content"], { type: "image/png" });

    await expect(attachPostImage({ channelId: 1, postId: 2 }, file, "notice.png")).resolves.toEqual(
      uploadedFile,
    );
    await expect(
      attachPostAttachment({ channelId: 1, postId: 2 }, file, "notice.png"),
    ).resolves.toEqual(uploadedFile);

    expect(observedImageContentType).toContain("multipart/form-data");
    expect(observedAttachmentContentType).toContain("multipart/form-data");
  });
});
