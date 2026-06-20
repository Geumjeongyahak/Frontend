import type { CommentResponseDto } from "@/api/comment/comment.dto";

export type BoardCommentThreadItem = CommentResponseDto & {
  replies: CommentResponseDto[];
};

function sortCommentsByCreatedAt<T extends CommentResponseDto>(comments: T[]) {
  return [...comments].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

    if (leftTime === rightTime) {
      return (left.id ?? 0) - (right.id ?? 0);
    }

    return leftTime - rightTime;
  });
}

export function buildBoardCommentThread(
  comments: CommentResponseDto[],
): BoardCommentThreadItem[] {
  const sortedComments = sortCommentsByCreatedAt(comments);
  const parentIds = new Set(
    sortedComments
      .filter((comment) => comment.parentCommentId == null)
      .map((comment) => comment.id)
      .filter((id): id is number => typeof id === "number"),
  );
  const threadMap = new Map<number, BoardCommentThreadItem>();
  const rootComments: BoardCommentThreadItem[] = [];

  sortedComments.forEach((comment) => {
    const commentId = comment.id;

    if (typeof commentId !== "number") {
      rootComments.push({ ...comment, replies: [] });
      return;
    }

    threadMap.set(commentId, { ...comment, replies: [] });
  });

  sortedComments.forEach((comment) => {
    const commentId = comment.id;
    const parentCommentId = comment.parentCommentId;

    if (typeof commentId !== "number") {
      return;
    }

    const current = threadMap.get(commentId);

    if (!current) {
      return;
    }

    if (parentCommentId == null || !parentIds.has(parentCommentId)) {
      rootComments.push(current);
      return;
    }

    const parent = threadMap.get(parentCommentId);

    if (!parent) {
      rootComments.push(current);
      return;
    }

    parent.replies.push(current);
  });

  return rootComments;
}
