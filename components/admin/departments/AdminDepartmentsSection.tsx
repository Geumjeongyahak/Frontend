"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  DepartmentDetailResponseDto,
  DepartmentListItemDto,
} from "@/api/department/department.dto";
import type { DepartmentFormState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  DangerButton,
  DataState,
  Divider,
  FormGrid,
  Label,
  List,
  ListItem,
  MetaGrid,
  MetaItem,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionHeaderRow,
  SectionTitle,
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

type AdminDepartmentsSectionProps = {
  departments: DepartmentListItemDto[];
  selectedDepartmentId: number | null;
  departmentForm: DepartmentFormState;
  departmentsQuery: QueryState<unknown>;
  departmentDetailQuery: QueryState<DepartmentDetailResponseDto>;
  createDepartmentMutation: VoidMutationAction;
  updateDepartmentMutation: VoidMutationAction;
  deleteDepartmentMutation: VoidMutationAction;
  setSelectedDepartmentId: Dispatch<SetStateAction<number | null>>;
  setDepartmentForm: Dispatch<SetStateAction<DepartmentFormState>>;
  selectDepartment: (item: DepartmentListItemDto) => void;
  emptyDepartmentForm: DepartmentFormState;
};

export function AdminDepartmentsSection({
  departments,
  selectedDepartmentId,
  departmentForm,
  departmentsQuery,
  departmentDetailQuery,
  createDepartmentMutation,
  updateDepartmentMutation,
  deleteDepartmentMutation,
  setSelectedDepartmentId,
  setDepartmentForm,
  selectDepartment,
  emptyDepartmentForm,
}: AdminDepartmentsSectionProps) {
  return (
    <TwoColumnGrid>
      <SectionCard>
        <SectionHeaderRow>
          <SectionTitle>부서 목록</SectionTitle>
          <SmallButton
            type="button"
            onClick={() => {
              setSelectedDepartmentId(null);
              setDepartmentForm(emptyDepartmentForm);
            }}
          >
            신규 개설
          </SmallButton>
        </SectionHeaderRow>
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
              {departments.map((item) => (
                <tr key={item.id} onClick={() => selectDepartment(item)}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </DataState>
      </SectionCard>
      <SectionCard>
        <SectionTitle>{selectedDepartmentId ? "부서 상세/수정" : "부서 생성"}</SectionTitle>
        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedDepartmentId) {
              updateDepartmentMutation.mutate();
            } else {
              createDepartmentMutation.mutate();
            }
          }}
        >
          <Label>
            이름
            <TextInput
              value={departmentForm.name}
              onChange={(event) =>
                setDepartmentForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            설명
            <TextInput
              value={departmentForm.description}
              onChange={(event) =>
                setDepartmentForm((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </Label>
          <ButtonRow>
            <PrimaryButton
              disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
            >
              {selectedDepartmentId ? "수정" : "생성"}
            </PrimaryButton>
            {selectedDepartmentId ? (
              <DangerButton
                type="button"
                disabled={deleteDepartmentMutation.isPending}
                onClick={() => deleteDepartmentMutation.mutate()}
              >
                삭제
              </DangerButton>
            ) : null}
          </ButtonRow>
        </FormGrid>
        <Divider />
        <SectionTitle>소속 사용자/권한</SectionTitle>
        <DataState
          isLoading={departmentDetailQuery.isLoading}
          isError={departmentDetailQuery.isError}
          isEmpty={!selectedDepartmentId}
          loadingLabel="부서 상세 불러오는 중"
          errorLabel="부서 상세를 불러오지 못했습니다."
          emptyLabel="부서를 선택하세요."
        >
          <MetaGrid>
            <MetaItem>사용자 {departmentDetailQuery.data?.users?.length ?? 0}명</MetaItem>
            <MetaItem>권한 {departmentDetailQuery.data?.permissions?.length ?? 0}개</MetaItem>
          </MetaGrid>
          <List>
            {departmentDetailQuery.data?.users?.map((item) => (
              <ListItem key={item.id}>
                <span>{item.name ?? item.email}</span>
                <span>{item.role}</span>
              </ListItem>
            ))}
          </List>
        </DataState>
      </SectionCard>
    </TwoColumnGrid>
  );
}
