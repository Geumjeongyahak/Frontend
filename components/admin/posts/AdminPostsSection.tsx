"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
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
  TextArea,
  TextInput,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";

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
  postsQuery: QueryState<unknown>;
  postDetailQuery: QueryState<PostDetailResponseDto>;
  createPostMutation: VoidMutationAction;
  updatePostMutation: VoidMutationAction;
  pinPostMutation: ValueMutationAction<boolean>;
  deletePostMutation: VoidMutationAction;
  setPostTitleSearch: Dispatch<SetStateAction<string>>;
  setPostCreate: Dispatch<SetStateAction<PostCreateState>>;
  setPostEdit: Dispatch<SetStateAction<PostEditState>>;
  selectPost: (item: PostSummaryResponseDto) => void;
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
  postsQuery,
  postDetailQuery,
  createPostMutation,
  updatePostMutation,
  pinPostMutation,
  deletePostMutation,
  setPostTitleSearch,
  setPostCreate,
  setPostEdit,
  selectPost,
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

      <TwoColumnGrid>
        <SectionCard>
          <SectionTitle>게시글 목록</SectionTitle>

          <ControlRow>
            <TextInput
              value={postTitleSearch}
              onChange={(event) => setPostTitleSearch(event.target.value)}
              placeholder="제목 검색"
            />
          </ControlRow>

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
        </SectionCard>

        <SectionCard>
          <SectionTitle>게시글 상세/수정</SectionTitle>
          <SectionDescription>
            선택한 게시글의 제목, 상태, 댓글 허용 여부와 본문 HTML을 수정하거나 삭제합니다.
          </SectionDescription>

          <DataState
            isLoading={postDetailQuery.isLoading}
            isError={postDetailQuery.isError}
            isEmpty={!selectedPost}
            loadingLabel="게시글 상세 불러오는 중"
            errorLabel="게시글 상세를 불러오지 못했습니다."
            emptyLabel="게시글을 선택하세요."
          >
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

              <Label>
                본문
                <TextArea
                  value={postEdit.contentHtml}
                  onChange={(event) =>
                    setPostEdit((current) => ({
                      ...current,
                      contentHtml: event.target.value,
                    }))
                  }
                />
              </Label>

              <ButtonRow>
                <PrimaryButton disabled={updatePostMutation.isPending}>수정</PrimaryButton>
                <SmallButton
                  type="button"
                  disabled={pinPostMutation.isPending}
                  onClick={() => pinPostMutation.mutate(!(postDetailQuery.data?.isPinned ?? false))}
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
            </FormGrid>
          </DataState>
        </SectionCard>
      </TwoColumnGrid>
    </>
  );
}
