export type StaffSection = {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
};

export type FinanceRequest = {
  id: number;
  className: string;
  title: string;
  author: string;
  paymentDate: string;
  status: string;
  detail: string;
};

export const FINANCE_REQUESTS_PER_PAGE = 9;

export const staffSections: StaffSection[] = [
  {
    title: "수업 관리",
    items: [
      { label: "수업 일지", href: "/staff/classes/journal" },
      { label: "수업 교환 신청", href: "/staff/classes/exchange" },
      { label: "수업 결강 신청", href: "/staff/classes/absence" },
    ],
  },
  {
    title: "재무 관리",
    items: [{ label: "결제 신청", href: "/staff/finance" }],
  },
  {
    title: "자료실",
    items: [
      { label: "교칙", href: "/staff/resources/rules" },
      { label: "연락망", href: "/staff/resources/contacts" },
      { label: "교학 회의록", href: "/staff/resources/meeting-minutes" },
      { label: "인수인계서", href: "/staff/resources/handover" },
      { label: "시험 문제 자료", href: "/staff/resources/exams" },
      { label: "서류 양식", href: "/staff/resources/forms" },
    ],
  },
  {
    title: "게시판",
    items: [{ label: "게시판", href: "/staff/board" }],
  },
  {
    title: "학사일정",
    items: [{ label: "월별 일정", href: "/staff/calendar" }],
  },
];

export const financeRequests: FinanceRequest[] = [
  {
    id: 1,
    className: "개나리반",
    title: "개나리반 4월 수학 교재비 결제 신청",
    author: "김민지",
    paymentDate: "26.04.02",
    status: "대기 중",
    detail:
      "중등 수학 문제집 12권 구입 건입니다. 반별 수업 진도에 맞춰 공통 교재로 사용 예정입니다.",
  },
  {
    id: 2,
    className: "해바라기반",
    title: "해바라기반 화이트보드 마커 및 지우개 구매",
    author: "박서준",
    paymentDate: "26.04.03",
    status: "승인 완료",
    detail:
      "소모품 재고 부족으로 화이트보드 마커 3세트와 보드 지우개 5개를 구매 요청합니다.",
  },
  {
    id: 3,
    className: "민들레반",
    title: "민들레반 영어 단어시험 출력물 결제 요청",
    author: "이도윤",
    paymentDate: "26.04.03",
    status: "검토 중",
    detail:
      "주간 단어시험지와 복습 자료 출력 비용 정산 요청입니다. 총 4주 분량을 포함합니다.",
  },
  {
    id: 4,
    className: "장미반",
    title: "장미반 과학 실험 키트 구입 신청",
    author: "최유진",
    paymentDate: "26.04.04",
    status: "대기 중",
    detail: "기초 화학 단원 실험을 위한 안전 실험 키트 8세트 구입 건입니다.",
  },
  {
    id: 5,
    className: "벚꽃반",
    title: "벚꽃반 프린터 토너 교체 비용 신청",
    author: "정하늘",
    paymentDate: "26.04.05",
    status: "반려",
    detail:
      "교실 공용 프린터 토너 잔량 부족으로 교체를 진행했고, 영수증 기준 결제 요청합니다.",
  },
  {
    id: 6,
    className: "개나리반",
    title: "개나리반 보충수업 간식비 정산 요청",
    author: "한지호",
    paymentDate: "26.04.07",
    status: "승인 완료",
    detail:
      "중간고사 대비 보충수업 참여 학생 간식 제공 비용입니다. 총 18명 기준입니다.",
  },
  {
    id: 7,
    className: "해바라기반",
    title: "해바라기반 독서 토론 도서 추가 구매",
    author: "윤가은",
    paymentDate: "26.04.08",
    status: "대기 중",
    detail: "독서 토론 프로그램 운영을 위해 동일 도서 10권을 추가 구매합니다.",
  },
  {
    id: 8,
    className: "민들레반",
    title: "민들레반 학습 멘토링 활동지 제작비",
    author: "강시우",
    paymentDate: "26.04.09",
    status: "검토 중",
    detail:
      "멘토링 프로그램 활동지와 피드백 기록지 디자인 및 출력 비용을 포함합니다.",
  },
  {
    id: 9,
    className: "장미반",
    title: "장미반 발표수업용 무선 마이크 구매 신청",
    author: "오세린",
    paymentDate: "26.04.10",
    status: "대기 중",
    detail:
      "발표 수업 시 음성 전달을 위해 휴대용 무선 마이크 2개 구입을 요청합니다.",
  },
  {
    id: 10,
    className: "벚꽃반",
    title: "벚꽃반 역사 체험학습 차량비 결제 요청",
    author: "임태윤",
    paymentDate: "26.04.11",
    status: "승인 완료",
    detail: "인근 박물관 현장학습 이동을 위한 차량 대절 비용 정산 요청입니다.",
  },
  {
    id: 11,
    className: "개나리반",
    title: "개나리반 수업용 태블릿 충전기 구매",
    author: "김민지",
    paymentDate: "26.04.14",
    status: "대기 중",
    detail:
      "기존 충전기 고장으로 인해 수업용 태블릿 6대의 충전기 교체가 필요합니다.",
  },
  {
    id: 12,
    className: "해바라기반",
    title: "해바라기반 5월 월간 학습자료 인쇄비",
    author: "박서준",
    paymentDate: "26.04.15",
    status: "검토 중",
    detail:
      "월간 학습 계획표, 수행평가 가이드, 오답 정리 노트 출력 비용입니다.",
  },
  {
    id: 13,
    className: "민들레반",
    title: "민들레반 교실 정리함 구입 결제 신청",
    author: "이도윤",
    paymentDate: "26.04.15",
    status: "대기 중",
    detail:
      "활동지와 실습 도구 분류 보관을 위한 플라스틱 정리함 4개 구입 건입니다.",
  },
  {
    id: 14,
    className: "장미반",
    title: "장미반 미술 수업 재료비 신청",
    author: "최유진",
    paymentDate: "26.04.16",
    status: "승인 완료",
    detail:
      "포스터 물감, 붓 세트, 켄트지 등 프로젝트 수업 재료를 포함합니다.",
  },
  {
    id: 15,
    className: "벚꽃반",
    title: "벚꽃반 교실 시계 및 벽걸이 게시판 구입",
    author: "정하늘",
    paymentDate: "26.04.17",
    status: "반려",
    detail:
      "교실 환경 정비를 위한 벽시계 1개와 안내 게시판 1개 구입 요청입니다.",
  },
  {
    id: 16,
    className: "개나리반",
    title: "개나리반 1학기 상담주간 안내문 제작비",
    author: "한지호",
    paymentDate: "26.04.18",
    status: "대기 중",
    detail:
      "학부모 상담주간 안내문, 일정표, 회신서 출력 및 제본 비용입니다.",
  },
  {
    id: 17,
    className: "해바라기반",
    title: "해바라기반 교실 청소용품 보충 신청",
    author: "윤가은",
    paymentDate: "26.04.18",
    status: "승인 완료",
    detail:
      "빗자루, 물티슈, 청소포, 쓰레기봉투 등 교실 환경 정비용 소모품 구매 건입니다.",
  },
  {
    id: 18,
    className: "민들레반",
    title: "민들레반 독서기록장 추가 제작 요청",
    author: "강시우",
    paymentDate: "26.04.21",
    status: "검토 중",
    detail:
      "전학생 포함 전체 학생 수 증가로 독서기록장 12권을 추가 제작합니다.",
  },
  {
    id: 19,
    className: "장미반",
    title: "장미반 교실 프로젝터 HDMI 케이블 교체",
    author: "오세린",
    paymentDate: "26.04.22",
    status: "대기 중",
    detail:
      "수업용 프로젝터 연결 불량으로 케이블 2개 교체 비용을 신청합니다.",
  },
  {
    id: 20,
    className: "벚꽃반",
    title: "벚꽃반 진로특강 강사 음료 및 다과비",
    author: "임태윤",
    paymentDate: "26.04.22",
    status: "승인 완료",
    detail:
      "외부 진로특강 진행 강사 접대용 음료 및 다과 구매 비용입니다.",
  },
  {
    id: 21,
    className: "개나리반",
    title: "개나리반 수행평가 포트폴리오 파일 구입",
    author: "김민지",
    paymentDate: "26.04.23",
    status: "대기 중",
    detail:
      "학생별 수행평가 자료 보관을 위한 클리어 파일 30권 구입 요청입니다.",
  },
  {
    id: 22,
    className: "해바라기반",
    title: "해바라기반 수업 보조 스피커 구매 신청",
    author: "박서준",
    paymentDate: "26.04.23",
    status: "검토 중",
    detail:
      "듣기평가와 멀티미디어 수업용 블루투스 스피커 1대 구매 건입니다.",
  },
  {
    id: 23,
    className: "민들레반",
    title: "민들레반 발표용 레이저 포인터 결제 요청",
    author: "이도윤",
    paymentDate: "26.04.24",
    status: "대기 중",
    detail:
      "학생 발표 수업 진행을 위한 레이저 포인터 2개 구입 비용입니다.",
  },
];

export function getFinanceRequestById(id: number) {
  return financeRequests.find((request) => request.id === id);
}

export function getFinanceRequestsByPage(page: number) {
  const startIndex = (page - 1) * FINANCE_REQUESTS_PER_PAGE;

  return financeRequests.slice(
    startIndex,
    startIndex + FINANCE_REQUESTS_PER_PAGE,
  );
}

export function getFinanceRequestTotalPages() {
  return Math.ceil(financeRequests.length / FINANCE_REQUESTS_PER_PAGE);
}
