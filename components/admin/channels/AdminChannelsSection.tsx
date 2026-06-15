"use client";

import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import styled from "styled-components";
import type { ChannelAccessLevel, ChannelListItemDto } from "@/api/channel/channel.dto";
import type { ChannelFormState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  CheckLabel,
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

const CHANNELS_PER_PAGE = 11;

type QueryState<TData = unknown> = {
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
  isChannelEditing: boolean;
  isChannelCreateModalOpen: boolean;
  isChannelDeleteConfirmOpen: boolean;
  channelSearch: string;
  channelForm: ChannelFormState;
  channelsQuery: QueryState;
  channelDetailQuery: QueryState<ChannelListItemDto>;
  createChannelMutation: VoidMutationAction;
  updateChannelMutation: VoidMutationAction;
  deleteChannelMutation: VoidMutationAction;
  setSelectedChannelId: Dispatch<SetStateAction<number | null>>;
  setIsChannelEditing: Dispatch<SetStateAction<boolean>>;
  setIsChannelCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsChannelDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>;
  setChannelSearch: Dispatch<SetStateAction<string>>;
  setChannelForm: Dispatch<SetStateAction<ChannelFormState>>;
  selectChannel: (item: ChannelListItemDto) => void;
  emptyChannelForm: ChannelFormState;
};

function formatChannelStatus(isActive?: boolean) {
  return isActive === false ? "비활성" : "활성";
}

export function AdminChannelsSection({
  channels,
  selectedChannelId,
  isChannelEditing,
  isChannelCreateModalOpen,
  isChannelDeleteConfirmOpen,
  channelSearch,
  channelForm,
  channelsQuery,
  channelDetailQuery,
  createChannelMutation,
  updateChannelMutation,
  deleteChannelMutation,
  setSelectedChannelId,
  setIsChannelEditing,
  setIsChannelCreateModalOpen,
  setIsChannelDeleteConfirmOpen,
  setChannelSearch,
  setChannelForm,
  selectChannel,
  emptyChannelForm,
}: AdminChannelsSectionProps) {
  const isDetailOpen = selectedChannelId !== null;
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const totalPages = Math.max(1, Math.ceil(channels.length / CHANNELS_PER_PAGE));
  const requestedPage = pagination.search === channelSearch ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedChannels = channels.slice(
    (safeCurrentPage - 1) * CHANNELS_PER_PAGE,
    safeCurrentPage * CHANNELS_PER_PAGE,
  );

  function closeChannelDetail() {
    setSelectedChannelId(null);
    setIsChannelEditing(false);
    setIsChannelDeleteConfirmOpen(false);
  }

  function openCreateModal() {
    setSelectedChannelId(null);
    setIsChannelEditing(false);
    setChannelForm(emptyChannelForm);
    setIsChannelCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createChannelMutation.isPending) {
      return;
    }

    setIsChannelCreateModalOpen(false);
    setChannelForm(emptyChannelForm);
  }

  function cancelEditing() {
    const detail = channelDetailQuery.data;

    setChannelForm({
      name: detail?.name ?? channelForm.name,
      description: detail?.description ?? channelForm.description,
      accessLevel: detail?.accessLevel ?? channelForm.accessLevel,
      allowGuestRead: detail?.allowGuestRead ?? channelForm.allowGuestRead,
      isDefault: detail?.isDefault ?? channelForm.isDefault,
      isActive: detail?.isActive ?? channelForm.isActive,
    });
    setIsChannelEditing(false);
  }

  function handleChannelListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedChannelRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedChannelRow) {
      closeChannelDetail();
    }
  }

  return (
    <>
      <ChannelListSection $isPanelOpen={isDetailOpen} onClick={handleChannelListSectionClick}>
        <SectionHeaderRow>
          <SectionTitle>채널 목록</SectionTitle>
          <SmallButton type="button" onClick={openCreateModal}>
            신규 개설
          </SmallButton>
        </SectionHeaderRow>

        <ControlRow>
          <TextInput
            value={channelSearch}
            onChange={(event) => setChannelSearch(event.target.value)}
            placeholder="채널명, 유형, 설명, ID 검색"
          />
        </ControlRow>

        <ChannelListFrame>
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
                {pagedChannels.map((item) => (
                  <tr key={item.id} onClick={() => selectChannel(item)}>
                    <td>{item.name ?? "-"}</td>
                    <td>{item.channelType ?? "-"}</td>
                    <td>{item.refId ?? "-"}</td>
                    <td>{formatChannelStatus(item.isActive)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </ChannelListFrame>

        <Pagination aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPagination({ page: Math.max(1, safeCurrentPage - 1), search: channelSearch })
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
                onClick={() => setPagination({ page: pageNumber, search: channelSearch })}
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
                search: channelSearch,
              })
            }
          >
            ▶
          </PageArrowButton>
        </Pagination>

        {isDetailOpen ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="채널 상세/수정" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="채널 상세 닫기"
                  onClick={closeChannelDetail}
                >
                  <CloseIcon aria-hidden="true" />
                </ClosePanelButton>
                <SectionTitle>{isChannelEditing ? "채널 수정" : "채널 상세"}</SectionTitle>
              </PanelHeader>

              <DataState
                isLoading={channelDetailQuery.isLoading}
                isError={channelDetailQuery.isError}
                isEmpty={!selectedChannelId}
                loadingLabel="채널 상세 불러오는 중"
                errorLabel="채널 상세를 불러오지 못했습니다."
                emptyLabel="채널을 선택하세요."
              >
                <PanelContent>
                  <DetailFormView>
                    <ChannelFields
                      form={channelForm}
                      disabled={!isChannelEditing || updateChannelMutation.isPending}
                      setChannelForm={setChannelForm}
                    />
                  </DetailFormView>

                  <DetailBlock>
                    <DetailBlockTitle>채널 정보</DetailBlockTitle>
                    <List>
                      <ListItem>
                        <span>유형</span>
                        <span>{channelDetailQuery.data?.channelType ?? "-"}</span>
                      </ListItem>
                      <ListItem>
                        <span>바인딩</span>
                        <span>{channelDetailQuery.data?.bindingType ?? "-"}</span>
                      </ListItem>
                      <ListItem>
                        <span>연결 대상</span>
                        <span>{channelDetailQuery.data?.refId ?? "-"}</span>
                      </ListItem>
                    </List>
                  </DetailBlock>

                  <ButtonRow>
                    {isChannelEditing ? (
                      <>
                        <ChannelActionButton
                          type="button"
                          onClick={() => updateChannelMutation.mutate()}
                          disabled={updateChannelMutation.isPending || !channelForm.name.trim()}
                        >
                          저장
                        </ChannelActionButton>
                        <SmallButton
                          type="button"
                          disabled={updateChannelMutation.isPending}
                          onClick={cancelEditing}
                        >
                          취소
                        </SmallButton>
                      </>
                    ) : (
                      <>
                        <ChannelActionButton
                          type="button"
                          disabled={!selectedChannelId}
                          onClick={() => setIsChannelEditing(true)}
                        >
                          수정
                        </ChannelActionButton>
                        <DangerButton
                          type="button"
                          disabled={deleteChannelMutation.isPending}
                          onClick={() => setIsChannelDeleteConfirmOpen(true)}
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
      </ChannelListSection>

      {isChannelCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeCreateModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="channel-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="channel-create-modal-title">채널 생성</SectionTitle>
              <SmallButton
                type="button"
                disabled={createChannelMutation.isPending}
                onClick={closeCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>
            <FormGrid
              onSubmit={(event) => {
                event.preventDefault();
                createChannelMutation.mutate();
              }}
            >
              <ChannelFields
                form={channelForm}
                disabled={createChannelMutation.isPending}
                setChannelForm={setChannelForm}
              />
              <ButtonRow>
                <ChannelActionButton
                  type="submit"
                  disabled={createChannelMutation.isPending || !channelForm.name.trim()}
                >
                  생성
                </ChannelActionButton>
                <SmallButton
                  type="button"
                  disabled={createChannelMutation.isPending}
                  onClick={closeCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      {isChannelDeleteConfirmOpen ? (
        <ModalBackdrop onMouseDown={() => setIsChannelDeleteConfirmOpen(false)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="channel-delete-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="channel-delete-confirm-title">채널 삭제</ConfirmTitle>
            <ConfirmMessage>삭제하시겠습니까?</ConfirmMessage>
            <ButtonRow>
              <DangerButton
                type="button"
                disabled={deleteChannelMutation.isPending}
                onClick={() => deleteChannelMutation.mutate()}
              >
                확인
              </DangerButton>
              <SmallButton
                type="button"
                disabled={deleteChannelMutation.isPending}
                onClick={() => setIsChannelDeleteConfirmOpen(false)}
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

type ChannelFieldsProps = {
  form: ChannelFormState;
  disabled: boolean;
  setChannelForm: Dispatch<SetStateAction<ChannelFormState>>;
};

function ChannelFields({ form, disabled, setChannelForm }: ChannelFieldsProps) {
  return (
    <>
      <Label>
        이름
        <TextInput
          value={form.name}
          disabled={disabled}
          onChange={(event) =>
            setChannelForm((current) => ({ ...current, name: event.target.value }))
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
            setChannelForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </Label>
      <Label>
        접근 수준
        <ChannelSelect
          value={form.accessLevel}
          disabled={disabled}
          onChange={(event) =>
            setChannelForm((current) => ({
              ...current,
              accessLevel: event.target.value as ChannelAccessLevel,
            }))
          }
        >
          <option value="CLOSED">CLOSED</option>
          <option value="READ_ONLY">READ_ONLY</option>
          <option value="READ_COMMENT">READ_COMMENT</option>
          <option value="READ_WRITE">READ_WRITE</option>
        </ChannelSelect>
      </Label>
      <CheckLabel>
        <input
          type="checkbox"
          checked={form.allowGuestRead}
          disabled={disabled}
          onChange={(event) =>
            setChannelForm((current) => ({ ...current, allowGuestRead: event.target.checked }))
          }
        />{" "}
        게스트 읽기
      </CheckLabel>
      <CheckLabel>
        <input
          type="checkbox"
          checked={form.isDefault}
          disabled={disabled}
          onChange={(event) =>
            setChannelForm((current) => ({ ...current, isDefault: event.target.checked }))
          }
        />{" "}
        기본 채널
      </CheckLabel>
      <CheckLabel>
        <input
          type="checkbox"
          checked={form.isActive}
          disabled={disabled}
          onChange={(event) =>
            setChannelForm((current) => ({ ...current, isActive: event.target.checked }))
          }
        />{" "}
        활성
      </CheckLabel>
    </>
  );
}

const ChannelListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const ChannelListFrame = styled.div`
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
  animation: fadeChannelPanelBackdropIn 0.18s ease-out both;

  @keyframes fadeChannelPanelBackdropIn {
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
  animation: slideChannelPanelIn 0.22s ease-out both;

  @keyframes slideChannelPanelIn {
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

const ChannelSelect = styled.select`
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

const ChannelActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
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
