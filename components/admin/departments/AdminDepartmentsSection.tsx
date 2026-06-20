"use client";

import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import styled from "styled-components";
import type {
  DepartmentDetailResponseDto,
  DepartmentListItemDto,
  PermissionResponseDto,
} from "@/api/department/department.dto";
import type { PermissionDefinitionDto } from "@/api/user/user.dto";
import type {
  DepartmentFormState,
  PermissionFormState,
} from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  Label,
  List,
  ListItem,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  SmallButton,
  Table,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const DEPARTMENTS_PER_PAGE = 11;

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

function getPermissionActions(permissionOptions: PermissionDefinitionDto[], resourceType: string) {
  return permissionOptions
    .filter((option) => option.resourceCode === resourceType)
    .map((option) => option.actionCode)
    .filter(
      (value, index, array): value is string => Boolean(value) && array.indexOf(value) === index,
    );
}

function getPermissionDefinition(
  permissionOptions: PermissionDefinitionDto[],
  resourceType: string,
  actionType: string,
) {
  return permissionOptions.find(
    (option) => option.resourceCode === resourceType && option.actionCode === actionType,
  );
}

function getDefaultPermissionScope(definition?: PermissionDefinitionDto) {
  const canUseGlobal = definition?.globalAllowed ?? definition?.scope !== "TARGET_ONLY";

  return canUseGlobal ? "GLOBAL" : "TARGET";
}

function getPermissionCode(permission: PermissionResponseDto) {
  return permission.permissionCode ?? permission.code ?? permission.name ?? "";
}

function getPermissionDescription(permission: PermissionResponseDto) {
  const code = getPermissionCode(permission);
  const description = permission.name ?? "";

  return description && description !== code ? description : "";
}

type AdminDepartmentsSectionProps = {
  departments: DepartmentListItemDto[];
  selectedDepartmentId: number | null;
  isDepartmentEditing: boolean;
  isDepartmentCreateModalOpen: boolean;
  isDepartmentDeleteConfirmOpen: boolean;
  departmentSearch: string;
  departmentForm: DepartmentFormState;
  permissionForm: PermissionFormState;
  permissionOptions: PermissionDefinitionDto[];
  availableActions: string[];
  departmentsQuery: QueryState<unknown>;
  departmentDetailQuery: QueryState<DepartmentDetailResponseDto>;
  createDepartmentMutation: VoidMutationAction;
  updateDepartmentMutation: VoidMutationAction;
  deleteDepartmentMutation: VoidMutationAction;
  addDepartmentPermissionMutation: VoidMutationAction;
  removeDepartmentPermissionMutation: ValueMutationAction<string>;
  setSelectedDepartmentId: Dispatch<SetStateAction<number | null>>;
  setIsDepartmentEditing: Dispatch<SetStateAction<boolean>>;
  setIsDepartmentCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsDepartmentDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>;
  setDepartmentSearch: Dispatch<SetStateAction<string>>;
  setDepartmentForm: Dispatch<SetStateAction<DepartmentFormState>>;
  setPermissionForm: Dispatch<SetStateAction<PermissionFormState>>;
  selectDepartment: (item: DepartmentListItemDto) => void;
  emptyDepartmentForm: DepartmentFormState;
};

export function AdminDepartmentsSection({
  departments,
  selectedDepartmentId,
  isDepartmentEditing,
  isDepartmentCreateModalOpen,
  isDepartmentDeleteConfirmOpen,
  departmentSearch,
  departmentForm,
  permissionForm,
  permissionOptions,
  availableActions,
  departmentsQuery,
  departmentDetailQuery,
  createDepartmentMutation,
  updateDepartmentMutation,
  deleteDepartmentMutation,
  addDepartmentPermissionMutation,
  removeDepartmentPermissionMutation,
  setSelectedDepartmentId,
  setIsDepartmentEditing,
  setIsDepartmentCreateModalOpen,
  setIsDepartmentDeleteConfirmOpen,
  setDepartmentSearch,
  setDepartmentForm,
  setPermissionForm,
  selectDepartment,
  emptyDepartmentForm,
}: AdminDepartmentsSectionProps) {
  const isDetailOpen = selectedDepartmentId !== null;
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const totalPages = Math.max(1, Math.ceil(departments.length / DEPARTMENTS_PER_PAGE));
  const requestedPage = pagination.search === departmentSearch ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedDepartments = departments.slice(
    (safeCurrentPage - 1) * DEPARTMENTS_PER_PAGE,
    safeCurrentPage * DEPARTMENTS_PER_PAGE,
  );
  const permissionResources = Array.from(
    new Set(permissionOptions.map((option) => option.resourceCode).filter(Boolean)),
  );

  function closeDepartmentDetail() {
    setSelectedDepartmentId(null);
    setIsDepartmentEditing(false);
    setIsDepartmentDeleteConfirmOpen(false);
  }

  function openCreateModal() {
    setSelectedDepartmentId(null);
    setIsDepartmentEditing(false);
    setDepartmentForm(emptyDepartmentForm);
    setIsDepartmentCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createDepartmentMutation.isPending) {
      return;
    }

    setIsDepartmentCreateModalOpen(false);
    setDepartmentForm(emptyDepartmentForm);
  }

  function cancelEditing() {
    const detail = departmentDetailQuery.data;

    setDepartmentForm({
      name: detail?.name ?? departmentForm.name,
      description: detail?.description ?? departmentForm.description,
    });
    setIsDepartmentEditing(false);
  }

  function handleDepartmentListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedDepartmentRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedDepartmentRow) {
      closeDepartmentDetail();
    }
  }

  return (
    <>
      <DepartmentListSection $isPanelOpen={isDetailOpen} onClick={handleDepartmentListSectionClick}>
        <SectionHeaderRow>
          <SectionTitle>부서 목록</SectionTitle>
          <SmallButton type="button" onClick={openCreateModal}>
            신규 개설
          </SmallButton>
        </SectionHeaderRow>

        <ControlRow>
          <TextInput
            value={departmentSearch}
            onChange={(event) => setDepartmentSearch(event.target.value)}
            placeholder="부서명, 설명, ID 검색"
          />
        </ControlRow>

        <DepartmentListFrame>
          <DataState
            isLoading={departmentsQuery.isLoading}
            isError={departmentsQuery.isError}
            isEmpty={departments.length === 0}
            loadingLabel="부서 목록 불러오는 중"
            errorLabel="부서 목록을 불러오지 못했습니다."
            emptyLabel="부서가 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {pagedDepartments.map((item) => (
                  <tr key={item.id} onClick={() => selectDepartment(item)}>
                    <td>{item.id ?? "-"}</td>
                    <td>{item.name ?? "-"}</td>
                    <td>{item.description ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </DepartmentListFrame>

        <Pagination aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPagination({ page: Math.max(1, safeCurrentPage - 1), search: departmentSearch })
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
                onClick={() => setPagination({ page: pageNumber, search: departmentSearch })}
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
                search: departmentSearch,
              })
            }
          >
            ▶
          </PageArrowButton>
        </Pagination>

        {isDetailOpen ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="부서 상세/수정" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="부서 상세 닫기"
                  onClick={closeDepartmentDetail}
                >
                  <CloseIcon aria-hidden="true" />
                </ClosePanelButton>
                <SectionTitle>{isDepartmentEditing ? "부서 수정" : "부서 상세"}</SectionTitle>
              </PanelHeader>

              <DataState
                isLoading={departmentDetailQuery.isLoading}
                isError={departmentDetailQuery.isError}
                isEmpty={!selectedDepartmentId}
                loadingLabel="부서 상세 불러오는 중"
                errorLabel="부서 상세를 불러오지 못했습니다."
                emptyLabel="부서를 선택하세요."
              >
                <PanelContent>
                  <DetailFormView>
                    <DepartmentFields
                      form={departmentForm}
                      disabled={!isDepartmentEditing || updateDepartmentMutation.isPending}
                      setDepartmentForm={setDepartmentForm}
                    />
                  </DetailFormView>

                  <DetailBlock>
                    <DetailBlockTitle>소속 사용자</DetailBlockTitle>
                    <List>
                      {departmentDetailQuery.data?.users?.length ? (
                        departmentDetailQuery.data.users.map((item) => (
                          <ListItem key={item.id ?? item.email}>
                            <span>{item.name ?? item.email ?? "-"}</span>
                            <span>{item.role ?? "-"}</span>
                          </ListItem>
                        ))
                      ) : (
                        <EmptyListItem>소속 사용자가 없습니다.</EmptyListItem>
                      )}
                    </List>
                  </DetailBlock>

                  <DetailBlock>
                    <DetailBlockTitle>부서 권한</DetailBlockTitle>
                    <List>
                      {departmentDetailQuery.data?.permissions?.length ? (
                        departmentDetailQuery.data.permissions.map((permission) => {
                          const code = getPermissionCode(permission);

                          return (
                            <ListItem key={code}>
                              <PermissionItemContent>
                                <PermissionCode>{code || "-"}</PermissionCode>
                                {getPermissionDescription(permission) ? (
                                  <PermissionDescription>
                                    {getPermissionDescription(permission)}
                                  </PermissionDescription>
                                ) : null}
                              </PermissionItemContent>
                              {code ? (
                                <SmallButton
                                  type="button"
                                  disabled={removeDepartmentPermissionMutation.isPending}
                                  onClick={() => removeDepartmentPermissionMutation.mutate(code)}
                                >
                                  제거
                                </SmallButton>
                              ) : null}
                            </ListItem>
                          );
                        })
                      ) : (
                        <EmptyListItem>부서 권한이 없습니다.</EmptyListItem>
                      )}
                    </List>

                    {isDepartmentEditing ? (
                      <PermissionAddForm
                        onSubmit={(event) => {
                          event.preventDefault();
                          addDepartmentPermissionMutation.mutate();
                        }}
                      >
                        <PermissionAddHeader>
                          <PermissionAddTitle>부서 권한 추가</PermissionAddTitle>
                        </PermissionAddHeader>
                        <Label>
                          리소스
                          <DepartmentSelect
                            value={permissionForm.resourceType}
                            onChange={(event) => {
                              const resourceType = event.target.value;
                              const actions = getPermissionActions(permissionOptions, resourceType);
                              const actionType = actions[0] ?? "";
                              const definition = getPermissionDefinition(
                                permissionOptions,
                                resourceType,
                                actionType,
                              );
                              const scope = getDefaultPermissionScope(definition);

                              setPermissionForm((current) => ({
                                ...current,
                                resourceType,
                                actionType,
                                scope,
                                target: scope === "GLOBAL" ? "" : current.target,
                              }));
                            }}
                          >
                            {permissionResources.map((resource) => (
                              <option key={resource} value={resource}>
                                {resource}
                              </option>
                            ))}
                          </DepartmentSelect>
                        </Label>
                        <Label>
                          액션
                          <DepartmentSelect
                            value={permissionForm.actionType}
                            disabled={availableActions.length === 0}
                            onChange={(event) => {
                              const actionType = event.target.value;
                              const definition = getPermissionDefinition(
                                permissionOptions,
                                permissionForm.resourceType,
                                actionType,
                              );
                              const scope = getDefaultPermissionScope(definition);

                              setPermissionForm((current) => ({
                                ...current,
                                actionType,
                                scope,
                                target: scope === "GLOBAL" ? "" : current.target,
                              }));
                            }}
                          >
                            {availableActions.map((action) => (
                              <option key={action} value={action}>
                                {action}
                              </option>
                            ))}
                          </DepartmentSelect>
                        </Label>
                        <Label>
                          범위
                          <DepartmentSelect
                            value={permissionForm.scope}
                            onChange={(event) =>
                              setPermissionForm((current) => ({
                                ...current,
                                scope: event.target.value as PermissionFormState["scope"],
                                target: event.target.value === "GLOBAL" ? "" : current.target,
                              }))
                            }
                          >
                            <option value="GLOBAL">전체 권한</option>
                            <option value="TARGET">특정 대상 권한</option>
                          </DepartmentSelect>
                        </Label>
                        <Label>
                          대상 ID
                          <TextInput
                            value={permissionForm.target}
                            disabled={permissionForm.scope === "GLOBAL"}
                            onChange={(event) =>
                              setPermissionForm((current) => ({
                                ...current,
                                target: event.target.value,
                              }))
                            }
                          />
                        </Label>
                        <DepartmentActionButton
                          type="submit"
                          disabled={
                            !selectedDepartmentId ||
                            addDepartmentPermissionMutation.isPending ||
                            !permissionForm.resourceType ||
                            !permissionForm.actionType ||
                            (permissionForm.scope === "TARGET" && !permissionForm.target.trim())
                          }
                        >
                          권한 추가
                        </DepartmentActionButton>
                      </PermissionAddForm>
                    ) : null}
                  </DetailBlock>

                  <ButtonRow>
                    {isDepartmentEditing ? (
                      <>
                        <DepartmentActionButton
                          type="button"
                          onClick={() => updateDepartmentMutation.mutate()}
                          disabled={
                            updateDepartmentMutation.isPending || !departmentForm.name.trim()
                          }
                        >
                          저장
                        </DepartmentActionButton>
                        <SmallButton
                          type="button"
                          disabled={updateDepartmentMutation.isPending}
                          onClick={cancelEditing}
                        >
                          취소
                        </SmallButton>
                      </>
                    ) : (
                      <>
                        <DepartmentActionButton
                          type="button"
                          disabled={!selectedDepartmentId}
                          onClick={() => setIsDepartmentEditing(true)}
                        >
                          수정
                        </DepartmentActionButton>
                        <DangerButton
                          type="button"
                          disabled={deleteDepartmentMutation.isPending}
                          onClick={() => setIsDepartmentDeleteConfirmOpen(true)}
                        >
                          삭제
                        </DangerButton>
                      </>
                    )}
                  </ButtonRow>
                </PanelContent>
              </DataState>
            </SlidePanel>
          </>
        ) : null}
      </DepartmentListSection>

      {isDepartmentCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeCreateModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="department-create-modal-title">부서 생성</SectionTitle>
              <SmallButton
                type="button"
                disabled={createDepartmentMutation.isPending}
                onClick={closeCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>
            <FormGrid
              onSubmit={(event) => {
                event.preventDefault();
                createDepartmentMutation.mutate();
              }}
            >
              <DepartmentFields
                form={departmentForm}
                disabled={createDepartmentMutation.isPending}
                setDepartmentForm={setDepartmentForm}
              />
              <ButtonRow>
                <DepartmentActionButton
                  type="submit"
                  disabled={createDepartmentMutation.isPending || !departmentForm.name.trim()}
                >
                  생성
                </DepartmentActionButton>
                <SmallButton
                  type="button"
                  disabled={createDepartmentMutation.isPending}
                  onClick={closeCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      {isDepartmentDeleteConfirmOpen ? (
        <ModalBackdrop onMouseDown={() => setIsDepartmentDeleteConfirmOpen(false)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-delete-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="department-delete-confirm-title">부서 삭제</ConfirmTitle>
            <ConfirmMessage>삭제하시겠습니까?</ConfirmMessage>
            <ButtonRow>
              <DangerButton
                type="button"
                disabled={deleteDepartmentMutation.isPending}
                onClick={() => deleteDepartmentMutation.mutate()}
              >
                확인
              </DangerButton>
              <SmallButton
                type="button"
                disabled={deleteDepartmentMutation.isPending}
                onClick={() => setIsDepartmentDeleteConfirmOpen(false)}
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

type DepartmentFieldsProps = {
  form: DepartmentFormState;
  disabled: boolean;
  setDepartmentForm: Dispatch<SetStateAction<DepartmentFormState>>;
};

function DepartmentFields({ form, disabled, setDepartmentForm }: DepartmentFieldsProps) {
  return (
    <>
      <Label>
        이름
        <TextInput
          value={form.name}
          disabled={disabled}
          onChange={(event) =>
            setDepartmentForm((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
      </Label>
      <Label>
        설명
        <TextInput
          value={form.description}
          disabled={disabled}
          onChange={(event) =>
            setDepartmentForm((current) => ({ ...current, description: event.target.value }))
          }
          required
        />
      </Label>
    </>
  );
}

const DepartmentListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const DepartmentListFrame = styled.div`
  position: relative;
  min-height: 22.35rem;
  border-radius: 0.5rem;

  @media (min-width: 120rem) {
    min-height: 22.5rem;
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

const PanelBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: rgba(17, 24, 39, 0.18);
  pointer-events: none;
  animation: fadeDepartmentPanelBackdropIn 0.18s ease-out both;

  @keyframes fadeDepartmentPanelBackdropIn {
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
  animation: slideDepartmentPanelIn 0.22s ease-out both;

  @keyframes slideDepartmentPanelIn {
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

const DetailBlock = styled.div`
  display: grid;
  gap: ${spacing.space4};

  ${List} {
    margin: 0;
  }
`;

const DetailBlockTitle = styled.h3`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const EmptyListItem = styled.li`
  display: flex;
  align-items: center;
  min-height: 2.375rem;
  padding: ${spacing.space8};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  color: #64706c;
  font-size: ${typography.fontSize13};
`;

const PermissionAddForm = styled(FormGrid)`
  margin-top: ${spacing.space12};
`;

const PermissionAddHeader = styled.div`
  padding-top: ${spacing.space12};
  border-top: 1px solid #e6e9e7;
`;

const PermissionAddTitle = styled.h4`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const PermissionItemContent = styled.span`
  display: grid;
  gap: ${spacing.space4};
  min-width: 0;
`;

const PermissionCode = styled.span`
  color: #1f2b28;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  word-break: break-word;
`;

const PermissionDescription = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  word-break: keep-all;
`;

const DepartmentSelect = styled.select`
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

const DepartmentActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
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
