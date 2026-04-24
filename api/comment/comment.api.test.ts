import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { COMMENT_LIST_RESPONSE, COMMENT_RESPONSE } from "../../mocks/handlers/comment.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createComment, deleteComment, getComments } from "./comment.api";

describe("comment.api", () => {
  it("returns comments for a post", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const response = await getComments({ channelId: 1, postId: 1 });

    expect(response).toEqual(COMMENT_LIST_RESPONSE);
  });

  it("creates a comment with the expected request body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/channels/1/posts/1/comments`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ ...COMMENT_RESPONSE, id: 2, content: "New comment" });
      }),
    );

    const body = { content: "New comment", parentCommentId: 1 };
    const response = await createComment({ channelId: 1, postId: 1 }, body);

    expect(response).toMatchObject({ id: 2, content: "New comment" });
    expect(observedBody).toEqual(body);
  });

  it("deletes a comment", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    await expect(
      deleteComment({ channelId: 1, postId: 1, commentId: 1 }),
    ).resolves.toBeUndefined();
  });
});
