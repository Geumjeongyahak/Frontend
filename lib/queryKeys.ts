export const queryKeys = {
  posts: {
    noticeTop12: () => ["posts", "notice", "top12"] as const,
    eventChannels: () => ["posts", "event", "channels"] as const,
    eventHomePhotos: (channelId?: number) => ["posts", "event", "homePhotos", channelId] as const,
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
    myWeekly: (from: string, to: string) => ["lessons", "me", "weekly", { from, to }] as const,
  },
  events: {
    weekly: (from: string, to: string) => ["events", "weekly", { from, to }] as const,
  },
  user: {
    me: () => ["users", "me"] as const,
  },
  classrooms: {
    list: () => ["classrooms", "list"] as const,
  },
  vendors: {
    list: () => ["vendors", "list"] as const,
  },
  students: {
    list: (params?: { name?: string; status?: string; classroomId?: number }) =>
      ["students", "list", params ?? {}] as const,
    contactClasses: () => ["students", "contact-classes"] as const,
  },
  teachers: {
    contactList: () => ["teachers", "contact-list"] as const,
  },
  meetingRecords: {
    list: (params: { page: number; size: number; keyword?: string; mineOnly?: boolean }) =>
      ["meeting-records", "list", params] as const,
    detail: (recordId: number) => ["meeting-records", "detail", recordId] as const,
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
  siteContent: {
    history: () => ["site-content", "history"] as const,
    departments: () => ["site-content", "departments"] as const,
    classes: () => ["site-content", "classes"] as const,
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
    subjects: (classroomId?: number) => ["admin", "subjects", { classroomId }] as const,
    activeVolunteerTeachers: () => ["admin", "users", "active-volunteer-teachers"] as const,
    purchaseRequests: (params?: string | { status?: string; keyword?: string }) => {
      const normalizedParams = typeof params === "string" ? { status: params } : (params ?? {});

      return ["admin", "purchase-requests", normalizedParams] as const;
    },
    purchaseRequestDetail: (requestId: number) =>
      ["admin", "purchase-requests", "detail", requestId] as const,
  },
};
