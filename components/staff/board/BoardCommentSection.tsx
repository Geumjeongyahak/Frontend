"use client";

import { IconCornerDownRight } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/api/comment/comment.api";
import type { CommentResponseDto } from "@/api/comment/comment.dto";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import { buildBoardCommentThread } from "./boardComments";

type BoardCommentSectionProps = {
  channelId: number;
  postId: number;
};

export default function BoardCommentSection({ channelId, postId }: BoardCommentSectionProps) {
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const [commentDraft, setCommentDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [openReplyCommentId, setOpenReplyCommentId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const commentsQuery = useQuery({
    queryKey: queryKeys.comments.boardDetail(channelId, postId),
    queryFn: () => getComments({ channelId, postId }),
    retry: false,
  });

  const commentThread = useMemo(
    () => buildBoardCommentThread(commentsQuery.data ?? []),
    [commentsQuery.data],
  );

  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: number }) =>
      createComment({ channelId, postId }, { content, parentCommentId }),
    onSuccess: async (_, variables) => {
      if (typeof variables.parentCommentId === "number") {
        setReplyDraft("");
        setOpenReplyCommentId(null);
      } else {
        setCommentDraft("");
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.boardDetail(channelId, postId),
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment({ channelId, postId, commentId }, { content }),
    onSuccess: async () => {
      setEditingCommentId(null);
      setEditDraft("");

      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.boardDetail(channelId, postId),
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment({ channelId, postId, commentId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.boardDetail(channelId, postId),
      });
    },
  });

  const isAuthenticated = status === "authenticated" && Boolean(user);
  const totalCommentCount = commentThread.reduce(
    (count, comment) => count + 1 + comment.replies.length,
    0,
  );
  const stateMessage =
    commentsQuery.isLoading && !commentsQuery.data
      ? "댓글을 불러오는 중입니다."
      : commentsQuery.isError
        ? "댓글을 불러오지 못했습니다."
        : createCommentMutation.isError
          ? "댓글 등록에 실패했습니다."
          : updateCommentMutation.isError
            ? "댓글 수정에 실패했습니다."
            : deleteCommentMutation.isError
              ? "댓글 삭제에 실패했습니다."
              : !isAuthenticated && status !== "loading"
                ? "로그인 후 댓글을 작성할 수 있습니다."
                : "";

  const submitComment = (parentCommentId?: number) => {
    const source = typeof parentCommentId === "number" ? replyDraft : commentDraft;
    const content = source.trim();

    if (!content || !isAuthenticated || createCommentMutation.isPending) {
      return;
    }

    createCommentMutation.mutate({ content, parentCommentId });
  };

  const startEdit = (comment: CommentResponseDto) => {
    setOpenReplyCommentId(null);
    setReplyDraft("");
    setEditingCommentId(comment.id ?? null);
    setEditDraft(comment.content?.trim() ?? "");
  };

  const submitEdit = (commentId?: number) => {
    const content = editDraft.trim();

    if (
      typeof commentId !== "number" ||
      !content ||
      !isAuthenticated ||
      updateCommentMutation.isPending
    ) {
      return;
    }

    updateCommentMutation.mutate({ commentId, content });
  };

  return (
    <Section>
      <HeaderRow>
        <SectionTitle>{`댓글 (${totalCommentCount})`}</SectionTitle>
        <SubmitButton
          type="button"
          disabled={!isAuthenticated || !commentDraft.trim() || createCommentMutation.isPending}
          onClick={() => submitComment()}
        >
          작성 완료
        </SubmitButton>
      </HeaderRow>

      <CommentTextarea
        placeholder={isAuthenticated ? "내용" : "로그인 후 댓글을 작성할 수 있습니다."}
        value={commentDraft}
        disabled={!isAuthenticated || createCommentMutation.isPending}
        onChange={(event) => setCommentDraft(event.target.value)}
      />

      {stateMessage ? <StateText>{stateMessage}</StateText> : null}

      {commentThread.length === 0 && !commentsQuery.isLoading && !commentsQuery.isError ? (
        <StateText>아직 댓글이 없습니다.</StateText>
      ) : null}

      <CommentList>
        {commentThread.map((comment) => (
          <CommentGroup key={comment.id ?? `comment-${comment.createdAt}`}>
            <CommentItem>
              <CommentMeta>
                <CommentAuthor>{comment.authorName ?? "익명"}</CommentAuthor>
                <CommentDate>
                  {formatUtcToKstShortDate(comment.createdAt ?? comment.updatedAt)}
                </CommentDate>
              </CommentMeta>
              {editingCommentId === comment.id ? (
                <EditWrap>
                  <CommentTextarea
                    placeholder="내용"
                    value={editDraft}
                    disabled={updateCommentMutation.isPending}
                    onChange={(event) => setEditDraft(event.target.value)}
                  />
                  <ReplyActionRow>
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditDraft("");
                      }}
                    >
                      취소
                    </SecondaryButton>
                    <SubmitButton
                      type="button"
                      disabled={!editDraft.trim() || updateCommentMutation.isPending}
                      onClick={() => submitEdit(comment.id)}
                    >
                      수정 완료
                    </SubmitButton>
                  </ReplyActionRow>
                </EditWrap>
              ) : (
                <CommentBodyRow>
                  <CommentBody>{getCommentBody(comment)}</CommentBody>
                </CommentBodyRow>
              )}
              {comment.status !== "DELETED" && editingCommentId !== comment.id ? (
                <ActionRow>
                  <ManageActionGroup>
                    {canManageComment(comment, user) ? (
                      <>
                        <TextActionButton
                          type="button"
                          $tone="muted"
                          onClick={() => startEdit(comment)}
                        >
                          수정
                        </TextActionButton>
                        <TextActionButton
                          type="button"
                          $tone="danger"
                          disabled={deleteCommentMutation.isPending}
                          onClick={() => {
                            if (typeof comment.id === "number") {
                              deleteCommentMutation.mutate(comment.id);
                            }
                          }}
                        >
                          삭제
                        </TextActionButton>
                      </>
                    ) : (
                      <>
                        <ActionGhostButton aria-hidden="true" tabIndex={-1}>
                          수정
                        </ActionGhostButton>
                        <ActionGhostButton aria-hidden="true" tabIndex={-1}>
                          삭제
                        </ActionGhostButton>
                      </>
                    )}
                  </ManageActionGroup>
                  <ReplyActionButtonWrap>
                    <TextActionButton
                      type="button"
                      disabled={!isAuthenticated}
                      onClick={() =>
                        setOpenReplyCommentId((current) =>
                          current === comment.id ? null : (comment.id ?? null),
                        )
                      }
                    >
                      댓글 추가
                    </TextActionButton>
                  </ReplyActionButtonWrap>
                </ActionRow>
              ) : null}
            </CommentItem>

            {openReplyCommentId === comment.id && comment.status !== "DELETED" ? (
              <ReplyComposerWrap>
                <CommentTextarea
                  placeholder={isAuthenticated ? "내용" : "로그인 후 댓글을 작성할 수 있습니다."}
                  value={replyDraft}
                  disabled={!isAuthenticated || createCommentMutation.isPending}
                  onChange={(event) => setReplyDraft(event.target.value)}
                />
                <ReplyActionRow>
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setOpenReplyCommentId(null);
                      setReplyDraft("");
                    }}
                  >
                    취소
                  </SecondaryButton>
                  <SubmitButton
                    type="button"
                    disabled={
                      !isAuthenticated || !replyDraft.trim() || createCommentMutation.isPending
                    }
                    onClick={() => {
                      if (typeof comment.id === "number") {
                        submitComment(comment.id);
                      }
                    }}
                  >
                    작성 완료
                  </SubmitButton>
                </ReplyActionRow>
              </ReplyComposerWrap>
            ) : null}

            {comment.replies.map((reply) => (
              <CommentItem key={reply.id ?? `reply-${reply.createdAt}`}>
                <ReplyMeta>
                  <ReplyMetaArrow aria-hidden="true" stroke={1.8} />
                  <CommentAuthor>{reply.authorName ?? "익명"}</CommentAuthor>
                  <CommentDate>
                    {formatUtcToKstShortDate(reply.createdAt ?? reply.updatedAt)}
                  </CommentDate>
                </ReplyMeta>
                {editingCommentId === reply.id ? (
                  <EditWrap $isReply>
                    <CommentTextarea
                      placeholder="내용"
                      value={editDraft}
                      disabled={updateCommentMutation.isPending}
                      onChange={(event) => setEditDraft(event.target.value)}
                    />
                    <ReplyActionRow>
                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditDraft("");
                        }}
                      >
                        취소
                      </SecondaryButton>
                      <SubmitButton
                        type="button"
                        disabled={!editDraft.trim() || updateCommentMutation.isPending}
                        onClick={() => submitEdit(reply.id)}
                      >
                        수정 완료
                      </SubmitButton>
                    </ReplyActionRow>
                  </EditWrap>
                ) : (
                  <ReplyBodyRow>
                    <CommentBody>
                      {reply.status === "DELETED" ? (
                        "삭제된 댓글입니다."
                      ) : (
                        <>
                          <ReplyMention>@{comment.authorName ?? "익명"}</ReplyMention>{" "}
                          {reply.content?.trim() || "내용이 없습니다."}
                        </>
                      )}
                    </CommentBody>
                  </ReplyBodyRow>
                )}
                {reply.status !== "DELETED" && editingCommentId !== reply.id ? (
                  <ReplyOnlyActionRow>
                    {canManageComment(reply, user) ? (
                      <>
                        <TextActionButton
                          type="button"
                          $tone="muted"
                          onClick={() => startEdit(reply)}
                        >
                          수정
                        </TextActionButton>
                        <TextActionButton
                          type="button"
                          $tone="danger"
                          disabled={deleteCommentMutation.isPending}
                          onClick={() => {
                            if (typeof reply.id === "number") {
                              deleteCommentMutation.mutate(reply.id);
                            }
                          }}
                        >
                          삭제
                        </TextActionButton>
                      </>
                    ) : (
                      <>
                        <ActionGhostButton aria-hidden="true" tabIndex={-1}>
                          수정
                        </ActionGhostButton>
                        <ActionGhostButton aria-hidden="true" tabIndex={-1}>
                          삭제
                        </ActionGhostButton>
                      </>
                    )}
                  </ReplyOnlyActionRow>
                ) : null}
              </CommentItem>
            ))}
          </CommentGroup>
        ))}
      </CommentList>
    </Section>
  );
}

function getCommentBody(comment: CommentResponseDto) {
  if (comment.status === "DELETED") {
    return "삭제된 댓글입니다.";
  }

  return comment.content?.trim() || "내용이 없습니다.";
}

function canManageComment(
  comment: CommentResponseDto,
  user: {
    id?: number;
    role?: string;
    name?: string;
    nickname?: string;
    email?: string;
  } | null,
) {
  if (!user || comment.status === "DELETED") {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  if (typeof user.id === "number" && comment.authorId === user.id) {
    return true;
  }

  const authorName = comment.authorName;

  return Boolean(
    authorName &&
    (authorName === user.name || authorName === user.nickname || authorName === user.email),
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};
  margin-top: ${spacing.space8};
  padding-top: ${spacing.space20};
  border-top: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    gap: 1.875rem;
    padding-top: 1.875rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space16};

  @media (max-width: ${layout.breakpointMobile}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const SecondaryButton = styled(SubmitButton)`
  border-color: ${colors.border};
  background-color: ${colors.white};
  color: ${colors.placeholder};

  &:not(:disabled):hover {
    background-color: ${colors.background};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 7rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  resize: vertical;

  &::placeholder {
    color: ${colors.muted};
  }

  &:disabled {
    background-color: ${colors.white};
    color: ${colors.placeholder};
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 10.0625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const StateText = styled.p`
  margin: 0;
  color: ${colors.placeholder};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentItem = styled.article`
  display: flex;
  flex-direction: column;
  padding: 2rem 0 ${spacing.space12};
  border-bottom: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    padding: 3rem 0 1.75rem;
  }
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${spacing.space8};
  min-height: 1.75rem;
  padding: 0 ${spacing.space12};
  @media (min-width: 120rem) {
    min-height: 1.75rem;
    padding: 0 ${spacing.space20};
    gap: ${spacing.space12};
  }
`;

const ReplyMeta = styled(CommentMeta)`
  position: relative;
  padding-left: 3rem;

  @media (min-width: 120rem) {
    padding-left: 4.4375rem;
  }
`;

const ReplyMetaArrow = styled(IconCornerDownRight)`
  position: absolute;
  left: ${spacing.space20};
  top: 50%;
  width: ${typography.fontSize14};
  height: ${typography.fontSize14};
  transform: translateY(-50%);
  color: ${colors.text};
  pointer-events: none;

  @media (min-width: 120rem) {
    left: ${spacing.space20};
    width: ${typography.fontSize20};
    height: ${typography.fontSize20};
  }
`;

const CommentAuthor = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const CommentDate = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const CommentBodyRow = styled.div`
  padding-left: ${spacing.space12};
  margin-bottom: 1rem;

  @media (min-width: 120rem) {
    padding-left: ${spacing.space20};
    margin-bottom: 1rem;
  }
`;

const ReplyBodyRow = styled.div`
  padding-left: 3rem;
  margin-bottom: 1rem;

  @media (min-width: 120rem) {
    padding-left: 4.4375rem;
    margin-bottom: 1rem;
  }
`;

const EditWrap = styled.div<{ $isReply?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding-left: ${({ $isReply }) => ($isReply ? "3rem" : spacing.space12)};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-left: ${({ $isReply }) => ($isReply ? "4.4375rem" : spacing.space20)};
  }
`;

const CommentBody = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ReplyMention = styled.span`
  color: ${colors.point};
  font-weight: 700;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space8};
  padding-left: ${spacing.space12};
  padding-right: ${spacing.space8};
  margin-bottom: -${spacing.space8};

  @media (min-width: 120rem) {
    padding-right: ${spacing.space12};
    margin-bottom: -${spacing.space20};
  }
`;

const ManageActionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space8};
  min-width: 4.5rem;

  @media (min-width: 120rem) {
    min-width: 7rem;
  }
`;

const ReplyActionButtonWrap = styled.div`
  display: flex;
  align-items: center;
`;

const ReplyOnlyActionRow = styled(ActionRow)`
  gap: ${spacing.space8};
  padding-left: 3rem;

  @media (min-width: 120rem) {
    padding-left: 4.4375rem;
  }
`;

const ReplyComposerWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding: ${spacing.space12} 0 ${spacing.space20} 3rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding: ${spacing.space16} 0 ${spacing.space20} 4.4375rem;
  }
`;

const ReplyActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space12};
`;

const TextActionButton = styled.button<{ $tone?: "default" | "muted" | "danger" }>`
  border: 0;
  background: transparent;
  padding: 0;
  color: ${({ $tone }) =>
    $tone === "muted" ? colors.placeholder : $tone === "danger" ? colors.notice : colors.point};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-position: from-font;
  cursor: pointer;

  &:not(:disabled):hover {
    opacity: 0.72;
  }

  &:disabled {
    color: ${colors.muted};
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const ActionGhostButton = styled(TextActionButton).attrs({
  type: "button",
  disabled: true,
})`
  visibility: hidden;
  pointer-events: none;
`;
