"use client";

import { useEffect } from "react";
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
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import Image from "next/image";
import chevronRight from "@/assets/chevron_right.svg";

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
  postCreate: PostCreateState;
  postEdit: PostEditState;
  isPostEditing: boolean;
  postsQuery: QueryState<unknown>;
  postDetailQuery: QueryState<PostDetailResponseDto>;
  createPostMutation: VoidMutationAction;
  updatePostMutation: VoidMutationAction;
  pinPostMutation: ValueMutationAction<boolean>;
  deletePostMutation: VoidMutationAction;
  setPostTitleSearch: Dispatch<SetStateAction<string>>;
  setPostCreate: Dispatch<SetStateAction<PostCreateState>>;
  setPostEdit: Dispatch<SetStateAction<PostEditState>>;
  setIsPostEditing: Dispatch<SetStateAction<boolean>>;
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
  postCreate,
  postEdit,
  isPostEditing,
  postsQuery,
  postDetailQuery,
  createPostMutation,
  updatePostMutation,
  pinPostMutation,
  deletePostMutation,
  setPostTitleSearch,
  setPostCreate,
  setPostEdit,
  setIsPostEditing,
  selectPost,
  closePostDetail,
}: AdminPostsSectionProps) {
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
  const postView = postDetailQuery.data ? mapPostDetailToEditState(postDetailQuery.data) : postEdit;

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
      closePostDetail();
    }
  }

  return (
    <>
      <SectionCard>
        <SectionTitle>게시글 작성</SectionTitle>

        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            createPostMutation.mutate();
          }}
        >
          <Label>
            채널 구분
            <Select
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
            </Select>
          </Label>

          {postCreate.channelScope === "CLASSROOM" ? (
            <Label>
              반/부서 선택
              <Select
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
              </Select>
            </Label>
          ) : null}

          {postCreate.channelScope === "DEPARTMENT" ? (
            <Label>
              반/부서 선택
              <Select
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
              </Select>
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
            <Select
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
            </Select>
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

          <PrimaryButton disabled={createPostMutation.isPending || !postCreate.channelId}>
            게시글 작성
          </PrimaryButton>
        </FormGrid>
      </SectionCard>

      <PostListSection $isPanelOpen={Boolean(selectedPost)} onClick={handlePostListSectionClick}>
        <SectionTitle>게시글 목록</SectionTitle>

        <ControlRow>
          <TextInput
            value={postTitleSearch}
            onChange={(event) => setPostTitleSearch(event.target.value)}
            placeholder="제목 검색"
          />
        </ControlRow>

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
                {posts.map((item) => (
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

        {selectedPost ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="게시글 상세/수정" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="게시글 상세 닫기"
                  onClick={closePostDetail}
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
                      <Select
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
                      </Select>
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
                      <PrimaryButton disabled={updatePostMutation.isPending || !selectedPost}>
                        저장
                      </PrimaryButton>
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
                      <ReadonlyValue>{postView.allowComment ? "허용" : "허용 안 함"}</ReadonlyValue>
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
                      <PrimaryButton
                        type="button"
                        disabled={!selectedPost}
                        onClick={() => {
                          setPostEdit(postView);
                          setIsPostEditing(true);
                        }}
                      >
                        수정
                      </PrimaryButton>
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
                        onClick={() => deletePostMutation.mutate()}
                      >
                        삭제
                      </DangerButton>
                    </ButtonRow>
                  </ReadonlyDetail>
                )}
              </DataState>
            </SlidePanel>
          </>
        ) : null}
      </PostListSection>
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

const PostListSection = styled.section<{ $isPanelOpen: boolean }>`
  position: relative;
  min-width: 0;
  min-height: 44rem;
  overflow: hidden;
  padding: 1.25rem 1rem;
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};

  @media (min-width: 120rem) {
    padding: 2rem 1.75rem;
  }
`;

const PostListFrame = styled.div`
  position: relative;
  min-height: 32rem;
  border-radius: 0.5rem;
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
  width: 1rem;
  height: 1rem;
  display: block;
  background-color: currentColor;
  mask: url("/chevron_right.svg") center / contain no-repeat;
  -webkit-mask: url("/chevron_right.svg") center / contain no-repeat;
`;

const ClosePanelButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  color: #1f2b28;
  cursor: pointer;

  &:hover {
    border-color: #88cd5a;
    background-color: #f5fff0;
    color: #5eb63a;
  }
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
