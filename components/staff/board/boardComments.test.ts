import { describe, expect, it } from "vitest";
import { buildBoardCommentThread } from "./boardComments";

describe("buildBoardCommentThread", () => {
  it("groups replies under their parent comment in chronological order", () => {
    const thread = buildBoardCommentThread([
      {
        id: 3,
        parentCommentId: 1,
        content: "reply",
        createdAt: "2026-06-20T10:03:00",
      },
      {
        id: 2,
        parentCommentId: null,
        content: "second root",
        createdAt: "2026-06-20T10:02:00",
      },
      {
        id: 1,
        parentCommentId: null,
        content: "first root",
        createdAt: "2026-06-20T10:01:00",
      },
      {
        id: 4,
        parentCommentId: 1,
        content: "second reply",
        createdAt: "2026-06-20T10:04:00",
      },
    ]);

    expect(thread).toHaveLength(2);
    expect(thread[0]?.id).toBe(1);
    expect(thread[0]?.replies.map((comment) => comment.id)).toEqual([3, 4]);
    expect(thread[1]?.id).toBe(2);
  });

  it("keeps orphan replies at the root level", () => {
    const thread = buildBoardCommentThread([
      {
        id: 9,
        parentCommentId: 999,
        content: "orphan reply",
        createdAt: "2026-06-20T11:00:00",
      },
    ]);

    expect(thread).toHaveLength(1);
    expect(thread[0]).toMatchObject({ id: 9, parentCommentId: 999, replies: [] });
  });
});
