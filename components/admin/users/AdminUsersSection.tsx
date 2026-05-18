"use client";

import type { Dispatch, SetStateAction } from "react";
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
  InlineStatus,
  Label,
  List,
  ListItem,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionHeaderRow,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextInput,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";

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
  selectedUserId: number | null;
  userSearch: string;
  userForm: UserFormState;
  permissionForm: PermissionFormState;
  permissionOptions: PermissionDefinitionDto[];
  availableActions: string[];
  canUseGlobalPermission: boolean;
  canUseTargetPermission: boolean;
  generatedPermissionCode: string;
  usersQuery: QueryState<unknown>;
  userDetailQuery: QueryState<UserResponseDto>;
  userPermissionsQuery: QueryState<PermissionResponseDto[]>;
  createUserMutation: VoidMutationAction;
  updateUserMutation: VoidMutationAction;
  deleteUserMutation: VoidMutationAction;
  addPermissionMutation: VoidMutationAction;
  removePermissionMutation: ValueMutationAction<string>;
  setSelectedUserId: Dispatch<SetStateAction<number | null>>;
  setUserSearch: Dispatch<SetStateAction<string>>;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
  setPermissionForm: Dispatch<SetStateAction<PermissionFormState>>;
  selectUser: (item: UserListItemDto) => void;
  emptyUserForm: UserFormState;
};

export function AdminUsersSection({
  filteredUsers,
  selectedUserId,
  userSearch,
  userForm,
  permissionForm,
  permissionOptions,
  availableActions,
  canUseGlobalPermission,
  canUseTargetPermission,
  generatedPermissionCode,
  usersQuery,
  userDetailQuery,
  userPermissionsQuery,
  createUserMutation,
  updateUserMutation,
  deleteUserMutation,
  addPermissionMutation,
  removePermissionMutation,
  setSelectedUserId,
  setUserSearch,
  setUserForm,
  setPermissionForm,
  selectUser,
  emptyUserForm,
}: AdminUsersSectionProps) {
  return (
    <TwoColumnGrid>
      <SectionCard>
        <SectionHeaderRow>
          <SectionTitle>사용자 목록</SectionTitle>
          <SmallButton
            type="button"
            onClick={() => {
              setSelectedUserId(null);
              setUserForm(emptyUserForm);
            }}
          >
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
              {filteredUsers.map((item) => (
                <tr key={item.id} onClick={() => selectUser(item)}>
                  <td>{item.name ?? item.nickname ?? "-"}</td>
                  <td>{item.email ?? "-"}</td>
                  <td>{item.role ?? "-"}</td>
                  <td>{item.departmentId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </DataState>
      </SectionCard>
      <SectionCard>
        <SectionTitle>{selectedUserId ? "사용자 상세/수정" : "사용자 생성"}</SectionTitle>
        {userDetailQuery.isLoading ? (
          <InlineStatus>사용자 상세를 불러오는 중입니다.</InlineStatus>
        ) : null}
        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedUserId) {
              updateUserMutation.mutate();
            } else {
              createUserMutation.mutate();
            }
          }}
        >
          <Label>
            이메일
            <TextInput
              value={userForm.email}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            닉네임
            <TextInput
              value={userForm.nickname}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, nickname: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            비밀번호
            <TextInput
              type="password"
              value={userForm.password}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder={selectedUserId ? "수정 시 변경하지 않음" : ""}
              required={!selectedUserId}
            />
          </Label>
          <Label>
            이름
            <TextInput
              value={userForm.name}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            전화번호
            <TextInput
              value={userForm.phoneNumber}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, phoneNumber: event.target.value }))
              }
            />
          </Label>
          <Label>
            역할
            <Select
              value={userForm.role}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, role: event.target.value }))
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="VOLUNTEER">VOLUNTEER</option>
              <option value="GUEST">GUEST</option>
            </Select>
          </Label>
          <Label>
            부서 ID
            <TextInput
              value={userForm.departmentId}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, departmentId: event.target.value }))
              }
            />
          </Label>
          <ButtonRow>
            <PrimaryButton disabled={createUserMutation.isPending || updateUserMutation.isPending}>
              {selectedUserId ? "수정" : "생성"}
            </PrimaryButton>
            {selectedUserId ? (
              <DangerButton
                type="button"
                disabled={deleteUserMutation.isPending}
                onClick={() => deleteUserMutation.mutate()}
              >
                삭제
              </DangerButton>
            ) : null}
          </ButtonRow>
        </FormGrid>
        <Divider />
        <SectionTitle>직접 권한</SectionTitle>
        <DataState
          isLoading={userPermissionsQuery.isLoading}
          isError={userPermissionsQuery.isError}
          isEmpty={!selectedUserId || (userPermissionsQuery.data?.length ?? 0) === 0}
          loadingLabel="권한 목록 불러오는 중"
          errorLabel="권한 목록을 불러오지 못했습니다."
          emptyLabel={selectedUserId ? "직접 부여된 권한이 없습니다." : "사용자를 선택하세요."}
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
            <Select
              value={permissionForm.resourceType}
              onChange={(event) =>
                setPermissionForm((current) => ({
                  ...current,
                  resourceType: event.target.value,
                  actionType: "",
                }))
              }
            >
              {Array.from(
                new Set(permissionOptions.map((option) => option.resourceCode).filter(Boolean)),
              ).map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            액션
            <Select
              value={permissionForm.actionType}
              onChange={(event) =>
                setPermissionForm((current) => ({ ...current, actionType: event.target.value }))
              }
            >
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            범위
            <Select
              value={permissionForm.scope}
              onChange={(event) =>
                setPermissionForm((current) => ({
                  ...current,
                  scope: event.target.value as PermissionFormState["scope"],
                }))
              }
            >
              <option value="GLOBAL" disabled={!canUseGlobalPermission}>
                전체 권한
              </option>
              <option value="TARGET" disabled={!canUseTargetPermission}>
                특정 대상 권한
              </option>
            </Select>
          </Label>
          <Label>
            대상 ID
            <TextInput
              value={permissionForm.target}
              disabled={permissionForm.scope === "GLOBAL"}
              onChange={(event) =>
                setPermissionForm((current) => ({ ...current, target: event.target.value }))
              }
            />
          </Label>
          <PrimaryButton
            disabled={
              !selectedUserId ||
              addPermissionMutation.isPending ||
              (permissionForm.scope === "TARGET" && !permissionForm.target.trim())
            }
          >
            권한 추가
          </PrimaryButton>
        </FormGrid>
      </SectionCard>
    </TwoColumnGrid>
  );
}
