"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, Fragment, useMemo, useState } from "react";
import { IconDownload, IconFilePlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { uploadPurchaseItemImage } from "@/api/file/file.api";
import {
  deletePurchaseRequest,
  getPurchaseRequestDetail,
  reportPurchase,
  updateAdminPurchaseItemReceipts,
  updatePurchaseItemReceipts,
} from "@/api/request/request.api";
import type {
  PurchaseRequestItemResponseDto,
  PurchaseRequestListResponseDto,
  PurchaseRequestResponseDto,
  PurchaseRequestStatus,
} from "@/api/request/request.dto";
import { getVendors } from "@/api/vendor/vendor.api";
import {
  AttachmentEditorPanel,
  AttachmentDownloadList,
  type AttachmentItem,
} from "@/components/common/AttachmentField";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestDetailPageProps = {
  requestId: number;
};

type PaymentType = "PREPAID" | "ACTUAL";

type VendorBalance = {
  vendorId?: number;
  vendorName?: string;
  balance?: number;
};

type AffiliationOption = {
  id: number;
  label: string;
  value: string;
  type: "classroom" | "department";
};

type ExtendedPurchaseItem = PurchaseRequestItemResponseDto;

type ExtendedPurchaseRequest = PurchaseRequestResponseDto;

const fallbackVendorNames = ["예소디자인", "목민서관", "지성문구", "마트"] as const;

function getAffiliationLabel(request?: PurchaseRequestResponseDto) {
  return request?.departmentName ?? request?.classroomName ?? "-";
}

type EditableItem = {
  id: number;
  name: string;
  quantity: string;
  reason: string;
};

type ReportItem = {
  itemId: number;
  vendorId: string;
  vendorName: string;
  name: string;
  price: string;
  paymentMethod: string;
  receiptFile: File | null;
  receiptFileName: string;
  receiptFileId?: string;
  receiptFileUrl?: string;
  receiptPreviewUrl?: string;
};

type ParsedPrepaidBudgetItem = {
  id: number;
  detailBusiness: string;
  reason: string;
  name: string;
};

type ParsedPrepaidProduct = {
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

type ParsedPrepaidContent = {
  approvalNumber: string;
  paymentAccount: string;
  summary: string;
  policyProject: string;
  requestDepartmentName: string;
  approvalDate: string;
  detailBusiness: string;
  approvalAmount: string;
  budgetItems: ParsedPrepaidBudgetItem[];
  products: ParsedPrepaidProduct[];
  approvalEntries: ApprovalEntry[];
  cooperationEntries: ApprovalEntry[];
};

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
const paymentMethodOptions = ["현금", "법인카드", "계좌이체", "자동이체", "기타 납부"] as const;
const reportCustomOptionValue = "__report_custom__";

const statusLabels: Record<PurchaseRequestStatus, string> = {
  PENDING: "대기 중",
  APPROVED: "승인 완료",
  PURCHASED: "구매 완료",
  CONFIRMED: "결재 확인",
  REJECTED: "거절",
};

function getStatusLabel(status?: PurchaseRequestStatus) {
  return status ? (statusLabels[status] ?? status) : "-";
}

function formatAmount(amount?: number) {
  return typeof amount === "number" ? `${amount.toLocaleString()}원` : "-";
}

function getStatusTone(status?: PurchaseRequestStatus) {
  switch (status) {
    case "APPROVED":
      return "#3DA75C";
    case "PURCHASED":
      return "#2F80ED";
    case "CONFIRMED":
      return "#1D9A35";
    case "REJECTED":
      return "#DA3A30";
    case "PENDING":
    default:
      return "#E5AD34";
  }
}

function getReceiptName(receipt: {
  fileName?: string;
  originalName?: string;
  ext?: string;
  fileId?: string;
  receiptFileId?: string;
}) {
  if (receipt.fileName) {
    return receipt.fileName;
  }

  if (!receipt.originalName) {
    return receipt.fileId ?? receipt.receiptFileId ?? "영수증";
  }

  return receipt.ext && !receipt.originalName.endsWith(`.${receipt.ext}`)
    ? `${receipt.originalName}.${receipt.ext}`
    : receipt.originalName;
}

function mapPurchaseItemsToEditableItems(items?: PurchaseRequestItemResponseDto[]) {
  return (items ?? []).map((item, index) => {
    return {
      id: item.id ?? index + 1,
      name: item.name ?? "",
      quantity: typeof item.quantity === "number" ? String(item.quantity) : "1",
      reason: item.reason ?? "",
    };
  });
}

function getRequestPaymentType(items?: PurchaseRequestItemResponseDto[]): PaymentType {
  const paymentType = items?.find((item) => item.paymentType)?.paymentType;
  return paymentType === "PREPAID" ? "PREPAID" : "ACTUAL";
}

function parseNumericValue(value: string) {
  const normalized = value.replaceAll(",", "").replaceAll("원", "").trim();
  if (!normalized) return 0;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getApprovalNumber(referenceDate: string, paymentAccount: string) {
  if (!paymentAccount.trim()) {
    return "";
  }

  const year = referenceDate.slice(0, 4) || String(new Date().getFullYear());
  return `${year}품-${paymentAccount}-01`;
}

function getContentLineValue(content: string | undefined, label: string) {
  if (!content) {
    return "";
  }

  const line = content.split(/\r?\n/).find((currentLine) => currentLine.startsWith(`${label}:`));

  return line ? line.slice(label.length + 1).trim() : "";
}

function getContentSection(content: string | undefined, label: string, nextLabels: string[]) {
  if (!content) {
    return "";
  }

  const lines = content.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === label);

  if (startIndex < 0) {
    return "";
  }

  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && nextLabels.includes(line.trim()),
  );
  const sectionLines = lines.slice(startIndex + 1, endIndex >= 0 ? endIndex : undefined);

  return sectionLines.join("\n").trim();
}

function buildApprovalEntries(requestedByName?: string) {
  return [
    { position: "총무", name: requestedByName ?? "" },
    { position: "교장", name: "정혜웅" },
    { position: "", name: "" },
  ];
}

function buildCooperationEntries(departmentName?: string) {
  const firstPosition = departmentName && departmentName !== "총무부" ? `${departmentName}장` : "";

  return [
    { position: firstPosition, name: "" },
    { position: "", name: "" },
    { position: "", name: "" },
  ];
}

function parsePrepaidContent(purchase?: PurchaseRequestResponseDto): ParsedPrepaidContent | null {
  if (!purchase) {
    return null;
  }

  const content = purchase.content ?? "";
  const summary =
    getContentSection(content, "[품의 개요]", ["정책 사업:", "[예산 내역]"]) ||
    purchase.content ||
    "";
  const budgetSection = getContentSection(content, "[예산 내역]", ["[품목 내역]"]);
  const productSection = getContentSection(content, "[품목 내역]", []);

  const budgetLines = budgetSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const productLines = productSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => Boolean(line) && line !== "없음");

  const budgetItems =
    purchase.items?.map((item, index) => {
      const matchedLine = budgetLines[index] ?? "";
      const matched = matchedLine.match(
        /^\d+\.\s*세부사업:\s*(.*?)\s*\/\s*세부 항목:\s*(.*?)\s*\/\s*산출 내역:\s*(.*)$/,
      );

      return {
        id: item.id ?? index + 1,
        detailBusiness: matched?.[1]?.trim() ?? "",
        reason: matched?.[2]?.trim() ?? item.reason ?? "",
        name: matched?.[3]?.trim() ?? item.name ?? "",
      };
    }) ?? [];

  const products = productLines.map((line, index) => {
    const matched = line.match(
      /^\d+\.\s*내용:\s*(.*?)\s*\/\s*규격:\s*(.*?)\s*\/\s*수량:\s*(.*?)\s*\/\s*예상 단가:\s*(.*?)\s*\/\s*예상 금액:\s*(.*)$/,
    );

    return {
      id: index + 1,
      description: matched?.[1]?.trim() ?? "",
      specification: matched?.[2]?.trim() ?? "",
      quantity: matched?.[3]?.trim() ?? "0",
      unitPrice: matched?.[4]?.trim() ?? "0",
      amount: matched?.[5]?.trim() ?? "0",
    };
  });

  return {
    approvalNumber: getContentLineValue(content, "품의 번호"),
    paymentAccount: getContentLineValue(content, "결제 통장"),
    summary,
    policyProject: getContentLineValue(content, "정책 사업"),
    requestDepartmentName:
      getContentLineValue(content, "요구 부서") || purchase.departmentName || "-",
    approvalDate: getContentLineValue(content, "품의 일자"),
    detailBusiness: getContentLineValue(content, "세부 사업"),
    approvalAmount: getContentLineValue(content, "품의 금액").replaceAll("원", "").trim(),
    budgetItems,
    products,
    approvalEntries: buildApprovalEntries(purchase.requestedByName),
    cooperationEntries: buildCooperationEntries(
      getContentLineValue(content, "요구 부서") || purchase.departmentName,
    ),
  };
}

function mapPurchaseItemsToReportItems(purchase?: ExtendedPurchaseRequest): ReportItem[] {
  if (purchase?.transactions?.length) {
    return purchase.transactions.map((transaction, index) => {
      const item = findPurchaseItemForTransaction(transaction.itemNames, purchase.items);

      return {
        itemId: transaction.id ?? item?.id ?? index + 1,
        vendorId: typeof transaction.vendorId === "number" ? String(transaction.vendorId) : "",
        vendorName: transaction.vendorName ?? "",
        name: transaction.itemNames?.join(", ") || item?.name || "",
        price: typeof transaction.amount === "number" ? String(transaction.amount) : "0",
        paymentMethod: "",
        receiptFile: null,
        receiptFileName:
          transaction.receiptFileId || transaction.receiptFileUrl
            ? getReceiptName({ receiptFileId: transaction.receiptFileId })
            : "",
        receiptFileId: transaction.receiptFileId,
        receiptFileUrl: transaction.receiptFileUrl,
      };
    });
  }

  return (purchase?.items ?? [])
    .filter((item) => typeof item.id === "number")
    .map((item) => ({
      itemId: item.id ?? 0,
      vendorId: "",
      vendorName: purchase?.vendorName ?? "",
      name: item.name ?? "",
      price: "0",
      paymentMethod: "",
      receiptFile: null,
      receiptFileName: "",
    }));
}

function cloneReportItems(items: ReportItem[]) {
  return items.map((item) => ({ ...item }));
}

function getPrepaidReceiptAttachments(purchase?: ExtendedPurchaseRequest): AttachmentItem[] {
  return (purchase?.transactions ?? [])
    .filter((transaction) => Boolean(transaction.receiptFileUrl))
    .map((transaction, index) => ({
      id: String(transaction.id ?? `receipt-${index}`),
      label: purchase?.transactions?.length === 1 ? "영수증" : `영수증 ${index + 1}`,
      href: transaction.receiptFileUrl ?? "#",
    }));
}

function findPurchaseItemForTransaction(
  transactionItemNames?: string[],
  items?: PurchaseRequestItemResponseDto[],
) {
  return items?.find((item) => {
    if (!item.name) {
      return false;
    }

    return transactionItemNames?.some((name) => name.trim() === item.name);
  });
}

export default function FinanceRequestDetailPage({ requestId }: FinanceRequestDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAffiliationValue, setEditAffiliationValue] = useState("");
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [editPrepaidContent, setEditPrepaidContent] = useState<ParsedPrepaidContent | null>(null);
  const [editPrepaidDepartmentId, setEditPrepaidDepartmentId] = useState("");
  const [editReceiptFiles, setEditReceiptFiles] = useState<File[]>([]);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [savedPrepaidReportItems, setSavedPrepaidReportItems] = useState<ReportItem[]>([]);
  const [customReportFieldModal, setCustomReportFieldModal] = useState<{
    field: "vendor" | "paymentMethod";
    itemId: number;
  } | null>(null);
  const [customReportFieldDraft, setCustomReportFieldDraft] = useState("");
  const [isReportEditing, setIsReportEditing] = useState(false);
  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.requests.purchaseDetail(requestId),
    queryFn: () => getPurchaseRequestDetail({ requestId }),
    retry: false,
  });
  const { data: vendorData } = useQuery({
    queryKey: queryKeys.vendors.list(),
    queryFn: () => getVendors(),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const { data: classroomData } = useQuery({
    queryKey: queryKeys.classrooms.list(),
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    retry: false,
  });
  const { data: departmentData } = useQuery({
    queryKey: ["departments", "finance-request-detail"],
    queryFn: () => getDepartments(),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePurchaseRequest({ requestId }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseDetail(requestId) });
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseList() });
      router.replace("/staff/finance-management");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "결제 신청 삭제에 실패했습니다."));
    },
  });

  const purchase = request as ExtendedPurchaseRequest | undefined;
  const requestPaymentType = getRequestPaymentType(request?.items);
  const initialEditItems = useMemo(
    () => mapPurchaseItemsToEditableItems(request?.items),
    [request?.items],
  );
  const parsedPrepaidContent = useMemo(
    () => (requestPaymentType === "PREPAID" ? parsePrepaidContent(purchase) : null),
    [purchase, requestPaymentType],
  );
  const prepaidReceiptAttachments = useMemo(
    () => (requestPaymentType === "PREPAID" ? getPrepaidReceiptAttachments(request) : []),
    [request, requestPaymentType],
  );
  const activePrepaidContent = isEditing ? editPrepaidContent : parsedPrepaidContent;
  const initialReportItems = useMemo(() => mapPurchaseItemsToReportItems(purchase), [purchase]);
  const persistedPrepaidReportItems =
    savedPrepaidReportItems.length > 0 ? savedPrepaidReportItems : initialReportItems;
  const activeReportItems =
    reportItems.length > 0
      ? reportItems
      : requestPaymentType === "PREPAID"
        ? persistedPrepaidReportItems
        : initialReportItems;
  const classrooms = useMemo(() => classroomData?.content ?? [], [classroomData]);
  const departments = useMemo(() => departmentData?.departments ?? [], [departmentData]);
  const affiliationOptions = useMemo<AffiliationOption[]>(
    () => [
      ...classrooms
        .filter((classroom) => typeof classroom.id === "number")
        .map((classroom) => ({
          id: classroom.id as number,
          label: classroom.name ?? `반 ${classroom.id}`,
          value: `classroom:${classroom.id}`,
          type: "classroom" as const,
        })),
      ...departments
        .filter((department) => typeof department.id === "number")
        .map((department) => ({
          id: department.id as number,
          label: department.name ?? `부서 ${department.id}`,
          value: `department:${department.id}`,
          type: "department" as const,
        })),
    ],
    [classrooms, departments],
  );
  const selectedAffiliation = affiliationOptions.find(
    (option) => option.value === editAffiliationValue,
  );
  const requestAffiliationValue = useMemo(() => {
    const currentAffiliation = affiliationOptions.find((option) =>
      option.type === "department"
        ? typeof request?.departmentId === "number"
          ? option.id === request.departmentId
          : option.label === request?.departmentName
        : typeof request?.classroomId === "number"
          ? option.id === request.classroomId
          : option.label === request?.classroomName,
    );

    return currentAffiliation?.value ?? "";
  }, [affiliationOptions, request]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      const uploadedReceiptIds = await Promise.all(
        activeReportItems.map(async (item) => {
          if (!item.receiptFile) {
            return null;
          }

          const uploaded = await uploadPurchaseItemImage(item.receiptFile, item.receiptFile.name);
          return uploaded.fileId ?? null;
        }),
      );

      const body = {
        transactions: activeReportItems.map((item, index) => ({
          vendorId: Number(item.vendorId),
          itemNames: item.name
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean),
          amount: Number(item.price),
          ...(uploadedReceiptIds[index] || item.receiptFileId
            ? { receiptFileId: uploadedReceiptIds[index] ?? item.receiptFileId }
            : {}),
        })),
      };

      if (isReportEditing) {
        return user?.role === "ADMIN"
          ? updateAdminPurchaseItemReceipts({ requestId }, body)
          : updatePurchaseItemReceipts({ requestId }, body);
      }

      return reportPurchase({ requestId }, body);
    },
    onSuccess: () => {
      if (requestPaymentType === "PREPAID") {
        setSavedPrepaidReportItems(cloneReportItems(activeReportItems));
      }
      setIsReportEditing(false);
      setReportItems([]);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.purchaseDetail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.purchaseList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.list() });
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          isReportEditing
            ? "구매 완료 보고 수정에 실패했습니다."
            : "구매 완료 보고에 실패했습니다.",
        ),
      );
    },
  });

  const detailItems = purchase?.transactions?.length
    ? purchase.transactions.map((transaction, index) => {
        const item = findPurchaseItemForTransaction(transaction.itemNames, purchase.items);

        return {
          id: transaction.id ?? item?.id ?? index,
          name: transaction.itemNames?.join(", ") || item?.name || "-",
          reason: item?.reason ?? purchase.content ?? "-",
          quantity: item?.quantity,
          paymentType: item?.paymentType,
          vendorName: transaction.vendorName,
          price: transaction.amount,
          receipt:
            transaction.receiptFileId || transaction.receiptFileUrl
              ? {
                  receiptFileId: transaction.receiptFileId,
                  fileUrl: transaction.receiptFileUrl,
                }
              : undefined,
        };
      })
    : purchase?.items?.length
      ? purchase.items.map((item, index) => {
          const extendedItem = item as ExtendedPurchaseItem;
          return {
            id: item.id ?? index,
            name: item.name ?? "-",
            reason: item.reason ?? purchase.content ?? "-",
            quantity: extendedItem.quantity,
            paymentType: extendedItem.paymentType,
            vendorName: purchase.vendorName,
            price: undefined,
            receipt: undefined,
          };
        })
      : [
          {
            id: purchase?.id ?? 0,
            name: purchase?.title ?? "-",
            reason: purchase?.content ?? "-",
            quantity: undefined,
            paymentType: undefined,
            vendorName: purchase?.vendorName,
            price: purchase?.totalPrice,
            receipt: undefined,
          },
        ];
  const isRequester =
    authStatus === "authenticated" &&
    typeof user?.id === "number" &&
    typeof request?.requestedById === "number" &&
    user.id === request.requestedById;
  const isAdmin = authStatus === "authenticated" && user?.role === "ADMIN";
  const canManageRequest = isAdmin || isRequester;
  const canManagePurchaseReport = authStatus === "authenticated" && canManageRequest;
  const canEditRequest = request?.status === "PENDING" && canManageRequest;
  const canDeleteRequest = request?.status === "PENDING" && canManageRequest;
  const canShowReportForm = request?.status === "APPROVED" && isRequester;
  const canEditPurchaseReport =
    (request?.status === "PURCHASED" || request?.status === "CONFIRMED") && canManagePurchaseReport;
  const canShowReportSection =
    requestPaymentType === "PREPAID"
      ? canShowReportForm || canEditPurchaseReport || isReportEditing
      : canShowReportForm || isReportEditing;
  const isPrepaidReportReadOnly =
    requestPaymentType === "PREPAID" && canEditPurchaseReport && !isReportEditing;
  const canPrintApprovalForm =
    request?.status === "APPROVED" ||
    request?.status === "PURCHASED" ||
    request?.status === "CONFIRMED";
  const canPrintResolutionForm = request?.status === "CONFIRMED";
  const vendorBalances: VendorBalance[] = vendorData?.length
    ? vendorData.map((vendor) => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        balance: vendor.balance,
      }))
    : (purchase?.vendorBalances ?? []);
  const vendorNames = vendorBalances.length
    ? vendorBalances
        .map((vendor) => vendor.vendorName)
        .filter((name): name is string => Boolean(name))
    : [...fallbackVendorNames];
  const vendorOptions = vendorBalances
    .filter((vendor) => typeof vendor.vendorId === "number" && Boolean(vendor.vendorName))
    .map((vendor) => ({ id: vendor.vendorId as number, name: vendor.vendorName as string }));
  const canSubmitReport =
    canShowReportSection &&
    !isPrepaidReportReadOnly &&
    activeReportItems.length > 0 &&
    activeReportItems.every(
      (item) =>
        Number.isInteger(Number(item.vendorId)) &&
        item.name.trim().length > 0 &&
        item.price.trim().length > 0 &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 1 &&
        (requestPaymentType !== "PREPAID" || item.paymentMethod.trim().length > 0),
    ) &&
    !reportMutation.isPending;
  const prepaidQuantityTotal =
    activePrepaidContent?.products.reduce(
      (sum, item) => sum + parseNumericValue(item.quantity),
      0,
    ) ?? 0;
  const prepaidAmountTotal =
    activePrepaidContent?.products.reduce((sum, item) => sum + parseNumericValue(item.amount), 0) ??
    0;

  function updateReportItem(
    itemId: number,
    patch: Partial<{
      vendorName: string;
      vendorId: string;
      name: string;
      price: string;
      paymentMethod: string;
      receiptFile: File | null;
      receiptFileName: string;
      receiptFileId: string;
      receiptFileUrl: string;
      receiptPreviewUrl: string;
    }>,
  ) {
    setReportItems((current) =>
      (current.length ? current : initialReportItems).map((item) =>
        item.itemId === itemId ? { ...item, ...patch } : item,
      ),
    );
  }

  function handleReceiptChange(itemId: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const previewUrl = file ? URL.createObjectURL(file) : undefined;
    updateReportItem(itemId, {
      receiptFile: file,
      receiptFileName: file?.name ?? "",
      receiptPreviewUrl: previewUrl,
    });
  }

  function openCustomReportFieldModal(field: "vendor" | "paymentMethod", itemId: number) {
    const currentItem = activeReportItems.find((item) => item.itemId === itemId);
    const draft =
      field === "vendor"
        ? currentItem?.vendorId === reportCustomOptionValue
          ? (currentItem.vendorName ?? "")
          : ""
        : paymentMethodOptions.includes(
              (currentItem?.paymentMethod ?? "") as (typeof paymentMethodOptions)[number],
            )
          ? ""
          : (currentItem?.paymentMethod ?? "");

    setCustomReportFieldDraft(draft);
    setCustomReportFieldModal({ field, itemId });
  }

  function closeCustomReportFieldModal() {
    setCustomReportFieldModal(null);
    setCustomReportFieldDraft("");
  }

  function confirmCustomReportFieldModal() {
    const nextValue = customReportFieldDraft.trim();

    if (!customReportFieldModal || !nextValue) {
      return;
    }

    if (customReportFieldModal.field === "vendor") {
      updateReportItem(customReportFieldModal.itemId, {
        vendorId: reportCustomOptionValue,
        vendorName: nextValue,
      });
    }

    if (customReportFieldModal.field === "paymentMethod") {
      updateReportItem(customReportFieldModal.itemId, { paymentMethod: nextValue });
    }

    closeCustomReportFieldModal();
  }

  function updateEditItem(itemId: number, patch: Partial<EditableItem>) {
    setEditItems((current) =>
      (current.length ? current : initialEditItems).map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    );
  }

  function addEditItem() {
    setEditItems((current) => {
      const source = current.length ? current : initialEditItems;
      const nextId = source.length ? Math.max(...source.map((item) => item.id)) + 1 : 1;

      return [
        ...source,
        {
          id: nextId,
          name: "",
          quantity: "1",
          reason: "",
        },
      ];
    });
  }

  function removeEditItem(itemId: number) {
    setEditItems((current) => {
      const source = current.length ? current : initialEditItems;

      if (source.length <= 1) {
        return [
          {
            id: source[0]?.id ?? 1,
            name: "",
            quantity: "1",
            reason: "",
          },
        ];
      }

      return source.filter((item) => item.id !== itemId);
    });
  }

  function updateEditPrepaidContent(patch: Partial<ParsedPrepaidContent>) {
    setEditPrepaidContent((current) => (current ? { ...current, ...patch } : current));
  }

  function syncEditPrepaidDepartment(departmentId: string) {
    setEditPrepaidDepartmentId(departmentId);
    setEditPrepaidContent((current) => {
      if (!current) {
        return current;
      }

      const department = departments.find((item) => String(item.id) === departmentId);
      const nextDepartmentName = department?.name ?? "";
      const nextCooperationPosition =
        nextDepartmentName && nextDepartmentName !== "총무부" ? `${nextDepartmentName}장` : "";

      return {
        ...current,
        requestDepartmentName: nextDepartmentName,
        cooperationEntries: current.cooperationEntries.map((entry, index) =>
          index === 0 ? { ...entry, position: nextCooperationPosition } : entry,
        ),
      };
    });
  }

  function syncEditPrepaidDetailBusiness(value: string) {
    setEditPrepaidContent((current) =>
      current
        ? {
            ...current,
            detailBusiness: value,
            budgetItems: current.budgetItems.map((item) => ({
              ...item,
              detailBusiness: value,
            })),
          }
        : current,
    );
  }

  function updateEditPrepaidBudgetItem(itemId: number, patch: Partial<ParsedPrepaidBudgetItem>) {
    setEditPrepaidContent((current) =>
      current
        ? {
            ...current,
            budgetItems: current.budgetItems.map((item) =>
              item.id === itemId ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  }

  function updateEditPrepaidProduct(itemId: number, patch: Partial<ParsedPrepaidProduct>) {
    setEditPrepaidContent((current) =>
      current
        ? {
            ...current,
            products: current.products.map((item) =>
              item.id === itemId ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  }

  function updateEditPrepaidProductCalculated(
    itemId: number,
    field: "quantity" | "unitPrice",
    value: string,
  ) {
    setEditPrepaidContent((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        products: current.products.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const next = { ...item, [field]: value };
          const quantity = parseNumericValue(next.quantity);
          const unitPrice = parseNumericValue(next.unitPrice);

          return {
            ...next,
            amount: quantity > 0 && unitPrice > 0 ? String(quantity * unitPrice) : "",
          };
        }),
      };
    });
  }

  function addEditPrepaidProduct() {
    setEditPrepaidContent((current) =>
      current
        ? {
            ...current,
            products: [
              ...current.products,
              {
                id: Math.max(0, ...current.products.map((item) => item.id)) + 1,
                description: "",
                specification: "",
                quantity: "1",
                unitPrice: "",
                amount: "",
              },
            ],
          }
        : current,
    );
  }

  function removeEditPrepaidProduct(itemId: number) {
    setEditPrepaidContent((current) => {
      if (!current) {
        return current;
      }

      if (current.products.length <= 1) {
        return {
          ...current,
          products: [
            {
              id: current.products[0]?.id ?? 1,
              description: "",
              specification: "",
              quantity: "1",
              unitPrice: "",
              amount: "",
            },
          ],
        };
      }

      return {
        ...current,
        products: current.products.filter((item) => item.id !== itemId),
      };
    });
  }

  function updateEditApprovalEntry(
    kind: "approval" | "cooperation",
    index: number,
    patch: Partial<ApprovalEntry>,
  ) {
    setEditPrepaidContent((current) => {
      if (!current) {
        return current;
      }

      const key = kind === "approval" ? "approvalEntries" : "cooperationEntries";
      return {
        ...current,
        [key]: current[key].map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, ...patch } : entry,
        ),
      } as ParsedPrepaidContent;
    });
  }

  function startEditing() {
    if (!request) {
      return;
    }

    setEditReceiptFiles([]);
    setEditTitle(request.title ?? "");
    setEditAffiliationValue(requestAffiliationValue);
    if (requestPaymentType === "PREPAID" && parsedPrepaidContent) {
      setEditPrepaidContent(parsedPrepaidContent);
      const matchedDepartment = departments.find(
        (department) => department.name === parsedPrepaidContent.requestDepartmentName,
      );
      setEditPrepaidDepartmentId(matchedDepartment?.id != null ? String(matchedDepartment.id) : "");
      setEditItems([]);
    } else {
      setEditItems(initialEditItems);
      setEditPrepaidContent(null);
      setEditPrepaidDepartmentId("");
    }
    setIsEditing(true);
  }

  function startReportEditing() {
    const sourceItems =
      requestPaymentType === "PREPAID" ? persistedPrepaidReportItems : initialReportItems;
    setReportItems(cloneReportItems(sourceItems));
    setIsReportEditing(true);
  }

  function cancelReportEditing() {
    setReportItems([]);
    setIsReportEditing(false);
  }

  function cancelEditing() {
    setEditReceiptFiles([]);
    setIsEditing(false);
  }

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitReport) {
      return;
    }
    reportMutation.mutate();
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request) {
      return;
    }

    if (requestPaymentType === "PREPAID" && editPrepaidContent) {
      const selectedDepartment = departments.find(
        (department) => String(department.id) === editPrepaidDepartmentId,
      );
      const nextApprovalNumber = getApprovalNumber(
        editPrepaidContent.approvalDate,
        editPrepaidContent.paymentAccount,
      );
      const budgetContent = editPrepaidContent.budgetItems
        .map(
          (item, index) =>
            `${index + 1}. 세부사업: ${item.detailBusiness || editPrepaidContent.detailBusiness || "-"} / 세부 항목: ${item.reason || "-"} / 산출 내역: ${item.name || "-"}`,
        )
        .join("\n");
      const productContent =
        editPrepaidContent.products.length > 0
          ? editPrepaidContent.products
              .map(
                (item, index) =>
                  `${index + 1}. 내용: ${item.description || "-"} / 규격: ${item.specification || "-"} / 수량: ${item.quantity || 0} / 예상 단가: ${item.unitPrice || 0} / 예상 금액: ${item.amount || 0}`,
              )
              .join("\n")
          : "없음";
      const nextContent = [
        `분반: ${selectedAffiliation?.label ?? getAffiliationLabel(request)}`,
        `신청자: ${request.requestedByName ?? "-"}`,
        "결제 유형: 선금 결제",
        "",
        `[품의 번호]`,
        `품의 번호: ${nextApprovalNumber || "-"}`,
        `결제 통장: ${editPrepaidContent.paymentAccount || "-"}`,
        "",
        `[품의 개요]`,
        editPrepaidContent.summary.trim(),
        `정책 사업: ${editPrepaidContent.policyProject || "-"}`,
        `요구 부서: ${selectedDepartment?.name ?? editPrepaidContent.requestDepartmentName ?? "-"}`,
        `단위 사업: ${unitBusinessLabel}`,
        `품의 일자: ${editPrepaidContent.approvalDate || "-"}`,
        `세부 사업: ${editPrepaidContent.detailBusiness || "-"}`,
        `품의 금액: ${editPrepaidContent.approvalAmount || "0"}원`,
        "",
        `[예산 내역]`,
        budgetContent,
        "",
        `[품목 내역]`,
        productContent,
      ].join("\n");

      const nextRequest = {
        ...request,
        title: editTitle.trim() || request.title,
        classroomId:
          selectedAffiliation?.type === "classroom" ? selectedAffiliation.id : request.classroomId,
        classroomName:
          selectedAffiliation?.type === "classroom"
            ? selectedAffiliation.label
            : request.classroomName,
        departmentId:
          selectedAffiliation?.type === "department"
            ? selectedAffiliation.id
            : request.departmentId,
        departmentName:
          selectedAffiliation?.type === "department"
            ? selectedAffiliation.label
            : request.departmentName,
        content: nextContent,
        items: editPrepaidContent.budgetItems.map((item) => ({
          id: item.id,
          name: item.name.trim(),
          reason: item.reason.trim() || undefined,
          quantity: 1,
          paymentType: "PREPAID" as const,
        })),
      };

      queryClient.setQueryData(queryKeys.requests.purchaseDetail(requestId), nextRequest);
      queryClient.setQueryData<PurchaseRequestListResponseDto | undefined>(
        queryKeys.requests.purchaseList(),
        (current) =>
          current
            ? {
                ...current,
                content: current.content.map((item) =>
                  item.id === requestId ? { ...item, ...nextRequest } : item,
                ),
              }
            : current,
      );
      cancelEditing();
      return;
    }

    const nextRequest = {
      ...request,
      title: editTitle.trim() || request.title,
      classroomId:
        selectedAffiliation?.type === "classroom" ? selectedAffiliation.id : request.classroomId,
      classroomName:
        selectedAffiliation?.type === "classroom"
          ? selectedAffiliation.label
          : request.classroomName,
      departmentId:
        selectedAffiliation?.type === "department" ? selectedAffiliation.id : request.departmentId,
      departmentName:
        selectedAffiliation?.type === "department"
          ? selectedAffiliation.label
          : request.departmentName,
      items: (editItems.length ? editItems : initialEditItems).map((item) => ({
        id: item.id,
        name: item.name.trim(),
        reason: item.reason.trim() || undefined,
        quantity: Number(item.quantity),
        paymentType: getRequestPaymentType(request.items),
      })),
    };

    queryClient.setQueryData(queryKeys.requests.purchaseDetail(requestId), nextRequest);
    queryClient.setQueryData<PurchaseRequestListResponseDto | undefined>(
      queryKeys.requests.purchaseList(),
      (current) =>
        current
          ? {
              ...current,
              content: current.content.map((item) =>
                item.id === requestId ? { ...item, ...nextRequest } : item,
              ),
            }
          : current,
    );
    cancelEditing();
  }

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <Actions>
            {!isEditing && requestPaymentType === "PREPAID" ? (
              <ActionGroup>
                <ActionButton type="button" $variant="edit" disabled={!canPrintApprovalForm}>
                  품의서 출력
                </ActionButton>
                <ActionButton type="button" $variant="edit" disabled={!canPrintResolutionForm}>
                  결의서 출력
                </ActionButton>
              </ActionGroup>
            ) : (
              <div />
            )}
            <ActionGroup>
              {isEditing ? (
                <>
                  <ActionButton type="submit" form="finance-request-edit-form" $variant="edit">
                    수정 완료
                  </ActionButton>
                  <CancelTopButton type="button" onClick={cancelEditing}>
                    취소
                  </CancelTopButton>
                </>
              ) : (
                <>
                  {canManageRequest ? (
                    <>
                      <ActionButton
                        type="button"
                        $variant="danger"
                        disabled={!canDeleteRequest || deleteMutation.isPending || isLoading}
                        title={
                          canDeleteRequest
                            ? undefined
                            : "관리자이거나 대기 중인 본인 작성 글만 삭제할 수 있습니다."
                        }
                        onClick={() => deleteMutation.mutate()}
                      >
                        {deleteMutation.isPending ? "삭제 중" : "삭제"}
                      </ActionButton>
                      <ActionButton
                        type="button"
                        $variant="edit"
                        disabled={!canEditRequest}
                        title={
                          canEditRequest
                            ? undefined
                            : "관리자이거나 대기 중인 본인 작성 글만 수정할 수 있습니다."
                        }
                        onClick={startEditing}
                      >
                        수정
                      </ActionButton>
                    </>
                  ) : null}
                  <ListButton href="/staff/finance-management">목록</ListButton>
                </>
              )}
            </ActionGroup>
          </Actions>

          {isLoading ? <StateMessage>결제 신청 정보를 불러오는 중입니다.</StateMessage> : null}
          {isError ? (
            <StateMessage role="alert">결제 신청 정보를 불러오지 못했습니다.</StateMessage>
          ) : null}
          {request ? (
            <ContentColumn
              as={isEditing ? "form" : "article"}
              id={isEditing ? "finance-request-edit-form" : undefined}
              onSubmit={handleEditSubmit}
            >
              <DateBar>{formatUtcToKstShortDate(request.createdAt)}</DateBar>

              <Section>
                <Label>제목</Label>
                {isEditing ? (
                  <EditInput
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                ) : (
                  <Field>{request.title ?? "-"}</Field>
                )}
              </Section>

              <Section>
                <SectionTitle>신청자 정보</SectionTitle>
                <InfoRow>
                  <InlineLabel htmlFor="edit-affiliation" as="label">
                    소속
                  </InlineLabel>
                  {isEditing ? (
                    <EditSelect
                      id="edit-affiliation"
                      name="affiliation"
                      value={editAffiliationValue}
                      onChange={(event) => setEditAffiliationValue(event.target.value)}
                      required
                    >
                      <option value="">소속 선택</option>
                      {affiliationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </EditSelect>
                  ) : (
                    <InlineField>{getAffiliationLabel(request)}</InlineField>
                  )}
                  <InlineLabel>신청자</InlineLabel>
                  <InlineField>{request.requestedByName ?? "-"}</InlineField>
                </InfoRow>
              </Section>

              <Section>
                <SectionTitle>결제 유형</SectionTitle>
                <PaymentTypeGroup aria-disabled="true">
                  <PaymentTypeOption>
                    <input
                      type="checkbox"
                      name="edit-paymentType"
                      value="PREPAID"
                      checked={getRequestPaymentType(request.items) === "PREPAID"}
                      disabled
                      readOnly
                    />
                    <span>선금 결제</span>
                  </PaymentTypeOption>
                  <PaymentTypeOption>
                    <input
                      type="checkbox"
                      name="edit-paymentType"
                      value="ACTUAL"
                      checked={getRequestPaymentType(request.items) === "ACTUAL"}
                      disabled
                      readOnly
                    />
                    <span>실 결제</span>
                  </PaymentTypeOption>
                </PaymentTypeGroup>
              </Section>

              {requestPaymentType === "PREPAID" ? (
                <>
                  {isEditing && editPrepaidContent ? (
                    <>
                      <Section>
                        <SectionTitle>품의 번호</SectionTitle>
                        <ApprovalNumberRow>
                          <ApprovalNumberField>
                            {getApprovalNumber(
                              editPrepaidContent.approvalDate,
                              editPrepaidContent.paymentAccount,
                            ) || "-"}
                          </ApprovalNumberField>
                          <EditSelect
                            value={editPrepaidContent.paymentAccount}
                            onChange={(event) =>
                              updateEditPrepaidContent({ paymentAccount: event.target.value })
                            }
                          >
                            <option value="">결제 통장 선택</option>
                            {paymentAccountOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                            {editPrepaidContent.paymentAccount &&
                            !paymentAccountOptions.some(
                              (option) => option === editPrepaidContent.paymentAccount,
                            ) ? (
                              <option value={editPrepaidContent.paymentAccount}>
                                {editPrepaidContent.paymentAccount}
                              </option>
                            ) : null}
                          </EditSelect>
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
                                  <SummaryTextareaInput
                                    value={editPrepaidContent.summary}
                                    onChange={(event) =>
                                      updateEditPrepaidContent({ summary: event.target.value })
                                    }
                                  />
                                </SummaryWideCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>정책 사업</SummaryLabelCell>
                                <SummaryValueCell>
                                  {editPrepaidContent.policyProject || "-"}
                                </SummaryValueCell>
                                <SummaryLabelCell>요구 부서</SummaryLabelCell>
                                <SummaryValueCell>
                                  <SummaryCellSelect
                                    value={editPrepaidDepartmentId}
                                    onChange={(event) =>
                                      syncEditPrepaidDepartment(event.target.value)
                                    }
                                  >
                                    <option value="">부서 선택</option>
                                    {departments.map((department) => (
                                      <option key={department.id} value={department.id}>
                                        {department.name ?? `부서 ${department.id}`}
                                      </option>
                                    ))}
                                  </SummaryCellSelect>
                                </SummaryValueCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>단위 사업</SummaryLabelCell>
                                <SummaryValueCell>{unitBusinessLabel}</SummaryValueCell>
                                <SummaryLabelCell>품의 일자</SummaryLabelCell>
                                <SummaryValueCell>
                                  <SummaryCellInput
                                    type="date"
                                    value={editPrepaidContent.approvalDate}
                                    onChange={(event) =>
                                      updateEditPrepaidContent({
                                        approvalDate: event.target.value,
                                        policyProject: `${
                                          event.target.value.slice(0, 4) || new Date().getFullYear()
                                        }년 성인문해교육 지원사업`,
                                      })
                                    }
                                  />
                                </SummaryValueCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>세부 사업</SummaryLabelCell>
                                <SummaryValueCell>
                                  <SummaryCellSelect
                                    value={editPrepaidContent.detailBusiness}
                                    onChange={(event) =>
                                      syncEditPrepaidDetailBusiness(event.target.value)
                                    }
                                  >
                                    <option value="">세부 사업 선택</option>
                                    {detailBusinessOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                    {editPrepaidContent.detailBusiness &&
                                    !detailBusinessOptions.some(
                                      (option) => option === editPrepaidContent.detailBusiness,
                                    ) ? (
                                      <option value={editPrepaidContent.detailBusiness}>
                                        {editPrepaidContent.detailBusiness}
                                      </option>
                                    ) : null}
                                  </SummaryCellSelect>
                                </SummaryValueCell>
                                <SummaryLabelCell>품의 금액</SummaryLabelCell>
                                <SummaryValueCell>
                                  <SummaryCellInput
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={editPrepaidContent.approvalAmount}
                                    onChange={(event) =>
                                      updateEditPrepaidContent({
                                        approvalAmount: event.target.value,
                                      })
                                    }
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
                              {editPrepaidContent.budgetItems.map((item, index) => (
                                <tr key={item.id}>
                                  <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                                  <BudgetBodyCell>
                                    <BudgetInlineInput
                                      value={
                                        item.detailBusiness || editPrepaidContent.detailBusiness
                                      }
                                      onChange={(event) =>
                                        updateEditPrepaidBudgetItem(item.id, {
                                          detailBusiness: event.target.value,
                                        })
                                      }
                                      placeholder="세부 사업"
                                    />
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>
                                    <BudgetInlineSelect
                                      value={item.reason}
                                      onChange={(event) =>
                                        updateEditPrepaidBudgetItem(item.id, {
                                          reason: event.target.value,
                                        })
                                      }
                                    >
                                      <option value="">세부 항목</option>
                                      {budgetItemReasonOptions.map((option) => (
                                        <option key={`${item.id}-${option}`} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                      {item.reason &&
                                      !budgetItemReasonOptions.some(
                                        (option) => option === item.reason,
                                      ) ? (
                                        <option value={item.reason}>{item.reason}</option>
                                      ) : null}
                                    </BudgetInlineSelect>
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>
                                    <BudgetInlineSelect
                                      value={item.name}
                                      onChange={(event) =>
                                        updateEditPrepaidBudgetItem(item.id, {
                                          name: event.target.value,
                                        })
                                      }
                                    >
                                      <option value="">산출 내역</option>
                                      {budgetItemNameOptions.map((option) => (
                                        <option key={`${item.id}-name-${option}`} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                      {item.name &&
                                      !budgetItemNameOptions.some(
                                        (option) => option === item.name,
                                      ) ? (
                                        <option value={item.name}>{item.name}</option>
                                      ) : null}
                                    </BudgetInlineSelect>
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>
                                    <BudgetInlineInput
                                      type="number"
                                      min="0"
                                      inputMode="numeric"
                                      value={editPrepaidContent.approvalAmount}
                                      onChange={(event) =>
                                        updateEditPrepaidContent({
                                          approvalAmount: event.target.value,
                                        })
                                      }
                                    />
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                </tr>
                              ))}
                              <tr>
                                <BudgetTotalLabelCell colSpan={4}>합계</BudgetTotalLabelCell>
                                <BudgetTotalValueCell>
                                  {editPrepaidContent.approvalAmount || "-"}
                                </BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
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
                                {editPrepaidContent.products.length > 1 ? (
                                  <BudgetHeadCell>삭제</BudgetHeadCell>
                                ) : null}
                              </tr>
                            </thead>
                            <tbody>
                              {editPrepaidContent.products.map((product, index) => (
                                <tr key={product.id}>
                                  <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                                  <BudgetBodyCell>
                                    <BudgetInlineInput
                                      value={product.description}
                                      onChange={(event) =>
                                        updateEditPrepaidProduct(product.id, {
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
                                        updateEditPrepaidProduct(product.id, {
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
                                        updateEditPrepaidProductCalculated(
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
                                        updateEditPrepaidProductCalculated(
                                          product.id,
                                          "unitPrice",
                                          event.target.value,
                                        )
                                      }
                                      placeholder="0"
                                    />
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>
                                    <BudgetInlineInput value={product.amount} readOnly />
                                  </BudgetBodyCell>
                                  {editPrepaidContent.products.length > 1 ? (
                                    <BudgetBodyCell>
                                      <MiniDeleteButton
                                        type="button"
                                        aria-label={`${index + 1}번 품목 삭제`}
                                        onClick={() => removeEditPrepaidProduct(product.id)}
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
                                  {prepaidQuantityTotal.toLocaleString()}
                                </BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
                                <BudgetTotalValueCell>
                                  {prepaidAmountTotal.toLocaleString()}
                                </BudgetTotalValueCell>
                                {editPrepaidContent.products.length > 1 ? (
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                ) : null}
                              </tr>
                            </tbody>
                          </BudgetTable>
                        </ResponsiveTableWrap>
                        <AddItemButton type="button" onClick={addEditPrepaidProduct}>
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
                                {editPrepaidContent.approvalEntries.map((entry, index) => (
                                  <Fragment key={`edit-approval-${index}`}>
                                    <ApprovalBodyCell>
                                      <ApprovalEditableInput
                                        value={entry.position}
                                        onChange={(event) =>
                                          updateEditApprovalEntry("approval", index, {
                                            position: event.target.value,
                                          })
                                        }
                                      />
                                    </ApprovalBodyCell>
                                    <ApprovalBodyCell>
                                      <ApprovalEditableInput
                                        value={entry.name}
                                        onChange={(event) =>
                                          updateEditApprovalEntry("approval", index, {
                                            name: event.target.value,
                                          })
                                        }
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
                                {editPrepaidContent.cooperationEntries.map((entry, index) => (
                                  <Fragment key={`edit-cooperation-${index}`}>
                                    <ApprovalBodyCell>
                                      <ApprovalEditableInput
                                        value={entry.position}
                                        onChange={(event) =>
                                          updateEditApprovalEntry("cooperation", index, {
                                            position: event.target.value,
                                          })
                                        }
                                      />
                                    </ApprovalBodyCell>
                                    <ApprovalBodyCell>
                                      <ApprovalEditableInput
                                        value={entry.name}
                                        onChange={(event) =>
                                          updateEditApprovalEntry("cooperation", index, {
                                            name: event.target.value,
                                          })
                                        }
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
                        <AttachmentEditorPanel
                          existingAttachments={[]}
                          selectedFiles={editReceiptFiles}
                          onSelectFiles={(files) =>
                            setEditReceiptFiles((current) => [...current, ...files])
                          }
                          onRemoveSelected={(file) =>
                            setEditReceiptFiles((current) =>
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
                  ) : activePrepaidContent ? (
                    <>
                      <Section>
                        <SectionTitle>품의 번호</SectionTitle>
                        <ApprovalNumberRow>
                          <ApprovalNumberField>
                            {activePrepaidContent.approvalNumber || "-"}
                          </ApprovalNumberField>
                          <ApprovalNumberField>
                            {activePrepaidContent.paymentAccount || "-"}
                          </ApprovalNumberField>
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
                                  <SummaryReadOnlyBlock>
                                    {activePrepaidContent.summary || "-"}
                                  </SummaryReadOnlyBlock>
                                </SummaryWideCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>정책 사업</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.policyProject || "-"}
                                </SummaryValueCell>
                                <SummaryLabelCell>요구 부서</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.requestDepartmentName || "-"}
                                </SummaryValueCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>단위 사업</SummaryLabelCell>
                                <SummaryValueCell>{unitBusinessLabel}</SummaryValueCell>
                                <SummaryLabelCell>품의 일자</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.approvalDate || "-"}
                                </SummaryValueCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>세부 사업</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.detailBusiness || "-"}
                                </SummaryValueCell>
                                <SummaryLabelCell>품의 금액</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.approvalAmount || "-"}
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
                              {activePrepaidContent.budgetItems.map((item, index) => (
                                <tr key={item.id}>
                                  <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                                  <BudgetBodyCell>{item.detailBusiness || "-"}</BudgetBodyCell>
                                  <BudgetBodyCell>{item.reason || "-"}</BudgetBodyCell>
                                  <BudgetBodyCell>{item.name || "-"}</BudgetBodyCell>
                                  <BudgetBodyCell>
                                    {activePrepaidContent.approvalAmount || "-"}
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                </tr>
                              ))}
                              <tr>
                                <BudgetTotalLabelCell colSpan={4}>합계</BudgetTotalLabelCell>
                                <BudgetTotalValueCell>
                                  {activePrepaidContent.approvalAmount || "-"}
                                </BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
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
                              </tr>
                            </thead>
                            <tbody>
                              {activePrepaidContent.products.length > 0 ? (
                                activePrepaidContent.products.map((product, index) => (
                                  <tr key={product.id}>
                                    <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.description || "-"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.specification || "-"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.quantity || "0"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.unitPrice || "0"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.amount || "0"}</BudgetBodyCell>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <BudgetBodyCell colSpan={6}>-</BudgetBodyCell>
                                </tr>
                              )}
                              <tr>
                                <BudgetTotalLabelCell colSpan={3}>합계</BudgetTotalLabelCell>
                                <BudgetTotalValueCell>
                                  {prepaidQuantityTotal.toLocaleString()}
                                </BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
                                <BudgetTotalValueCell>
                                  {prepaidAmountTotal.toLocaleString()}
                                </BudgetTotalValueCell>
                              </tr>
                            </tbody>
                          </BudgetTable>
                        </ResponsiveTableWrap>
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
                                {activePrepaidContent.approvalEntries.map((entry, index) => (
                                  <Fragment key={`detail-approval-${index}`}>
                                    <ApprovalBodyCell>{entry.position || "-"}</ApprovalBodyCell>
                                    <ApprovalBodyCell>{entry.name || "-"}</ApprovalBodyCell>
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
                                {activePrepaidContent.cooperationEntries.map((entry, index) => (
                                  <Fragment key={`detail-cooperation-${index}`}>
                                    <ApprovalBodyCell>{entry.position || "-"}</ApprovalBodyCell>
                                    <ApprovalBodyCell>{entry.name || "-"}</ApprovalBodyCell>
                                  </Fragment>
                                ))}
                              </tr>
                            </tbody>
                          </ApprovalTable>
                        </ResponsiveTableWrap>
                      </Section>

                      <Section>
                        <SectionTitle>영수증</SectionTitle>
                        <AttachmentDownloadList
                          attachments={prepaidReceiptAttachments}
                          emptyText="첨부된 파일이 없습니다."
                        />
                      </Section>
                    </>
                  ) : null}
                </>
              ) : (
                <Section>
                  <DetailSectionHeader>
                    <SectionTitle>상세 품목</SectionTitle>
                    {canEditPurchaseReport && !isReportEditing ? (
                      <ReportEditTextButton type="button" onClick={startReportEditing}>
                        수정
                      </ReportEditTextButton>
                    ) : null}
                  </DetailSectionHeader>
                  {isEditing ? (
                    <>
                      <EditItemList>
                        {(editItems.length ? editItems : initialEditItems).map((item, index) => (
                          <EditItemBlock key={item.id}>
                            <ItemFieldRow>
                              <ItemLabel htmlFor={`editItemName-${item.id}`}>
                                {(editItems.length ? editItems : initialEditItems).length > 1
                                  ? `품목 ${index + 1}`
                                  : "품목"}
                              </ItemLabel>
                              <EditInput
                                id={`editItemName-${item.id}`}
                                value={item.name}
                                onChange={(event) =>
                                  updateEditItem(item.id, { name: event.target.value })
                                }
                              />
                            </ItemFieldRow>
                            <ItemFieldRow>
                              <ItemLabel htmlFor={`editQuantity-${item.id}`}>개수</ItemLabel>
                              <EditInput
                                id={`editQuantity-${item.id}`}
                                type="number"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateEditItem(item.id, { quantity: event.target.value })
                                }
                              />
                            </ItemFieldRow>
                            <ItemFieldRow>
                              <ItemLabel htmlFor={`editReason-${item.id}`}>결제 사유</ItemLabel>
                              <EditInput
                                id={`editReason-${item.id}`}
                                value={item.reason}
                                onChange={(event) =>
                                  updateEditItem(item.id, { reason: event.target.value })
                                }
                              />
                            </ItemFieldRow>
                            {(editItems.length ? editItems : initialEditItems).length > 1 ? (
                              <EditItemActionRow>
                                <DeleteItemButton
                                  type="button"
                                  onClick={() => removeEditItem(item.id)}
                                >
                                  품목 삭제
                                </DeleteItemButton>
                              </EditItemActionRow>
                            ) : null}
                          </EditItemBlock>
                        ))}
                      </EditItemList>
                      <AddItemButton type="button" onClick={addEditItem}>
                        품목 추가하기
                      </AddItemButton>
                    </>
                  ) : activePrepaidContent ? (
                    <>
                      <Section>
                        <SectionTitle>품의 번호</SectionTitle>
                        <ApprovalNumberRow>
                          <ApprovalNumberField>
                            {activePrepaidContent.approvalNumber || "-"}
                          </ApprovalNumberField>
                          <ApprovalNumberField>
                            {activePrepaidContent.paymentAccount || "-"}
                          </ApprovalNumberField>
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
                                  <SummaryReadOnlyBlock>
                                    {activePrepaidContent.summary || "-"}
                                  </SummaryReadOnlyBlock>
                                </SummaryWideCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>정책 사업</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.policyProject || "-"}
                                </SummaryValueCell>
                                <SummaryLabelCell>요구 부서</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.requestDepartmentName || "-"}
                                </SummaryValueCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>단위 사업</SummaryLabelCell>
                                <SummaryValueCell>{unitBusinessLabel}</SummaryValueCell>
                                <SummaryLabelCell>품의 일자</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.approvalDate || "-"}
                                </SummaryValueCell>
                              </tr>
                              <tr>
                                <SummaryLabelCell>세부 사업</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.detailBusiness || "-"}
                                </SummaryValueCell>
                                <SummaryLabelCell>품의 금액</SummaryLabelCell>
                                <SummaryValueCell>
                                  {activePrepaidContent.approvalAmount
                                    ? `${activePrepaidContent.approvalAmount}`
                                    : "-"}
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
                              {activePrepaidContent.budgetItems.map((item, index) => (
                                <tr key={item.id}>
                                  <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                                  <BudgetBodyCell>{item.detailBusiness || "-"}</BudgetBodyCell>
                                  <BudgetBodyCell>{item.reason || "-"}</BudgetBodyCell>
                                  <BudgetBodyCell>{item.name || "-"}</BudgetBodyCell>
                                  <BudgetBodyCell>
                                    {activePrepaidContent.approvalAmount
                                      ? `${activePrepaidContent.approvalAmount}`
                                      : "-"}
                                  </BudgetBodyCell>
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                  <BudgetBodyCell>-</BudgetBodyCell>
                                </tr>
                              ))}
                              <tr>
                                <BudgetTotalLabelCell colSpan={4}>합계</BudgetTotalLabelCell>
                                <BudgetTotalValueCell>
                                  {activePrepaidContent.approvalAmount
                                    ? `${activePrepaidContent.approvalAmount}`
                                    : "-"}
                                </BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
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
                              </tr>
                            </thead>
                            <tbody>
                              {activePrepaidContent.products.length > 0 ? (
                                activePrepaidContent.products.map((product, index) => (
                                  <tr key={product.id}>
                                    <BudgetBodyCell>{index + 1}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.description || "-"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.specification || "-"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.quantity || "0"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.unitPrice || "0"}</BudgetBodyCell>
                                    <BudgetBodyCell>{product.amount || "0"}</BudgetBodyCell>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <BudgetBodyCell colSpan={6}>-</BudgetBodyCell>
                                </tr>
                              )}
                              <tr>
                                <BudgetTotalLabelCell colSpan={3}>합계</BudgetTotalLabelCell>
                                <BudgetTotalValueCell>
                                  {prepaidQuantityTotal.toLocaleString()}
                                </BudgetTotalValueCell>
                                <BudgetTotalValueCell>-</BudgetTotalValueCell>
                                <BudgetTotalValueCell>
                                  {prepaidAmountTotal.toLocaleString()}
                                </BudgetTotalValueCell>
                              </tr>
                            </tbody>
                          </BudgetTable>
                        </ResponsiveTableWrap>
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
                                {activePrepaidContent.approvalEntries.map((entry, index) => (
                                  <Fragment key={`detail-approval-${index}`}>
                                    <ApprovalBodyCell>{entry.position || "-"}</ApprovalBodyCell>
                                    <ApprovalBodyCell>{entry.name || "-"}</ApprovalBodyCell>
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
                                {activePrepaidContent.cooperationEntries.map((entry, index) => (
                                  <Fragment key={`detail-cooperation-${index}`}>
                                    <ApprovalBodyCell>{entry.position || "-"}</ApprovalBodyCell>
                                    <ApprovalBodyCell>{entry.name || "-"}</ApprovalBodyCell>
                                  </Fragment>
                                ))}
                              </tr>
                            </tbody>
                          </ApprovalTable>
                        </ResponsiveTableWrap>
                      </Section>

                      <Section>
                        <SectionTitle>영수증</SectionTitle>
                        <AttachmentDownloadList
                          attachments={prepaidReceiptAttachments}
                          emptyText="첨부된 파일이 없습니다."
                        />
                      </Section>
                    </>
                  ) : (
                    <DetailTable>
                      <thead>
                        <tr>
                          <th>거래처</th>
                          <th>품목</th>
                          <th>개수</th>
                          <th>결제 사유</th>
                          <th>결제 금액</th>
                          <th>영수증</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailItems.map((item, index) => (
                          <tr key={`${item.id}-${index}`}>
                            <td>{item.vendorName ?? "-"}</td>
                            <td>{item.name}</td>
                            <td>{typeof item.quantity === "number" ? item.quantity : "-"}</td>
                            <td>{item.reason}</td>
                            <td>{formatAmount(item.price)}</td>
                            <td>
                              {item.receipt ? (
                                <InlineReceiptLink
                                  href={item.receipt.fileUrl ?? "#"}
                                  download={getReceiptName(item.receipt)}
                                >
                                  영수증
                                  <ReceiptIcon aria-hidden="true">
                                    <IconDownload size={12} stroke={2.25} />
                                  </ReceiptIcon>
                                </InlineReceiptLink>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </DetailTable>
                  )}
                </Section>
              )}

              <Section>
                <SectionTitle>현재 거래처별 잔액</SectionTitle>
                <VendorBalanceTable>
                  <tbody>
                    {vendorNames.map((vendorName) => {
                      const balance = vendorBalances.find((item) => item.vendorName === vendorName);

                      return (
                        <tr key={vendorName}>
                          <th scope="row">{vendorName}</th>
                          <td>{formatAmount(balance?.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </VendorBalanceTable>
              </Section>

              <Section>
                <SectionTitle>신청 현황</SectionTitle>
                <StatusField $status={request.status}>{getStatusLabel(request.status)}</StatusField>
                {request.status === "REJECTED" ? (
                  <RejectReason>거절 사유: {request.note?.trim() || "-"}</RejectReason>
                ) : null}
              </Section>

              {canShowReportSection ? (
                <ReportForm onSubmit={handleReportSubmit}>
                  {requestPaymentType === "PREPAID" ? (
                    <DetailSectionHeader>
                      <SectionTitle>
                        {isReportEditing ? "구매 완료 보고 수정" : "구매 완료 보고"}
                      </SectionTitle>
                      {canEditPurchaseReport && !isReportEditing ? (
                        <ReportEditTextButton type="button" onClick={startReportEditing}>
                          수정
                        </ReportEditTextButton>
                      ) : null}
                    </DetailSectionHeader>
                  ) : (
                    <SectionTitle>
                      {isReportEditing ? "구매 완료 보고 수정" : "구매 완료 보고"}
                    </SectionTitle>
                  )}
                  <ResponsiveTableWrap>
                    <ReportTable>
                      <thead>
                        <tr>
                          <ReportHeadCell>품목</ReportHeadCell>
                          <ReportHeadCell>거래처</ReportHeadCell>
                          <ReportHeadCell>결제 금액</ReportHeadCell>
                          {requestPaymentType === "PREPAID" ? (
                            <ReportHeadCell>지급 구분</ReportHeadCell>
                          ) : null}
                          <ReportHeadCell>영수증</ReportHeadCell>
                        </tr>
                      </thead>
                      <tbody>
                        {activeReportItems.map((item, index) => (
                          <tr key={item.itemId}>
                            <ReportBodyCell>
                              <ReportInlineText id={`reportName-${item.itemId}`}>
                                {item.name ||
                                  (activeReportItems.length > 1 ? `품목 ${index + 1}` : "품목")}
                              </ReportInlineText>
                            </ReportBodyCell>
                            <ReportBodyCell>
                              {isPrepaidReportReadOnly ? (
                                <ReportInlineText>{item.vendorName || "-"}</ReportInlineText>
                              ) : (
                                <ReportSelect
                                  id={`vendor-${item.itemId}`}
                                  value={
                                    item.vendorId && item.vendorId !== reportCustomOptionValue
                                      ? item.vendorId
                                      : item.vendorName.trim().length > 0
                                        ? reportCustomOptionValue
                                        : ""
                                  }
                                  onChange={(event) => {
                                    if (event.target.value === reportCustomOptionValue) {
                                      openCustomReportFieldModal("vendor", item.itemId);
                                      return;
                                    }

                                    const vendor = vendorOptions.find(
                                      (option) => String(option.id) === event.target.value,
                                    );

                                    updateReportItem(item.itemId, {
                                      vendorId: event.target.value,
                                      vendorName: vendor?.name ?? "",
                                    });
                                  }}
                                >
                                  <option value="">거래처 선택</option>
                                  {vendorOptions.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                      {vendor.name}
                                    </option>
                                  ))}
                                  <option value={reportCustomOptionValue}>직접 입력</option>
                                </ReportSelect>
                              )}
                            </ReportBodyCell>
                            <ReportBodyCell>
                              {isPrepaidReportReadOnly ? (
                                <ReportInlineText>
                                  {item.price.trim().length > 0
                                    ? `${Number(item.price).toLocaleString()}원`
                                    : "-"}
                                </ReportInlineText>
                              ) : (
                                <ReportInput
                                  id={`price-${item.itemId}`}
                                  type="number"
                                  min="1"
                                  inputMode="numeric"
                                  placeholder="0"
                                  value={item.price}
                                  onChange={(event) =>
                                    updateReportItem(item.itemId, { price: event.target.value })
                                  }
                                />
                              )}
                            </ReportBodyCell>
                            {requestPaymentType === "PREPAID" ? (
                              <ReportBodyCell>
                                {isPrepaidReportReadOnly ? (
                                  <ReportInlineText>{item.paymentMethod || "-"}</ReportInlineText>
                                ) : (
                                  <ReportSelect
                                    value={
                                      item.paymentMethod &&
                                      !paymentMethodOptions.includes(
                                        item.paymentMethod as (typeof paymentMethodOptions)[number],
                                      )
                                        ? reportCustomOptionValue
                                        : item.paymentMethod
                                    }
                                    onChange={(event) => {
                                      if (event.target.value === reportCustomOptionValue) {
                                        openCustomReportFieldModal("paymentMethod", item.itemId);
                                        return;
                                      }

                                      updateReportItem(item.itemId, {
                                        paymentMethod: event.target.value,
                                      });
                                    }}
                                  >
                                    <option value="">지급 구분 선택</option>
                                    {paymentMethodOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                    <option value={reportCustomOptionValue}>직접 입력</option>
                                  </ReportSelect>
                                )}
                              </ReportBodyCell>
                            ) : null}
                            <ReportBodyCell>
                              {isPrepaidReportReadOnly ? (
                                item.receiptFileUrl || item.receiptPreviewUrl ? (
                                  <InlineReceiptLink
                                    href={item.receiptFileUrl ?? item.receiptPreviewUrl ?? "#"}
                                    download={item.receiptFileName || "영수증"}
                                  >
                                    영수증
                                    <ReceiptIcon aria-hidden="true">
                                      <IconDownload size={12} stroke={2.25} />
                                    </ReceiptIcon>
                                  </InlineReceiptLink>
                                ) : (
                                  <ReportInlineText>
                                    {item.receiptFileName ? "영수증" : "-"}
                                  </ReportInlineText>
                                )
                              ) : (
                                <UploadControl>
                                  <UploadInput
                                    id={`receipt-${item.itemId}`}
                                    type="file"
                                    onChange={(event) => handleReceiptChange(item.itemId, event)}
                                  />
                                  <UploadBox htmlFor={`receipt-${item.itemId}`}>
                                    <IconFilePlus size={20} stroke={1.8} aria-hidden="true" />
                                    <span>{item.receiptFileName || "파일 추가하기"}</span>
                                  </UploadBox>
                                </UploadControl>
                              )}
                            </ReportBodyCell>
                          </tr>
                        ))}
                      </tbody>
                    </ReportTable>
                  </ResponsiveTableWrap>
                  {!isPrepaidReportReadOnly ? (
                    <ReportActionRow>
                      <ReportSubmitButton type="submit" disabled={!canSubmitReport}>
                        {reportMutation.isPending
                          ? isReportEditing
                            ? "수정 중"
                            : "보고 중"
                          : isReportEditing
                            ? "수정 완료"
                            : "구매 완료 보고하기"}
                      </ReportSubmitButton>
                      {isReportEditing ? (
                        <CancelEditButton
                          type="button"
                          disabled={reportMutation.isPending}
                          onClick={cancelReportEditing}
                        >
                          취소
                        </CancelEditButton>
                      ) : null}
                    </ReportActionRow>
                  ) : null}
                </ReportForm>
              ) : null}

              {customReportFieldModal ? (
                <ModalOverlay role="presentation">
                  <ModalCard
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="report-custom-input-modal-title"
                  >
                    <ModalTitle id="report-custom-input-modal-title">
                      {customReportFieldModal.field === "vendor"
                        ? "거래처 직접 입력"
                        : "지급 구분 직접 입력"}
                    </ModalTitle>
                    <ModalInput
                      value={customReportFieldDraft}
                      onChange={(event) => setCustomReportFieldDraft(event.target.value)}
                      placeholder={
                        customReportFieldModal.field === "vendor" ? "거래처 입력" : "지급 구분 입력"
                      }
                      autoFocus
                    />
                    <ModalActionRow>
                      <ModalButton type="button" onClick={closeCustomReportFieldModal}>
                        취소
                      </ModalButton>
                      <ModalButton
                        type="button"
                        $variant="primary"
                        onClick={confirmCustomReportFieldModal}
                        disabled={customReportFieldDraft.trim().length === 0}
                      >
                        확인
                      </ModalButton>
                    </ModalActionRow>
                  </ModalCard>
                </ModalOverlay>
              ) : null}
            </ContentColumn>
          ) : null}
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
  padding: 1.8125rem 3.125rem 4rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding-inline: ${spacing.space16};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #a9a9a9;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const BaseAction = styled.button<{ $variant?: "default" | "danger" | "edit" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "danger" ? colors.notice : $variant === "edit" ? colors.point : "transparent"};
  border-radius: ${radii.radius15};
  background-color: ${({ $variant }) =>
    $variant === "danger" || $variant === "edit" ? colors.white : colors.point};
  padding: 0.8125rem ${spacing.space20};
  color: ${({ $variant }) =>
    $variant === "danger" ? colors.notice : $variant === "edit" ? colors.point : colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    filter: saturate(0.7);
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: ${({ $variant }) =>
      $variant === "danger"
        ? colors.noticeSoft
        : $variant === "edit"
          ? colors.pointSoft
          : "#76bd49"};
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ActionButton = styled(BaseAction)``;

const ListButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const CancelTopButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
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

const Label = styled.h2`
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

const DetailSectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space20};
`;

const ReportEditTextButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: #b3b3b3;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: ${colors.point};
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  min-width: 0;
  background-color: #f7f7f7;
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
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

const InlineLabel = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineField = styled(Field)``;

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

const ApprovalNumberField = styled(Field)``;

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

const SummaryReadOnlyBlock = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  font-family: inherit;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const SummaryTextareaInput = styled.textarea`
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

const SummaryCellInput = styled.input`
  width: 100%;
  border: 0;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const SummaryCellSelect = styled.select`
  width: 100%;
  border: 0;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
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

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${colors.muted};
  color: #000000;
  table-layout: fixed;

  th,
  td {
    padding: ${spacing.space12};
    border: 1px solid ${colors.muted};
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight150};
    overflow-wrap: anywhere;
    vertical-align: middle;
  }

  th {
    background-color: ${colors.background};
    font-weight: 600;
    text-align: center;
  }

  td {
    font-weight: 400;
    text-align: center;
  }

  td:nth-child(4) {
    text-align: left;
  }

  th:nth-child(1),
  th:nth-child(2),
  th:nth-child(5),
  th:nth-child(6) {
    width: 8.25rem;
  }

  th:nth-child(3) {
    width: 6rem;
  }

  @media (min-width: 120rem) {
    th,
    td {
      padding: ${spacing.space20};
      font-size: ${typography.fontSize20};
    }

    th:nth-child(1),
    th:nth-child(2),
    th:nth-child(5),
    th:nth-child(6) {
      width: 12rem;
    }

    th:nth-child(3) {
      width: 8.25rem;
    }
  }
`;

const EditInput = styled.input`
  min-width: 0;
  min-height: 2.6875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const EditSelect = styled.select`
  min-width: 0;
  border: 1px solid #c0c0c0;
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;
  appearance: none;
  padding: 0.8125rem ${spacing.space32} 0.8125rem ${spacing.space12};
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000000' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right ${spacing.space12} center;
  background-repeat: no-repeat;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 3rem ${spacing.space20} ${spacing.space20};
    font-size: ${typography.fontSize20};
    background-position: right ${spacing.space20} center;
  }
`;

const EditItemList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -${spacing.space8};
`;

const EditItemBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding: ${spacing.space20} 0;
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

const ItemLabel = styled.label`
  min-width: 4rem;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    min-width: 6.125rem;
    font-size: ${typography.fontSize20};
  }
`;

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

const EditItemActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
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

const DeleteItemButton = styled(AddItemButton)`
  width: 9rem;
  border-color: #e45a52;
  background-color: #fde4e2;
  color: #da3a30;

  @media (min-width: 120rem) {
    width: 12rem;
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
    font-weight: 600;
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

const StateMessage = styled.p`
  margin: 0 0 ${spacing.space20};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
`;

const ReceiptIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: ${colors.point};
  color: ${colors.white};

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
`;

const StatusField = styled(Field)<{ $status?: PurchaseRequestStatus }>`
  width: fit-content;
  justify-content: center;
  border-radius: ${radii.radius15};
  background-color: #fbf4d7;
  padding-inline: ${spacing.space20};
  color: ${({ $status }) => getStatusTone($status)};
  font-weight: 600;

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;

const RejectReason = styled.p`
  margin: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineReceiptLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  color: #000000;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;

const ReportForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding-top: ${spacing.space20};
  border-top: 1px solid ${colors.borderStrong};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: 1.875rem;
  }
`;

const ReportTable = styled.table`
  width: 100%;
  min-width: 44rem;
  border-collapse: collapse;
  table-layout: fixed;
`;

const ReportHeadCell = styled.th`
  ${tableCellBase}
  background-color: ${colors.background};
  font-weight: 600;
  text-align: center;
`;

const ReportBodyCell = styled.td`
  ${tableCellBase}
  text-align: center;
`;

const ReportInput = styled.input`
  width: 100%;
  border: 0;
  background-color: transparent;
  padding: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  text-align: center;
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ReportInlineText = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  padding: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ReportActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
  flex-wrap: wrap;
`;

const ReportSelect = styled.select`
  width: 100%;
  border: 0;
  background-color: transparent;
  appearance: none;
  padding: 0 ${spacing.space24} 0 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  text-align: center;
  text-align-last: center;
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000000' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right ${spacing.space8} center;
  background-repeat: no-repeat;

  @media (min-width: 120rem) {
    padding-right: 2rem;
    font-size: ${typography.fontSize20};
    background-position: right ${spacing.space12} center;
  }
`;

const UploadControl = styled.div`
  display: flex;
  justify-content: center;
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
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  padding: 0;
  background-color: transparent;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  span {
    max-width: 10rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
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
  width: 100%;
  min-width: 0;
  border: 1px solid #c0c0c0;
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

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

const ReportSubmitButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    filter: saturate(0.7);
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

const CancelEditButton = styled(ReportSubmitButton)`
  border: 1px solid ${colors.border};
  background-color: ${colors.background};
  color: ${colors.text};

  &:not(:disabled):hover {
    background-color: ${colors.border};
  }
`;
