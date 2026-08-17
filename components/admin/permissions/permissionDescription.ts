import type { PermissionDefinitionDto } from "@/api/user/user.dto";

type PermissionDescriptionSource = {
  description?: string;
  label?: string;
  name?: string;
};

const RESOURCE_LABELS: Record<string, string> = {
  "absence-request": "결강 신청",
  channel: "채널",
  department: "부서",
  event: "행사",
  "lesson-exchange-request": "수업 교환 신청",
  post: "게시글",
  "purchase-request": "구매 요청",
  subject: "과목",
  user: "사용자",
};

const ACTION_LABELS: Record<string, string> = {
  grant: "권한 부여 또는 변경",
  manage: "관리",
  read: "조회",
  review: "검토",
  write: "생성",
};

function getPermissionDefinition(
  code: string,
  definitions: PermissionDefinitionDto[],
) {
  const [resourceCode, actionCode] = code.split(":");

  return definitions.find(
    (definition) =>
      definition.resourceCode === resourceCode && definition.actionCode === actionCode,
  );
}

function isPermissionCode(value: string) {
  return /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[^:\s]+$/i.test(value);
}

function getReadableDescription(...candidates: Array<string | undefined>) {
  return candidates.find((candidate) => {
    const value = candidate?.trim();

    return value ? !isPermissionCode(value) : false;
  });
}

export function getPermissionDescription(
  code: string,
  definitions: PermissionDefinitionDto[] = [],
  permission?: PermissionDescriptionSource,
) {
  if (!code.trim()) {
    return "추가할 권한을 선택하세요.";
  }

  const definition = getPermissionDefinition(code, definitions);
  const [resourceCode, actionCode, target] = code.split(":");
  const resourceLabel =
    definition?.resourceLabel?.trim() ??
    RESOURCE_LABELS[resourceCode] ??
    (resourceCode || "대상");
  const actionLabel =
    ACTION_LABELS[actionCode] ??
    definition?.actionLabel?.trim();

  if (actionLabel) {
    return target && target !== "*"
      ? `${resourceLabel} ${actionLabel} (ID: ${target})`
      : `전체 ${resourceLabel} ${actionLabel}`;
  }

  const permissionDescription = getReadableDescription(
    permission?.description,
    permission?.label,
    permission?.name,
  );
  const definitionDescription = getReadableDescription(definition?.description, definition?.label);

  return permissionDescription ?? definitionDescription ?? `${resourceLabel} ${actionCode} 권한`;
}
