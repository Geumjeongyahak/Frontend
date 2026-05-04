import type { ChannelType } from "@/api/channel/channel.dto";
import type { PostDetailResponseDto, PostSummaryResponseDto } from "@/api/post/post.dto";

export type BoardMockPost = PostDetailResponseDto & {
  channelType: ChannelType;
  boardScope: string;
};

export const boardMockPosts: BoardMockPost[] = [
  {
    id: 1,
    channelId: 201,
    channelName: "교무기획부",
    channelType: "DEPARTMENT",
    boardScope: "academic-planning",
    title: "5월 교무 일정 공유드립니다",
    postType: "NOTICE",
    status: "PUBLISHED",
    authorId: 1,
    authorName: "김민정",
    isPinned: true,
    viewCount: 28,
    contentHtml: "<p>5월 교무 일정과 제출 자료 마감일을 확인해 주세요.</p>",
    allowComment: true,
    createdAt: "2026-05-01T09:00:00",
    updatedAt: "2026-05-01T09:00:00",
  },
  {
    id: 2,
    channelId: 202,
    channelName: "교육연구부",
    channelType: "DEPARTMENT",
    boardScope: "education-research",
    title: "기초 문해 수업 자료 회람",
    postType: "GENERAL",
    status: "PUBLISHED",
    authorId: 2,
    authorName: "박서연",
    isPinned: false,
    viewCount: 14,
    contentHtml: "<p>이번 주 기초 문해 수업 자료를 공유합니다.</p>",
    allowComment: true,
    createdAt: "2026-05-02T13:30:00",
    updatedAt: "2026-05-02T13:30:00",
  },
  {
    id: 3,
    channelId: 203,
    channelName: "생활안전부",
    channelType: "DEPARTMENT",
    boardScope: "student-safety",
    title: "야간 하교 지도 협조 요청",
    postType: "GENERAL",
    status: "PUBLISHED",
    authorId: 3,
    authorName: "이준호",
    isPinned: false,
    viewCount: 9,
    contentHtml: "<p>야간 하교 시간 안전 지도를 위해 교실별 담당자를 확인해 주세요.</p>",
    allowComment: true,
    createdAt: "2026-05-03T18:10:00",
    updatedAt: "2026-05-03T18:10:00",
  },
  {
    id: 4,
    channelId: 204,
    channelName: "총무부",
    channelType: "DEPARTMENT",
    boardScope: "general-affairs",
    title: "소모품 신청 내역 확인",
    postType: "GENERAL",
    status: "PUBLISHED",
    authorId: 4,
    authorName: "최유진",
    isPinned: false,
    viewCount: 7,
    contentHtml: "<p>각 반에서 요청한 소모품 신청 내역을 확인했습니다.</p>",
    allowComment: true,
    createdAt: "2026-05-04T10:20:00",
    updatedAt: "2026-05-04T10:20:00",
  },
  {
    id: 5,
    channelId: 102,
    channelName: "개나리반",
    channelType: "CLASSROOM",
    boardScope: "forsythia",
    title: "개나리반 수학 보충 자료",
    postType: "GENERAL",
    status: "PUBLISHED",
    authorId: 5,
    authorName: "홍길동",
    isPinned: false,
    viewCount: 11,
    contentHtml: "<p>개나리반 수학 보충 자료와 다음 수업 준비물을 안내합니다.</p>",
    allowComment: true,
    createdAt: "2026-05-04T11:00:00",
    updatedAt: "2026-05-04T11:00:00",
  },
  {
    id: 6,
    channelId: 104,
    channelName: "장미반",
    channelType: "CLASSROOM",
    boardScope: "rose",
    title: "장미반 받아쓰기 안내",
    postType: "GENERAL",
    status: "PUBLISHED",
    authorId: 6,
    authorName: "정하늘",
    isPinned: false,
    viewCount: 6,
    contentHtml: "<p>이번 주 장미반 받아쓰기 범위와 연습 방법입니다.</p>",
    allowComment: true,
    createdAt: "2026-05-04T12:10:00",
    updatedAt: "2026-05-04T12:10:00",
  },
];

function getBoardPostTime(post: PostSummaryResponseDto) {
  const time = new Date(post.createdAt ?? post.updatedAt ?? "").getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function getBoardMockPosts({
  boardType,
  boardScope,
}: {
  boardType: string;
  boardScope: string;
}): PostSummaryResponseDto[] {
  return boardMockPosts
    .filter((post) => {
      const matchesType = boardType === "all" || post.channelType === boardType;
      const matchesScope = boardScope === "all" || post.boardScope === boardScope;
      return matchesType && matchesScope;
    })
    .sort((a, b) => {
      const aIsNotice = Boolean(a.isPinned) || a.postType === "NOTICE";
      const bIsNotice = Boolean(b.isPinned) || b.postType === "NOTICE";

      if (aIsNotice !== bIsNotice) {
        return aIsNotice ? -1 : 1;
      }

      return getBoardPostTime(a) - getBoardPostTime(b);
    });
}

export function getBoardMockPostById(postId: number) {
  return boardMockPosts.find((post) => post.id === postId);
}
