"use client";

import { FormEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { createPurchaseRequest } from "@/api/request/request.api";
import type { CreatePurchaseRequestDto } from "@/api/request/request.dto";
import { getVendors } from "@/api/vendor/vendor.api";
import { AttachmentEditorPanel } from "@/components/common/AttachmentField";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const fallbackVendorNames = ["예소디자인", "목민서관", "지성문구", "마트"] as const;
const unitBusinessLabel = "프로그램운영비";
const detailBusinessOptions = ["경상 운영비", "사업 추진비", "기타 운영비", "인건비"] as const;
const budgetItemReasonOptions = [
  "교통비",
  "교재비",
  "프로그램추진비",
  "임차료",
  "홍보비",
  "기타 운영비",
] as const;
const budgetItemNameOptions = [
  "무급강사교통비",
  "무급행정담당자 교통비",
  "시중교재",
  "제본교재",
  "(소풍)식비",
  "행사물품",
  "현수막",
  "다과비",
  "포스터",
  "소식지",
  "입간판 및 배너, 스티커 제작",
  "이체 수수료",
  "사무용품비",
  "통신비",
  "전기비",
  "수도세",
  "정수기 필터교체",
  "청소용품",
  "프린트토너",
] as const;
const paymentAccountOptions = ["국비04", "구비01", "구비08"] as const;
const customDetailBusinessOptionValue = "__custom_detail_business__";

type PaymentType = "PREPAID" | "ACTUAL";

type FinanceItemForm = {
  id: number;
  detailBusiness: string;
  name: string;
  quantity: string;
  reason: string;
  budgetBalance: string;
  businessBalance: string;
};

type PrepaidProductForm = {
  id: number;
  description: string;
  specification: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

type ApprovalEntry = {
  position: string;
  name: string;
};

type AffiliationOption = {
  id: number;
  label: string;
  value: string;
};

const initialItem: FinanceItemForm = {
  id: 1,
  detailBusiness: "",
  name: "",
  quantity: "1",
  reason: "",
  budgetBalance: "",
  businessBalance: "",
};

const initialPrepaidProduct: PrepaidProductForm = {
  id: 1,
  description: "",
  specification: "",
  quantity: "1",
  unitPrice: "",
  amount: "",
};

const initialApprovalEntries: ApprovalEntry[] = [
  { position: "총무", name: "" },
  { position: "교장", name: "정혜웅" },
  { position: "", name: "" },
];

const initialCooperationEntries: ApprovalEntry[] = [
  { position: "", name: "" },
  { position: "", name: "" },
  { position: "", name: "" },
];

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPrepaidSummaryTemplate(referenceDate: string) {
  const month = Number(referenceDate.slice(5, 7)) || new Date().getMonth() + 1;
  return `${month}월 [ ] 비용을 다음과 같이 지출하고자 합니다.\n\n1. 청구 비용: 0원`;
}

function parseAmount(value: string) {
  const normalized = value.replaceAll(",", "").trim();
  if (!normalized) return 0;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return value > 0 ? `${value.toLocaleString()}원` : "-";
}

function getPolicyProjectLabel(referenceDate: string) {
  const year = referenceDate.slice(0, 4) || String(new Date().getFullYear());
  return `${year}년 성인문해교육 지원사업`;
}

function isPresetDetailBusiness(value: string) {
  return detailBusinessOptions.includes(value as (typeof detailBusinessOptions)[number]);
}

function isPresetBudgetItemReason(value: string) {
  return budgetItemReasonOptions.includes(value as (typeof budgetItemReasonOptions)[number]);
}

function isPresetPaymentAccount(value: string) {
  return paymentAccountOptions.includes(value as (typeof paymentAccountOptions)[number]);
}

function getApprovalNumber(referenceDate: string, paymentAccount: string) {
  if (!paymentAccount.trim()) {
    return "";
  }

  const year = referenceDate.slice(0, 4) || String(new Date().getFullYear());
  return `${year}품-${paymentAccount}-01`;
}

export default function FinanceRequestCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [title, setTitle] = useState("");
  const [affiliationValue, setAffiliationValue] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("ACTUAL");
  const [items, setItems] = useState<FinanceItemForm[]>([initialItem]);
  const [prepaidSummary, setPrepaidSummary] = useState(() =>
    getPrepaidSummaryTemplate(getTodayInputValue()),
  );
  const [paymentAccount, setPaymentAccount] = useState("");
  const [requestDepartmentId, setRequestDepartmentId] = useState("");
  const [approvalDate, setApprovalDate] = useState(getTodayInputValue);
  const [detailBusiness, setDetailBusiness] = useState<string>("");
  const [customFieldModal, setCustomFieldModal] = useState<{
    field: "topDetailBusiness" | "budgetReason" | "budgetName" | "paymentAccount";
    itemId?: number;
  } | null>(null);
  const [customFieldDraft, setCustomFieldDraft] = useState("");
  const [approvalAmount, setApprovalAmount] = useState("");
  const [prepaidProducts, setPrepaidProducts] = useState<PrepaidProductForm[]>([
    initialPrepaidProduct,
  ]);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [approvalEntries, setApprovalEntries] = useState<ApprovalEntry[]>(initialApprovalEntries);
  const [cooperationEntries, setCooperationEntries] =
    useState<ApprovalEntry[]>(initialCooperationEntries);
  const previousApplicantNameRef = useRef("");

  const { data: classroomData } = useQuery({
    queryKey: ["classrooms", "finance-request-create"],
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    retry: false,
  });
  const { data: departmentData } = useQuery({
    queryKey: ["departments", "finance-request-create"],
    queryFn: () => getDepartments(),
    retry: false,
  });
  const { data: vendorData } = useQuery({
    queryKey: queryKeys.vendors.list(),
    queryFn: () => getVendors(),
    retry: false,
  });

  const classrooms = useMemo(() => classroomData?.content ?? [], [classroomData]);
  const departments = useMemo(() => departmentData?.departments ?? [], [departmentData]);
  const affiliationOptions = useMemo<AffiliationOption[]>(
    () =>
      classrooms
        .filter((classroom) => typeof classroom.id === "number")
        .map((classroom) => ({
          id: classroom.id as number,
          label: classroom.name ?? `반 ${classroom.id}`,
          value: `classroom:${classroom.id}`,
        })),
    [classrooms],
  );
  const selectedAffiliation = affiliationOptions.find(
    (option) => option.value === affiliationValue,
  );
  const selectedDepartment = departments.find(
    (department) => String(department.id) === requestDepartmentId,
  );
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
  const approvalNumber = useMemo(
    () => getApprovalNumber(approvalDate, paymentAccount),
    [approvalDate, paymentAccount],
  );

  useEffect(() => {
    if (paymentType !== "PREPAID") {
      return;
    }

    setItems((current) => {
      const firstItem = current[0] ?? initialItem;
      return [{ ...firstItem, quantity: "1" }];
    });
  }, [paymentType]);

  const mutation = useMutation({
    mutationFn: (body: CreatePurchaseRequestDto) => createPurchaseRequest(body),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseList() });
      router.push("/staff/finance-management");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "결제 신청서 제출에 실패했습니다."));
    },
  });

  const normalizedItems = items
    .map((item) => ({
      detailBusiness: item.detailBusiness.trim() || undefined,
      name: item.name.trim(),
      quantity:
        paymentType === "PREPAID"
          ? 1
          : item.quantity.trim().length > 0
            ? Number(item.quantity)
            : undefined,
      reason: item.reason.trim() || undefined,
    }))
    .filter((item) => item.name.length > 0);

  const normalizedPrepaidProducts = prepaidProducts
    .map((item) => ({
      description: item.description.trim(),
      specification: item.specification.trim(),
      quantity: parseAmount(item.quantity),
      unitPrice: parseAmount(item.unitPrice),
      amount: parseAmount(item.amount),
    }))
    .filter(
      (item) =>
        item.description.length > 0 ||
        item.specification.length > 0 ||
        item.quantity > 0 ||
        item.unitPrice > 0 ||
        item.amount > 0,
    );

  const quantityTotal = normalizedPrepaidProducts.reduce((sum, item) => sum + item.quantity, 0);
  const unitPriceTotal = normalizedPrepaidProducts.reduce((sum, item) => sum + item.unitPrice, 0);
  const amountTotal = normalizedPrepaidProducts.reduce((sum, item) => sum + item.amount, 0);
  const approvalAmountValue = parseAmount(approvalAmount);
  const budgetBalanceTotal = items.reduce((sum, item) => sum + parseAmount(item.budgetBalance), 0);
  const businessBalanceTotal = items.reduce(
    (sum, item) => sum + parseAmount(item.businessBalance),
    0,
  );

  const canSubmitPrepaid =
    prepaidSummary.trim().length > 0 &&
    requestDepartmentId.length > 0 &&
    approvalDate.length > 0 &&
    detailBusiness.length > 0 &&
    approvalAmountValue > 0;

  const canSubmit =
    title.trim().length > 0 &&
    Boolean(selectedAffiliation) &&
    authStatus === "authenticated" &&
    normalizedItems.length > 0 &&
    !normalizedItems.some(
      (item) =>
        typeof item.quantity !== "number" ||
        Number.isNaN(item.quantity) ||
        item.quantity < 1 ||
        !Number.isInteger(item.quantity),
    ) &&
    (paymentType === "PREPAID" ? canSubmitPrepaid : true) &&
    !mutation.isPending;

  const applicantName =
    user?.name ??
    user?.nickname ??
    user?.email ??
    (authStatus === "loading"
      ? "사용자 확인 중"
      : authStatus === "unauthenticated" || authStatus === "error"
        ? "로그인 필요"
        : "이름 정보 없음");
  const applicantNameForApproval =
    applicantName === "사용자 확인 중" ||
    applicantName === "로그인 필요" ||
    applicantName === "이름 정보 없음"
      ? ""
      : applicantName;

  useEffect(() => {
    setApprovalEntries((current) =>
      current.map((entry, index) => {
        if (index === 0) {
          const shouldUpdateName = !entry.name || entry.name === previousApplicantNameRef.current;

          return {
            position: entry.position || "총무",
            name: shouldUpdateName ? applicantNameForApproval : entry.name,
          };
        }

        if (index === 1) {
          return {
            position: entry.position || "교장",
            name: entry.name || "정혜웅",
          };
        }

        return entry;
      }),
    );

    previousApplicantNameRef.current = applicantNameForApproval;
  }, [applicantNameForApproval]);

  useEffect(() => {
    const nextPosition =
      selectedDepartment?.name && selectedDepartment.name !== "총무부"
        ? `${selectedDepartment.name}장`
        : "";

    setCooperationEntries((current) =>
      current.map((entry, index) => (index === 0 ? { ...entry, position: nextPosition } : entry)),
    );
  }, [selectedDepartment?.name]);

  function updateItem(itemId: number, patch: Partial<FinanceItemForm>) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    if (paymentType === "PREPAID") {
      return;
    }

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

  function updatePrepaidProduct(itemId: number, patch: Partial<PrepaidProductForm>) {
    setPrepaidProducts((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
  }

  function updatePrepaidProductCalculated(
    itemId: number,
    field: "quantity" | "unitPrice",
    value: string,
  ) {
    setPrepaidProducts((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const next = { ...item, [field]: value };
        const quantity = parseAmount(next.quantity);
        const unitPrice = parseAmount(next.unitPrice);

        return {
          ...next,
          amount: quantity > 0 && unitPrice > 0 ? String(quantity * unitPrice) : "",
        };
      }),
    );
  }

  function updateApprovalEntry(
    kind: "approval" | "cooperation",
    index: number,
    patch: Partial<ApprovalEntry>,
  ) {
    const setter = kind === "approval" ? setApprovalEntries : setCooperationEntries;

    setter((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)),
    );
  }

  function openCustomFieldModal(
    field: "topDetailBusiness" | "budgetReason" | "budgetName" | "paymentAccount",
    itemId?: number,
  ) {
    const currentItem = itemId != null ? items.find((item) => item.id === itemId) : undefined;
    const draft =
      field === "topDetailBusiness"
        ? isPresetDetailBusiness(detailBusiness)
          ? ""
          : detailBusiness
        : field === "paymentAccount"
          ? isPresetPaymentAccount(paymentAccount)
            ? ""
            : paymentAccount
          : field === "budgetReason"
            ? (currentItem?.reason ?? "")
            : (currentItem?.name ?? "");

    setCustomFieldDraft(draft);
    setCustomFieldModal({ field, itemId });
  }

  function closeCustomFieldModal() {
    setCustomFieldModal(null);
    setCustomFieldDraft("");
  }

  function confirmCustomFieldModal() {
    const nextValue = customFieldDraft.trim();

    if (!nextValue || !customFieldModal) {
      return;
    }

    if (customFieldModal.field === "topDetailBusiness") {
      setDetailBusiness(nextValue);
    }

    if (customFieldModal.field === "paymentAccount") {
      setPaymentAccount(nextValue);
    }

    if (customFieldModal.field === "budgetReason" && customFieldModal.itemId != null) {
      updateItem(customFieldModal.itemId, { reason: nextValue, name: "" });
    }

    if (customFieldModal.field === "budgetName" && customFieldModal.itemId != null) {
      updateItem(customFieldModal.itemId, { name: nextValue, quantity: "1" });
    }

    setCustomFieldModal(null);
    setCustomFieldDraft("");
  }

  function addPrepaidProduct() {
    setPrepaidProducts((current) => [
      ...current,
      {
        ...initialPrepaidProduct,
        id: Math.max(...current.map((item) => item.id)) + 1,
      },
    ]);
  }

  function removePrepaidProduct(itemId: number) {
    setPrepaidProducts((current) => {
      if (current.length <= 1) {
        return [{ ...initialPrepaidProduct, id: current[0]?.id ?? 1 }];
      }
      return current.filter((item) => item.id !== itemId);
    });
  }

  function buildActualContent() {
    const itemContent = normalizedItems
      .map((item, index) => {
        const reason = item.reason ? ` - ${item.reason}` : "";
        const quantity = typeof item.quantity === "number" ? ` ${item.quantity}개` : "";
        const paymentTypeLabel = paymentType === "PREPAID" ? "선금 결제" : "실 결제";

        return `${index + 1}. ${item.name}${quantity} / ${paymentTypeLabel}${reason}`;
      })
      .join("\n");

    return `분반: ${selectedAffiliation?.label ?? "-"}\n신청자: ${applicantName}\n결제 유형: 실 결제\n\n${itemContent}`;
  }

  function buildPrepaidContent() {
    const budgetContent = normalizedItems
      .map(
        (item, index) =>
          `${index + 1}. 세부사업: ${item.detailBusiness || detailBusiness || "-"} / 세부 항목: ${item.reason ?? "-"} / 산출 내역: ${item.name}`,
      )
      .join("\n");
    const productContent =
      normalizedPrepaidProducts.length > 0
        ? normalizedPrepaidProducts
            .map(
              (item, index) =>
                `${index + 1}. 내용: ${item.description || "-"} / 규격: ${item.specification || "-"} / 수량: ${item.quantity || 0} / 예상 단가: ${item.unitPrice || 0} / 예상 금액: ${item.amount || 0}`,
            )
            .join("\n")
        : "없음";

    return [
      `분반: ${selectedAffiliation?.label ?? "-"}`,
      `신청자: ${applicantName}`,
      "결제 유형: 선금 결제",
      "",
      `[품의 번호]`,
      `품의 번호: ${approvalNumber || "-"}`,
      `결제 통장: ${paymentAccount || "-"}`,
      "",
      `[품의 개요]`,
      prepaidSummary.trim(),
      `정책 사업: ${getPolicyProjectLabel(approvalDate)}`,
      `요구 부서: ${selectedDepartment?.name ?? "-"}`,
      `단위 사업: ${unitBusinessLabel}`,
      `품의 일자: ${approvalDate}`,
      `세부 사업: ${detailBusiness}`,
      `품의 금액: ${approvalAmountValue.toLocaleString()}원`,
      "",
      `[예산 내역]`,
      budgetContent,
      "",
      `[품목 내역]`,
      productContent,
    ].join("\n");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedOption = selectedAffiliation;

    if (!canSubmit || !selectedOption) {
      return;
    }

    mutation.mutate({
      title: title.trim(),
      content: paymentType === "PREPAID" ? buildPrepaidContent() : buildActualContent(),
      classroomId: selectedOption.id,
      items: normalizedItems.map((item) => ({
        name: item.name,
        quantity: paymentType === "PREPAID" ? 1 : (item.quantity ?? 1),
        reason: item.reason,
        paymentType,
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
                <FieldLabel htmlFor="affiliation">분반</FieldLabel>
                <InlineSelect
                  id="affiliation"
                  name="affiliation"
                  value={affiliationValue}
                  onChange={(event) => setAffiliationValue(event.target.value)}
                  required
                >
                  <option value="">분반 선택</option>
                  {affiliationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </InlineSelect>
                <FieldLabel htmlFor="applicant">신청자</FieldLabel>
                <InlineInput id="applicant" name="applicant" value={applicantName} readOnly />
              </InfoRow>
            </Section>

            <Section>
              <SectionTitle>결제 유형</SectionTitle>
              <PaymentTypeGroup>
                <PaymentTypeOption>
                  <input
                    type="checkbox"
                    name="paymentType"
                    value="PREPAID"
                    checked={paymentType === "PREPAID"}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setPaymentType("PREPAID");
                      }
                    }}
                  />
                  <span>선금 결제</span>
                </PaymentTypeOption>
                <PaymentTypeOption>
                  <input
                    type="checkbox"
                    name="paymentType"
                    value="ACTUAL"
                    checked={paymentType === "ACTUAL"}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setPaymentType("ACTUAL");
                      }
                    }}
                  />
                  <span>실 결제</span>
                </PaymentTypeOption>
              </PaymentTypeGroup>
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

            {paymentType === "PREPAID" ? (
              <>
                <Section>
                  <SectionTitle>품의 번호</SectionTitle>
                  <ApprovalNumberRow>
                    <ApprovalNumberInput value={approvalNumber} readOnly />
                    <ApprovalNumberSelect
                      value={paymentAccount}
                      onChange={(event) => {
                        if (event.target.value === customDetailBusinessOptionValue) {
                          openCustomFieldModal("paymentAccount");
                          return;
                        }

                        setPaymentAccount(event.target.value);
                      }}
                    >
                      <option value="">결제 통장 선택</option>
                      {paymentAccountOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      {!isPresetPaymentAccount(paymentAccount) && paymentAccount ? (
                        <option value={paymentAccount}>{paymentAccount}</option>
                      ) : null}
                      <option value={customDetailBusinessOptionValue}>직접 입력</option>
                    </ApprovalNumberSelect>
                  </ApprovalNumberRow>
                </Section>

                <Section>
                  <SectionTitle>품의 개요</SectionTitle>
                  <ResponsiveTableWrap>
                    <SummaryTable>
                      <tbody>
                        <tr>
                          <SummaryLabelCell>품의 개요</SummaryLabelCell>
                          <SummaryWideCell colSpan={3}>
                            <SummaryTextarea
                              value={prepaidSummary}
                              onChange={(event) => setPrepaidSummary(event.target.value)}
                              placeholder="품의 개요를 입력해 주세요."
                              required
                            />
                          </SummaryWideCell>
                        </tr>
                        <tr>
                          <SummaryLabelCell>정책 사업</SummaryLabelCell>
                          <SummaryValueCell>{getPolicyProjectLabel(approvalDate)}</SummaryValueCell>
                          <SummaryLabelCell>요구 부서</SummaryLabelCell>
                          <SummaryValueCell>
                            <SummarySelect
                              value={requestDepartmentId}
                              onChange={(event) => setRequestDepartmentId(event.target.value)}
                              required
                            >
                              <option value="">부서 선택</option>
                              {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                  {department.name ?? `부서 ${department.id}`}
                                </option>
                              ))}
                            </SummarySelect>
                          </SummaryValueCell>
                        </tr>
                        <tr>
                          <SummaryLabelCell>단위 사업</SummaryLabelCell>
                          <SummaryValueCell>{unitBusinessLabel}</SummaryValueCell>
                          <SummaryLabelCell>품의 일자</SummaryLabelCell>
                          <SummaryValueCell>
                            <SummaryInput
                              type="date"
                              value={approvalDate}
                              onChange={(event) => setApprovalDate(event.target.value)}
                              required
                            />
                          </SummaryValueCell>
                        </tr>
                        <tr>
                          <SummaryLabelCell>세부 사업</SummaryLabelCell>
                          <SummaryValueCell>
                            <SummarySelect
                              value={detailBusiness}
                              onChange={(event) => {
                                if (event.target.value === customDetailBusinessOptionValue) {
                                  openCustomFieldModal("topDetailBusiness");
                                  return;
                                }

                                setDetailBusiness(event.target.value);
                              }}
                            >
                              <option value="">세부 사업 선택</option>
                              {detailBusinessOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                              {!isPresetDetailBusiness(detailBusiness) && detailBusiness ? (
                                <option value={detailBusiness}>{detailBusiness}</option>
                              ) : null}
                              <option value={customDetailBusinessOptionValue}>직접 입력</option>
                            </SummarySelect>
                          </SummaryValueCell>
                          <SummaryLabelCell>품의 금액</SummaryLabelCell>
                          <SummaryValueCell>
                            <SummaryInput
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={approvalAmount}
                              onChange={(event) => setApprovalAmount(event.target.value)}
                              placeholder="0"
                              required
                            />
                          </SummaryValueCell>
                        </tr>
                      </tbody>
                    </SummaryTable>
                  </ResponsiveTableWrap>
                </Section>

                <Section>
                  <SectionTitle>예산 내역</SectionTitle>
                  <ResponsiveTableWrap>
                    <BudgetTable>
                      <thead>
                        <tr>
                          <BudgetHeadCell>순번</BudgetHeadCell>
                          <BudgetHeadCell>세부 사업</BudgetHeadCell>
                          <BudgetHeadCell>세부 항목</BudgetHeadCell>
                          <BudgetHeadCell>산출 내역</BudgetHeadCell>
                          <BudgetHeadCell>품의 금액</BudgetHeadCell>
                          <BudgetHeadCell>예산 잔액</BudgetHeadCell>
                          <BudgetHeadCell>사업 잔액</BudgetHeadCell>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={item.id}>
                            <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                value={item.detailBusiness || detailBusiness}
                                placeholder="세부 사업"
                                readOnly
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineSelect
                                value={item.reason}
                                onChange={(event) => {
                                  if (event.target.value === customDetailBusinessOptionValue) {
                                    openCustomFieldModal("budgetReason", item.id);
                                    return;
                                  }

                                  const nextReason = event.target.value;
                                  updateItem(item.id, {
                                    reason: nextReason,
                                  });
                                }}
                              >
                                <option value="">세부 항목</option>
                                {budgetItemReasonOptions.map((option) => (
                                  <option key={`${item.id}-reason-${option}`} value={option}>
                                    {option}
                                  </option>
                                ))}
                                {!isPresetBudgetItemReason(item.reason) && item.reason ? (
                                  <option value={item.reason}>{item.reason}</option>
                                ) : null}
                                <option value={customDetailBusinessOptionValue}>직접 입력</option>
                              </BudgetInlineSelect>
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineSelect
                                value={item.name}
                                onChange={(event) => {
                                  if (event.target.value === customDetailBusinessOptionValue) {
                                    openCustomFieldModal("budgetName", item.id);
                                    return;
                                  }

                                  updateItem(item.id, {
                                    name: event.target.value,
                                    quantity: "1",
                                  });
                                }}
                                required={index === 0}
                              >
                                <option value="">산출 내역</option>
                                {budgetItemNameOptions.map((option) => (
                                  <option key={`${item.id}-name-${option}`} value={option}>
                                    {option}
                                  </option>
                                ))}
                                {item.name &&
                                !budgetItemNameOptions.some((option) => option === item.name) ? (
                                  <option value={item.name}>{item.name}</option>
                                ) : null}
                                <option value={customDetailBusinessOptionValue}>직접 입력</option>
                              </BudgetInlineSelect>
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={approvalAmount}
                                onChange={(event) => setApprovalAmount(event.target.value)}
                                placeholder="0"
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={item.budgetBalance}
                                onChange={(event) =>
                                  updateItem(item.id, { budgetBalance: event.target.value })
                                }
                                placeholder="0"
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={item.businessBalance}
                                onChange={(event) =>
                                  updateItem(item.id, { businessBalance: event.target.value })
                                }
                                placeholder="0"
                              />
                            </BudgetBodyCell>
                          </tr>
                        ))}
                        <tr>
                          <BudgetTotalLabelCell colSpan={4}>합계</BudgetTotalLabelCell>
                          <BudgetTotalValueCell>
                            {formatCurrency(approvalAmountValue)}
                          </BudgetTotalValueCell>
                          <BudgetTotalValueCell>
                            {formatCurrency(budgetBalanceTotal)}
                          </BudgetTotalValueCell>
                          <BudgetTotalValueCell>
                            {formatCurrency(businessBalanceTotal)}
                          </BudgetTotalValueCell>
                        </tr>
                      </tbody>
                    </BudgetTable>
                  </ResponsiveTableWrap>
                </Section>

                <Section>
                  <SectionTitle>품목 내역</SectionTitle>
                  <ResponsiveTableWrap>
                    <BudgetTable>
                      <thead>
                        <tr>
                          <BudgetHeadCell>순번</BudgetHeadCell>
                          <BudgetHeadCell>내용</BudgetHeadCell>
                          <BudgetHeadCell>규격</BudgetHeadCell>
                          <BudgetHeadCell>수량</BudgetHeadCell>
                          <BudgetHeadCell>예상 단가</BudgetHeadCell>
                          <BudgetHeadCell>예상 금액</BudgetHeadCell>
                          {prepaidProducts.length > 1 ? (
                            <BudgetHeadCell>삭제</BudgetHeadCell>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {prepaidProducts.map((product, index) => (
                          <tr key={product.id}>
                            <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                value={product.description}
                                onChange={(event) =>
                                  updatePrepaidProduct(product.id, {
                                    description: event.target.value,
                                  })
                                }
                                placeholder="내용"
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                value={product.specification}
                                onChange={(event) =>
                                  updatePrepaidProduct(product.id, {
                                    specification: event.target.value,
                                  })
                                }
                                placeholder="규격"
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={product.quantity}
                                onChange={(event) =>
                                  updatePrepaidProductCalculated(
                                    product.id,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                                placeholder="0"
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={product.unitPrice}
                                onChange={(event) =>
                                  updatePrepaidProductCalculated(
                                    product.id,
                                    "unitPrice",
                                    event.target.value,
                                  )
                                }
                                placeholder="0"
                              />
                            </BudgetBodyCell>
                            <BudgetBodyCell>
                              <BudgetInlineInput value={product.amount} readOnly placeholder="0" />
                            </BudgetBodyCell>
                            {prepaidProducts.length > 1 ? (
                              <BudgetBodyCell>
                                <MiniDeleteButton
                                  type="button"
                                  aria-label={`${index + 1}번 품목 삭제`}
                                  onClick={() => removePrepaidProduct(product.id)}
                                >
                                  <IconX aria-hidden="true" size={16} stroke={2.4} />
                                </MiniDeleteButton>
                              </BudgetBodyCell>
                            ) : null}
                          </tr>
                        ))}
                        <tr>
                          <BudgetTotalLabelCell colSpan={3}>합계</BudgetTotalLabelCell>
                          <BudgetTotalValueCell>
                            {quantityTotal.toLocaleString()}
                          </BudgetTotalValueCell>
                          <BudgetTotalValueCell>-</BudgetTotalValueCell>
                          <BudgetTotalValueCell>
                            {amountTotal.toLocaleString()}
                          </BudgetTotalValueCell>
                          {prepaidProducts.length > 1 ? <BudgetBodyCell>-</BudgetBodyCell> : null}
                        </tr>
                      </tbody>
                    </BudgetTable>
                  </ResponsiveTableWrap>
                  <AddItemButton type="button" onClick={addPrepaidProduct}>
                    품목 추가하기
                  </AddItemButton>
                </Section>

                <Section>
                  <SectionTitle>결재 & 협조</SectionTitle>
                  <ResponsiveTableWrap>
                    <ApprovalTable>
                      <tbody>
                        <tr>
                          <ApprovalTypeCell rowSpan={2}>결재</ApprovalTypeCell>
                          <ApprovalHeadCell>직위</ApprovalHeadCell>
                          <ApprovalHeadCell>이름</ApprovalHeadCell>
                          <ApprovalHeadCell>직위</ApprovalHeadCell>
                          <ApprovalHeadCell>이름</ApprovalHeadCell>
                          <ApprovalHeadCell>직위</ApprovalHeadCell>
                          <ApprovalHeadCell>이름</ApprovalHeadCell>
                        </tr>
                        <tr>
                          {approvalEntries.map((entry, index) => (
                            <Fragment key={`approval-${index}`}>
                              <ApprovalBodyCell>
                                <ApprovalEditableInput
                                  value={entry.position}
                                  onChange={(event) =>
                                    updateApprovalEntry("approval", index, {
                                      position: event.target.value,
                                    })
                                  }
                                  placeholder="직위"
                                />
                              </ApprovalBodyCell>
                              <ApprovalBodyCell>
                                <ApprovalEditableInput
                                  value={entry.name}
                                  onChange={(event) =>
                                    updateApprovalEntry("approval", index, {
                                      name: event.target.value,
                                    })
                                  }
                                  placeholder="이름"
                                />
                              </ApprovalBodyCell>
                            </Fragment>
                          ))}
                        </tr>
                        <tr>
                          <ApprovalTypeCell rowSpan={2}>협조</ApprovalTypeCell>
                          <ApprovalHeadCell>직위</ApprovalHeadCell>
                          <ApprovalHeadCell>이름</ApprovalHeadCell>
                          <ApprovalHeadCell>직위</ApprovalHeadCell>
                          <ApprovalHeadCell>이름</ApprovalHeadCell>
                          <ApprovalHeadCell>직위</ApprovalHeadCell>
                          <ApprovalHeadCell>이름</ApprovalHeadCell>
                        </tr>
                        <tr>
                          {cooperationEntries.map((entry, index) => (
                            <Fragment key={`cooperation-${index}`}>
                              <ApprovalBodyCell>
                                <ApprovalEditableInput
                                  value={entry.position}
                                  onChange={(event) =>
                                    updateApprovalEntry("cooperation", index, {
                                      position: event.target.value,
                                    })
                                  }
                                  placeholder="직위"
                                />
                              </ApprovalBodyCell>
                              <ApprovalBodyCell>
                                <ApprovalEditableInput
                                  value={entry.name}
                                  onChange={(event) =>
                                    updateApprovalEntry("cooperation", index, {
                                      name: event.target.value,
                                    })
                                  }
                                  placeholder="이름"
                                />
                              </ApprovalBodyCell>
                            </Fragment>
                          ))}
                        </tr>
                      </tbody>
                    </ApprovalTable>
                  </ResponsiveTableWrap>
                </Section>

                <Section>
                  <SectionTitle>영수증</SectionTitle>
                  <ReceiptSectionDescription>
                    현재는 품의서 작성 단계이지만, 추후 구매 완료 보고를 통한 결의서 작성 시 사용할
                    영수증을 미리 첨부해 둘 수 있습니다.
                  </ReceiptSectionDescription>
                  <AttachmentEditorPanel
                    existingAttachments={[]}
                    selectedFiles={receiptFiles}
                    onSelectFiles={(files) => setReceiptFiles((current) => [...current, ...files])}
                    onRemoveSelected={(file) =>
                      setReceiptFiles((current) =>
                        current.filter(
                          (currentFile) =>
                            !(
                              currentFile.name === file.name &&
                              currentFile.lastModified === file.lastModified
                            ),
                        ),
                      )
                    }
                    selectLabel="영수증 파일 선택"
                    emptyText="첨부된 영수증 파일이 없습니다."
                  />
                </Section>
              </>
            ) : (
              <Section>
                <SectionTitle>상세 품목</SectionTitle>
                <ItemList>
                  {items.map((item, index) => (
                    <ItemBlock key={item.id}>
                      <ItemFieldRow>
                        <ItemLabel htmlFor={`itemName-${item.id}`}>
                          {items.length > 1 ? `품목 ${index + 1}` : "품목"}
                        </ItemLabel>
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
                          onChange={(event) =>
                            updateItem(item.id, { quantity: event.target.value })
                          }
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
              </Section>
            )}
          </Form>
        </Content>
      </Stage>
      {customFieldModal ? (
        <ModalOverlay role="presentation">
          <ModalCard role="dialog" aria-modal="true" aria-labelledby="custom-input-modal-title">
            <ModalTitle id="custom-input-modal-title">
              {customFieldModal.field === "topDetailBusiness"
                ? "세부 사업 직접 입력"
                : customFieldModal.field === "budgetReason"
                  ? "세부 항목 직접 입력"
                  : customFieldModal.field === "paymentAccount"
                    ? "결제 통장 직접 입력"
                    : "산출 내역 직접 입력"}
            </ModalTitle>
            <ModalInput
              value={customFieldDraft}
              onChange={(event) => setCustomFieldDraft(event.target.value)}
              placeholder={
                customFieldModal.field === "topDetailBusiness"
                  ? "세부 사업 입력"
                  : customFieldModal.field === "budgetReason"
                    ? "세부 항목 입력"
                    : customFieldModal.field === "paymentAccount"
                      ? "결제 통장 입력"
                      : "산출 내역 입력"
              }
              autoFocus
            />
            <ModalActionRow>
              <ModalButton type="button" onClick={closeCustomFieldModal}>
                취소
              </ModalButton>
              <ModalButton
                type="button"
                $variant="primary"
                onClick={confirmCustomFieldModal}
                disabled={customFieldDraft.trim().length === 0}
              >
                확인
              </ModalButton>
            </ModalActionRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}
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

const ReceiptSectionDescription = styled.p`
  margin: 0;
  color: ${colors.placeholder};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const inputBase = `
  min-width: 0;
  border: 1px solid #c0c0c0;
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
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
  appearance: none;
  padding: 0.8125rem ${spacing.space32} 0.8125rem ${spacing.space12};
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000000' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right ${spacing.space12} center;
  background-repeat: no-repeat;

  @media (min-width: 120rem) {
    padding: ${spacing.space20} 3rem ${spacing.space20} ${spacing.space20};
    background-position: right ${spacing.space20} center;
  }
`;

const ApprovalNumberRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ApprovalNumberInput = styled(InlineInput)`
  background-color: ${colors.background};
  color: #6f6f6f;

  &:read-only {
    cursor: default;
  }
`;

const ApprovalNumberSelect = styled(InlineSelect)``;

const PaymentTypeGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

const PaymentTypeOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 1rem;
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  margin-right: 1rem;

  input {
    accent-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 2rem;
    font-size: ${typography.fontSize20};
    margin-right: 2rem;
  }
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

const ResponsiveTableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const tableCellBase = `
  border: 1px solid ${colors.borderStrong};
  padding: ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  vertical-align: middle;

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const SummaryTable = styled.table`
  width: 100%;
  min-width: 48rem;
  border-collapse: collapse;
  table-layout: fixed;
`;

const SummaryLabelCell = styled.th`
  ${tableCellBase}
  width: 10rem;
  background-color: ${colors.background};
  font-weight: 600;
  text-align: center;
`;

const SummaryValueCell = styled.td`
  ${tableCellBase}
  background-color: ${colors.white};
`;

const SummaryWideCell = styled(SummaryValueCell)`
  min-height: 10rem;
`;

const SummaryTextarea = styled.textarea`
  width: 100%;
  min-height: 9rem;
  border: 0;
  resize: vertical;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  outline: none;

  @media (min-width: 120rem) {
    min-height: 12rem;
    font-size: ${typography.fontSize20};
  }
`;

const SummaryInput = styled.input`
  ${inputBase}
  width: 100%;
  min-height: auto;
  border: 0;
  padding: 0;
`;

const SummarySelect = styled.select`
  ${inputBase}
  width: 100%;
  min-height: auto;
  border: 0;
  padding: 0;
  background: transparent;
`;

const BudgetTable = styled.table`
  width: 100%;
  min-width: 58rem;
  border-collapse: collapse;
  table-layout: fixed;
`;

const BudgetHeadCell = styled.th`
  ${tableCellBase}
  background-color: ${colors.background};
  font-weight: 600;
  text-align: center;
`;

const BudgetBodyCell = styled.td`
  ${tableCellBase}
  text-align: center;
`;

const BudgetTotalLabelCell = styled(BudgetBodyCell)`
  background-color: ${colors.background};
  font-weight: 600;
`;

const BudgetTotalValueCell = styled(BudgetBodyCell)`
  font-weight: 600;
`;

const BudgetInlineInput = styled.input`
  width: 100%;
  border: 0;
  background-color: transparent;
  text-align: center;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const BudgetInlineSelect = styled.select`
  width: 100%;
  border: 0;
  background-color: transparent;
  text-align: center;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ApprovalTable = styled.table`
  width: 100%;
  min-width: 46rem;
  border-collapse: collapse;
  table-layout: fixed;
`;

const ApprovalTypeCell = styled.th`
  ${tableCellBase}
  width: 6rem;
  background-color: ${colors.background};
  font-weight: 600;
  text-align: center;
`;

const ApprovalHeadCell = styled.th`
  ${tableCellBase}
  background-color: ${colors.background};
  font-weight: 600;
  text-align: center;
`;

const ApprovalBodyCell = styled.td`
  ${tableCellBase}
  text-align: center;
`;

const ApprovalEditableInput = styled.input`
  width: 100%;
  border: 0;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  text-align: center;
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -${spacing.space8};
`;

const ItemBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding: ${spacing.space20} 0 ${spacing.space20};
  border-bottom: 1px solid #bcbcbc;

  &:first-child {
    padding-top: ${spacing.space8};
  }

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: ${spacing.space20};
    padding-bottom: 1.875rem;

    &:first-child {
      padding-top: ${spacing.space12};
    }
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
  display: flex;
  justify-content: flex-end;
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

const MiniDeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background-color: ${colors.noticeSoft};
  color: ${colors.notice};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3rem;
    height: 3rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalCard = styled.div`
  width: min(100%, 28rem);
  display: flex;
  flex-direction: column;
  gap: ${spacing.space16};
  border-radius: ${radii.radius20};
  background-color: ${colors.white};
  padding: ${spacing.space24};
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.16);
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize18};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const ModalInput = styled.input`
  ${inputBase}
  width: 100%;
  padding: 0.8125rem ${spacing.space12};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const ModalActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space12};
`;

const ModalButton = styled.button<{ $variant?: "primary" }>`
  min-width: 5rem;
  min-height: 2.5rem;
  border: 1px solid ${({ $variant }) => ($variant === "primary" ? colors.point : colors.border)};
  border-radius: ${radii.radius12};
  background-color: ${({ $variant }) => ($variant === "primary" ? colors.point : colors.white)};
  color: ${({ $variant }) => ($variant === "primary" ? colors.white : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
