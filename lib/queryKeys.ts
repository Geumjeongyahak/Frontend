export const queryKeys = {
  posts: {
    noticeTop12: () => ["posts", "notice", "top12"] as const,
    boardList: (filters: {
      page: number;
      channelType: string;
      boardScope: string;
      searchKeyword?: string;
      mineOnly?: boolean;
      author?: string;
      refreshNonce?: number;
    }) => ["posts", "board", filters] as const,
    boardDetail: (channelId: number, postId: number) =>
      ["posts", "board", "detail", { channelId, postId }] as const,
  },
  lessons: {
    weekly: (from: string, to: string) => ["lessons", "weekly", { from, to }] as const,
  },
  user: {
    me: () => ["users", "me"] as const,
  },
  classrooms: {
    list: () => ["classrooms", "list"] as const,
  },
  students: {
    list: (params?: { name?: string; status?: string; classroomId?: number }) =>
      ["students", "list", params ?? {}] as const,
  },
  requests: {
    lessonExchangeList: () => ["lesson-exchange-requests"] as const,
    lessonExchangeDetail: (requestId: number) => ["lesson-exchange-request", requestId] as const,
    lessonExchangeProposals: (requestId: number) =>
      ["lesson-exchange-request-proposals", requestId] as const,
    absenceList: () => ["absence-requests"] as const,
    absenceDetail: (requestId: number) => ["absence-request", requestId] as const,
    purchaseList: () => ["purchase-requests"] as const,
    purchaseDetail: (requestId: number) => ["purchase-request", requestId] as const,
  },
  admin: {
    users: (page = 0, size = 20) => ["admin", "users", { page, size }] as const,
    userDetail: (userId: number) => ["admin", "users", "detail", userId] as const,
    userPermissions: (userId: number) => ["admin", "users", "permissions", userId] as const,
    permissionRegistry: () => ["admin", "permission-registry"] as const,
    channels: () => ["admin", "channels"] as const,
    channelDetail: (channelId: number) => ["admin", "channels", "detail", channelId] as const,
    posts: (page = 0, size = 20) => ["admin", "posts", { page, size }] as const,
    postDetail: (channelId: number, postId: number) =>
      ["admin", "posts", "detail", { channelId, postId }] as const,
    departments: () => ["admin", "departments"] as const,
    departmentDetail: (departmentId: number) =>
      ["admin", "departments", "detail", departmentId] as const,
    classrooms: () => ["admin", "classrooms"] as const,
    classroomDetail: (classroomId: number) =>
      ["admin", "classrooms", "detail", classroomId] as const,
    purchaseRequests: (status?: string) => ["admin", "purchase-requests", { status }] as const,
    purchaseRequestDetail: (requestId: number) =>
      ["admin", "purchase-requests", "detail", requestId] as const,
  },
};
