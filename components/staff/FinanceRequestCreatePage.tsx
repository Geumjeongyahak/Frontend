"use client";

import { FormEvent, useMemo, useState } from "react";
import { IconFilePlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { uploadPurchaseItemImage } from "@/api/file/file.api";
import { createPurchaseRequest } from "@/api/request/request.api";
import type { CreatePurchaseRequestDto } from "@/api/request/request.dto";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { financeReceiptToGoogleDrive } from "@/lib/googleDrive/financeReceiptToGoogleDrive";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type FinanceItemForm = {
  id: number;
  name: string;
  reason: string;
  expectedPrice: string;
  receiptFileName: string;
  receiptFile: File | null;
};

const initialItem: FinanceItemForm = {
  id: 1,
  name: "",
  reason: "",
  expectedPrice: "",
  receiptFileName: "",
  receiptFile: null,
};

export default function FinanceRequestCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [title, setTitle] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<FinanceItemForm[]>([initialItem]);

  const { data: classroomData } = useQuery({
    queryKey: ["classrooms", "finance-request-create"],
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    retry: false,
  });

  const classrooms = useMemo(() => classroomData?.content ?? [], [classroomData]);

  const mutation = useMutation({
    mutationFn: (body: CreatePurchaseRequestDto) => createPurchaseRequest(body),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseList() });
      router.push("/staff/finance");
    },
  });

  const normalizedItems = items
    .map((item) => ({
      name: item.name.trim(),
      reason: item.reason.trim() || undefined,
      expectedPrice: item.expectedPrice.trim().length > 0 ? Number(item.expectedPrice) : undefined,
    }))
    .filter((item) => item.name.length > 0);

  const totalExpectedPrice = normalizedItems.reduce(
    (sum, item) => sum + (typeof item.expectedPrice === "number" ? item.expectedPrice : 0),
    0,
  );

  const canSubmit =
    title.trim().length > 0 &&
    classroomId.trim().length > 0 &&
    Number.isInteger(Number(classroomId)) &&
    paymentDate.trim().length > 0 &&
    authStatus === "authenticated" &&
    normalizedItems.length > 0 &&
    !normalizedItems.some((item) => Number.isNaN(item.expectedPrice)) &&
    totalExpectedPrice > 0 &&
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

    const uploadedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.receiptFile) {
          return {
            receiptUrl: "",
          };
        }

        const [driveUploaded, apiUploaded] = await Promise.all([
          financeReceiptToGoogleDrive(item.receiptFile),
          uploadPurchaseItemImage(item.receiptFile, item.receiptFile.name),
        ]);

        return {
          receiptFileId: apiUploaded.fileId,
          receiptUrl: driveUploaded.url,
        };
      }),
    );
    const receiptFileIds = uploadedItems
      .map((item) => item.receiptFileId)
      .filter((fileId): fileId is string => Boolean(fileId));

    const itemContent = normalizedItems
      .map((item, index) => {
        const reason = item.reason ? ` - ${item.reason}` : "";
        const price =
          typeof item.expectedPrice === "number"
            ? ` (${item.expectedPrice.toLocaleString()}원)`
            : "";
        const receiptUrl = uploadedItems[index]?.receiptUrl
          ? `\n   영수증: ${uploadedItems[index].receiptUrl}`
          : "";

        return `${index + 1}. ${item.name}${reason}${price}${receiptUrl}`;
      })
      .join("\n");

    mutation.mutate({
      title: title.trim(),
      content: `결제 일자: ${paymentDate}\n신청자: ${applicantName}\n\n${itemContent}`,
      classroomId: Number(classroomId),
      advancePaymentRequestedAmount: totalExpectedPrice,
      ...(receiptFileIds.length ? { receiptFileIds } : {}),
      items: normalizedItems,
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
                <FieldLabel htmlFor="paymentDate">결제 일자</FieldLabel>
                <InlineInput
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  required
                />
                <FieldLabel htmlFor="applicant">신청자</FieldLabel>
                <InlineInput id="applicant" name="applicant" value={applicantName} readOnly />
              </InfoRow>
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
                      <ItemLabel htmlFor={`expectedPrice-${item.id}`}>예상 금액</ItemLabel>
                      <ItemInput
                        id={`expectedPrice-${item.id}`}
                        name={`expectedPrice-${item.id}`}
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        value={item.expectedPrice}
                        onChange={(event) =>
                          updateItem(item.id, { expectedPrice: event.target.value })
                        }
                      />
                    </ItemFieldRow>
                    <ItemLabel as="span">영수증</ItemLabel>
                    <UploadControl>
                      <UploadInput
                        id={`receiptFile-${item.id}`}
                        name={`receiptFile-${item.id}`}
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;

                          updateItem(item.id, {
                            receiptFile: file,
                            receiptFileName: file?.name ?? "",
                          });
                        }}
                      />
                      <UploadBox htmlFor={`receiptFile-${item.id}`}>
                        <IconFilePlus size={24} stroke={1.8} aria-hidden="true" />
                        <span>{item.receiptFileName || "파일 추가하기"}</span>
                      </UploadBox>
                    </UploadControl>
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
  border: 0;
  border-radius: ${radii.radius15};
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    background-color: #b7b7b7;
    cursor: not-allowed;
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

const UploadControl = styled.div`
  display: flex;
  align-items: flex-start;
`;

const UploadInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const UploadBox = styled.label`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-width: 5.5rem;
  min-height: 4.125rem;
  padding: ${spacing.space20};
  background-color: ${colors.background};
  color: #969696;
  font-size: 0.5rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  span {
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 120rem) {
    min-width: 8.375rem;
    min-height: 6.25rem;
    gap: 0.9375rem;
    padding: 1.875rem;
    font-size: 0.75rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
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
  border: 1px solid ${colors.point};
  background-color: #eef9e6;
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
