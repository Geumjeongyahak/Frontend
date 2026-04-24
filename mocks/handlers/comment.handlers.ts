import { HttpResponse, http, type RequestHandler } from "msw";

import type { CreateCommentRequestDto } from "../../api/comment/comment.dto";
import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const COMMENT_RESPONSE = {
  id: 1,
  postId: 1,
  parentCommentId: null,
  authorId: 1,
  authorName: "Administrator",
  content: "Confirmed.",
  status: "ACTIVE",
  createdAt: "2026-04-10T20:45:00",
  updatedAt: "2026-04-10T20:45:00",
};

export const COMMENT_LIST_RESPONSE = [COMMENT_RESPONSE];

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const commentHandlers: RequestHandler[] = [
  http.get(
    `${API_BASE_URL}/api/v1/channels/:channelId/posts/:postId/comments`,
    ({ request, params }) => {
      if (!hasValidAuthorization(request)) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      return HttpResponse.json([
        {
          ...COMMENT_RESPONSE,
          postId: Number(params.postId),
        },
      ]);
    },
  ),
  http.post(
    `${API_BASE_URL}/api/v1/channels/:channelId/posts/:postId/comments`,
    async ({ request, params }) => {
      if (!hasValidAuthorization(request)) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as CreateCommentRequestDto;

      if (!body.content) {
        return HttpResponse.json({ message: "Invalid comment payload" }, { status: 400 });
      }

      return HttpResponse.json({
        ...COMMENT_RESPONSE,
        id: 2,
        postId: Number(params.postId),
        content: body.content,
        parentCommentId: body.parentCommentId ?? null,
      });
    },
  ),
  http.delete(
    `${API_BASE_URL}/api/v1/channels/:channelId/posts/:postId/comments/:commentId`,
    ({ request }) => {
      if (!hasValidAuthorization(request)) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      return new HttpResponse(null, { status: 204 });
    },
  ),
];
