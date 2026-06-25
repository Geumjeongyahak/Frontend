export type AppsScriptFileTarget =
  | "event"
  | "meetingRecord"
  | "handover"
  | "examMaterials"
  | "documentForms"
  | "notice"
  | "classroom"
  | "department";

export type UploadTargetConfig = {
  targetType: string;
  targetName?: string;
};

export const UPLOAD_TARGETS: Record<AppsScriptFileTarget, UploadTargetConfig> = {
  event: { targetType: "event", targetName: "행사 정보" },
  meetingRecord: { targetType: "meetingMinutes", targetName: "교학 회의록" },
  handover: { targetType: "handover", targetName: "인수 인계서" },
  examMaterials: { targetType: "examProblems", targetName: "시험 문제 자료" },
  documentForms: { targetType: "forms", targetName: "서류 양식" },
  notice: { targetType: "notice", targetName: "공지사항" },
  classroom: { targetType: "classroom" },
  department: { targetType: "department" },
};
