"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ClassroomListItemDto } from "@/api/classroom/classroom.dto";
import type { ClassroomFormState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  InlineStatus,
  Label,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionHeaderRow,
  SectionTitle,
  Select,
  SmallButton,
  StableListArea,
  Table,
  TextInput,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";

type QueryState = {
  isLoading: boolean;
  isError: boolean;
};

type VoidMutationAction = {
  isPending: boolean;
  mutate: () => void;
};

type AdminClassroomsSectionProps = {
  classrooms: ClassroomListItemDto[];
  selectedClassroomId: number | null;
  classroomSearch: string;
  classroomForm: ClassroomFormState;
  classroomsQuery: QueryState;
  classroomDetailQuery: QueryState;
  createClassroomMutation: VoidMutationAction;
  updateClassroomMutation: VoidMutationAction;
  deleteClassroomMutation: VoidMutationAction;
  setSelectedClassroomId: Dispatch<SetStateAction<number | null>>;
  setClassroomSearch: Dispatch<SetStateAction<string>>;
  setClassroomForm: Dispatch<SetStateAction<ClassroomFormState>>;
  selectClassroom: (item: ClassroomListItemDto) => void;
  emptyClassroomForm: ClassroomFormState;
};

export function AdminClassroomsSection({
  classrooms,
  selectedClassroomId,
  classroomSearch,
  classroomForm,
  classroomsQuery,
  classroomDetailQuery,
  createClassroomMutation,
  updateClassroomMutation,
  deleteClassroomMutation,
  setSelectedClassroomId,
  setClassroomSearch,
  setClassroomForm,
  selectClassroom,
  emptyClassroomForm,
}: AdminClassroomsSectionProps) {
  return (
    <TwoColumnGrid>
      <SectionCard>
        <SectionHeaderRow>
          <SectionTitle>분반 목록</SectionTitle>
          <SmallButton
            type="button"
            onClick={() => {
              setSelectedClassroomId(null);
              setClassroomForm(emptyClassroomForm);
            }}
          >
            신규 개설
          </SmallButton>
        </SectionHeaderRow>
        <ControlRow>
          <TextInput
            value={classroomSearch}
            onChange={(event) => setClassroomSearch(event.target.value)}
            placeholder="분반명 검색"
          />
        </ControlRow>
        <StableListArea>
          <DataState
            isLoading={classroomsQuery.isLoading}
            isError={classroomsQuery.isError}
            isEmpty={classrooms.length === 0}
            loadingLabel="분반 목록 불러오는 중"
            errorLabel="분반 목록을 불러오지 못했습니다."
            emptyLabel="분반이 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>유형</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((item) => (
                  <tr key={item.id} onClick={() => selectClassroom(item)}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </StableListArea>
      </SectionCard>
      <SectionCard>
        <SectionTitle>{selectedClassroomId ? "분반 상세/수정" : "분반 생성"}</SectionTitle>
        {classroomDetailQuery.isLoading ? (
          <InlineStatus>분반 상세를 불러오는 중입니다.</InlineStatus>
        ) : null}
        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedClassroomId) {
              updateClassroomMutation.mutate();
            } else {
              createClassroomMutation.mutate();
            }
          }}
        >
          <Label>
            이름
            <TextInput
              value={classroomForm.name}
              onChange={(event) =>
                setClassroomForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            유형
            <Select
              value={classroomForm.type}
              onChange={(event) =>
                setClassroomForm((current) => ({ ...current, type: event.target.value }))
              }
            >
              <option value="WEEKDAY">WEEKDAY</option>
              <option value="WEEKEND">WEEKEND</option>
            </Select>
          </Label>
          <Label>
            설명
            <TextInput
              value={classroomForm.description}
              onChange={(event) =>
                setClassroomForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Label>
          <ButtonRow>
            <PrimaryButton
              disabled={createClassroomMutation.isPending || updateClassroomMutation.isPending}
            >
              {selectedClassroomId ? "수정" : "생성"}
            </PrimaryButton>
            {selectedClassroomId ? (
              <DangerButton
                type="button"
                disabled={deleteClassroomMutation.isPending}
                onClick={() => deleteClassroomMutation.mutate()}
              >
                삭제
              </DangerButton>
            ) : null}
          </ButtonRow>
        </FormGrid>
      </SectionCard>
    </TwoColumnGrid>
  );
}
