"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { deleteAttachment } from "@/api/file/file.api";
import { createPost, getPost, pinPost, updatePost } from "@/api/post/post.api";
import type { PostAttachmentInfoDto } from "@/api/post/post.dto";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import { AttachmentEditorPanel } from "@/components/common/AttachmentField";
import { FileUploadProgressNotice } from "@/components/common/FileUploadProgress";
import {
  resolveArchiveChannel,
  resolveArchiveChannelByName,
} from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import BoardDropdown, { type DropdownOption } from "@/components/staff/board/BoardDropdown";
import {
  CLASSROOM_WRITE_SCOPE_OPTIONS,
  DEPARTMENT_WRITE_SCOPE_OPTIONS,
} from "@/components/staff/board/boardOptions";
import {
  ActionButton,
  BoardSelectRow,
  CheckboxInput,
  CheckboxLabel,
  DocumentSection,
  Form,
  Label,
  OptionRow,
  PageTitle,
  StateMessage,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  publishArchivePostWithNewFiles,
} from "@/components/staff/archive/archive-document-section/archiveDocumentUpload";
import type { ArchiveDocumentConfig } from "@/config/archiveDocuments";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type ArchiveDocumentFormPageProps = {
  config: ArchiveDocumentConfig;
  editPostId?: number;
  editChannelId?: number;
};

type ArchiveScopeType = "CLASSROOM" | "DEPARTMENT";
type OpenDropdown = "type" | "scope" | null;

const ARCHIVE_SCOPE_TYPE_OPTIONS = [
  { label: "반별", value: "CLASSROOM" },
  { label: "부서별", value: "DEPARTMENT" },
] as const satisfies readonly DropdownOption<ArchiveScopeType>[];
const EMPTY_SCOPE_OPTION: DropdownOption<string> = { label: "선택", value: "__empty__" };

const CLASSROOM_SCOPE_ORDER = CLASSROOM_WRITE_SCOPE_OPTIONS.map((option) => option.label);
const DEPARTMENT_SCOPE_ORDER = DEPARTMENT_WRITE_SCOPE_OPTIONS.map((option) => option.label);
const CLASSROOM_HANDOVER_TEMPLATE = `
<p>1. 기본 정보</p>
<ul>
  <li>반명:</li>
  <li>이전 교사:</li>
  <li>후임 교사:</li>
  <li>인수인계일:</li>
</ul>
<p><br></p>
<p>2. 학습자 현황</p>
<ul>
  <li>현재 출석 인원:</li>
  <li>학생 명단,연락처:</li>
  <li>학습 수준:</li>
  <li>특이사항 (학습, 건강, 출석 등):</li>
</ul>
<p><br></p>
<p>3. 수업 운영</p>
<ul>
  <li>현재 진도:</li>
  <li>사용 교재:</li>
  <li>수업 방식:</li>
  <li>숙제 운영 여부:</li>
  <li>수업 진행 시 참고사항:</li>
</ul>
<p><br></p>
<p>4. 전달사항</p>
<ul>
  <li>다음 교사에게 전달할 내용:</li>
  <li>기타 참고사항:</li>
</ul>
<p><br></p>
<p>5. 인수인계 확인</p>
<ul>
  <li>인계자:</li>
  <li>인수자:</li>
  <li>작성일:</li>
</ul>
`.trim();

const DEPARTMENT_HANDOVER_TEMPLATE = `
<p>1. 기본 정보</p>
<ul>
  <li>부서명:</li>
  <li>이전 부장:</li>
  <li>후임 부장:</li>
  <li>인수인계일:</li>
</ul>
<p><br></p>
<p>2. 담당 업무</p>
<ul>
  <li>정기적으로 수행하는 업무:</li>
  <li>월별·학기별 주요 업무:</li>
  <li>업무 진행 순서:</li>
</ul>
<p><br></p>
<p>3. 진행 중인 업무</p>
<ul>
  <li>현재 진행 중인 업무:</li>
  <li>업무 진행 상황:</li>
  <li>마감 예정일:</li>
  <li>후속 조치가 필요한 사항:</li>
</ul>
<p><br></p>
<p>4. 연간 일정</p>
<ul>
  <li>연간 주요 행사:</li>
  <li>정기 일정:</li>
  <li>준비가 필요한 업무:</li>
</ul>
<p><br></p>
<p>5. 문서 및 자료 관리</p>
<ul>
  <li>사용 중인 문서:</li>
  <li>문서 저장 위치:</li>
  <li>자주 사용하는 양식:</li>
  <li>참고 자료:</li>
</ul>
<p><br></p>
<p>6. 홈페이지 및 시스템 관리</p>
<ul>
  <li>관리하는 게시판:</li>
  <li>홈페이지 관리 사항:</li>
  <li>시스템 사용 시 유의사항:</li>
</ul>
<p><br></p>
<p>7. 주요 연락 대상</p>
<ul>
  <li>협업이 필요한 담당자:</li>
  <li>자주 연락하는 대상:</li>
  <li>전달이 필요한 사항:</li>
</ul>
<p><br></p>
<p>8. 업무 노하우</p>
<ul>
  <li>업무 진행 팁:</li>
  <li>자주 발생하는 문제:</li>
  <li>해결 방법:</li>
</ul>
<p><br></p>
<p>9. 개선 및 건의사항</p>
<ul>
  <li>개선이 필요한 사항:</li>
  <li>후임에게 제안하고 싶은 내용:</li>
</ul>
<p><br></p>
<p>10. 기타 전달</p>
<ul>
  <li>기타 전달:</li>
</ul>
`.trim();

function sortOptionsByReference(
  options: DropdownOption<string>[],
  referenceOrder: readonly string[],
) {
  const orderMap = new Map(referenceOrder.map((label, index) => [label, index]));

  return [...options].sort((a, b) => {
    const aIndex = orderMap.get(a.label) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.get(b.label) ?? Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    return a.label.localeCompare(b.label, "ko");
  });
}

function getHandoverTemplate(scopeType: ArchiveScopeType) {
  return scopeType === "CLASSROOM"
    ? CLASSROOM_HANDOVER_TEMPLATE
    : DEPARTMENT_HANDOVER_TEMPLATE;
}

export default function ArchiveDocumentFormPage({
  config,
  editPostId,
  editChannelId,
}: ArchiveDocumentFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const isEditMode = typeof editPostId === "number" && typeof editChannelId === "number";
  const isHandoverPage = config.category === "handover";
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isPinned, setIsPinned] = useState<boolean | undefined>(undefined);
  const [allowComment, setAllowComment] = useState<boolean | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [scopeType, setScopeType] = useState<ArchiveScopeType>("CLASSROOM");
  const [scopeValue, setScopeValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [editableAttachments, setEditableAttachments] = useState<PostAttachmentInfoDto[] | null>(
    null,
  );
  const shouldShowUploadToastRef = useRef(false);

  const channelsQuery = useQuery({
    queryKey: ["staff", "archive", "channels"],
    queryFn: () => getChannels({ isActive: true }),
    enabled: !isEditMode,
    retry: false,
  });
  const classroomsQuery = useQuery({
    queryKey: ["staff", "archive", "handover", "classrooms"],
    queryFn: () => getClassrooms({ size: 100 }),
    enabled: isHandoverPage,
    retry: false,
  });
  const departmentsQuery = useQuery({
    queryKey: ["staff", "archive", "handover", "departments"],
    queryFn: () => getDepartments(),
    enabled: isHandoverPage,
    retry: false,
  });

  const postDetailQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(editChannelId ?? 0, editPostId ?? 0),
    queryFn: () => getPost({ channelId: editChannelId ?? 0, postId: editPostId ?? 0 }),
    enabled: isEditMode,
    retry: false,
  });
  const editChannel = channelsQuery.data?.find((item) => item.id === editChannelId);
  const editChannelName = editChannel?.name ?? postDetailQuery.data?.channelName ?? "";

  const scopeOptions = useMemo<readonly DropdownOption<string>[]>(() => {
    if (!isHandoverPage) return [];

    if (scopeType === "CLASSROOM") {
      const options =
        classroomsQuery.data?.content
          ?.filter((classroom) => typeof classroom.id === "number")
          .map((classroom) => ({
            label: classroom.name ?? `반 ${classroom.id}`,
            value: String(classroom.id),
          })) ?? [];

      return sortOptionsByReference(options, CLASSROOM_SCOPE_ORDER);
    }

    const options =
      departmentsQuery.data?.departments
        ?.filter((department) => typeof department.id === "number")
        .map((department) => ({
          label: department.name ?? `부서 ${department.id}`,
          value: String(department.id),
        })) ?? [];

    return sortOptionsByReference(options, DEPARTMENT_SCOPE_ORDER);
  }, [classroomsQuery.data, departmentsQuery.data, isHandoverPage, scopeType]);
  const scopeDropdownOptions = scopeOptions.length > 0 ? scopeOptions : [EMPTY_SCOPE_OPTION];

  const editScopeType = useMemo<ArchiveScopeType>(() => {
    if (!isHandoverPage) return "CLASSROOM";

    const matchedClassroom = CLASSROOM_SCOPE_ORDER.some((label) => editChannelName.includes(label));
    if (matchedClassroom) return "CLASSROOM";

    return "DEPARTMENT";
  }, [editChannelName, isHandoverPage]);

  const editScopeValue = useMemo(() => {
    if (!isHandoverPage) return "";

    const normalizedName = editChannelName.trim();
    const matchedOption = scopeOptions.find((option) => normalizedName.includes(option.label));
    return matchedOption?.value ?? "";
  }, [editChannelName, isHandoverPage, scopeOptions]);

  useEffect(() => {
    if (!isHandoverPage || !isEditMode) return;
    setScopeType(editScopeType);
  }, [editScopeType, isEditMode, isHandoverPage]);

  useEffect(() => {
    if (!isHandoverPage || isEditMode) return;
    if (scopeOptions.length === 0) {
      setScopeValue("");
      return;
    }

    if (scopeOptions.some((option) => option.value === scopeValue)) return;

    const firstMatchedOption = scopeOptions.find((option) =>
      resolveArchiveChannelByName(channelsQuery.data, `${option.label} ${config.title}`),
    );

    setScopeValue(firstMatchedOption?.value ?? scopeOptions[0]?.value ?? "");
  }, [channelsQuery.data, config.title, isEditMode, isHandoverPage, scopeOptions, scopeValue]);

  const selectedScopeValue = isEditMode ? editScopeValue : scopeValue;
  const selectedScopeOption = scopeOptions.find((option) => option.value === selectedScopeValue);
  const selectedScopeLabel = selectedScopeOption?.label ?? "";
  const targetChannelName =
    isHandoverPage && selectedScopeLabel ? `${selectedScopeLabel} ${config.title}` : config.title;
  const channel = isHandoverPage
    ? resolveArchiveChannelByName(channelsQuery.data, targetChannelName)
    : resolveArchiveChannel(channelsQuery.data, config);
  const channelId = isEditMode
    ? editChannelId
    : (channel?.id ?? (!isHandoverPage && channelsQuery.isError ? config.channelId : undefined));
  const scopeTypeValue = isEditMode ? editScopeType : scopeType;

  const currentUserName = user?.name ?? user?.nickname ?? user?.email ?? "";
  const canPinPost = user?.role === "ADMIN";
  const visibleTitle = title ?? postDetailQuery.data?.title ?? "";
  const visibleAuthor = postDetailQuery.data?.authorName ?? currentUserName;
  const defaultDescription =
    isHandoverPage && !isEditMode
      ? getHandoverTemplate(scopeTypeValue)
      : (postDetailQuery.data?.contentHtml ?? "");
  const visibleDescription = description ?? defaultDescription;
  const visibleIsPinned = isPinned ?? postDetailQuery.data?.isPinned ?? false;
  const visibleAllowComment = allowComment ?? postDetailQuery.data?.allowComment ?? true;
  const existingAttachments = postDetailQuery.data?.attachments ?? [];
  const visibleExistingAttachments = editableAttachments ?? existingAttachments;

  const canManagePost =
    !isEditMode ||
    user?.role === "ADMIN" ||
    (typeof user?.id === "number" && postDetailQuery.data?.authorId === user.id) ||
    Boolean(
      postDetailQuery.data?.authorName &&
      (postDetailQuery.data.authorName === user?.name ||
        postDetailQuery.data.authorName === user?.nickname ||
        postDetailQuery.data.authorName === user?.email),
    );

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      if (!channelId) {
        throw new Error(`${config.title} 채널을 찾을 수 없습니다.`);
      }

      const title = visibleTitle.trim();
      const contentHtml = visibleDescription.trim();
      const hasFileUpload = files.length > 0;
      shouldShowUploadToastRef.current = hasFileUpload;

      if (hasFileUpload) {
        return publishArchivePostWithNewFiles({
          channelId,
          title,
          contentHtml,
          allowComment: visibleAllowComment,
          isPinned: visibleIsPinned,
          files,
          errorLabel: config.title,
          ...(isEditMode
            ? {
                mode: "update",
                postId: editPostId,
                initialPinned: postDetailQuery.data?.isPinned ?? false,
              }
            : { mode: "create" }),
        });
      }

      if (isEditMode) {
        const updatedPost = await updatePost(
          { channelId, postId: editPostId },
          { title, contentHtml, status: "PUBLISHED", allowComment: visibleAllowComment },
        );

        if (canPinPost && visibleIsPinned !== (postDetailQuery.data?.isPinned ?? false)) {
          await pinPost({ channelId, postId: editPostId }, { isPinned: visibleIsPinned });
        }

        return updatedPost;
      }

      return createPost(
        {
          channelId,
        },
        {
          title,
          contentHtml,
          status: "PUBLISHED",
          allowComment: visibleAllowComment,
          isPinned: visibleIsPinned,
        },
      );
    },
    onSuccess: async (post) => {
      if (shouldShowUploadToastRef.current) {
        toast.success("파일 업로드가 완료되었습니다.");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) }),
        typeof post.channelId === "number" && typeof post.id === "number"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(post.channelId, post.id),
            })
          : Promise.resolve(),
      ]);

      if (typeof post.id === "number" && typeof post.channelId === "number") {
        router.push(`${config.listPath}/${post.id}?channelId=${post.channelId}`);
        return;
      }

      router.push(config.listPath);
    },
    onError: () => {
      shouldShowUploadToastRef.current = false;
    },
  });

  const canSubmit =
    visibleTitle.trim().length > 0 &&
    visibleDescription.trim().length > 0 &&
    Boolean(channelId) &&
    canManagePost &&
    !isPending;
  const canShowDescriptionEditor =
    !isEditMode || Boolean(postDetailQuery.data) || postDetailQuery.isError;
  const isScopeSelectionDisabled = isEditMode || scopeOptions.length === 0;

  async function handleRemoveExistingAttachment(fileId: string) {
    const currentAttachments = visibleExistingAttachments;
    await deleteAttachment({ fileId });
    setEditableAttachments(currentAttachments.filter((file) => file.fileId !== fileId));
  }

  function handleRemoveSelectedFile(file: File) {
    setFiles((current) =>
      current.filter(
        (item) => !(item.name === file.name && item.lastModified === file.lastModified),
      ),
    );
  }

  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>{isEditMode ? `${config.title} 수정하기` : config.writeTitle}</PageTitle>
        <ToolbarActions>
          {isPending && files.length > 0 ? <FileUploadProgressNotice /> : null}
          <ActionButton type="submit" form={`${config.category}-form`} disabled={!canSubmit}>
            {isEditMode ? "수정 완료" : "작성 완료"}
          </ActionButton>
        </ToolbarActions>
      </Toolbar>

      <Form
        id={`${config.category}-form`}
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) mutate();
        }}
      >
        {isHandoverPage ? (
          <BoardSelectRow aria-label="인수인계서 채널 선택">
            <BoardDropdown
              label="인수인계서 유형"
              options={ARCHIVE_SCOPE_TYPE_OPTIONS}
              value={scopeTypeValue}
              disabled={isEditMode}
              isOpen={openDropdown === "type"}
              onToggle={() =>
                setOpenDropdown((current) => (current === "type" || isEditMode ? null : "type"))
              }
              onSelect={(nextValue) => {
                if (isEditMode) return;
                setScopeType(nextValue);
                setScopeValue("");
                setOpenDropdown(null);
              }}
              width="wide"
            />
            <BoardDropdown
              label="인수인계서 채널"
              options={scopeDropdownOptions}
              value={selectedScopeValue || scopeDropdownOptions[0]?.value || EMPTY_SCOPE_OPTION.value}
              disabled={isScopeSelectionDisabled}
              isOpen={openDropdown === "scope"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "scope" || isScopeSelectionDisabled ? null : "scope",
                )
              }
              onSelect={(nextValue) => {
                if (isScopeSelectionDisabled) return;
                setScopeValue(nextValue);
                setOpenDropdown(null);
              }}
              width="wide"
            />
          </BoardSelectRow>
        ) : null}

        <Label as="label" htmlFor={`${config.category}-title`}>
          제목
        </Label>
        <ArchiveInput
          id={`${config.category}-title`}
          name="title"
          placeholder="제목"
          value={visibleTitle}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Label as="label" htmlFor={`${config.category}-author`}>
          작성자
        </Label>
        <ArchiveInput
          id={`${config.category}-author`}
          name="author"
          placeholder="홍길동"
          value={visibleAuthor}
          readOnly
        />

        <OptionRow>
          {canPinPost ? (
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={visibleIsPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
              />
              <span>게시물 고정</span>
            </CheckboxLabel>
          ) : null}
          <CheckboxLabel>
            <CheckboxInput
              type="checkbox"
              checked={visibleAllowComment}
              onChange={(event) => setAllowComment(event.target.checked)}
            />
            <span>댓글 허용</span>
          </CheckboxLabel>
        </OptionRow>

        <Label as="label" htmlFor={`${config.category}-description`}>
          설명
        </Label>
        {canShowDescriptionEditor ? (
          <EditorBox>
            <ToastEditorField
              key={
                isEditMode
                  ? `${config.category}-edit-${editChannelId}-${editPostId}`
                  : `${config.category}-create-${scopeTypeValue}-${selectedScopeValue || "default"}`
              }
              initialValue={visibleDescription}
              onChange={(contentHtml) => setDescription(contentHtml)}
            />
          </EditorBox>
        ) : (
          <StateMessage>본문 편집기를 불러오는 중입니다.</StateMessage>
        )}

        <Label>자료</Label>
        <AttachmentEditorPanel
          existingAttachments={visibleExistingAttachments.map((file, index) => ({
            id: file.fileId ?? `existing-${index}`,
            label: file.originalName ?? file.fileId ?? `자료 ${index + 1}`,
          }))}
          selectedFiles={files}
          onSelectFiles={(nextFiles) => setFiles((current) => [...current, ...nextFiles])}
          onRemoveExisting={handleRemoveExistingAttachment}
          onRemoveSelected={handleRemoveSelectedFile}
          disabled={isPending}
        />

        {postDetailQuery.isError ? (
          <StateMessage>수정할 {config.title} 내용을 불러오지 못했습니다.</StateMessage>
        ) : null}
        {isHandoverPage && !isEditMode && selectedScopeOption && !channel ? (
          <StateMessage>{targetChannelName} 채널을 찾을 수 없습니다.</StateMessage>
        ) : null}
        {!canManagePost ? <StateMessage>이 글을 수정할 권한이 없습니다.</StateMessage> : null}
        {isError ? (
          <StateMessage>
            {isEditMode
              ? `${config.title} 수정에 실패했습니다.`
              : `${config.title} 작성에 실패했습니다.`}
          </StateMessage>
        ) : null}
      </Form>
    </DocumentSection>
  );
}

const ArchiveInput = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:read-only {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const EditorBox = styled.div`
  width: 100%;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};

  .toastui-editor-defaultUI {
    border: 0;
  }
`;
