"use client";

import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { IconEdit, IconPlus, IconX } from "@tabler/icons-react";
import styled from "styled-components";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type OrganizationMember = {
  id: string;
  name: string;
  title: string;
  responsibilities: string[];
};

type DepartmentFormState = {
  title: string;
  name: string;
  responsibilities: string;
};

const sidebarItems = [
  { label: "연혁", href: "/info/history" },
  { label: "부서 정보", href: "/info/departments" },
  { label: "반 정보", href: "/info/classes" },
  { label: "행사 정보", href: "/info/events" },
];

const initialPrincipal: OrganizationMember = {
  id: "principal",
  title: "교장",
  name: "정해웅",
  responsibilities: ["금정열린배움터의 전반적인 운영을 총괄"],
};

const initialDepartments: OrganizationMember[] = [
  {
    id: "academic-planning",
    title: "교무기획부",
    name: "",
    responsibilities: ["야학 행사 계획 및 교무 선생님 보조"],
  },
  {
    id: "education-research",
    title: "교육연구부",
    name: "",
    responsibilities: ["신입 선생님 면접", "생일 및 참관, 연구 수업 관리", "각종 일지 관리"],
  },
  {
    id: "general-affairs",
    title: "총무부",
    name: "",
    responsibilities: ["야학 재정 관리"],
  },
  {
    id: "life-safety",
    title: "생활안전부",
    name: "",
    responsibilities: ["시설 안전 점검 및 수리", "비품 관리"],
  },
  {
    id: "public-relations",
    title: "홍보부",
    name: "",
    responsibilities: ["야학 홍보 및 학생, 교사 모집"],
  },
];

const emptyDepartmentForm: DepartmentFormState = {
  title: "",
  name: "",
  responsibilities: "",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function toForm(item: OrganizationMember): DepartmentFormState {
  return {
    title: item.title,
    name: item.name,
    responsibilities: item.responsibilities.join("\n"),
  };
}

function toResponsibilities(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DepartmentsPage() {
  const { status, user } = useAuthSession();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [departments, setDepartments] = useState(initialDepartments);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyDepartmentForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const editingItem = useMemo(() => {
    if (editingId === principal.id) return principal;
    return departments.find((item) => item.id === editingId) ?? null;
  }, [departments, editingId, principal]);

  function openCreateEditor() {
    setEditingId(null);
    setForm(emptyDepartmentForm);
    setIsEditorOpen(true);
  }

  function openEditEditor(item: OrganizationMember) {
    setEditingId(item.id);
    setForm(toForm(item));
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setEditingId(null);
    setForm(emptyDepartmentForm);
    setIsEditorOpen(false);
  }

  function finishEditMode() {
    closeEditor();
    setIsEditMode(false);
  }

  function updateForm(name: keyof DepartmentFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleDeleteItem() {
    if (!editingId || editingId === principal.id) return;
    setDepartments((current) => current.filter((item) => item.id !== editingId));
    closeEditor();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    const nextItem: OrganizationMember = {
      id: editingId ?? makeId("department"),
      title,
      name: form.name.trim(),
      responsibilities: toResponsibilities(form.responsibilities),
    };

    if (editingId === principal.id) {
      setPrincipal(nextItem);
    } else if (editingId) {
      setDepartments((current) => current.map((item) => (item.id === editingId ? nextItem : item)));
    } else {
      setDepartments((current) => [...current, nextItem]);
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
                const isCurrent = item.href === "/info/departments";
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
            <Title>부서 정보</Title>
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

          <OrganizationChart aria-label="금정열린배움터 조직 구성도">
            <PrincipalGroup>
              <MemberCard item={principal} isEditMode={isAdmin && isEditMode} onEdit={openEditEditor} />
            </PrincipalGroup>

            {departments.length > 0 ? (
              <>
                <ConnectorRow
                  aria-hidden="true"
                  style={{ "--department-count": departments.length } as CSSProperties}
                >
                  {departments.map((item) => (
                    <ConnectorBranch key={item.id} />
                  ))}
                </ConnectorRow>
                <DepartmentGrid style={{ "--department-count": departments.length } as CSSProperties}>
                  {departments.map((item) => (
                    <MemberCard
                      key={item.id}
                      item={item}
                      isEditMode={isAdmin && isEditMode}
                      onEdit={openEditEditor}
                    />
                  ))}
                </DepartmentGrid>
              </>
            ) : (
              <EmptyState>등록된 부서가 없습니다.</EmptyState>
            )}
          </OrganizationChart>
        </Content>
      </Stage>

      {isEditorOpen && isAdmin ? (
        <EditorBackdrop role="presentation" onMouseDown={closeEditor}>
          <EditorDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-editor-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <EditorHeader>
              <EditorTitle id="department-editor-title">
                {editingId ? `${editingItem?.title ?? "부서"} 수정` : "부서 추가"}
              </EditorTitle>
              <CloseButton type="button" onClick={closeEditor} aria-label="닫기">
                <IconX aria-hidden="true" size={20} stroke={2} />
              </CloseButton>
            </EditorHeader>

            <EditorForm onSubmit={handleSubmit}>
              <Field>
                <FieldLabel htmlFor="department-title">조직명</FieldLabel>
                <Input
                  id="department-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="예: 교육연구부"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="department-name">담당자</FieldLabel>
                <Input
                  id="department-name"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="담당자 이름을 입력하세요"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="department-responsibilities">주요 업무</FieldLabel>
                <Textarea
                  id="department-responsibilities"
                  value={form.responsibilities}
                  onChange={(event) => updateForm("responsibilities", event.target.value)}
                  placeholder={"한 줄에 하나씩 입력하세요\n예: 야학 재정 관리"}
                />
              </Field>

              <EditorActions>
                <SecondaryButton type="button" onClick={closeEditor}>
                  취소
                </SecondaryButton>
                {editingId && editingId !== principal.id ? (
                  <DeleteButton type="button" onClick={handleDeleteItem}>
                    삭제
                  </DeleteButton>
                ) : null}
                <ActionButton type="submit">
                  <span>{editingId ? "수정 완료" : "추가 완료"}</span>
                  <IconEdit aria-hidden="true" size={16} stroke={2} />
                </ActionButton>
              </EditorActions>
            </EditorForm>
          </EditorDialog>
        </EditorBackdrop>
      ) : null}
    </Shell>
  );
}

function MemberCard({
  isEditMode,
  item,
  onEdit,
}: {
  isEditMode: boolean;
  item: OrganizationMember;
  onEdit: (item: OrganizationMember) => void;
}) {
  return (
    <Member>
      <MemberTitle>{item.title}</MemberTitle>
      <MemberContent>
        {item.name ? <MemberName>{item.name}</MemberName> : null}
        {item.responsibilities.length > 0 ? (
          <ResponsibilityList $isSingleItem={item.responsibilities.length === 1}>
            {item.responsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ResponsibilityList>
        ) : null}
      </MemberContent>
      {isEditMode ? (
        <ItemEditButton type="button" onClick={() => onEdit(item)}>
          <span>수정</span>
          <IconEdit aria-hidden="true" size={16} stroke={2} />
        </ItemEditButton>
      ) : null}
    </Member>
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

const OrganizationChart = styled.div`
  display: grid;
  justify-items: center;
  width: 100%;
  max-width: 63.5rem;
  margin: 0 auto;
  padding: ${spacing.space8} 0 0;

  @media (min-width: 120rem) {
    max-width: 95.125rem;
    padding-top: ${spacing.space12};
  }
`;

const PrincipalGroup = styled.div`
  display: flex;
  justify-content: center;
`;

const ConnectorRow = styled.div`
  --department-count: 1;

  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--department-count), minmax(9rem, 1fr));
  width: 100%;
  height: 3.5rem;
  margin: ${spacing.space20} 0 0;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: calc(50% / var(--department-count));
    right: calc(50% / var(--department-count));
    height: 1px;
    background-color: ${colors.border};
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    width: 1px;
    height: 50%;
    background-color: ${colors.border};
    transform: translateX(-50%);
  }

  @media (min-width: 120rem) {
    grid-template-columns: repeat(var(--department-count), minmax(13.5rem, 1fr));
    height: 5.25rem;
    margin-top: 1.875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    display: none;
  }
`;

const ConnectorBranch = styled.span`
  position: relative;
  display: block;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 1px;
    height: 50%;
    background-color: ${colors.border};
    transform: translateX(-50%);
  }
`;

const DepartmentGrid = styled.div`
  --department-count: 1;

  display: grid;
  grid-template-columns: repeat(var(--department-count), minmax(9rem, 1fr));
  align-items: start;
  justify-items: center;
  gap: ${spacing.space20};
  width: 100%;

  @media (min-width: 120rem) {
    grid-template-columns: repeat(var(--department-count), minmax(13.5rem, 1fr));
    gap: 1.875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: ${spacing.space32};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const Member = styled.article`
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: ${spacing.space20};
  width: 100%;
  min-width: 0;
  color: #000000;
  text-align: center;

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const MemberTitle = styled.h3`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5.375rem;
  min-height: 3rem;
  margin: 0;
  padding: 0.75rem ${spacing.space24};
  border-radius: ${radii.radius999};
  background-color: ${colors.pointSoft};
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    min-width: 8.125rem;
    min-height: 4.25rem;
    padding: 1.25rem 2.5rem;
    font-size: ${typography.fontSize24};
  }
`;

const MemberContent = styled.div`
  display: grid;
  gap: ${spacing.space12};
  justify-items: center;
  min-width: 0;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const MemberName = styled.p`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ResponsibilityList = styled.ul<{ $isSingleItem: boolean }>`
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding-left: ${({ $isSingleItem }) => ($isSingleItem ? "0" : "1.25rem")};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  list-style-position: ${({ $isSingleItem }) => ($isSingleItem ? "inside" : "outside")};
  list-style-type: ${({ $isSingleItem }) => ($isSingleItem ? "none" : "disc")};
  text-align: ${({ $isSingleItem }) => ($isSingleItem ? "center" : "left")};
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    gap: ${spacing.space8};
    padding-left: ${({ $isSingleItem }) => ($isSingleItem ? "0" : "1.875rem")};
    font-size: ${typography.fontSize20};
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

const EmptyState = styled.p`
  margin: ${spacing.space32} 0 0;
  color: ${colors.placeholder};
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
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

  &:hover {
    background-color: ${colors.background};
  }

  @media (min-width: 120rem) {
    width: 3.75rem;
    height: 3.75rem;

    svg {
      width: 1.875rem;
      height: 1.875rem;
    }
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

  &:focus {
    outline: 2px solid ${colors.pointSoft};
    border-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 4.125rem;
    padding: 0 ${spacing.space24};
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize20};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  resize: vertical;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  padding: ${spacing.space16};
  color: ${colors.text};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  &:focus {
    outline: 2px solid ${colors.pointSoft};
    border-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 12rem;
    padding: ${spacing.space24};
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize20};
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

  &:hover {
    background-color: ${colors.border};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
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

  &:hover {
    background-color: ${colors.noticeSoft};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;
