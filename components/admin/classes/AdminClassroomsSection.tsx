"use client";

import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import styled from "styled-components";
import type {
  ClassroomDetailResponseDto,
  ClassroomListItemDto,
  ClassroomType,
} from "@/api/classroom/classroom.dto";
import type { StudentListResponseDto } from "@/api/student/student.dto";
import type {
  ClassroomFormState,
  StudentCreateFormState,
} from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  InlineStatus,
  Label,
  List,
  ListItem,
  SectionCard,
  SectionDescription,
  SectionHeaderRow,
  SectionTitle,
  SmallButton,
  Table,
  TablePaddingRows,
  TextArea,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatPhoneNumber } from "@/utils/phoneNumber";

const CLASSROOMS_PER_PAGE = 11;

type QueryState<TData = unknown> = {
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

type StudentFormMutationVariables = {
  studentId: number;
  form: StudentCreateFormState;
};

type AdminClassroomsSectionProps = {
  classrooms: ClassroomListItemDto[];
  selectedClassroomId: number | null;
  isClassroomEditing: boolean;
  isClassroomCreateModalOpen: boolean;
  isClassroomDeleteConfirmOpen: boolean;
  isStudentCreateModalOpen: boolean;
  classroomSearch: string;
  classroomForm: ClassroomFormState;
  studentCreateForm: StudentCreateFormState;
  classroomsQuery: QueryState;
  classroomDetailQuery: QueryState<ClassroomDetailResponseDto>;
  classroomStudentsQuery: QueryState<StudentListResponseDto>;
  createClassroomMutation: VoidMutationAction;
  updateClassroomMutation: VoidMutationAction;
  deleteClassroomMutation: VoidMutationAction;
  createStudentMutation: VoidMutationAction;
  deleteStudentMutation: ValueMutationAction<number>;
  updateStudentMutation: ValueMutationAction<StudentFormMutationVariables>;
  setSelectedClassroomId: Dispatch<SetStateAction<number | null>>;
  setIsClassroomEditing: Dispatch<SetStateAction<boolean>>;
  setIsClassroomCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsClassroomDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>;
  setIsStudentCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setClassroomSearch: Dispatch<SetStateAction<string>>;
  setClassroomForm: Dispatch<SetStateAction<ClassroomFormState>>;
  setStudentCreateForm: Dispatch<SetStateAction<StudentCreateFormState>>;
  selectClassroom: (item: ClassroomListItemDto) => void;
  emptyClassroomForm: ClassroomFormState;
  emptyStudentCreateForm: StudentCreateFormState;
};

function getClassroomTypeLabel(type?: ClassroomType) {
  if (type === "WEEKDAY") {
    return "평일";
  }

  if (type === "WEEKEND") {
    return "주말";
  }

  return type || "-";
}

export function AdminClassroomsSection({
  classrooms,
  selectedClassroomId,
  isClassroomEditing,
  isClassroomCreateModalOpen,
  isClassroomDeleteConfirmOpen,
  isStudentCreateModalOpen,
  classroomSearch,
  classroomForm,
  studentCreateForm,
  classroomsQuery,
  classroomDetailQuery,
  classroomStudentsQuery,
  createClassroomMutation,
  updateClassroomMutation,
  deleteClassroomMutation,
  createStudentMutation,
  deleteStudentMutation,
  updateStudentMutation,
  setSelectedClassroomId,
  setIsClassroomEditing,
  setIsClassroomCreateModalOpen,
  setIsClassroomDeleteConfirmOpen,
  setIsStudentCreateModalOpen,
  setClassroomSearch,
  setClassroomForm,
  setStudentCreateForm,
  selectClassroom,
  emptyClassroomForm,
  emptyStudentCreateForm,
}: AdminClassroomsSectionProps) {
  const isDetailOpen = selectedClassroomId !== null;
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const [studentDeleteTarget, setStudentDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [studentEditTarget, setStudentEditTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const totalPages = Math.max(1, Math.ceil(classrooms.length / CLASSROOMS_PER_PAGE));
  const requestedPage = pagination.search === classroomSearch ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedClassrooms = classrooms.slice(
    (safeCurrentPage - 1) * CLASSROOMS_PER_PAGE,
    safeCurrentPage * CLASSROOMS_PER_PAGE,
  );

  function closeClassroomDetail() {
    setSelectedClassroomId(null);
    setIsClassroomEditing(false);
    setIsClassroomDeleteConfirmOpen(false);
    setIsStudentCreateModalOpen(false);
    setStudentCreateForm(emptyStudentCreateForm);
    setStudentDeleteTarget(null);
    setStudentEditTarget(null);
  }

  function openCreateModal() {
    setSelectedClassroomId(null);
    setIsClassroomEditing(false);
    setClassroomForm(emptyClassroomForm);
    setIsClassroomCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createClassroomMutation.isPending) {
      return;
    }

    setIsClassroomCreateModalOpen(false);
    setClassroomForm(emptyClassroomForm);
  }

  function openStudentCreateModal() {
    setStudentEditTarget(null);
    setStudentCreateForm(emptyStudentCreateForm);
    setIsStudentCreateModalOpen(true);
  }

  function closeStudentCreateModal() {
    if (createStudentMutation.isPending || updateStudentMutation.isPending) {
      return;
    }

    setIsStudentCreateModalOpen(false);
    setStudentCreateForm(emptyStudentCreateForm);
    setStudentEditTarget(null);
  }

  function openStudentEditModal(student: StudentListResponseDto[number]) {
    if (typeof student.id !== "number") {
      return;
    }

    setStudentEditTarget({
      id: student.id,
      name: student.name?.trim() || "선택한 학생",
    });
    setStudentCreateForm({
      name: student.name ?? "",
      phoneNumber: student.phoneNumber ?? "",
      description: student.description ?? "",
    });
    setIsStudentCreateModalOpen(true);
  }

  function openStudentDeleteConfirm(studentId: number, studentName?: string) {
    setStudentDeleteTarget({
      id: studentId,
      name: studentName?.trim() || "선택한 학생",
    });
  }

  function closeStudentDeleteConfirm() {
    if (deleteStudentMutation.isPending) {
      return;
    }

    setStudentDeleteTarget(null);
  }

  function confirmStudentDelete() {
    if (!studentDeleteTarget) {
      return;
    }

    deleteStudentMutation.mutate(studentDeleteTarget.id);
    setStudentDeleteTarget(null);
  }

  function cancelEditing() {
    const detail = classroomDetailQuery.data;

    setClassroomForm({
      name: detail?.name ?? classroomForm.name,
      type: detail?.type ?? classroomForm.type,
      description: detail?.description ?? classroomForm.description,
    });
    setIsClassroomEditing(false);
  }

  function handleClassroomListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedClassroomRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedClassroomRow) {
      closeClassroomDetail();
    }
  }

  const selectedClassroomName =
    classroomDetailQuery.data?.name?.trim() || classroomForm.name.trim() || "선택된 분반";
  const classroomStudents = classroomStudentsQuery.data ?? [];
  const isStudentFormPending = createStudentMutation.isPending || updateStudentMutation.isPending;
  const studentModalTitle = studentEditTarget ? "학생 수정" : "학생 등록";
  const studentModalDescription = studentEditTarget
    ? `${studentEditTarget.name} 학생 정보를 수정하세요.`
    : `${selectedClassroomName}에 등록할 학생 정보를 입력하세요.`;

  function submitStudentForm() {
    if (studentEditTarget) {
      updateStudentMutation.mutate({
        studentId: studentEditTarget.id,
        form: studentCreateForm,
      });
      setIsStudentCreateModalOpen(false);
      setStudentCreateForm(emptyStudentCreateForm);
      setStudentEditTarget(null);
      return;
    }

    createStudentMutation.mutate();
  }

  return (
    <>
      <ClassroomListSection $isPanelOpen={isDetailOpen} onClick={handleClassroomListSectionClick}>
        <SectionHeaderRow>
          <SectionTitle>분반 목록</SectionTitle>
          <SmallButton type="button" onClick={openCreateModal}>
            신규 개설
          </SmallButton>
        </SectionHeaderRow>

        <ControlRow>
          <TextInput
            value={classroomSearch}
            onChange={(event) => setClassroomSearch(event.target.value)}
            placeholder="분반명, 유형, 설명, ID 검색"
          />
        </ControlRow>

        <ClassroomListFrame>
          <DataState
            isLoading={classroomsQuery.isLoading}
            isError={classroomsQuery.isError}
            isEmpty={classrooms.length === 0}
            loadingLabel="분반 목록 불러오는 중"
            errorLabel="분반 목록을 불러오지 못했습니다."
            emptyLabel="분반이 없습니다."
          >
            <Table>
              <colgroup>
                <col style={{ width: "3.9rem" }} />
                <col style={{ width: "9.8rem" }} />
                <col style={{ width: "12.25rem" }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>유형</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {pagedClassrooms.map((item) => (
                  <tr key={item.id} onClick={() => selectClassroom(item)}>
                    <td>{item.id ?? "-"}</td>
                    <td>{item.name ?? "-"}</td>
                    <td>{getClassroomTypeLabel(item.type)}</td>
                    <td>{item.description ?? "-"}</td>
                  </tr>
                ))}
                <TablePaddingRows
                  columnCount={4}
                  visibleRowCount={pagedClassrooms.length}
                  padTo={CLASSROOMS_PER_PAGE}
                  keyPrefix="admin-classrooms"
                />
              </tbody>
            </Table>
          </DataState>
        </ClassroomListFrame>

        <Pagination aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPagination({ page: Math.max(1, safeCurrentPage - 1), search: classroomSearch })
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
                onClick={() => setPagination({ page: pageNumber, search: classroomSearch })}
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
                search: classroomSearch,
              })
            }
          >
            ▶
          </PageArrowButton>
        </Pagination>

        {isDetailOpen ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="분반 상세/수정" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="분반 상세 닫기"
                  onClick={closeClassroomDetail}
                >
                  <CloseIcon aria-hidden="true" />
                </ClosePanelButton>
                <SectionTitle>{isClassroomEditing ? "분반 수정" : "분반 상세"}</SectionTitle>
              </PanelHeader>

              <DataState
                isLoading={classroomDetailQuery.isLoading}
                isError={classroomDetailQuery.isError}
                isEmpty={!selectedClassroomId}
                loadingLabel="분반 상세 불러오는 중"
                errorLabel="분반 상세를 불러오지 못했습니다."
                emptyLabel="분반을 선택하세요."
              >
                <PanelContent>
                  <DetailFormView>
                    <ClassroomFields
                      form={classroomForm}
                      disabled={!isClassroomEditing || updateClassroomMutation.isPending}
                      setClassroomForm={setClassroomForm}
                    />
                    <StudentSummarySection>
                      <SectionHeaderRow>
                        <SectionTitle>학생 목록</SectionTitle>
                      </SectionHeaderRow>
                      <SectionDescription>현재 분반에 등록된 학생 목록입니다.</SectionDescription>
                      <DataState
                        isLoading={classroomStudentsQuery.isLoading}
                        isError={classroomStudentsQuery.isError}
                        isEmpty={classroomStudents.length === 0}
                        loadingLabel="학생 목록 불러오는 중"
                        errorLabel="학생 목록을 불러오지 못했습니다."
                        emptyLabel="등록된 학생이 없습니다."
                        compact
                      >
                        <StudentList>
                          {classroomStudents.map((student, index) => (
                            <StudentListItem key={student.id ?? `${student.name}-${index}`}>
                              <StudentCardMain>
                                <StudentIdentity>
                                  <strong>{student.name ?? "이름 없음"}</strong>
                                  <span>
                                    {student.phoneNumber?.trim()
                                      ? student.phoneNumber
                                      : "연락처 미등록"}
                                  </span>
                                </StudentIdentity>
                                <StudentMeta>
                                  {student.description ? (
                                    <StudentDescription>{student.description}</StudentDescription>
                                  ) : null}
                                </StudentMeta>
                              </StudentCardMain>
                              {typeof student.id === "number" ? (
                                <StudentRowActions>
                                  <SmallButton
                                    type="button"
                                    disabled={
                                      isStudentFormPending || deleteStudentMutation.isPending
                                    }
                                    onClick={() => openStudentEditModal(student)}
                                  >
                                    수정
                                  </SmallButton>
                                  <DangerButton
                                    type="button"
                                    disabled={deleteStudentMutation.isPending}
                                    onClick={() =>
                                      openStudentDeleteConfirm(student.id as number, student.name)
                                    }
                                  >
                                    삭제
                                  </DangerButton>
                                </StudentRowActions>
                              ) : null}
                            </StudentListItem>
                          ))}
                        </StudentList>
                      </DataState>
                    </StudentSummarySection>
                  </DetailFormView>

                  <ButtonRow>
                    {isClassroomEditing ? (
                      <>
                        <ClassroomActionButton
                          type="button"
                          onClick={() => updateClassroomMutation.mutate()}
                          disabled={updateClassroomMutation.isPending || !classroomForm.name.trim()}
                        >
                          저장
                        </ClassroomActionButton>
                        <SmallButton
                          type="button"
                          disabled={updateClassroomMutation.isPending}
                          onClick={cancelEditing}
                        >
                          취소
                        </SmallButton>
                      </>
                    ) : (
                      <>
                        <ClassroomActionButton
                          type="button"
                          disabled={!selectedClassroomId}
                          onClick={() => setIsClassroomEditing(true)}
                        >
                          수정
                        </ClassroomActionButton>
                        <DangerButton
                          type="button"
                          disabled={deleteClassroomMutation.isPending}
                          onClick={() => setIsClassroomDeleteConfirmOpen(true)}
                        >
                          삭제
                        </DangerButton>
                        <SmallButton
                          type="button"
                          disabled={!selectedClassroomId}
                          onClick={openStudentCreateModal}
                        >
                          학생 등록
                        </SmallButton>
                      </>
                    )}
                  </ButtonRow>
                </PanelContent>
              </DataState>
            </SlidePanel>
          </>
        ) : null}
      </ClassroomListSection>

      {isClassroomCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeCreateModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="classroom-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="classroom-create-modal-title">분반 생성</SectionTitle>
              <SmallButton
                type="button"
                disabled={createClassroomMutation.isPending}
                onClick={closeCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>
            <FormGrid
              onSubmit={(event) => {
                event.preventDefault();
                createClassroomMutation.mutate();
              }}
            >
              <ClassroomFields
                form={classroomForm}
                disabled={createClassroomMutation.isPending}
                setClassroomForm={setClassroomForm}
              />
              <ButtonRow>
                <ClassroomActionButton
                  type="submit"
                  disabled={createClassroomMutation.isPending || !classroomForm.name.trim()}
                >
                  생성
                </ClassroomActionButton>
                <SmallButton
                  type="button"
                  disabled={createClassroomMutation.isPending}
                  onClick={closeCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      {isStudentCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeStudentCreateModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <div>
                <SectionTitle id="student-create-modal-title">{studentModalTitle}</SectionTitle>
                <ModalDescription>{studentModalDescription}</ModalDescription>
              </div>
              <SmallButton
                type="button"
                disabled={isStudentFormPending}
                onClick={closeStudentCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>
            <FormGrid
              onSubmit={(event) => {
                event.preventDefault();
                submitStudentForm();
              }}
            >
              <StudentCreateFields
                form={studentCreateForm}
                disabled={isStudentFormPending}
                setStudentCreateForm={setStudentCreateForm}
              />
              <ButtonRow>
                <ClassroomActionButton
                  type="submit"
                  disabled={isStudentFormPending || !studentCreateForm.name.trim()}
                >
                  {studentEditTarget ? "저장" : "등록"}
                </ClassroomActionButton>
                <SmallButton
                  type="button"
                  disabled={isStudentFormPending}
                  onClick={closeStudentCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      {studentDeleteTarget ? (
        <ModalBackdrop onMouseDown={closeStudentDeleteConfirm}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-delete-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="student-delete-confirm-title">학생 삭제</ConfirmTitle>
            <ConfirmMessage>{studentDeleteTarget.name} 학생을 삭제하시겠습니까?</ConfirmMessage>
            <ButtonRow>
              <DangerButton
                type="button"
                disabled={deleteStudentMutation.isPending}
                onClick={confirmStudentDelete}
              >
                확인
              </DangerButton>
              <SmallButton
                type="button"
                disabled={deleteStudentMutation.isPending}
                onClick={closeStudentDeleteConfirm}
              >
                취소
              </SmallButton>
            </ButtonRow>
          </ConfirmDialog>
        </ModalBackdrop>
      ) : null}

      {isClassroomDeleteConfirmOpen ? (
        <ModalBackdrop onMouseDown={() => setIsClassroomDeleteConfirmOpen(false)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="classroom-delete-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="classroom-delete-confirm-title">분반 삭제</ConfirmTitle>
            <ConfirmMessage>삭제하시겠습니까?</ConfirmMessage>
            <ButtonRow>
              <DangerButton
                type="button"
                disabled={deleteClassroomMutation.isPending}
                onClick={() => deleteClassroomMutation.mutate()}
              >
                확인
              </DangerButton>
              <SmallButton
                type="button"
                disabled={deleteClassroomMutation.isPending}
                onClick={() => setIsClassroomDeleteConfirmOpen(false)}
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

type ClassroomFieldsProps = {
  form: ClassroomFormState;
  disabled: boolean;
  setClassroomForm: Dispatch<SetStateAction<ClassroomFormState>>;
};

function ClassroomFields({ form, disabled, setClassroomForm }: ClassroomFieldsProps) {
  return (
    <>
      <Label>
        이름
        <TextInput
          value={form.name}
          disabled={disabled}
          onChange={(event) =>
            setClassroomForm((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
      </Label>
      <Label>
        유형
        <ClassroomSelect
          value={form.type}
          disabled={disabled}
          onChange={(event) =>
            setClassroomForm((current) => ({
              ...current,
              type: event.target.value as ClassroomType,
            }))
          }
        >
          <option value="WEEKDAY">평일</option>
          <option value="WEEKEND">주말</option>
        </ClassroomSelect>
      </Label>
      <Label>
        설명
        <TextInput
          value={form.description}
          disabled={disabled}
          onChange={(event) =>
            setClassroomForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </Label>
    </>
  );
}

type StudentCreateFieldsProps = {
  form: StudentCreateFormState;
  disabled: boolean;
  setStudentCreateForm: Dispatch<SetStateAction<StudentCreateFormState>>;
};

function StudentCreateFields({ form, disabled, setStudentCreateForm }: StudentCreateFieldsProps) {
  return (
    <>
      <Label>
        이름
        <TextInput
          value={form.name}
          disabled={disabled}
          onChange={(event) =>
            setStudentCreateForm((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
      </Label>
      <Label>
        연락처
        <TextInput
          value={form.phoneNumber}
          disabled={disabled}
          placeholder="010-0000-0000"
          onChange={(event) =>
            setStudentCreateForm((current) => ({
              ...current,
              phoneNumber: formatPhoneNumber(event.target.value),
            }))
          }
        />
      </Label>
      <Label>
        비고
        <TextArea
          value={form.description}
          disabled={disabled}
          onChange={(event) =>
            setStudentCreateForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
      </Label>
    </>
  );
}

const ClassroomListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const ClassroomListFrame = styled.div`
  position: relative;
  border-radius: 0.5rem;
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

const PanelBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: rgba(17, 24, 39, 0.18);
  pointer-events: none;
  animation: fadeClassroomPanelBackdropIn 0.18s ease-out both;

  @keyframes fadeClassroomPanelBackdropIn {
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
  animation: slideClassroomPanelIn 0.22s ease-out both;

  @keyframes slideClassroomPanelIn {
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

const DetailFormView = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const PanelContent = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const StudentSummarySection = styled.section`
  display: grid;
  gap: ${spacing.space8};
  padding-top: ${spacing.space8};
  border-top: 1px solid #e6e9e7;
`;

const StudentList = styled(List)`
  margin: 0;
`;

const StudentListItem = styled(ListItem)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: ${spacing.space12};
`;

const StudentCardMain = styled.div`
  display: grid;
`;

const StudentIdentity = styled.div`
  display: grid;
  gap: ${spacing.space4};

  strong {
    color: #111827;
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight130};
  }

  span {
    color: #64706c;
    font-size: ${typography.fontSize13};
    line-height: ${typography.lineHeight130};
  }
`;

const StudentMeta = styled.div`
  display: grid;
  gap: ${spacing.space4};
  justify-items: start;
`;

const StudentDescription = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
`;

const StudentRowActions = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: ${spacing.space8};
`;

const ClassroomSelect = styled.select`
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

const ModalDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 32rem);
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

const ModalDescription = styled.p`
  margin: ${spacing.space4} 0 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
`;

const ConfirmDialog = styled(ModalDialog)`
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

const ClassroomActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
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

  @media (min-width: 120rem) {
    min-height: 2.375rem;
    padding: 0 ${spacing.space16};
    font-size: ${typography.fontSize14};
  }
`;
