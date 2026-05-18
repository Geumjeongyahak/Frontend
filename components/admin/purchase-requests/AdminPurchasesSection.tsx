"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ClassroomListItemDto } from "@/api/classroom/classroom.dto";
import type {
  PurchaseRequestListItemDto,
  PurchaseRequestResponseDto,
  PurchaseRequestStatus,
} from "@/api/request/request.dto";
import type { PurchaseCreateState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  Label,
  List,
  ListItem,
  MetaGrid,
  MetaItem,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextArea,
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

type AdminPurchasesSectionProps = {
  classrooms: ClassroomListItemDto[];
  purchases: PurchaseRequestListItemDto[];
  selectedPurchaseId: number | null;
  purchaseStatus: PurchaseRequestStatus | "";
  purchaseCreate: PurchaseCreateState;
  reviewNote: string;
  approvedAmount: string;
  purchasesQuery: QueryState<unknown>;
  purchaseDetailQuery: QueryState<PurchaseRequestResponseDto>;
  createPurchaseMutation: VoidMutationAction;
  approvePurchaseMutation: VoidMutationAction;
  rejectPurchaseMutation: VoidMutationAction;
  confirmPurchaseMutation: VoidMutationAction;
  deletePurchaseMutation: VoidMutationAction;
  setPurchaseStatus: Dispatch<SetStateAction<PurchaseRequestStatus | "">>;
  setPurchaseCreate: Dispatch<SetStateAction<PurchaseCreateState>>;
  setSelectedPurchaseId: Dispatch<SetStateAction<number | null>>;
  setReviewNote: Dispatch<SetStateAction<string>>;
  setApprovedAmount: Dispatch<SetStateAction<string>>;
};

export function AdminPurchasesSection({
  classrooms,
  purchases,
  selectedPurchaseId,
  purchaseStatus,
  purchaseCreate,
  reviewNote,
  approvedAmount,
  purchasesQuery,
  purchaseDetailQuery,
  createPurchaseMutation,
  approvePurchaseMutation,
  rejectPurchaseMutation,
  confirmPurchaseMutation,
  deletePurchaseMutation,
  setPurchaseStatus,
  setPurchaseCreate,
  setSelectedPurchaseId,
  setReviewNote,
  setApprovedAmount,
}: AdminPurchasesSectionProps) {
  return (
    <>
      <SectionCard>
        <SectionTitle>구매 요청 작성</SectionTitle>
        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            createPurchaseMutation.mutate();
          }}
        >
          <Label>
            제목
            <TextInput
              value={purchaseCreate.title}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            내용
            <TextArea
              value={purchaseCreate.content}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, content: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            분반
            <Select
              value={purchaseCreate.classroomId}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, classroomId: event.target.value }))
              }
              required
            >
              <option value="">분반 선택</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            선금 요청 금액
            <TextInput
              value={purchaseCreate.advancePaymentRequestedAmount}
              onChange={(event) =>
                setPurchaseCreate((current) => ({
                  ...current,
                  advancePaymentRequestedAmount: event.target.value,
                }))
              }
            />
          </Label>
          <Label>
            품목명
            <TextInput
              value={purchaseCreate.itemName}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, itemName: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            구매 사유
            <TextInput
              value={purchaseCreate.itemReason}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, itemReason: event.target.value }))
              }
            />
          </Label>
          <Label>
            예상 금액
            <TextInput
              value={purchaseCreate.itemExpectedPrice}
              onChange={(event) =>
                setPurchaseCreate((current) => ({
                  ...current,
                  itemExpectedPrice: event.target.value,
                }))
              }
            />
          </Label>
          <PrimaryButton disabled={createPurchaseMutation.isPending || !purchaseCreate.classroomId}>
            구매 요청 작성
          </PrimaryButton>
        </FormGrid>
      </SectionCard>
      <TwoColumnGrid>
        <SectionCard>
          <SectionTitle>구매 요청 목록</SectionTitle>
          <ControlRow>
            <Select
              value={purchaseStatus}
              onChange={(event) =>
                setPurchaseStatus(event.target.value as PurchaseRequestStatus | "")
              }
            >
              <option value="">전체</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PURCHASED">PURCHASED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>
          </ControlRow>
          <DataState
            isLoading={purchasesQuery.isLoading}
            isError={purchasesQuery.isError}
            isEmpty={purchases.length === 0}
            loadingLabel="구매 요청 목록 불러오는 중"
            errorLabel="구매 요청 목록을 불러오지 못했습니다."
            emptyLabel="구매 요청이 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>분반</th>
                  <th>요청자</th>
                  <th>상태</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((item) => (
                  <tr key={item.id} onClick={() => item.id && setSelectedPurchaseId(item.id)}>
                    <td>{item.title}</td>
                    <td>{item.classroomName}</td>
                    <td>{item.requestedByName}</td>
                    <td>{item.status}</td>
                    <td>{item.advancePaymentRequestedAmount ?? item.totalPrice ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </SectionCard>
        <SectionCard>
          <SectionTitle>구매 요청 상세/처리</SectionTitle>
          <SectionDescription>
            선택한 구매 요청의 품목을 확인하고 승인, 반려, 결재 확인, 삭제 처리를 수행합니다.
          </SectionDescription>
          <DataState
            isLoading={purchaseDetailQuery.isLoading}
            isError={purchaseDetailQuery.isError}
            isEmpty={!selectedPurchaseId}
            loadingLabel="구매 요청 상세 불러오는 중"
            errorLabel="구매 요청 상세를 불러오지 못했습니다."
            emptyLabel="구매 요청을 선택하세요."
          >
            <MetaGrid>
              <MetaItem>제목: {purchaseDetailQuery.data?.title}</MetaItem>
              <MetaItem>상태: {purchaseDetailQuery.data?.status}</MetaItem>
              <MetaItem>요청자: {purchaseDetailQuery.data?.requestedByName}</MetaItem>
              <MetaItem>분반: {purchaseDetailQuery.data?.classroomName}</MetaItem>
            </MetaGrid>
            <List>
              {purchaseDetailQuery.data?.items?.map((item) => (
                <ListItem key={item.id}>
                  <span>{item.name}</span>
                  <span>{item.expectedPrice ?? item.actualPrice ?? 0}원</span>
                </ListItem>
              ))}
            </List>
            <FormGrid onSubmit={(event) => event.preventDefault()}>
              <Label>
                처리 사유
                <TextInput
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                />
              </Label>
              <Label>
                승인 선금
                <TextInput
                  value={approvedAmount}
                  onChange={(event) => setApprovedAmount(event.target.value)}
                />
              </Label>
              <ButtonRow>
                <PrimaryButton
                  type="button"
                  disabled={approvePurchaseMutation.isPending}
                  onClick={() => approvePurchaseMutation.mutate()}
                >
                  승인
                </PrimaryButton>
                <DangerButton
                  type="button"
                  disabled={rejectPurchaseMutation.isPending}
                  onClick={() => rejectPurchaseMutation.mutate()}
                >
                  반려
                </DangerButton>
                <SmallButton
                  type="button"
                  disabled={confirmPurchaseMutation.isPending}
                  onClick={() => confirmPurchaseMutation.mutate()}
                >
                  결재 확인
                </SmallButton>
                <DangerButton
                  type="button"
                  disabled={deletePurchaseMutation.isPending}
                  onClick={() => deletePurchaseMutation.mutate()}
                >
                  삭제
                </DangerButton>
              </ButtonRow>
            </FormGrid>
          </DataState>
        </SectionCard>
      </TwoColumnGrid>
    </>
  );
}
