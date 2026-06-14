"use client";

import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import styled from "styled-components";
import type { DepartmentListItemDto } from "@/api/department/department.dto";
import type {
  PermissionDefinitionDto,
  PermissionResponseDto,
  UserListItemDto,
  UserResponseDto,
} from "@/api/user/user.dto";
import type { PermissionFormState, UserFormState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  Divider,
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
import { formatPhoneNumber } from "@/utils/phoneNumber";

const USERS_PER_PAGE = 11;

function getDepartmentLabel(item: UserListItemDto, departments: DepartmentListItemDto[]) {
  if (item.department?.name) {
    return item.department.name;
  }

  if (typeof item.departmentId === "number") {
    return (
      departments.find((department) => department.id === item.departmentId)?.name ??
      `부서 ${item.departmentId}`
    );
  }

  return "-";
}

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

type AdminUsersSectionProps = {
  filteredUsers: UserListItemDto[];
  departments: DepartmentListItemDto[];
  selectedUserId: number | null;
  isUserEditing: boolean;
  isUserCreateModalOpen: boolean;
  isUserDeleteConfirmOpen: boolean;
  userSearch: string;
  userForm: UserFormState;
  permissionForm: PermissionFormState;
  permissionOptions: PermissionDefinitionDto[];
  availableActions: string[];
  canUseGlobalPermission: boolean;
  canUseTargetPermission: boolean;
  usersQuery: QueryState<unknown>;
  userDetailQuery: QueryState<UserResponseDto>;
  userPermissionsQuery: QueryState<PermissionResponseDto[]>;
  createUserMutation: VoidMutationAction;
  updateUserMutation: VoidMutationAction;
  deleteUserMutation: VoidMutationAction;
  addPermissionMutation: VoidMutationAction;
  removePermissionMutation: ValueMutationAction<string>;
  setSelectedUserId: Dispatch<SetStateAction<number | null>>;
  setIsUserEditing: Dispatch<SetStateAction<boolean>>;
  setIsUserCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsUserDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>;
  setUserSearch: Dispatch<SetStateAction<string>>;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
  setPermissionForm: Dispatch<SetStateAction<PermissionFormState>>;
  selectUser: (item: UserListItemDto) => void;
  emptyUserForm: UserFormState;
};

export function AdminUsersSection({
  filteredUsers,
  departments,
  selectedUserId,
  isUserEditing,
  isUserCreateModalOpen,
  isUserDeleteConfirmOpen,
  userSearch,
  userForm,
  permissionForm,
  permissionOptions,
  availableActions,
  canUseGlobalPermission,
  canUseTargetPermission,
  usersQuery,
  userDetailQuery,
  userPermissionsQuery,
  createUserMutation,
  updateUserMutation,
  deleteUserMutation,
  addPermissionMutation,
  removePermissionMutation,
  setSelectedUserId,
  setIsUserEditing,
  setIsUserCreateModalOpen,
  setIsUserDeleteConfirmOpen,
  setUserSearch,
  setUserForm,
  setPermissionForm,
  selectUser,
  emptyUserForm,
}: AdminUsersSectionProps) {
  const isDetailOpen = selectedUserId !== null;
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const requestedPage = pagination.search === userSearch ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * USERS_PER_PAGE,
    safeCurrentPage * USERS_PER_PAGE,
  );
  const permissionResources = Array.from(
    new Set(permissionOptions.map((option) => option.resourceCode).filter(Boolean)),
  );

  function closeUserDetail() {
    setSelectedUserId(null);
    setIsUserEditing(false);
    setIsUserDeleteConfirmOpen(false);
  }

  function openCreateModal() {
    setSelectedUserId(null);
    setIsUserEditing(false);
    setUserForm(emptyUserForm);
    setIsUserCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createUserMutation.isPending) {
      return;
    }

    setIsUserCreateModalOpen(false);
    setUserForm(emptyUserForm);
  }

  function cancelEditing() {
    const detail = userDetailQuery.data;

    setUserForm({
      email: detail?.email ?? userForm.email,
      nickname: detail?.nickname ?? userForm.nickname,
      password: "",
      name: detail?.name ?? userForm.name,
      phoneNumber: detail?.phoneNumber ?? userForm.phoneNumber,
      role: detail?.role ?? userForm.role,
      departmentId:
        detail?.departmentId !== null && detail?.departmentId !== undefined
          ? String(detail.departmentId)
          : typeof detail?.department?.id === "number"
            ? String(detail.department.id)
            : userForm.departmentId,
    });
    setIsUserEditing(false);
  }

  function handleUserListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedUserRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedUserRow) {
      closeUserDetail();
    }
  }

  return (
    <>
      <UserListSection $isPanelOpen={isDetailOpen} onClick={handleUserListSectionClick}>
        <SectionHeaderRow>
          <SectionTitle>사용자 목록</SectionTitle>
          <SmallButton type="button" onClick={openCreateModal}>
            신규 생성
          </SmallButton>
        </SectionHeaderRow>

        <ControlRow>
          <TextInput
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="이름, 이메일, 역할 검색"
          />
        </ControlRow>

        <UserListFrame>
          <DataState
            isLoading={usersQuery.isLoading}
            isError={usersQuery.isError}
            isEmpty={filteredUsers.length === 0}
            loadingLabel="사용자 목록 불러오는 중"
            errorLabel="사용자 목록을 불러오지 못했습니다."
            emptyLabel="사용자가 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>부서</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((item) => (
                  <tr key={item.id} onClick={() => selectUser(item)}>
                    <td>{item.name ?? item.nickname ?? "-"}</td>
                    <td>{item.email ?? "-"}</td>
                    <td>{item.role ?? "-"}</td>
                    <td>{getDepartmentLabel(item, departments)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </UserListFrame>
        <Pagination aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPagination({ page: Math.max(1, safeCurrentPage - 1), search: userSearch })
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
                onClick={() => setPagination({ page: pageNumber, search: userSearch })}
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
                search: userSearch,
              })
            }
          >
            ▶
          </PageArrowButton>
        </Pagination>

        {isDetailOpen ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="사용자 상세/수정" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="사용자 상세 닫기"
                  onClick={closeUserDetail}
                >
                  <CloseIcon aria-hidden="true" />
                </ClosePanelButton>
                <SectionTitle>{isUserEditing ? "사용자 수정" : "사용자 상세"}</SectionTitle>
              </PanelHeader>

              <DataState
                isLoading={userDetailQuery.isLoading}
                isError={userDetailQuery.isError}
                isEmpty={!selectedUserId}
                loadingLabel="사용자 상세 불러오는 중"
                errorLabel="사용자 상세를 불러오지 못했습니다."
                emptyLabel="사용자를 선택하세요."
              >
                {isUserEditing ? (
                  <FormGrid
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateUserMutation.mutate();
                    }}
                  >
                    <UserFields
                      form={userForm}
                      departments={departments}
                      disabled={updateUserMutation.isPending}
                      setUserForm={setUserForm}
                    />

                    <ButtonRow>
                      <UserActionButton
                        disabled={
                          updateUserMutation.isPending ||
                          !userForm.name.trim() ||
                          !userForm.email.trim()
                        }
                      >
                        저장
                      </UserActionButton>
                      <SmallButton
                        type="button"
                        disabled={updateUserMutation.isPending}
                        onClick={cancelEditing}
                      >
                        취소
                      </SmallButton>
                    </ButtonRow>
                  </FormGrid>
                ) : (
                  <DetailFormView>
                    <UserFields
                      form={userForm}
                      departments={departments}
                      disabled
                      setUserForm={setUserForm}
                    />

                    <ButtonRow>
                      <UserActionButton
                        type="button"
                        disabled={!selectedUserId}
                        onClick={() => setIsUserEditing(true)}
                      >
                        수정
                      </UserActionButton>
                      <DangerButton
                        type="button"
                        disabled={deleteUserMutation.isPending}
                        onClick={() => setIsUserDeleteConfirmOpen(true)}
                      >
                        삭제
                      </DangerButton>
                    </ButtonRow>
                  </DetailFormView>
                )}

                <Divider />
                <SectionTitle>직접 권한</SectionTitle>
                <DataState
                  isLoading={userPermissionsQuery.isLoading}
                  isError={userPermissionsQuery.isError}
                  isEmpty={!selectedUserId || (userPermissionsQuery.data?.length ?? 0) === 0}
                  loadingLabel="권한 목록 불러오는 중"
                  errorLabel="권한 목록을 불러오지 못했습니다."
                  emptyLabel={
                    selectedUserId ? "직접 부여된 권한이 없습니다." : "사용자를 선택하세요."
                  }
                >
                  <List>
                    {userPermissionsQuery.data?.map((permission) => {
                      const code = permission.permissionCode ?? permission.code ?? "";
                      return (
                        <ListItem key={code || permission.id}>
                          <span>{code || permission.label || "-"}</span>
                          {code ? (
                            <SmallButton
                              type="button"
                              disabled={removePermissionMutation.isPending}
                              onClick={() => removePermissionMutation.mutate(code)}
                            >
                              제거
                            </SmallButton>
                          ) : null}
                        </ListItem>
                      );
                    })}
                  </List>
                </DataState>

                <FormGrid
                  onSubmit={(event) => {
                    event.preventDefault();
                    addPermissionMutation.mutate();
                  }}
                >
                  <Label>
                    리소스
                    <UserSelect
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
                    </UserSelect>
                  </Label>
                  <Label>
                    액션
                    <UserSelect
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
                    </UserSelect>
                  </Label>
                  <Label>
                    범위
                    <UserSelect
                      value={permissionForm.scope}
                      onChange={(event) =>
                        setPermissionForm((current) => ({
                          ...current,
                          scope: event.target.value as PermissionFormState["scope"],
                          target: event.target.value === "GLOBAL" ? "" : current.target,
                        }))
                      }
                    >
                      <option value="GLOBAL" disabled={!canUseGlobalPermission}>
                        전체 권한
                      </option>
                      <option value="TARGET" disabled={!canUseTargetPermission}>
                        특정 대상 권한
                      </option>
                    </UserSelect>
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
                  <UserActionButton
                    disabled={
                      !selectedUserId ||
                      addPermissionMutation.isPending ||
                      !permissionForm.resourceType ||
                      !permissionForm.actionType ||
                      (permissionForm.scope === "TARGET" && !permissionForm.target.trim())
                    }
                  >
                    권한 추가
                  </UserActionButton>
                </FormGrid>
              </DataState>
            </SlidePanel>
          </>
        ) : null}
      </UserListSection>

      {isUserCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeCreateModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="user-create-modal-title">사용자 생성</SectionTitle>
              <SmallButton
                type="button"
                disabled={createUserMutation.isPending}
                onClick={closeCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>
            <FormGrid
              onSubmit={(event) => {
                event.preventDefault();
                createUserMutation.mutate();
              }}
            >
              <UserFields
                form={userForm}
                departments={departments}
                disabled={createUserMutation.isPending}
                setUserForm={setUserForm}
                includePassword
              />
              <ButtonRow>
                <UserActionButton
                  disabled={
                    createUserMutation.isPending ||
                    !userForm.name.trim() ||
                    !userForm.email.trim() ||
                    !userForm.password
                  }
                >
                  생성
                </UserActionButton>
                <SmallButton
                  type="button"
                  disabled={createUserMutation.isPending}
                  onClick={closeCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      {isUserDeleteConfirmOpen ? (
        <ModalBackdrop onMouseDown={() => setIsUserDeleteConfirmOpen(false)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-delete-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="user-delete-confirm-title">사용자 삭제</ConfirmTitle>
            <ConfirmMessage>삭제하시겠습니까?</ConfirmMessage>
            <ButtonRow>
              <DangerButton
                type="button"
                disabled={deleteUserMutation.isPending}
                onClick={() => deleteUserMutation.mutate()}
              >
                확인
              </DangerButton>
              <SmallButton
                type="button"
                disabled={deleteUserMutation.isPending}
                onClick={() => setIsUserDeleteConfirmOpen(false)}
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

type UserFieldsProps = {
  form: UserFormState;
  departments: DepartmentListItemDto[];
  disabled: boolean;
  includePassword?: boolean;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
};

function UserFields({
  form,
  departments,
  disabled,
  includePassword = false,
  setUserForm,
}: UserFieldsProps) {
  return (
    <>
      <Label>
        이름
        <TextInput
          value={form.name}
          disabled={disabled}
          onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
      </Label>
      <Label>
        이메일
        <TextInput
          type="email"
          value={form.email}
          disabled={disabled}
          onChange={(event) =>
            setUserForm((current) => ({ ...current, email: event.target.value }))
          }
          required
        />
      </Label>
      {includePassword ? (
        <Label>
          비밀번호
          <TextInput
            type="password"
            value={form.password}
            disabled={disabled}
            onChange={(event) =>
              setUserForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </Label>
      ) : null}
      <Label>
        전화번호
        <TextInput
          value={form.phoneNumber}
          disabled={disabled}
          onChange={(event) =>
            setUserForm((current) => ({
              ...current,
              phoneNumber: formatPhoneNumber(event.target.value),
            }))
          }
        />
      </Label>
      <Label>
        역할
        <UserSelect
          value={form.role}
          disabled={disabled}
          onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="VOLUNTEER">VOLUNTEER</option>
          <option value="GUEST">GUEST</option>
        </UserSelect>
      </Label>
      <Label>
        부서
        <UserSelect
          value={form.departmentId}
          disabled={disabled}
          onChange={(event) =>
            setUserForm((current) => ({ ...current, departmentId: event.target.value }))
          }
        >
          <option value="">부서 없음</option>
          {departments
            .filter((department) => typeof department.id === "number")
            .map((department) => (
              <option key={department.id} value={String(department.id)}>
                {department.name ?? `부서 ${department.id}`}
              </option>
            ))}
        </UserSelect>
      </Label>
    </>
  );
}

const UserListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const UserListFrame = styled.div`
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
  animation: fadeUserPanelBackdropIn 0.18s ease-out both;

  @keyframes fadeUserPanelBackdropIn {
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
  animation: slideUserPanelIn 0.22s ease-out both;

  @keyframes slideUserPanelIn {
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
  gap: ${spacing.space4};

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

const UserSelect = styled.select`
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

const UserActionButton = styled.button`
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
