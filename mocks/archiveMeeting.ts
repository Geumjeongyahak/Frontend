export type AbsenceReport = {
  id: number;
  author: string;
  reason: string;
  opinion: string;
};

export type MeetingMinute = {
  id: number;
  title: string;
  author: string;
  date: string;
  status: "회의 전" | "회의 후";
  agenda: string;
  discussion: string;
  suggestion: string;
  absenceReports: AbsenceReport[];
};

export const MEETING_MINUTES_PER_PAGE = 9;

const meetingTemplates: Omit<MeetingMinute, "id">[] = [
  {
    title: "26.04.05 교학 회의록 입니다",
    author: "홍길동",
    date: "26.04.05",
    status: "회의 전",
    agenda: "4월 수업 운영 현황과 학사 일정 공유",
    discussion: "반별 출석 현황, 보강 일정, 신규 학생 적응 상황을 점검합니다.",
    suggestion: "수업 자료 공유 방식과 회의 후 후속 업무 담당자를 정리합니다.",
    absenceReports: [
      {
        id: 1,
        author: "김민지",
        reason: "개인 일정으로 회의 참석이 어렵습니다.",
        opinion: "회의 자료 확인 후 필요한 의견은 별도로 전달하겠습니다.",
      },
      {
        id: 2,
        author: "박서준",
        reason: "동시간대 보강 수업 진행 예정입니다.",
        opinion: "보강 결과는 회의록 확인 후 공유하겠습니다.",
      },
    ],
  },
  {
    title: "26.04.12 교학 회의록 입니다",
    author: "김민지",
    date: "26.04.12",
    status: "회의 후",
    agenda: "중간 점검 및 반별 학생 관리 방안 논의",
    discussion: "학습 부진 학생 지원 계획과 상담 일정 배정을 논의했습니다.",
    suggestion: "상담 기록 양식을 통일하고 다음 회의에서 진행 상황을 확인합니다.",
    absenceReports: [
      {
        id: 1,
        author: "이도윤",
        reason: "외부 연수 참여",
        opinion: "공유된 안건에 동의합니다.",
      },
    ],
  },
  {
    title: "26.04.19 교학 회의록 입니다",
    author: "박서준",
    date: "26.04.19",
    status: "회의 전",
    agenda: "5월 행사 준비 및 수업 일정 조율",
    discussion: "행사 전후 수업 변경 가능성과 자료 준비 현황을 확인합니다.",
    suggestion: "행사 담당자별 준비 항목을 회의 후 공지합니다.",
    absenceReports: [],
  },
];

export const meetingMinutes: MeetingMinute[] = Array.from({ length: 45 }, (_, index) => {
  const template = meetingTemplates[index % meetingTemplates.length];
  const id = index + 1;

  return {
    ...template,
    id,
    title: `26.04.${String((index % 24) + 1).padStart(2, "0")} 교학 회의록 입니다`,
    date: `26.04.${String((index % 24) + 1).padStart(2, "0")}`,
    status: index % 3 === 0 ? "회의 전" : "회의 후",
  };
});

export function getMeetingMinuteById(id: number) {
  return meetingMinutes.find((minute) => minute.id === id);
}
