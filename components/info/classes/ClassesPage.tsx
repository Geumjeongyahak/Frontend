"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { IconEdit, IconPlus, IconX } from "@tabler/icons-react";
import styled from "styled-components";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type ClassGroupId = "weekday" | "weekendMorning" | "weekendAfternoon";

type ClassItem = {
  id: string;
  groupId: ClassGroupId;
  name: string;
  description: string;
};

type ClassGroup = {
  id: ClassGroupId;
  label: string;
  times: string[];
};

type ClassFormState = {
  groupId: ClassGroupId;
  name: string;
  description: string;
};

const sidebarItems = [
  { label: "연혁", href: "/info/history" },
  { label: "부서 정보", href: "/info/departments" },
  { label: "반 정보", href: "/info/classes" },
  { label: "행사 정보", href: "/info/events" },
];

const classGroups: ClassGroup[] = [
  {
    id: "weekday",
    label: "주중반",
    times: ["1교시     19:20 - 20:00", "2교시     20:10 - 20:50", "3교시     21:00 - 21:30"],
  },
  {
    id: "weekendMorning",
    label: "주말 오전반",
    times: ["1교시     9:10 - 9:50", "2교시     10:00 - 10:40", "3교시     10:50 - 11:30"],
  },
  {
    id: "weekendAfternoon",
    label: "주말 오후반",
    times: ["1교시     11:30 - 13:00"],
  },
];

const initialClasses: ClassItem[] = [
  {
    id: "weekday-cherry",
    groupId: "weekday",
    name: "벚꽃반",
    description: "한글 기초 학습 (자모, 받침, 기본 낱말)",
  },
  {
    id: "weekday-forsythia",
    groupId: "weekday",
    name: "개나리반",
    description: "짧은 기본 문장 읽기·쓰기 학습 (초등 1단계 국어)",
  },
  {
    id: "weekday-dandelion",
    groupId: "weekday",
    name: "민들레반",
    description: "생활 문장 읽기·이해 및 기초 수학 학습 (초등 2단계 국어·수학)",
  },
  {
    id: "weekday-camellia",
    groupId: "weekday",
    name: "동백반",
    description: "초등 고학년 수준의 교과 학습 (초등 3단계 국어·수학·영어)",
  },
  {
    id: "weekday-sunflower",
    groupId: "weekday",
    name: "해바라기반",
    description: "초졸 검정고시 대비 학습 (국어·영어·수학·사회·과학)",
  },
  {
    id: "weekday-chrysanthemum",
    groupId: "weekday",
    name: "국화반",
    description: "중졸 검정고시 대비 학습 (국어·영어·수학·사회·과학)",
  },
  {
    id: "weekend-sprout",
    groupId: "weekendMorning",
    name: "새싹반",
    description: "영어 기초 학습 (알파벳, 파닉스, 기본 단어)",
  },
  {
    id: "weekend-tree",
    groupId: "weekendMorning",
    name: "나무반",
    description: "초등 영어 문장 읽기 학습 (초등 영어 과정, 문장 읽기)",
  },
  {
    id: "weekend-fruit",
    groupId: "weekendMorning",
    name: "열매반",
    description: "중등 영어 문법·독해 학습 (중등 영어 과정, 문법)",
  },
  {
    id: "weekend-seed",
    groupId: "weekendAfternoon",
    name: "씨앗반",
    description: "영어 기초 과정 학습 (기초 영어)",
  },
  {
    id: "weekend-moon",
    groupId: "weekendAfternoon",
    name: "상현/하현/초승반",
    description: "디지털 기초 활용 학습 (스마트폰 기능, 생활 앱 사용법)",
  },
];

const emptyForm: ClassFormState = {
  groupId: "weekday",
  name: "",
  description: "",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function toForm(item: ClassItem): ClassFormState {
  return {
    groupId: item.groupId,
    name: item.name,
    description: item.description,
  };
}

function toDescriptionItems(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ClassesPage() {
  const { status, user } = useAuthSession();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";
  const [classes, setClasses] = useState(initialClasses);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormState>(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const editingItem = useMemo(
    () => classes.find((item) => item.id === editingId) ?? null,
    [classes, editingId],
  );

  function openCreateEditor() {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditorOpen(true);
  }

  function openEditEditor(item: ClassItem) {
    setEditingId(item.id);
    setForm(toForm(item));
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditorOpen(false);
  }

  function finishEditMode() {
    closeEditor();
    setIsEditMode(false);
  }

  function updateForm(name: keyof ClassFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleDeleteItem() {
    if (!editingId) return;
    setClasses((current) => current.filter((item) => item.id !== editingId));
    closeEditor();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const descriptionItems = toDescriptionItems(form.description);
    if (!name || descriptionItems.length === 0) return;

    const nextItem: ClassItem = {
      id: editingId ?? makeId("class"),
      groupId: form.groupId,
      name,
      description: descriptionItems.join("\n"),
    };

    setClasses((current) =>
      editingId
        ? current.map((item) => (item.id === editingId ? nextItem : item))
        : [...current, nextItem],
    );
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
                const isCurrent = item.href === "/info/classes";
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
            <Title>반 정보</Title>
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

          <ClassLayout aria-label="금정열린배움터 반 정보">
            <ClassColumn>
              <ClassSection
                group={classGroups[0]}
                items={classes.filter((item) => item.groupId === "weekday")}
                isEditMode={isAdmin && isEditMode}
                onEdit={openEditEditor}
              />
            </ClassColumn>
            <ColumnDivider aria-hidden="true" />
            <ClassColumn>
              <ClassSection
                group={classGroups[1]}
                items={classes.filter((item) => item.groupId === "weekendMorning")}
                isEditMode={isAdmin && isEditMode}
                onEdit={openEditEditor}
              />
              <ClassSection
                group={classGroups[2]}
                items={classes.filter((item) => item.groupId === "weekendAfternoon")}
                isEditMode={isAdmin && isEditMode}
                onEdit={openEditEditor}
              />
            </ClassColumn>
          </ClassLayout>
        </Content>
      </Stage>

      {isEditorOpen && isAdmin ? (
        <EditorBackdrop role="presentation" onMouseDown={closeEditor}>
          <EditorDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-editor-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <EditorHeader>
              <EditorTitle id="class-editor-title">
                {editingId ? `${editingItem?.name ?? "반"} 수정` : "반 추가"}
              </EditorTitle>
              <CloseButton type="button" onClick={closeEditor} aria-label="닫기">
                <IconX aria-hidden="true" size={20} stroke={2} />
              </CloseButton>
            </EditorHeader>

            <EditorForm onSubmit={handleSubmit}>
              <Field>
                <FieldLabel htmlFor="class-group">구분</FieldLabel>
                <Select
                  id="class-group"
                  value={form.groupId}
                  onChange={(event) => updateForm("groupId", event.target.value as ClassGroupId)}
                >
                  <option value="weekday">주중반</option>
                  <option value="weekendMorning">주말 오전반</option>
                  <option value="weekendAfternoon">주말 오후반</option>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="class-name">반 이름</FieldLabel>
                <Input
                  id="class-name"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="예: 벚꽃반"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="class-description">학습 내용</FieldLabel>
                <Textarea
                  id="class-description"
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  placeholder="예: 한글 기초 학습"
                  required
                />
              </Field>

              <EditorActions>
                <SecondaryButton type="button" onClick={closeEditor}>
                  취소
                </SecondaryButton>
                {editingId ? (
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

function ClassSection({
  group,
  isEditMode,
  items,
  onEdit,
}: {
  group: ClassGroup;
  isEditMode: boolean;
  items: ClassItem[];
  onEdit: (item: ClassItem) => void;
}) {
  return (
    <Section>
      <SectionTitle>{group.label}</SectionTitle>
      <TimeTable aria-label={`${group.label} 시간표`}>
        {group.times.map((time) => (
          <TimeRow key={time}>{time}</TimeRow>
        ))}
      </TimeTable>

      <ClassList>
        {items.length > 0 ? (
          items.map((item) => (
            <ClassCard key={item.id}>
              <ClassName>{item.name}</ClassName>
              <ClassDescriptionList>
                {toDescriptionItems(item.description).map((description) => (
                  <li key={description}>{description}</li>
                ))}
              </ClassDescriptionList>
              {isEditMode ? (
                <ItemEditButton type="button" onClick={() => onEdit(item)}>
                  <span>수정</span>
                  <IconEdit aria-hidden="true" size={16} stroke={2} />
                </ItemEditButton>
              ) : null}
            </ClassCard>
          ))
        ) : (
          <EmptyState>등록된 반이 없습니다.</EmptyState>
        )}
      </ClassList>
    </Section>
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
  margin-bottom: 2.375rem;

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

const ClassLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  gap: 3.75rem;
  align-items: start;

  @media (min-width: 120rem) {
    gap: 5.625rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
    gap: ${spacing.space40};
  }
`;

const ClassColumn = styled.div`
  display: grid;
  gap: 2.5rem;
  min-width: 0;

  @media (min-width: 120rem) {
    gap: 3.75rem;
  }
`;

const ColumnDivider = styled.div`
  width: 1px;
  min-height: 100%;
  align-self: stretch;
  background-color: ${colors.border};

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
    height: 1px;
    min-height: 1px;
    background-color: ${colors.border};
  }
`;

const Section = styled.section`
  display: grid;
  gap: 2rem;
  min-width: 0;

  @media (min-width: 120rem) {
    gap: 3.75rem;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: ${colors.point};
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const TimeTable = styled.div`
  display: grid;
  align-content: center;
  justify-items: center;
  width: 100%;
  min-height: 5.375rem;
  padding: ${spacing.space16};
  border: 1px solid ${colors.border};
  background-color: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: 1.75rem;
  white-space: pre;

  @media (min-width: 120rem) {
    min-height: 8rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
    line-height: 2.5rem;
  }
`;

const TimeRow = styled.p`
  margin: 0;
`;

const ClassList = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: 120rem) {
    gap: 3.75rem;
  }
`;

const ClassCard = styled.article`
  position: relative;
  display: grid;
  justify-items: start;
  gap: ${spacing.space16};
  min-width: 0;

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const ClassName = styled.h4`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5.125rem;
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
    min-width: 7.5rem;
    min-height: 4.25rem;
    padding: 1.25rem 2.5rem;
    font-size: ${typography.fontSize24};
  }
`;

const ClassDescriptionList = styled.ul`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
  padding-left: 1.125rem;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  list-style-position: outside;
  list-style-type: disc;
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    padding-left: 1.875rem;
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
  margin: 0;
  color: ${colors.placeholder};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const VisuallyHidden = styled.h3`
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

const controlStyle = `
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  color: ${colors.text};
  font-family: inherit;
  font-size: ${typography.fontSize14};

  &:focus {
    outline: 2px solid ${colors.pointSoft};
    border-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize20};
  }
`;

const Input = styled.input`
  ${controlStyle}
  min-height: 2.75rem;
  padding: 0 ${spacing.space16};

  @media (min-width: 120rem) {
    min-height: 4.125rem;
    padding: 0 ${spacing.space24};
  }
`;

const Select = styled.select`
  ${controlStyle}
  min-height: 2.75rem;
  padding: 0 ${spacing.space16};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: 4.125rem;
    padding: 0 ${spacing.space24};
  }
`;

const Textarea = styled.textarea`
  ${controlStyle}
  min-height: 8rem;
  resize: vertical;
  padding: ${spacing.space16};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    min-height: 12rem;
    padding: ${spacing.space24};
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
