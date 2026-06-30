import type { HeaderDropdownMenu } from "@/types/home";

export const headerMenus: HeaderDropdownMenu[] = [
  {
    label: "기관 정보",
    href: "/info/history",
    items: [
      { label: "연혁", href: "/info/history" },
      { label: "부서 정보", href: "/info/departments" },
      { label: "반 정보", href: "/info/classes" },
      { label: "행사 정보", href: "/info/events" },
    ],
  },
  {
    label: "교원",
    href: "/staff/class-management/weekly-schedule",
    items: [
      { label: "수업 관리", href: "/staff/class-management/weekly-schedule" },
      { label: "재무 관리", href: "/staff/finance-management" },
      { label: "자료실", href: "/staff/archive/school-rules" },
      { label: "게시판", href: "/staff/board" },
      { label: "학사일정", href: "/staff/calendar" },
    ],
  },
  {
    label: "교사 신청",
    href: "/register",
    items: [{ label: "신규 등록", href: "/apply" }],
  },
];
