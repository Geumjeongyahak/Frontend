import type {
  EventPhoto,
  HeaderDropdownMenu,
  MeetingMinute,
  Notice,
  WeeklyScheduleDay,
} from "@/types/home";

export const headerMenus: HeaderDropdownMenu[] = [
  {
    label: "기관 정보",
    href: "/info",
    items: [
      { label: "연혁", href: "/info/history" },
      { label: "부서 정보", href: "/info/departments" },
      { label: "반 정보", href: "/info/classes" },
      { label: "행사 정보", href: "/info/events" },
    ],
  },
  {
    label: "교원",
    href: "/staff",
    items: [
      { label: "수업 관리", href: "/staff/class" },
      { label: "재무 관리", href: "/staff/finance" },
      { label: "자료실", href: "/staff/resources" },
      { label: "게시판", href: "/staff/board" },
      { label: "학사일정", href: "/staff/calendar" },
    ],
  },
  {
    label: "신규 등록",
    href: "/register",
    items: [
      { label: "교사 신청", href: "/register/teacher" },
      { label: "학생 등록", href: "/register/student" },
    ],
  },
];

export const notices: Notice[] = [
  { id: 1, title: "2026년 1학기 교실 배정 안내", date: "2026.03.25" },
  { id: 2, title: "신규 자원봉사 교사 OT 일정 공지", date: "2026.03.22" },
  { id: 3, title: "금정열린배움터 4월 행사 운영 안내", date: "2026.03.19" },
  { id: 4, title: "학급별 출결부 제출 기한 안내", date: "2026.03.18" },
  { id: 5, title: "교실 기자재 점검 협조 요청", date: "2026.03.16" },
  { id: 6, title: "3월 마지막 주 방과후 프로그램 공지", date: "2026.03.14" },
  { id: 7, title: "교원 회의 자료 업로드 안내", date: "2026.03.12" },
  { id: 8, title: "도서실 운영 시간 변경 안내", date: "2026.03.10" },
  { id: 9, title: "학생 상담 주간 운영 공지", date: "2026.03.08" },
  { id: 10, title: "행사 사진 게시 일정 안내", date: "2026.03.05" },
];

export const meetingMinutes: MeetingMinute[] = [
  { id: 1, title: "2026년 3월 교직원 회의록", date: "2026.03.27" },
  { id: 2, title: "2026년 3월 교육과정 협의회 회의록", date: "2026.03.21" },
  { id: 3, title: "2026년 3월 행사 준비 회의록", date: "2026.03.16" },
  { id: 4, title: "2026년 2월 교과 협의회 회의록", date: "2026.02.26" },
  { id: 5, title: "2026년 2월 운영위원회 회의록", date: "2026.02.18" },
];

export const eventPhotos: EventPhoto[] = [
  {
    id: 1,
    title: "2026.03 봄맞이 문화행사",
    date: "2026.03.20",
    imageUrl: "/home/event-photo-1.svg",
  },
  {
    id: 2,
    title: "2026.03 교원 연수 현장",
    date: "2026.03.14",
    imageUrl: "/home/event-photo-2.svg",
  },
  {
    id: 3,
    title: "2026.02 학생 발표회",
    date: "2026.02.28",
    imageUrl: "/home/event-photo-3.svg",
  },
];

export const weeklySchedule: WeeklyScheduleDay[] = [
  {
    day: "월",
    items: [
      { time: "14:20", title: "해바라기반 영어수업" },
      { time: "16:00", title: "주말스마트폰 활용반" },
      { time: "18:30", title: "야간 자율학습 점검" },
    ],
  },
  {
    day: "화",
    items: [
      { time: "14:20", title: "해바라기반 영어수업" },
      { time: "15:30", title: "기초 문해 교실" },
      { time: "18:00", title: "교원 상담 시간" },
    ],
  },
  {
    day: "수",
    items: [
      { time: "14:20", title: "해바라기반 영어수업" },
      { time: "16:00", title: "주말스마트폰 활용반" },
      { time: "19:00", title: "자료실 정리" },
    ],
  },
  {
    day: "목",
    items: [
      { time: "14:20", title: "해바라기반 영어수업" },
      { time: "15:00", title: "행사 운영 회의" },
      { time: "18:00", title: "교사회의" },
    ],
  },
  {
    day: "금",
    items: [
      { time: "14:20", title: "해바라기반 영어수업" },
      { time: "16:30", title: "주말스마트폰 활용반" },
      { time: "18:10", title: "교실 정비" },
    ],
  },
  {
    day: "토",
    items: [
      { time: "14:20", title: "봄맞이 영어수업" },
      { time: "16:20", title: "민들레반 수학수업" },
      { time: "18:00", title: "주말스마트폰 활용반" },
    ],
  },
  {
    day: "일",
    items: [
      { time: "14:20", title: "해바라기반 영어수업" },
      { time: "16:00", title: "주말스마트폰 활용반" },
      { time: "18:30", title: "행사 자료 정리" },
    ],
  },
];
