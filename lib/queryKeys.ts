export const queryKeys = {
  posts: {
    noticeTop12: () => ["posts", "notice", "top12"] as const,
  },
  lessons: {
    weekly: (from: string, to: string) => ["lessons", "weekly", { from, to }] as const,
  },
  requests: {
    lessonExchangeList: () => ["lesson-exchange-requests"] as const,
    lessonExchangeDetail: (requestId: number) => ["lesson-exchange-request", requestId] as const,
    absenceList: () => ["absence-requests"] as const,
    absenceDetail: (requestId: number) => ["absence-request", requestId] as const,
  },
};
