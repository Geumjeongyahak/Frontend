export type DriveUploadTarget =
  | "handover"
  | "examMaterials"
  | "documentForms"
  | "board"
  | "financeReceipt";

type DriveUploadTargetConfig = {
  label: string;
  resolveUploadUrl: () => string | undefined;
};

export const DRIVE_UPLOAD_TARGETS: Record<DriveUploadTarget, DriveUploadTargetConfig> = {
  handover: {
    label: "인수인계서",
    resolveUploadUrl: () => process.env.NEXT_PUBLIC_APPS_SCRIPT_HANDOVER_DOCUMENT_UPLOAD_URL,
  },
  examMaterials: {
    label: "시험 문제 자료",
    resolveUploadUrl: () => process.env.NEXT_PUBLIC_APPS_SCRIPT_EXAM_MATERIALS_UPLOAD_URL,
  },
  documentForms: {
    label: "서류 양식",
    resolveUploadUrl: () => process.env.NEXT_PUBLIC_APPS_SCRIPT_DOCUMENT_FORMS_UPLOAD_URL,
  },
  board: {
    label: "게시판 자료",
    resolveUploadUrl: () => process.env.NEXT_PUBLIC_APPS_SCRIPT_BOARD_FILE_UPLOAD_URL,
  },
  financeReceipt: {
    label: "회계 영수증",
    resolveUploadUrl: () => FINANCE_RECEIPT_UPLOAD_URL,
  },
};

const FINANCE_RECEIPT_UPLOAD_URL =
  "https://script.google.com/macros/s/AKfycbwbqn9pNLSq1yalCgcwDmXXESZpWVvZajy5qWd3pjkmhXWDazB0mMOdGdnJ-6pmVK6Zmg/exec";
