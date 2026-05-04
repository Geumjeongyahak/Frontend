export const BOARD_TYPE_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "반별", value: "CLASSROOM" },
  { label: "부서별", value: "DEPARTMENT" },
] as const;

export const BOARD_WRITE_TYPE_OPTIONS = [
  { label: "반별 게시판", value: "CLASSROOM" },
  { label: "부서별 게시판", value: "DEPARTMENT" },
] as const;

export const CLASSROOM_SCOPE_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "벛꽃반", value: "cherry-blossom" },
  { label: "개나리반", value: "forsythia" },
  { label: "민들레반", value: "dandelion" },
  { label: "장미반", value: "rose" },
  { label: "해바라기반", value: "sunflower" },
  { label: "국화반", value: "chrysanthemum" },
  { label: "씨앗반", value: "seed" },
  { label: "새싹반", value: "sprout" },
  { label: "나무반", value: "tree" },
  { label: "열매반", value: "fruit" },
  { label: "스마트폰반", value: "smartphone" },
] as const;

export const DEPARTMENT_SCOPE_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "교무기획부", value: "academic-planning" },
  { label: "교육연구부", value: "education-research" },
  { label: "생활안전부", value: "student-safety" },
  { label: "총무부", value: "general-affairs" },
] as const;

export const EMPTY_SCOPE_OPTIONS = [{ label: "전체", value: "all" }] as const;
export const CLASSROOM_WRITE_SCOPE_OPTIONS = CLASSROOM_SCOPE_OPTIONS.filter(
  (option) => option.value !== "all",
);
export const DEPARTMENT_WRITE_SCOPE_OPTIONS = DEPARTMENT_SCOPE_OPTIONS.filter(
  (option) => option.value !== "all",
);

export type BoardType = (typeof BOARD_TYPE_OPTIONS)[number]["value"];
export type BoardWriteType = (typeof BOARD_WRITE_TYPE_OPTIONS)[number]["value"];
export type BoardDropdownValue =
  | BoardType
  | BoardWriteType
  | (typeof CLASSROOM_SCOPE_OPTIONS)[number]["value"]
  | (typeof DEPARTMENT_SCOPE_OPTIONS)[number]["value"];

export function getBoardScopeOptions(boardType: BoardType | BoardWriteType) {
  if (boardType === "CLASSROOM") return CLASSROOM_SCOPE_OPTIONS;
  if (boardType === "DEPARTMENT") return DEPARTMENT_SCOPE_OPTIONS;
  return EMPTY_SCOPE_OPTIONS;
}

export function getBoardWriteScopeOptions(boardType: BoardWriteType) {
  return boardType === "CLASSROOM" ? CLASSROOM_WRITE_SCOPE_OPTIONS : DEPARTMENT_WRITE_SCOPE_OPTIONS;
}

const classroomChannelIds: Record<string, number> = {
  all: 100,
  "cherry-blossom": 101,
  forsythia: 102,
  dandelion: 103,
  rose: 104,
  sunflower: 105,
  chrysanthemum: 106,
  seed: 107,
  sprout: 108,
  tree: 109,
  fruit: 110,
  smartphone: 111,
};

const departmentChannelIds: Record<string, number> = {
  all: 200,
  "academic-planning": 201,
  "education-research": 202,
  "student-safety": 203,
  "general-affairs": 204,
};

export function getBoardChannelId(boardType: BoardWriteType, boardScope: string) {
  return boardType === "CLASSROOM"
    ? (classroomChannelIds[boardScope] ?? classroomChannelIds.all)
    : (departmentChannelIds[boardScope] ?? departmentChannelIds.all);
}
