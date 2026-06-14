"use client";

import { useEffect, useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import styled from "styled-components";
import type { ChannelListItemDto } from "@/api/channel/channel.dto";
import type { ClassroomListItemDto } from "@/api/classroom/classroom.dto";
import type { DepartmentListItemDto } from "@/api/department/department.dto";
import type {
  PostDetailResponseDto,
  PostStatus,
  PostSummaryResponseDto,
} from "@/api/post/post.dto";
import type { PostCreateState, PostEditState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  CheckLabel,
  ControlRow,
  DangerButton,
  DataState,
  EditorField,
  EditorFieldTitle,
  FormGrid,
  Label,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  SmallButton,
  Table,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const POSTS_PER_PAGE = 11;

type QueryState<TData> = {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
};

type VoidMutationAction = {
  isPending: boolean;
  mutate: () => void;
};

type ValueMutationAction<TVariables> = {
  isPending: boolean;
  mutate: (variables: TVariables) => void;
};

type AdminPostsSectionProps = {
  channels: ChannelListItemDto[];
  classrooms: ClassroomListItemDto[];
  departments: DepartmentListItemDto[];
  posts: PostSummaryResponseDto[];
  selectedPost: { channelId: number; postId: number } | null;
  postTitleSearch: string;
  postChannelTypeFilter: string;
  postScopeFilter: string;
  postCreate: PostCreateState;
  postEdit: PostEditState;
  isPostEditing: boolean;
  isPostCreateModalOpen: boolean;
  postsQuery: QueryState<unknown>;
  postDetailQuery: QueryState<PostDetailResponseDto>;
  createPostMutation: VoidMutationAction;
  updatePostMutation: VoidMutationAction;
  pinPostMutation: ValueMutationAction<boolean>;
  deletePostMutation: VoidMutationAction;
  setPostTitleSearch: Dispatch<SetStateAction<string>>;
  setPostChannelTypeFilter: Dispatch<SetStateAction<string>>;
  setPostScopeFilter: Dispatch<SetStateAction<string>>;
  setPostCreate: Dispatch<SetStateAction<PostCreateState>>;
  setPostEdit: Dispatch<SetStateAction<PostEditState>>;
  setIsPostEditing: Dispatch<SetStateAction<boolean>>;
  setIsPostCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  selectPost: (item: PostSummaryResponseDto) => void;
  closePostDetail: () => void;
};

export function AdminPostsSection({
  channels,
  classrooms,
  departments,
  posts,
  selectedPost,
  postTitleSearch,
  postChannelTypeFilter,
  postScopeFilter,
  postCreate,
  postEdit,
  isPostEditing,
  isPostCreateModalOpen,
  postsQuery,
  postDetailQuery,
  createPostMutation,
  updatePostMutation,
  pinPostMutation,
  deletePostMutation,
  setPostTitleSearch,
  setPostChannelTypeFilter,
  setPostScopeFilter,
  setPostCreate,
  setPostEdit,
  setIsPostEditing,
  setIsPostCreateModalOpen,
  selectPost,
  closePostDetail,
}: AdminPostsSectionProps) {
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const [isPostDeleteConfirmOpen, setIsPostDeleteConfirmOpen] = useState(false);
  const noticeChannelId =
    channels.find((channel) => channel.channelType === "NOTICE" && typeof channel.id === "number")
      ?.id ?? "";
  const classroomChannelOptions = classrooms
    .map((classroom) => {
      const channel = channels.find(
        (item) =>
          item.channelType === "CLASSROOM" &&
          item.refId === classroom.id &&
          typeof item.id === "number",
      );

      return channel?.id
        ? {
            targetId: String(classroom.id),
            channelId: String(channel.id),
            label: classroom.name,
          }
        : null;
    })
    .filter((item): item is { targetId: string; channelId: string; label: string } =>
      Boolean(item),
    );
  const departmentChannelOptions = departments
    .map((department) => {
      const channel = channels.find(
        (item) =>
          item.channelType === "DEPARTMENT" &&
          item.refId === department.id &&
          typeof item.id === "number",
      );

      return channel?.id
        ? {
            targetId: String(department.id),
            channelId: String(channel.id),
            label: department.name,
          }
        : null;
    })
    .filter((item): item is { targetId: string; channelId: string; label: string } =>
      Boolean(item),
    );
  const postScopeOptions =
    postChannelTypeFilter === "CLASSROOM"
      ? [
          { value: "all", label: "전체" },
          ...classrooms
            .filter((classroom) => typeof classroom.id === "number")
            .map((classroom) => ({
              value: String(classroom.id),
              label: classroom.name ?? `분반 ${classroom.id}`,
            })),
        ]
      : postChannelTypeFilter === "DEPARTMENT"
        ? [
            { value: "all", label: "전체" },
            ...departments
              .filter((department) => typeof department.id === "number")
              .map((department) => ({
                value: String(department.id),
                label: department.name ?? `부서 ${department.id}`,
              })),
          ]
        : [{ value: "all", label: "전체" }];
  const isPostScopeDisabled =
    postChannelTypeFilter === "all" || postChannelTypeFilter === "NOTICE";
  const postView = postDetailQuery.data ? mapPostDetailToEditState(postDetailQuery.data) : postEdit;
  const paginationKey = `${postTitleSearch}|${postChannelTypeFilter}|${postScopeFilter}`;
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const requestedPage = pagination.search === paginationKey ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedPosts = posts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE,
  );

  function closeCreateModal() {
    if (createPostMutation.isPending) {
      return;
    }

    setIsPostCreateModalOpen(false);
  }

  useEffect(() => {
    if (postCreate.channelScope === "NOTICE" && noticeChannelId) {
      const nextChannelId = String(noticeChannelId);

      if (postCreate.channelId !== nextChannelId || postCreate.channelTargetId) {
        setPostCreate((current) => ({
          ...current,
          channelTargetId: "",
          channelId: nextChannelId,
        }));
      }
    }
  }, [
    noticeChannelId,
    postCreate.channelId,
    postCreate.channelScope,
    postCreate.channelTargetId,
    setPostCreate,
  ]);

  function handlePostListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!selectedPost) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedPostRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedPostRow) {
      setIsPostDeleteConfirmOpen(false);
      closePostDetail();
    }
  }

  return (
    <>
      {isPostCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeCreateModal}>
          <PostCreateModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="post-create-modal-title">게시글 작성</SectionTitle>
              <SmallButton
                type="button"
                disabled={createPostMutation.isPending}
                onClick={closeCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>

            <FormGrid
              onSubmit={(event) => {
                event.preventDefault();
                createPostMutation.mutate();
              }}
            >
          <Label>
            채널 구분
            <PostSelect
              value={postCreate.channelScope}
              onChange={(event) =>
                setPostCreate((current) => {
                  const channelScope = event.target.value as PostCreateState["channelScope"];

                  return {
                    ...current,
                    channelScope,
                    channelTargetId: "",
                    channelId: channelScope === "NOTICE" ? String(noticeChannelId) : "",
                  };
                })
              }
            >
              <option value="">채널 선택</option>
              <option value="NOTICE">공지</option>
              <option value="CLASSROOM">반별</option>
              <option value="DEPARTMENT">부서별</option>
            </PostSelect>
          </Label>

          {postCreate.channelScope === "CLASSROOM" ? (
            <Label>
              반/부서 선택
              <PostSelect
                value={postCreate.channelTargetId}
                onChange={(event) => {
                  const selectedOption = classroomChannelOptions.find(
                    (option) => option.targetId === event.target.value,
                  );

                  setPostCreate((current) => ({
                    ...current,
                    channelTargetId: event.target.value,
                    channelId: selectedOption?.channelId ?? "",
                  }));
                }}
              >
                <option value="">반 선택</option>
                {classroomChannelOptions.map((option) => (
                  <option key={option.targetId} value={option.targetId}>
                    {option.label}
                  </option>
                ))}
              </PostSelect>
            </Label>
          ) : null}

          {postCreate.channelScope === "DEPARTMENT" ? (
            <Label>
              반/부서 선택
              <PostSelect
                value={postCreate.channelTargetId}
                onChange={(event) => {
                  const selectedOption = departmentChannelOptions.find(
                    (option) => option.targetId === event.target.value,
                  );

                  setPostCreate((current) => ({
                    ...current,
                    channelTargetId: event.target.value,
                    channelId: selectedOption?.channelId ?? "",
                  }));
                }}
              >
                <option value="">부서 선택</option>
                {departmentChannelOptions.map((option) => (
                  <option key={option.targetId} value={option.targetId}>
                    {option.label}
                  </option>
                ))}
              </PostSelect>
            </Label>
          ) : null}

          <Label>
            제목
            <TextInput
              value={postCreate.title}
              onChange={(event) =>
                setPostCreate((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
          </Label>

          <Label>
            상태
            <PostSelect
              value={postCreate.status}
              onChange={(event) =>
                setPostCreate((current) => ({
                  ...current,
                  status: event.target.value as PostStatus,
                }))
              }
            >
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
            </PostSelect>
          </Label>

          <Label>
            썸네일 URL
            <TextInput
              value={postCreate.thumbnailUrl}
              onChange={(event) =>
                setPostCreate((current) => ({
                  ...current,
                  thumbnailUrl: event.target.value,
                }))
              }
            />
          </Label>

          <CheckLabel>
            <input
              type="checkbox"
              checked={postCreate.allowComment}
              onChange={(event) =>
                setPostCreate((current) => ({
                  ...current,
                  allowComment: event.target.checked,
                }))
              }
            />
            댓글 허용
          </CheckLabel>

          <CheckLabel>
            <input
              type="checkbox"
              checked={postCreate.isPinned}
              onChange={(event) =>
                setPostCreate((current) => ({
                  ...current,
                  isPinned: event.target.checked,
                }))
              }
            />
            상단 고정
          </CheckLabel>

          <EditorField>
            <EditorFieldTitle>본문</EditorFieldTitle>
            <ToastEditorField
              initialValue={postCreate.contentHtml}
              onChange={(contentHtml) =>
                setPostCreate((current) => ({
                  ...current,
                  contentHtml,
                }))
              }
            />
          </EditorField>

              <ButtonRow>
                <PostActionButton
                  type="submit"
                  disabled={createPostMutation.isPending || !postCreate.channelId}
                >
                  게시글 작성
                </PostActionButton>
                <SmallButton
                  type="button"
                  disabled={createPostMutation.isPending}
                  onClick={closeCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </PostCreateModalDialog>
        </ModalBackdrop>
      ) : null}

      <PostListSection $isPanelOpen={Boolean(selectedPost)} onClick={handlePostListSectionClick}>
        <SectionHeaderRow>
          <SectionTitle>게시글 목록</SectionTitle>
          <SmallButton type="button" onClick={() => setIsPostCreateModalOpen(true)}>
            게시글 작성
          </SmallButton>
        </SectionHeaderRow>

        <PostControlRow>
          <FilterSelect
            value={postChannelTypeFilter}
            aria-label="게시판 유형"
            onChange={(event) => {
              setPostChannelTypeFilter(event.target.value);
              setPostScopeFilter("all");
            }}
          >
            <option value="all">전체</option>
            <option value="NOTICE">공지사항</option>
            <option value="CLASSROOM">반별</option>
            <option value="DEPARTMENT">부서별</option>
          </FilterSelect>
          <FilterSelect
            value={postScopeFilter}
            aria-label="게시판 선택"
            disabled={isPostScopeDisabled}
            onChange={(event) => setPostScopeFilter(event.target.value)}
          >
            {postScopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <TextInput
            value={postTitleSearch}
            onChange={(event) => setPostTitleSearch(event.target.value)}
            placeholder="제목 검색"
          />
        </PostControlRow>

        <PostListFrame>
          <DataState
            isLoading={postsQuery.isLoading}
            isError={postsQuery.isError}
            isEmpty={posts.length === 0}
            loadingLabel="게시글 목록 불러오는 중"
            errorLabel="게시글 목록을 불러오지 못했습니다."
            emptyLabel="게시글이 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>채널</th>
                  <th>작성자</th>
                  <th>상태</th>
                  <th>조회</th>
                </tr>
              </thead>
              <tbody>
                {pagedPosts.map((item) => (
                  <tr key={item.id} onClick={() => selectPost(item)}>
                    <td>{item.title}</td>
                    <td>{item.channelName ?? item.channelId}</td>
                    <td>{item.authorName ?? "-"}</td>
                    <td>{item.status}</td>
                    <td>{item.viewCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </PostListFrame>

        <Pagination aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPagination({ page: Math.max(1, safeCurrentPage - 1), search: paginationKey })
            }
          >
            ◀
          </PageArrowButton>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <PageNumberButton
                key={pageNumber}
                type="button"
                $isActive={pageNumber === safeCurrentPage}
                aria-current={pageNumber === safeCurrentPage ? "page" : undefined}
                onClick={() => setPagination({ page: pageNumber, search: paginationKey })}
              >
                {pageNumber}
              </PageNumberButton>
            );
          })}
          <PageArrowButton
            type="button"
            aria-label="다음 페이지"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setPagination({
                page: Math.min(totalPages, safeCurrentPage + 1),
                search: paginationKey,
              })
            }
          >
            ▶
          </PageArrowButton>
        </Pagination>

        {selectedPost ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="게시글 상세/수정" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="게시글 상세 닫기"
                  onClick={() => {
                    setIsPostDeleteConfirmOpen(false);
                    closePostDetail();
                  }}
                >
                  <CloseIcon aria-hidden="true" />
                </ClosePanelButton>
                <SectionTitle>{isPostEditing ? "게시글 수정" : "게시글 상세"}</SectionTitle>
              </PanelHeader>

              <DataState
                isLoading={postDetailQuery.isLoading}
                isError={postDetailQuery.isError}
                isEmpty={!selectedPost}
                loadingLabel="게시글 상세 불러오는 중"
                errorLabel="게시글 상세를 불러오지 못했습니다."
                emptyLabel="게시글을 선택하세요."
              >
                <PanelContent>
                  {isPostEditing ? (
                    <FormGrid
                      onSubmit={(event) => {
                        event.preventDefault();
                        updatePostMutation.mutate();
                      }}
                    >
                      <Label>
                        제목
                        <TextInput
                          value={postEdit.title}
                          onChange={(event) =>
                            setPostEdit((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                        />
                      </Label>

                      <Label>
                        상태
                        <PostSelect
                          value={postEdit.status}
                          onChange={(event) =>
                            setPostEdit((current) => ({
                              ...current,
                              status: event.target.value as PostStatus,
                            }))
                          }
                        >
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </PostSelect>
                      </Label>

                      <Label>
                        썸네일 URL
                        <TextInput
                          value={postEdit.thumbnailUrl}
                          onChange={(event) =>
                            setPostEdit((current) => ({
                              ...current,
                              thumbnailUrl: event.target.value,
                            }))
                          }
                        />
                      </Label>

                      <CheckLabel>
                        <input
                          type="checkbox"
                          checked={postEdit.allowComment}
                          onChange={(event) =>
                            setPostEdit((current) => ({
                              ...current,
                              allowComment: event.target.checked,
                            }))
                          }
                        />
                        댓글 허용
                      </CheckLabel>

                      <CheckLabel>
                        <input
                          type="checkbox"
                          checked={postEdit.isPinned}
                          onChange={(event) =>
                            setPostEdit((current) => ({
                              ...current,
                              isPinned: event.target.checked,
                            }))
                          }
                        />
                        상단 고정
                      </CheckLabel>

                      <PanelEditorField>
                        <EditorFieldTitle>본문</EditorFieldTitle>
                        <ToastEditorField
                          initialValue={postEdit.contentHtml}
                          onChange={(contentHtml) =>
                            setPostEdit((current) => ({
                              ...current,
                              contentHtml,
                            }))
                          }
                        />
                      </PanelEditorField>

                      <ButtonRow>
                        <PostActionButton
                          type="submit"
                          disabled={updatePostMutation.isPending || !selectedPost}
                        >
                          저장
                        </PostActionButton>
                        <SmallButton
                          type="button"
                          disabled={updatePostMutation.isPending}
                          onClick={() => {
                            setPostEdit(postView);
                            setIsPostEditing(false);
                          }}
                        >
                          취소
                        </SmallButton>
                      </ButtonRow>
                    </FormGrid>
                  ) : (
                    <ReadonlyDetail>
                      <ReadonlyItem>
                        <ReadonlyLabel>제목</ReadonlyLabel>
                        <ReadonlyValue>{postView.title || "-"}</ReadonlyValue>
                      </ReadonlyItem>
                      <ReadonlyItem>
                        <ReadonlyLabel>상태</ReadonlyLabel>
                        <ReadonlyValue>{postView.status || "-"}</ReadonlyValue>
                      </ReadonlyItem>
                      <ReadonlyItem>
                        <ReadonlyLabel>댓글</ReadonlyLabel>
                        <ReadonlyValue>
                          {postView.allowComment ? "허용" : "허용 안 함"}
                        </ReadonlyValue>
                      </ReadonlyItem>
                      <ReadonlyItem>
                        <ReadonlyLabel>고정</ReadonlyLabel>
                        <ReadonlyValue>{postView.isPinned ? "고정" : "고정 안 함"}</ReadonlyValue>
                      </ReadonlyItem>
                      <ReadonlyItem>
                        <ReadonlyLabel>썸네일 URL</ReadonlyLabel>
                        <ReadonlyValue>{postView.thumbnailUrl || "-"}</ReadonlyValue>
                      </ReadonlyItem>
                      <ReadonlyItem>
                        <ReadonlyLabel>본문</ReadonlyLabel>
                        <ReadonlyContent>
                          {postView.contentHtml ? (
                            <ToastViewerField value={postView.contentHtml} />
                          ) : (
                            <ReadonlyEmpty>본문이 없습니다.</ReadonlyEmpty>
                          )}
                        </ReadonlyContent>
                      </ReadonlyItem>

                      <ButtonRow>
                        <PostActionButton
                          type="button"
                          disabled={!selectedPost}
                          onClick={() => {
                            setPostEdit(postView);
                            setIsPostEditing(true);
                          }}
                        >
                          수정
                        </PostActionButton>
                        <SmallButton
                          type="button"
                          disabled={pinPostMutation.isPending}
                          onClick={() =>
                            pinPostMutation.mutate(!(postDetailQuery.data?.isPinned ?? false))
                          }
                        >
                          {postDetailQuery.data?.isPinned ? "고정 해제" : "고정"}
                        </SmallButton>
                        <DangerButton
                          type="button"
                          disabled={deletePostMutation.isPending}
                          onClick={() => setIsPostDeleteConfirmOpen(true)}
                        >
                          삭제
                        </DangerButton>
                      </ButtonRow>
                    </ReadonlyDetail>
                  )}
                </PanelContent>
              </DataState>
            </SlidePanel>
          </>
        ) : null}
      </PostListSection>

      {selectedPost && isPostDeleteConfirmOpen ? (
        <ModalBackdrop onMouseDown={() => setIsPostDeleteConfirmOpen(false)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-delete-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="post-delete-confirm-title">게시글 삭제</ConfirmTitle>
            <ConfirmMessage>삭제하시겠습니까?</ConfirmMessage>
            <ButtonRow>
              <DangerButton
                type="button"
                disabled={deletePostMutation.isPending}
                onClick={() => deletePostMutation.mutate()}
              >
                확인
              </DangerButton>
              <SmallButton
                type="button"
                disabled={deletePostMutation.isPending}
                onClick={() => setIsPostDeleteConfirmOpen(false)}
              >
                취소
              </SmallButton>
            </ButtonRow>
          </ConfirmDialog>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

function mapPostDetailToEditState(post?: PostDetailResponseDto): PostEditState {
  return {
    title: post?.title ?? "",
    status: post?.status ?? "PUBLISHED",
    allowComment: post?.allowComment ?? true,
    isPinned: post?.isPinned ?? false,
    thumbnailUrl: post?.thumbnailUrl ?? "",
    contentHtml: post?.contentHtml ?? "",
  };
}

const PostListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const PostListFrame = styled.div`
  position: relative;
  min-height: 22.35rem;
  border-radius: 0.5rem;

  @media (min-width: 120rem) {
    min-height: 22.5rem;
  }
`;

const PostControlRow = styled(ControlRow)`
  align-items: center;

  ${TextInput} {
    flex: 1;
    min-width: 12rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-wrap: wrap;

    ${TextInput} {
      flex-basis: 100%;
    }
  }
`;

const FilterSelect = styled.select`
  width: 9.5rem;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 ${spacing.space12};
  background-color: ${colors.white};
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  appearance: none;
  outline: none;

  &:focus {
    border-color: ${colors.point};
  }

  &:disabled {
    opacity: 1;
    color: #64706c;
    background-color: ${colors.white};
  }
`;

const PostSelect = styled.select`
  width: 100%;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 ${spacing.space12};
  background-color: ${colors.white};
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  appearance: none;
  outline: none;

  &:focus {
    border-color: ${colors.point};
  }

  &:disabled {
    opacity: 1;
    color: #64706c;
    background-color: ${colors.white};
  }
`;

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: ${spacing.space16};
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
    margin-top: ${spacing.space28};
    font-size: ${typography.fontSize16};
  }
`;

const PageArrowButton = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const PageNumberButton = styled.button<{ $isActive?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  color: ${({ $isActive }) => ($isActive ? "#111" : "#9a9a9a")};
  font: inherit;
  font-size: ${typography.fontSize16};
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgb(0 0 0 / 42%);
`;

const PostCreateModalDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 56rem);
  max-height: calc(100vh - 2.5rem);
  overflow-y: auto;
  padding: ${spacing.space20};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 18%);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space16};

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

const ConfirmDialog = styled(PostCreateModalDialog)`
  width: min(100%, 24rem);
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const ConfirmMessage = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;

const PostActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
  ({ type }) => ({
    type: type ?? "button",
  }),
)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.375rem;
  border: 1px solid ${colors.point};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  padding: 0 ${spacing.space16};
  color: ${colors.point};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PanelBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: rgba(17, 24, 39, 0.18);
  pointer-events: none;
  animation: fadePostPanelBackdropIn 0.18s ease-out both;

  @keyframes fadePostPanelBackdropIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const SlidePanel = styled.aside`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
  display: grid;
  align-content: start;
  gap: ${spacing.space12};
  width: 75%;
  max-height: 100%;
  min-height: 100%;
  overflow-y: auto;
  border-left: 1px solid #e6e9e7;
  background-color: ${colors.white};
  padding: 1.25rem 1rem;
  box-shadow: -1rem 0 2rem rgba(17, 24, 39, 0.12);
  transform: translateX(0);
  will-change: transform, opacity;
  animation: slidePostPanelIn 0.22s ease-out both;

  @keyframes slidePostPanelIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (min-width: 120rem) {
    padding: 2rem 1.75rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 88%;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

const CloseIcon = styled.span`
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  background-color: currentColor;
  mask: url("/chevron_right.svg") center / contain no-repeat;
  -webkit-mask: url("/chevron_right.svg") center / contain no-repeat;
`;

const ClosePanelButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #1f2b28;
  cursor: pointer;

  &:hover {
    background-color: #f5fff0;
    color: #5eb63a;
  }
`;

const PanelContent = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const PanelEditorField = styled.div`
  display: grid;
  gap: ${spacing.space4};
  min-width: 0;

  .toastui-editor-defaultUI {
    border-color: ${colors.border};
    border-radius: 0.375rem;
    max-width: 100%;
    overflow: hidden;
  }

  .toastui-editor-mode-switch {
    display: none;
  }

  .toastui-editor-md-tab-container {
    display: none;
  }

  .toastui-editor-main,
  .toastui-editor-ww-container,
  .toastui-editor-md-container {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .toastui-editor-toolbar {
    overflow-x: auto;
  }

  .toastui-editor-contents {
    color: #111827;
    font-size: ${typography.fontSize14};
    font-weight: 400;
  }

  .toastui-editor-contents strong,
  .toastui-editor-contents b,
  .toastui-editor-ww-container strong,
  .toastui-editor-ww-container b {
    font-weight: 800;
  }
`;

const ReadonlyDetail = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ReadonlyItem = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const ReadonlyLabel = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const ReadonlyValue = styled.div`
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0.625rem ${spacing.space12};
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  overflow-wrap: anywhere;
`;

const ReadonlyContent = styled.div`
  min-height: 8rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0.625rem ${spacing.space12};
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  overflow-wrap: anywhere;

  .toastui-editor-contents {
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight150};
  }
`;

const ReadonlyEmpty = styled.p`
  margin: 0;
  color: #64706c;
`;
