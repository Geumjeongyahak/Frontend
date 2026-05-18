"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ChannelListItemDto } from "@/api/channel/channel.dto";
import type { ChannelFormState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  CheckLabel,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  Label,
  MetaGrid,
  MetaItem,
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

type AdminChannelsSectionProps = {
  channels: ChannelListItemDto[];
  selectedChannelId: number | null;
  channelSearch: string;
  channelForm: ChannelFormState;
  channelsQuery: QueryState<unknown>;
  channelDetailQuery: QueryState<ChannelListItemDto>;
  createChannelMutation: VoidMutationAction;
  updateChannelMutation: VoidMutationAction;
  deleteChannelMutation: VoidMutationAction;
  setSelectedChannelId: Dispatch<SetStateAction<number | null>>;
  setChannelSearch: Dispatch<SetStateAction<string>>;
  setChannelForm: Dispatch<SetStateAction<ChannelFormState>>;
  selectChannel: (item: ChannelListItemDto) => void;
  emptyChannelForm: ChannelFormState;
};

export function AdminChannelsSection({
  channels,
  selectedChannelId,
  channelSearch,
  channelForm,
  channelsQuery,
  channelDetailQuery,
  createChannelMutation,
  updateChannelMutation,
  deleteChannelMutation,
  setSelectedChannelId,
  setChannelSearch,
  setChannelForm,
  selectChannel,
  emptyChannelForm,
}: AdminChannelsSectionProps) {
  return (
    <TwoColumnGrid>
      <SectionCard>
        <SectionHeaderRow>
          <SectionTitle>채널 목록</SectionTitle>
          <SmallButton
            type="button"
            onClick={() => {
              setSelectedChannelId(null);
              setChannelForm(emptyChannelForm);
            }}
          >
            신규 개설
          </SmallButton>
        </SectionHeaderRow>
        <ControlRow>
          <TextInput
            value={channelSearch}
            onChange={(event) => setChannelSearch(event.target.value)}
            placeholder="채널명 검색"
          />
        </ControlRow>
        <DataState
          isLoading={channelsQuery.isLoading}
          isError={channelsQuery.isError}
          isEmpty={channels.length === 0}
          loadingLabel="채널 목록 불러오는 중"
          errorLabel="채널 목록을 불러오지 못했습니다."
          emptyLabel="채널이 없습니다."
        >
          <Table>
            <thead>
              <tr>
                <th>이름</th>
                <th>유형</th>
                <th>연결</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((item) => (
                <tr key={item.id} onClick={() => selectChannel(item)}>
                  <td>{item.name}</td>
                  <td>{item.channelType}</td>
                  <td>{item.refId ?? "-"}</td>
                  <td>{item.isActive ? "활성" : "비활성"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </DataState>
      </SectionCard>
      <SectionCard>
        <SectionTitle>{selectedChannelId ? "채널 상세/수정" : "채널 생성"}</SectionTitle>
        <MetaGrid>
          <MetaItem>유형: {channelDetailQuery.data?.channelType ?? "-"}</MetaItem>
          <MetaItem>바인딩: {channelDetailQuery.data?.bindingType ?? "-"}</MetaItem>
          <MetaItem>연결 대상: {channelDetailQuery.data?.refId ?? "-"}</MetaItem>
        </MetaGrid>
        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedChannelId) {
              updateChannelMutation.mutate();
            } else {
              createChannelMutation.mutate();
            }
          }}
        >
          <Label>
            이름
            <TextInput
              value={channelForm.name}
              onChange={(event) =>
                setChannelForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            설명
            <TextInput
              value={channelForm.description}
              onChange={(event) =>
                setChannelForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Label>
          <Label>
            접근 수준
            <Select
              value={channelForm.accessLevel}
              onChange={(event) =>
                setChannelForm((current) => ({ ...current, accessLevel: event.target.value }))
              }
            >
              <option value="CLOSED">CLOSED</option>
              <option value="READ_ONLY">READ_ONLY</option>
              <option value="READ_COMMENT">READ_COMMENT</option>
              <option value="READ_WRITE">READ_WRITE</option>
            </Select>
          </Label>
          <CheckLabel>
            <input
              type="checkbox"
              checked={channelForm.allowGuestRead}
              onChange={(event) =>
                setChannelForm((current) => ({ ...current, allowGuestRead: event.target.checked }))
              }
            />{" "}
            게스트 읽기
          </CheckLabel>
          <CheckLabel>
            <input
              type="checkbox"
              checked={channelForm.isDefault}
              onChange={(event) =>
                setChannelForm((current) => ({ ...current, isDefault: event.target.checked }))
              }
            />{" "}
            기본 채널
          </CheckLabel>
          <CheckLabel>
            <input
              type="checkbox"
              checked={channelForm.isActive}
              onChange={(event) =>
                setChannelForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />{" "}
            활성
          </CheckLabel>
          <ButtonRow>
            <PrimaryButton
              disabled={createChannelMutation.isPending || updateChannelMutation.isPending}
            >
              {selectedChannelId ? "수정" : "생성"}
            </PrimaryButton>
            {selectedChannelId ? (
              <DangerButton
                type="button"
                disabled={deleteChannelMutation.isPending}
                onClick={() => deleteChannelMutation.mutate()}
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
