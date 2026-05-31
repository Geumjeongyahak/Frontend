"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconEdit,
  IconExternalLink,
  IconLink,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import styled from "styled-components";
import {
  createHistory,
  deleteHistory,
  getHistories,
  updateHistory,
} from "@/api/siteContent/siteContent.api";
import type { SiteHistoryResponseDto } from "@/api/siteContent/siteContent.dto";
import { uploadSiteContentImage } from "@/api/file/file.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type HistoryLink = {
  id: string;
  label: string;
  href: string;
};

type HistoryPhoto = {
  id: string;
  alt: string;
  src: string;
};

type HistoryItem = {
  id: number;
  title: string;
  detail?: string;
  links?: HistoryLink[];
  photos?: HistoryPhoto[];
};

type HistoryFormState = {
  title: string;
  detail: string;
  linkLabel: string;
  linkHref: string;
  photos: HistoryPhoto[];
};

const sidebarItems = [
  { label: "연혁", href: "/info/history" },
  { label: "부서 정보", href: "/info/departments" },
  { label: "반 정보", href: "/info/classes" },
  { label: "행사 정보", href: "/info/events" },
];

const emptyForm: HistoryFormState = {
  title: "",
  detail: "",
  linkLabel: "",
  linkHref: "",
  photos: [],
};

function normalizeHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function mapHistoryItem(item: SiteHistoryResponseDto): HistoryItem | null {
  if (typeof item.id !== "number" || !item.title) return null;
  const linkHref = normalizeHref(item.linkHref ?? "");

  return {
    id: item.id,
    title: item.title,
    detail: item.detail || undefined,
    links: linkHref
      ? [
          {
            id: `link-${item.id}`,
            label: item.linkLabel ?? "",
            href: linkHref,
          },
        ]
      : undefined,
    photos: item.photos?.map((photo, index) => ({
      id: String(photo.id ?? `${item.id}-${index}`),
      alt: photo.alt ?? item.title ?? "연혁 사진",
      src: photo.url ?? "",
    })),
  };
}

function itemToForm(item: HistoryItem): HistoryFormState {
  return {
    title: item.title,
    detail: item.detail ?? "",
    linkLabel: item.links?.[0]?.label ?? "",
    linkHref: item.links?.[0]?.href === "#" ? "" : item.links?.[0]?.href ?? "",
    photos: item.photos ?? [],
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("사진 파일을 읽지 못했습니다."));
    });
    reader.addEventListener("error", () => reject(reader.error ?? new Error("사진 파일을 읽지 못했습니다.")));
    reader.readAsDataURL(file);
  });
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";
  const historiesQuery = useQuery({
    queryKey: queryKeys.siteContent.history(),
    queryFn: getHistories,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [form, setForm] = useState<HistoryFormState>(emptyForm);
  const [photoFileNames, setPhotoFileNames] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const items = useMemo(
    () => historiesQuery.data?.history?.map(mapHistoryItem).filter((item): item is HistoryItem => item !== null) ?? [],
    [historiesQuery.data],
  );

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingItemId) ?? null,
    [editingItemId, items],
  );

  const refreshHistory = () => queryClient.invalidateQueries({ queryKey: queryKeys.siteContent.history() });

  const createMutation = useMutation({
    mutationFn: createHistory,
    onSuccess: refreshHistory,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateHistory>[1] }) =>
      updateHistory({ historyId: id }, body),
    onSuccess: refreshHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteHistory({ historyId: id }),
    onSuccess: refreshHistory,
  });

  function openCreateEditor() {
    setEditingItemId(null);
    setForm(emptyForm);
    setPhotoFileNames([]);
    setIsEditorOpen(true);
  }

  function openEditEditor(item: HistoryItem) {
    setEditingItemId(item.id);
    setForm(itemToForm(item));
    setPhotoFileNames([]);
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingItemId(null);
    setForm(emptyForm);
    setPhotoFileNames([]);
  }

  function finishEditMode() {
    closeEditor();
    setIsEditMode(false);
  }

  function updateForm(name: keyof HistoryFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handlePhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextPhotos = await Promise.all(
      files.map(async (file) => {
        const [previewSrc, uploaded] = await Promise.all([
          readFileAsDataUrl(file),
          uploadSiteContentImage(file, file.name),
        ]);

        return {
          id: uploaded.fileId ?? `${file.name}-${Date.now()}`,
          alt: file.name,
          src: uploaded.url ?? previewSrc,
        };
      }),
    );

    setPhotoFileNames(files.map((file) => file.name));
    setForm((current) => ({
      ...current,
      photos: [...current.photos, ...nextPhotos],
    }));
    event.target.value = "";
  }

  function removePhoto(photoId: string) {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== photoId),
    }));
  }

  async function handleDeleteItem() {
    if (!editingItemId) return;

    await deleteMutation.mutateAsync(editingItemId);
    closeEditor();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    const linkHref = normalizeHref(form.linkHref);
    const body = {
      title,
      detail: form.detail.trim() || undefined,
      linkLabel: linkHref ? form.linkLabel.trim() : undefined,
      linkHref: linkHref || undefined,
      photos: form.photos.length > 0
        ? form.photos
            .filter((photo) => photo.src)
            .map((photo) => ({ url: photo.src, alt: photo.alt || title }))
        : undefined,
    };

    if (editingItemId) {
      await updateMutation.mutateAsync({ id: editingItemId, body });
    } else {
      await createMutation.mutateAsync(body);
    }
    closeEditor();
  }

  return (
    <Shell>
      <Stage>
        <InfoSidebar>
          <SidebarHeader>기관 정보</SidebarHeader>
          <SidebarContent>
            <SidebarList>
              {sidebarItems.map((item) => {
                const isCurrent = item.href === "/info/history";
                return (
                  <SidebarItem key={item.href}>
                    <SidebarLink
                      href={item.href}
                      $isCurrent={isCurrent}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {item.label}
                    </SidebarLink>
                  </SidebarItem>
                );
              })}
            </SidebarList>
          </SidebarContent>
        </InfoSidebar>

        <Content>
          <HeaderRow>
            <Title>연혁</Title>
            {isAdmin ? (
              isEditMode ? (
                <HeaderActions>
                  <ActionButton type="button" onClick={openCreateEditor}>
                    <span>추가</span>
                    <IconPlus aria-hidden="true" size={16} stroke={2} />
                  </ActionButton>
                  <ActionButton type="button" onClick={finishEditMode}>
                    <span>수정 완료</span>
                    <IconEdit aria-hidden="true" size={16} stroke={2} />
                  </ActionButton>
                </HeaderActions>
              ) : (
                <ActionButton type="button" onClick={() => setIsEditMode(true)}>
                  <span>수정</span>
                  <IconEdit aria-hidden="true" size={16} stroke={2} />
                </ActionButton>
              )
            ) : null}
          </HeaderRow>

          {historiesQuery.isLoading ? (
            <EmptyState>연혁 정보를 불러오는 중입니다.</EmptyState>
          ) : historiesQuery.isError ? (
            <EmptyState>연혁 정보를 불러오지 못했습니다.</EmptyState>
          ) : items.length === 0 ? (
            <EmptyState>등록된 연혁이 없습니다.</EmptyState>
          ) : (
            <TimelineList>
              {items.map((item) => (
              <TimelineItem key={item.id}>
                <TimelineMarker aria-hidden="true" />
                <TimelineBody>
                  <ItemHeader>
                    <ItemTitle>{item.title}</ItemTitle>
                    {isAdmin && isEditMode ? (
                      <ItemEditButton type="button" onClick={() => openEditEditor(item)}>
                        <span>수정</span>
                        <IconEdit aria-hidden="true" size={16} stroke={2} />
                      </ItemEditButton>
                    ) : null}
                  </ItemHeader>

                  {item.detail ? <DetailText>{item.detail}</DetailText> : null}

                  {item.photos?.length ? (
                    <PhotoGrid>
                      {item.photos.map((photo) =>
                        photo.src ? (
                          <PhotoImage key={photo.id} src={photo.src} alt={photo.alt} />
                        ) : (
                          <PhotoPlaceholder key={photo.id} aria-label={photo.alt}>
                            <IconPhoto aria-hidden="true" size={22} stroke={1.8} />
                          </PhotoPlaceholder>
                        ),
                      )}
                    </PhotoGrid>
                  ) : null}

                  {item.links?.length ? (
                    <AttachmentRow aria-label="관련 링크">
                      {item.links.map((link) => (
                        <LinkPill
                          key={link.id}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={link.label || "관련 링크"}
                          $iconOnly={!link.label}
                        >
                          <IconLink aria-hidden="true" size={18} stroke={2} />
                          {link.label ? <span>{link.label}</span> : null}
                        </LinkPill>
                      ))}
                    </AttachmentRow>
                  ) : null}
                </TimelineBody>
              </TimelineItem>
              ))}
            </TimelineList>
          )}
        </Content>
      </Stage>

      {isEditorOpen && isAdmin ? (
        <EditorBackdrop role="presentation" onMouseDown={closeEditor}>
          <EditorDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-editor-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <EditorHeader>
              <EditorTitle id="history-editor-title">
                {editingItemId ? "연혁 수정" : "연혁 추가"}
              </EditorTitle>
              <CloseButton type="button" onClick={closeEditor} aria-label="닫기">
                <IconX aria-hidden="true" size={20} stroke={2} />
              </CloseButton>
            </EditorHeader>

            <EditorForm onSubmit={handleSubmit}>
              <Field>
                <FieldLabel htmlFor="history-title">내용</FieldLabel>
                <Input
                  id="history-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="예: 2026년 3월 새 행사 진행"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="history-detail">세부 내용</FieldLabel>
                <Input
                  id="history-detail"
                  value={form.detail}
                  onChange={(event) => updateForm("detail", event.target.value)}
                  placeholder="추가 설명을 입력하세요"
                />
              </Field>

              <TwoColumn>
                <Field>
                  <FieldLabel htmlFor="history-link-label">링크 이름</FieldLabel>
                  <Input
                    id="history-link-label"
                    value={form.linkLabel}
                    onChange={(event) => updateForm("linkLabel", event.target.value)}
                    placeholder="관련 링크"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="history-link-href">링크 URL</FieldLabel>
                  <Input
                    id="history-link-href"
                    value={form.linkHref}
                    onChange={(event) => updateForm("linkHref", event.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              </TwoColumn>

              <Field>
                <FieldLabel htmlFor="history-photo-file">사진 첨부</FieldLabel>
                <FileControl>
                  <HiddenFileInput
                    id="history-photo-file"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoFileChange}
                  />
                  <FileButton htmlFor="history-photo-file">파일 선택</FileButton>
                  <FileName>
                    {photoFileNames.length > 0
                      ? photoFileNames.join(", ")
                      : form.photos.length > 0
                        ? `${form.photos.length}장 첨부됨`
                        : "선택된 파일 없음"}
                  </FileName>
                </FileControl>
              </Field>

              {form.photos.length > 0 ? (
                <PreviewGrid>
                  {form.photos.map((photo) => (
                    <PreviewBox key={photo.id}>
                      <PreviewImage src={photo.src} alt={photo.alt || "첨부 사진 미리보기"} />
                      <RemovePhotoButton
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        aria-label={`${photo.alt || "첨부 사진"} 제거`}
                      >
                        <IconTrash aria-hidden="true" size={16} stroke={2} />
                        <span>사진 제거</span>
                      </RemovePhotoButton>
                    </PreviewBox>
                  ))}
                </PreviewGrid>
              ) : null}

              <EditorActions>
                <SecondaryButton type="button" onClick={closeEditor}>
                  취소
                </SecondaryButton>
                {editingItemId ? (
                  <DeleteButton type="button" onClick={handleDeleteItem}>
                    삭제
                  </DeleteButton>
                ) : null}
                <ActionButton type="submit">
                  <span>{editingItemId ? "수정 완료" : "추가 완료"}</span>
                  <IconExternalLink aria-hidden="true" size={16} stroke={2} />
                </ActionButton>
              </EditorActions>
            </EditorForm>
          </EditorDialog>
        </EditorBackdrop>
      ) : null}
    </Shell>
  );
}

const Shell = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
  }
`;

const Stage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const InfoSidebar = styled.aside`
  width: 11.625rem;
  flex-shrink: 0;
  background-color: ${colors.background};
  border-right: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    width: 17.4375rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
  }
`;

const SidebarHeader = styled.h1`
  display: flex;
  align-items: center;
  min-height: 3.625rem;
  margin: 0;
  padding: 0 1.625rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 5.5rem;
    padding: 0 2.5rem;
    font-size: ${typography.fontSize24};
  }
`;

const SidebarContent = styled.nav`
  padding: 1.75rem 0 2.5rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 0 3.75rem;
  }
`;

const SidebarList = styled.ul`
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 120rem) {
    gap: 0.625rem;
  }
`;

const SidebarItem = styled.li`
  display: block;
`;

const SidebarLink = styled(Link)<{ $isCurrent: boolean }>`
  display: block;
  padding: 0.25rem 1.625rem;
  background-color: ${({ $isCurrent }) => ($isCurrent ? colors.point : "transparent")};
  color: ${({ $isCurrent }) => ($isCurrent ? colors.white : colors.point)};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: ${({ $isCurrent }) => ($isCurrent ? colors.point : "#eeeeee")};
    color: ${({ $isCurrent }) => ($isCurrent ? colors.white : colors.text)};
  }

  @media (min-width: 120rem) {
    padding: 0.3125rem 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
  padding: 2.1875rem 3.3125rem 4rem 3.125rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 3.0625rem;

  @media (min-width: 120rem) {
    margin-bottom: 4.5rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    justify-content: flex-start;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${colors.pointSoft};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const TimelineList = styled.ol`
  position: relative;
  display: grid;
  gap: 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 120rem) {
    gap: 3.75rem;
  }
`;

const TimelineItem = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: start;
  column-gap: 0.625rem;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: calc(-2.5rem - 0.71875rem);
    left: 0.3125rem;
    width: 1px;
    background-color: #000000;
  }

  &:first-child::after {
    top: 0.375rem;
  }

  @media (min-width: 120rem) {
    grid-template-columns: 2.875rem minmax(0, 1fr);

    &:not(:last-child)::after {
      top: 0;
      bottom: calc(-3.75rem - 1.0625rem);
      left: 0.5rem;
    }

    &:first-child::after {
      top: 0.5625rem;
    }
  }
`;

const TimelineMarker = styled.span`
  position: relative;
  z-index: 1;
  width: 0.6875rem;
  height: 0.6875rem;
  margin-top: 0.375rem;
  border-radius: 50%;
  background-color: #000000;

  @media (min-width: 120rem) {
    width: 1rem;
    height: 1rem;
    margin-top: 0.5625rem;
  }
`;

const TimelineBody = styled.div`
  display: grid;
  gap: 1rem;
  min-width: 0;

  @media (min-width: 120rem) {
    gap: 1.5rem;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space16};

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    gap: ${spacing.space12};
  }
`;

const ItemTitle = styled.h3`
  min-width: 0;
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const ItemEditButton = styled(ActionButton)`
  min-height: 2.125rem;
  padding: 0.5rem ${spacing.space12};
  font-size: ${typography.fontSize13};

  @media (min-width: 120rem) {
    min-height: 3rem;
    padding: 0.75rem ${spacing.space20};
    font-size: ${typography.fontSize16};
  }
`;

const DetailText = styled.p`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const EmptyState = styled.p`
  margin: 0;
  color: ${colors.placeholder};
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const AttachmentRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space12};
`;

const LinkPill = styled.a<{ $iconOnly?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  width: ${({ $iconOnly }) => ($iconOnly ? "2.875rem" : "auto")};
  min-height: 2.875rem;
  padding: ${({ $iconOnly }) => ($iconOnly ? "0" : "0.75rem 1rem")};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius999};
  background-color: ${colors.pointSoft};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    background-color: #e3f5d8;
  }

  @media (min-width: 120rem) {
    width: ${({ $iconOnly }) => ($iconOnly ? "4.3125rem" : "auto")};
    min-height: 4.3125rem;
    padding: ${({ $iconOnly }) => ($iconOnly ? "0" : "1.25rem")};
    font-size: ${typography.fontSize20};

    svg {
      width: 1.75rem;
      height: 1.75rem;
    }
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 25.625rem);
  gap: ${spacing.space16};

  @media (min-width: 120rem) {
    grid-template-columns: minmax(0, 25.625rem);
  }
`;

const PhotoPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 17.125rem);
  aspect-ratio: 410 / 231;
  background-color: #d9d9d9;
  color: ${colors.placeholder};

  @media (min-width: 120rem) {
    width: min(100%, 25.625rem);
  }
`;

const PhotoImage = styled.img`
  display: block;
  width: min(100%, 17.125rem);
  aspect-ratio: 410 / 231;
  object-fit: cover;
  background-color: #d9d9d9;

  @media (min-width: 120rem) {
    width: min(100%, 25.625rem);
  }
`;

const EditorBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgba(0, 0, 0, 0.35);

  @media (min-width: 120rem) {
    padding: 1.875rem;
  }
`;

const EditorDialog = styled.section`
  width: min(100%, 44rem);
  max-height: calc(100vh - 2.5rem);
  overflow: auto;
  border-radius: ${radii.radius20};
  background-color: ${colors.white};
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.18);

  @media (min-width: 120rem) {
    width: min(100%, 66rem);
    max-height: calc(100vh - 3.75rem);
    border-radius: ${radii.radius30};
  }
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space16};
  padding: ${spacing.space24} ${spacing.space24} ${spacing.space16};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
    padding: 2.25rem 2.25rem ${spacing.space24};
  }
`;

const EditorTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 50%;
  background-color: transparent;
  color: ${colors.text};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3.75rem;
    height: 3.75rem;

    svg {
      width: 1.875rem;
      height: 1.875rem;
    }
  }

  &:hover {
    background-color: ${colors.background};
  }
`;

const EditorForm = styled.form`
  display: grid;
  gap: ${spacing.space16};
  padding: 0 ${spacing.space24} ${spacing.space24};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
    padding: 0 2.25rem 2.25rem;
  }
`;

const Field = styled.div`
  display: grid;
  gap: ${spacing.space8};

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
  }
`;

const FieldLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Input = styled.input`
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  padding: 0 ${spacing.space16};
  color: ${colors.text};
  font-family: inherit;
  font-size: ${typography.fontSize14};

  @media (min-width: 120rem) {
    min-height: 4.125rem;
    padding: 0 ${spacing.space24};
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize20};
  }

  &:focus {
    outline: 2px solid ${colors.pointSoft};
    border-color: ${colors.point};
  }
`;

const FileControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  padding: 0 ${spacing.space16};
  color: ${colors.text};
  font-size: ${typography.fontSize14};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
    min-height: 4.125rem;
    padding: 0 ${spacing.space24};
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize20};
  }

  &:focus-within {
    outline: 2px solid ${colors.pointSoft};
    border-color: ${colors.point};
  }
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space16};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

const FileButton = styled.label`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.875rem;
  padding: 0 ${spacing.space12};
  border: 1px solid ${colors.borderStrong};
  border-radius: 0.5rem;
  background-color: ${colors.background};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 2.8125rem;
    padding: 0 ${spacing.space20};
    border-radius: 0.75rem;
    font-size: ${typography.fontSize20};
  }

  &:hover {
    background-color: ${colors.border};
  }
`;

const FileName = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 20rem);
  gap: ${spacing.space16};

  @media (min-width: 120rem) {
    grid-template-columns: minmax(0, 30rem);
    gap: ${spacing.space24};
  }
`;

const PreviewBox = styled.div`
  display: grid;
  gap: ${spacing.space12};
  justify-items: start;

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }
`;

const PreviewImage = styled.img`
  display: block;
  width: min(100%, 20rem);
  aspect-ratio: 410 / 231;
  object-fit: cover;
  background-color: #d9d9d9;

  @media (min-width: 120rem) {
    width: min(100%, 30rem);
  }
`;

const RemovePhotoButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  border: 1px solid ${colors.notice};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.notice};
  padding: 0.625rem ${spacing.space12};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  cursor: pointer;

  @media (min-width: 120rem) {
    padding: 0.9375rem ${spacing.space20};
    border-radius: ${radii.radius20};
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  &:hover {
    background-color: ${colors.noticeSoft};
  }
`;

const EditorActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column-reverse;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
  color: ${colors.text};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }

  &:hover {
    background-color: ${colors.border};
  }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.notice};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.notice};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }

  &:hover {
    background-color: ${colors.noticeSoft};
  }
`;
