import { HttpResponse, http, type RequestHandler } from "msw";

import type { CreatePostRequestDto, UpdatePostRequestDto } from "../../api/post/post.dto";
import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const POST_SUMMARY_RESPONSE = {
  id: 1,
  channelId: 1,
  channelName: "Notice",
  channelType: "NOTICE",
  title: "April notice",
  postType: "NOTICE",
  status: "PUBLISHED",
  authorId: 1,
  authorName: "Administrator",
  isPinned: true,
  viewCount: 10,
};

export const POST_DETAIL_RESPONSE = {
  ...POST_SUMMARY_RESPONSE,
  contentHtml: "<p>Notice body</p>",
  allowComment: true,
  createdAt: "2026-04-10T19:30:00",
  updatedAt: "2026-04-10T19:30:00",
};

export const POST_LIST_RESPONSE = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 1,
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const postHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/posts`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      ...POST_LIST_RESPONSE,
      content: [],
      totalElements: 0,
      totalPages: 1,
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/channels/:channelId/posts`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      ...POST_LIST_RESPONSE,
      content: [{ ...POST_SUMMARY_RESPONSE, channelId: Number(params.channelId) }],
      totalElements: 1,
      totalPages: 1,
    });
  }),
  http.post(`${API_BASE_URL}/api/v1/channels/:channelId/posts`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreatePostRequestDto;

    if (!body.title || !body.contentHtml) {
      return HttpResponse.json({ message: "Invalid post payload" }, { status: 400 });
    }

    return HttpResponse.json({
      ...POST_DETAIL_RESPONSE,
      id: 2,
      channelId: Number(params.channelId),
      ...body,
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/channels/:channelId/posts/:postId`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = Number(params.postId);
    const channelId = Number(params.channelId);

    if (channelId === 1 && postId === 1) {
      return HttpResponse.json(POST_DETAIL_RESPONSE);
    }

    return HttpResponse.json({
      ...POST_DETAIL_RESPONSE,
      channelId,
      id: postId,
    });
  }),
  http.put(
    `${API_BASE_URL}/api/v1/channels/:channelId/posts/:postId`,
    async ({ request, params }) => {
      if (!hasValidAuthorization(request)) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as UpdatePostRequestDto;

      return HttpResponse.json({
        ...POST_DETAIL_RESPONSE,
        channelId: Number(params.channelId),
        id: Number(params.postId),
        ...body,
      });
    },
  ),
  http.delete(`${API_BASE_URL}/api/v1/channels/:channelId/posts/:postId`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
