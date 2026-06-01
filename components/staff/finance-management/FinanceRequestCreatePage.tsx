"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { createPurchaseRequest } from "@/api/request/request.api";
import type { CreatePurchaseRequestDto } from "@/api/request/request.dto";
import { getVendors } from "@/api/vendor/vendor.api";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const fallbackVendorNames = ["예소디자인", "목민서관", "지성문구", "마트"] as const;

type FinanceItemForm = {
  id: number;
  name: string;
  quantity: string;
  reason: string;
  paymentType: "PREPAID" | "ACTUAL";
};

const initialItem: FinanceItemForm = {
  id: 1,
  name: "",
  quantity: "1",
  reason: "",
  paymentType: "ACTUAL",
};

export default function FinanceRequestCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [title, setTitle] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [items, setItems] = useState<FinanceItemForm[]>([initialItem]);

  const { data: classroomData } = useQuery({
    queryKey: ["classrooms", "finance-request-create"],
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    retry: false,
  });
  const { data: vendorData } = useQuery({
    queryKey: queryKeys.vendors.list(),
    queryFn: () => getVendors(),
    retry: false,
  });

  const classrooms = useMemo(() => classroomData?.content ?? [], [classroomData]);
  const vendorBalances = useMemo(
    () =>
      vendorData?.length
        ? vendorData.map((vendor) => ({
            name: vendor.name ?? "-",
            balance: vendor.balance,
          }))
        : fallbackVendorNames.map((name) => ({ name, balance: undefined })),
    [vendorData],
  );

  const mutation = useMutation({
    mutationFn: (body: CreatePurchaseRequestDto) => createPurchaseRequest(body),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseList() });
      router.push("/staff/finance-management");
    },
  });

  const normalizedItems = items
    .map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity.trim().length > 0 ? Number(item.quantity) : undefined,
      reason: item.reason.trim() || undefined,
      paymentType: item.paymentType,
    }))
    .filter((item) => item.name.length > 0);

  const canSubmit =
    title.trim().length > 0 &&
    classroomId.trim().length > 0 &&
    Number.isInteger(Number(classroomId)) &&
    authStatus === "authenticated" &&
    normalizedItems.length > 0 &&
    !normalizedItems.some(
      (item) =>
        typeof item.quantity !== "number" ||
        Number.isNaN(item.quantity) ||
        item.quantity < 1 ||
        !Number.isInteger(item.quantity),
    ) &&
    !mutation.isPending;

  const applicantName =
    authStatus === "authenticated"
      ? (user?.name ?? user?.nickname ?? user?.email ?? "이름 정보 없음")
      : authStatus === "loading"
        ? "사용자 확인 중"
        : "로그인 필요";

  function updateItem(itemId: number, patch: Partial<FinanceItemForm>) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        ...initialItem,
        id: Math.max(...current.map((item) => item.id)) + 1,
      },
    ]);
  }

  function removeItem(itemId: number) {
    setItems((current) => {
      if (current.length <= 1) {
        return [{ ...initialItem, id: current[0]?.id ?? 1 }];
      }
      return current.filter((item) => item.id !== itemId);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const itemContent = normalizedItems
      .map((item, index) => {
        const reason = item.reason ? ` - ${item.reason}` : "";
        const quantity = typeof item.quantity === "number" ? ` ${item.quantity}개` : "";
        const paymentType = item.paymentType === "PREPAID" ? "선금 결제" : "실 결제";

        return `${index + 1}. ${item.name}${quantity} / ${paymentType}${reason}`;
      })
      .join("\n");

    mutation.mutate({
      title: title.trim(),
      content: `신청자: ${applicantName}\n\n${itemContent}`,
      classroomId: Number(classroomId),
      items: normalizedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity ?? 1,
        reason: item.reason,
        paymentType: item.paymentType,
      })),
    });
  }

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <HeaderRow>
            <Title>결제 신청서 작성하기</Title>
            <SubmitButton type="submit" form="finance-request-form" disabled={!canSubmit}>
              {mutation.isPending ? "제출 중" : "결제 신청서 제출하기"}
            </SubmitButton>
          </HeaderRow>

          <Form id="finance-request-form" onSubmit={handleSubmit}>
            <Section>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                placeholder="제목"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Section>

            <Section>
              <SectionTitle>신청자 정보</SectionTitle>
              <InfoRow>
                <FieldLabel htmlFor="classroomId">반 이름</FieldLabel>
                <InlineSelect
                  id="classroomId"
                  name="classroomId"
                  value={classroomId}
                  onChange={(event) => setClassroomId(event.target.value)}
                  required
                >
                  <option value="">반 선택</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </InlineSelect>
                <FieldLabel htmlFor="applicant">신청자</FieldLabel>
                <InlineInput id="applicant" name="applicant" value={applicantName} readOnly />
              </InfoRow>
            </Section>

            <Section>
              <SectionTitle>현재 거래처별 잔액</SectionTitle>
              <VendorBalanceTable>
                <tbody>
                  {vendorBalances.map((vendor) => (
                    <tr key={vendor.name}>
                      <th scope="row">{vendor.name}</th>
                      <td>
                        {typeof vendor.balance === "number"
                          ? `${vendor.balance.toLocaleString()}원`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </VendorBalanceTable>
            </Section>

            <Section>
              <SectionTitle>상세 품목</SectionTitle>
              <ItemList>
                {items.map((item, index) => (
                  <ItemBlock key={item.id}>
                    <ItemFieldRow>
                      <ItemLabel htmlFor={`itemName-${item.id}`}>품목 {index + 1}</ItemLabel>
                      <ItemInput
                        id={`itemName-${item.id}`}
                        name={`itemName-${item.id}`}
                        placeholder="품목"
                        value={item.name}
                        onChange={(event) => updateItem(item.id, { name: event.target.value })}
                        required={index === 0}
                      />
                    </ItemFieldRow>
                    <ItemFieldRow>
                      <ItemLabel htmlFor={`quantity-${item.id}`}>개수</ItemLabel>
                      <ItemInput
                        id={`quantity-${item.id}`}
                        name={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
                      />
                    </ItemFieldRow>
                    <ItemFieldRow>
                      <ItemLabel htmlFor={`paymentReason-${item.id}`}>결제 사유</ItemLabel>
                      <ItemInput
                        id={`paymentReason-${item.id}`}
                        name={`paymentReason-${item.id}`}
                        placeholder="결제 사유"
                        value={item.reason}
                        onChange={(event) => updateItem(item.id, { reason: event.target.value })}
                      />
                    </ItemFieldRow>
                    <ItemFieldRow>
                      <ItemLabel>결제 유형</ItemLabel>
                      <PaymentTypeGroup>
                        <PaymentTypeOption>
                          <input
                            type="checkbox"
                            name={`paymentType-${item.id}`}
                            value="PREPAID"
                            checked={item.paymentType === "PREPAID"}
                            onChange={(event) => {
                              if (event.target.checked) {
                                updateItem(item.id, { paymentType: "PREPAID" });
                              }
                            }}
                          />
                          <span>선금 결제</span>
                        </PaymentTypeOption>
                        <PaymentTypeOption>
                          <input
                            type="checkbox"
                            name={`paymentType-${item.id}`}
                            value="ACTUAL"
                            checked={item.paymentType === "ACTUAL"}
                            onChange={(event) => {
                              if (event.target.checked) {
                                updateItem(item.id, { paymentType: "ACTUAL" });
                              }
                            }}
                          />
                          <span>실 결제</span>
                        </PaymentTypeOption>
                      </PaymentTypeGroup>
                    </ItemFieldRow>
                    {items.length > 1 ? (
                      <ItemActionRow>
                        <DeleteItemButton type="button" onClick={() => removeItem(item.id)}>
                          품목 삭제
                        </DeleteItemButton>
                      </ItemActionRow>
                    ) : null}
                  </ItemBlock>
                ))}
              </ItemList>

              <AddItemButton type="button" onClick={addItem}>
                품목 추가하기
              </AddItemButton>
              {mutation.isError ? (
                <StatusMessage role="alert">결제 신청서 제출에 실패했습니다.</StatusMessage>
              ) : null}
            </Section>
          </Form>
        </Content>
      </Stage>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
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

const Content = styled.section`
  flex: 1;
  min-width: 0;
  padding: 2.3125rem 3.125rem 4rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding-inline: ${spacing.space16};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 2.125rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const Label = styled.label`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const inputBase = `
  min-width: 0;
  min-height: 2.6875rem;
  border: 0;
  background-color: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    font-size: ${typography.fontSize20};
  }
`;

const Input = styled.input`
  ${inputBase}
  width: 100%;
  padding: 0.8125rem ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const FieldLabel = styled.label`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineInput = styled.input`
  ${inputBase}
  padding: 0.8125rem ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

const InlineSelect = styled.select`
  ${inputBase}
  padding: 0.8125rem ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemBlock = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding: ${spacing.space20} 0 ${spacing.space20};
  border-bottom: 1px solid #bcbcbc;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-bottom: 1.875rem;
  }
`;

const ItemFieldRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ItemLabel = styled(Label)`
  min-width: 4rem;
  white-space: nowrap;

  @media (min-width: 120rem) {
    min-width: 6.125rem;
  }
`;

const ItemInput = styled(Input)`
  padding-inline: ${spacing.space20};

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;

const PaymentTypeGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

const VendorBalanceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${colors.muted};
  table-layout: fixed;

  th,
  td {
    width: 50%;
    padding: ${spacing.space12};
    border: 1px solid ${colors.muted};
    color: #000000;
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight130};
  }

  th {
    background-color: ${colors.background};
    font-weight: 600;
    text-align: left;
  }

  td {
    font-weight: 500;
    text-align: right;
  }

  @media (min-width: 120rem) {
    th,
    td {
      padding: ${spacing.space20};
      font-size: ${typography.fontSize20};
    }
  }
`;

const PaymentTypeOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space16};
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  input {
    accent-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const StatusMessage = styled.p`
  margin: 0;
  color: #da3a30;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.125rem;
  border: 0;
  background-color: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 3.125rem;
    font-size: ${typography.fontSize20};
  }
`;

const ItemActionRow = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${spacing.space12};
  display: flex;
  justify-content: flex-end;

  @media (min-width: 120rem) {
    bottom: ${spacing.space20};
  }
`;

const DeleteItemButton = styled(AddItemButton)`
  width: 9rem;
  min-height: 2.125rem;
  border-color: #e45a52;
  background-color: #fde4e2;
  color: #da3a30;

  @media (min-width: 120rem) {
    width: 12rem;
    min-height: 3.125rem;
    font-size: ${typography.fontSize20};
  }
`;
