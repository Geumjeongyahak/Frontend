"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import styled from "styled-components";
import { AdminMainDashboardSection } from "@/components/admin/AdminMainDashboardSection";
import { StatePanel } from "@/components/admin/AdminDashboardSectionParts";
import { AdminChannelsSection } from "@/components/admin/channels/AdminChannelsSection";
import { AdminClassroomsSection } from "@/components/admin/classes/AdminClassroomsSection";
import { AdminDepartmentsSection } from "@/components/admin/departments/AdminDepartmentsSection";
import { AdminPostsSection } from "@/components/admin/posts/AdminPostsSection";
import { AdminPurchasesSection } from "@/components/admin/purchase-requests/AdminPurchasesSection";
import { AdminUsersSection } from "@/components/admin/users/AdminUsersSection";
import type {
  AdminMenu,
  ChannelFormState,
  ClassroomFormState,
  DepartmentFormState,
  PermissionFormState,
  PostCreateState,
  PostEditState,
  PurchaseCreateState,
  UserFormState,
} from "@/components/admin/AdminDashboardTypes";
import {
  createChannel,
  deleteChannel,
  getChannel,
  getChannels,
  updateChannel,
} from "@/api/channel/channel.api";
import {
  createClassroom,
  deleteClassroom,
  getClassroomDetail,
  getClassrooms,
  updateClassroom,
} from "@/api/classroom/classroom.api";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentDetail,
  getDepartments,
  updateDepartment,
} from "@/api/department/department.api";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  pinPost,
  updatePost,
} from "@/api/post/post.api";
import type { PostStatus } from "@/api/post/post.dto";
import {
  approveAdminPurchaseRequest,
  confirmPurchase,
  createPurchaseRequest,
  deleteAdminPurchaseRequest,
  getAdminPurchaseRequestDetail,
  getAllPurchaseRequests,
  rejectAdminPurchaseRequest,
} from "@/api/request/request.api";
import type { PurchaseRequestStatus } from "@/api/request/request.dto";
import {
  addUserPermission,
  createUser,
  deleteUser,
  getAssignablePermissions,
  getUserDetail,
  getUserPermissions,
  getUsers,
  removeUserPermission,
  updateUser,
} from "@/api/user/user.api";
import type { PermissionDefinitionDto } from "@/api/user/user.dto";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const navigationItems: { key: AdminMenu; label: string }[] = [
  { key: "dashboard", label: "대시보드" },
  { key: "users", label: "사용자" },
  { key: "departments", label: "부서" },
  { key: "classrooms", label: "분반" },
  { key: "channels", label: "채널" },
  { key: "posts", label: "게시글" },
  { key: "purchases", label: "구매 요청" },
];

const fallbackPermissions: PermissionDefinitionDto[] = [
  {
    permissionCode: "user:manage:*",
    resourceCode: "user",
    actionCode: "manage",
    scope: "GLOBAL_ONLY",
    globalAllowed: true,
    targetAllowed: false,
    label: "전체 사용자 관리",
  },
  {
    permissionCode: "department:read:*",
    resourceCode: "department",
    actionCode: "read",
    scope: "BOTH",
    globalAllowed: true,
    targetAllowed: true,
    label: "부서 조회",
  },
  {
    permissionCode: "department:manage:*",
    resourceCode: "department",
    actionCode: "manage",
    scope: "BOTH",
    globalAllowed: true,
    targetAllowed: true,
    label: "부서 관리",
  },
  {
    permissionCode: "purchase-request:review:*",
    resourceCode: "purchase-request",
    actionCode: "review",
    scope: "GLOBAL_ONLY",
    globalAllowed: true,
    targetAllowed: false,
    label: "구매 요청 검토",
  },
  {
    permissionCode: "channel:manage:*",
    resourceCode: "channel",
    actionCode: "manage",
    scope: "BOTH",
    globalAllowed: true,
    targetAllowed: true,
    label: "채널 관리",
  },
  {
    permissionCode: "subject:write:*",
    resourceCode: "subject",
    actionCode: "write",
    scope: "BOTH",
    globalAllowed: true,
    targetAllowed: true,
    label: "과목 작성",
  },
];

const emptyUserForm: UserFormState = {
  email: "",
  nickname: "",
  password: "",
  name: "",
  phoneNumber: "",
  role: "VOLUNTEER",
  departmentId: "",
};

const emptyChannelForm: ChannelFormState = {
  name: "",
  description: "",
  accessLevel: "READ_WRITE",
  allowGuestRead: false,
  isDefault: false,
  isActive: true,
};

const emptyDepartmentForm: DepartmentFormState = {
  name: "",
  description: "",
};

const emptyClassroomForm: ClassroomFormState = {
  name: "",
  type: "WEEKDAY",
  description: "",
};

const emptyPostEdit: PostEditState = {
  title: "",
  status: "PUBLISHED",
  allowComment: true,
  isPinned: false,
  thumbnailUrl: "",
  contentHtml: "",
};

const emptyPostCreate: PostCreateState = {
  channelScope: "",
  channelTargetId: "",
  channelId: "",
  title: "",
  status: "PUBLISHED",
  allowComment: true,
  isPinned: false,
  thumbnailUrl: "",
  contentHtml: "",
};

const emptyPurchaseCreate: PurchaseCreateState = {
  title: "",
  content: "",
  classroomId: "",
  advancePaymentRequestedAmount: "",
  itemName: "",
  itemReason: "",
  itemExpectedPrice: "",
};

const emptyPermissionForm: PermissionFormState = {
  resourceType: "user",
  actionType: "manage",
  scope: "GLOBAL",
  target: "",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

function getTotalFromPage(contentLength: number, totalElements?: number) {
  return typeof totalElements === "number" ? totalElements : contentLength;
}

function buildPermissionCode(form: PermissionFormState) {
  const target = form.scope === "GLOBAL" ? "*" : form.target.trim();
  return `${form.resourceType}:${form.actionType}:${target}`;
}

function mapCreateUserFormToPayload(form: UserFormState) {
  return {
    email: form.email.trim(),
    nickname: form.nickname.trim(),
    password: form.password,
    name: form.name.trim(),
    phoneNumber: form.phoneNumber.trim() || undefined,
    role: form.role,
    departmentId: form.departmentId ? (toNumber(form.departmentId) ?? null) : null,
  };
}

function mapUpdateUserFormToPayload(form: UserFormState) {
  return {
    email: form.email.trim(),
    nickname: form.nickname.trim(),
    ...(form.password ? { password: form.password } : {}),
    name: form.name.trim(),
    phoneNumber: form.phoneNumber.trim() || undefined,
    role: form.role,
    departmentId: form.departmentId ? (toNumber(form.departmentId) ?? null) : null,
  };
}

function mapChannelFormToPayload(form: ChannelFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    accessLevel: form.accessLevel,
    allowGuestRead: form.allowGuestRead,
    isDefault: form.isDefault,
    isActive: form.isActive,
  };
}

function mapPostToEditState(post?: {
  title?: string;
  status?: PostStatus;
  allowComment?: boolean;
  isPinned?: boolean;
  thumbnailUrl?: string | null;
  contentHtml?: string;
}) {
  if (!post) {
    return emptyPostEdit;
  }

  return {
    title: post.title ?? "",
    status: post.status ?? "PUBLISHED",
    allowComment: post.allowComment ?? true,
    isPinned: post.isPinned ?? false,
    thumbnailUrl: post.thumbnailUrl ?? "",
    contentHtml: post.contentHtml ?? "",
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status, user, signOut } = useAuthSession();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";
  const [activeMenu, setActiveMenu] = useState<AdminMenu>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<{ channelId: number; postId: number } | null>(
    null,
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [postTitleSearch, setPostTitleSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseRequestStatus | "">("");
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [channelForm, setChannelForm] = useState<ChannelFormState>(emptyChannelForm);
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormState>(emptyDepartmentForm);
  const [classroomForm, setClassroomForm] = useState<ClassroomFormState>(emptyClassroomForm);
  const [postEdit, setPostEdit] = useState<PostEditState>(emptyPostEdit);
  const [isPostEditing, setIsPostEditing] = useState(false);
  const [postCreate, setPostCreate] = useState<PostCreateState>(emptyPostCreate);
  const [purchaseCreate, setPurchaseCreate] = useState<PurchaseCreateState>(emptyPurchaseCreate);
  const [permissionForm, setPermissionForm] = useState<PermissionFormState>(emptyPermissionForm);
  const [reviewNote, setReviewNote] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && user?.role !== "ADMIN")) {
      router.replace("/admin/login");
    }
  }, [router, status, user?.role]);

  const usersQuery = useQuery({
    queryKey: queryKeys.admin.users(0, 50),
    queryFn: () => getUsers({ page: 0, size: 50 }),
    enabled: isAdmin,
  });
  const departmentsQuery = useQuery({
    queryKey: queryKeys.admin.departments(),
    queryFn: getDepartments,
    enabled: isAdmin,
  });
  const classroomsQuery = useQuery({
    queryKey: queryKeys.admin.classrooms(),
    queryFn: () => getClassrooms({ page: 0, size: 50, name: classroomSearch || undefined }),
    enabled: isAdmin,
    placeholderData: (previousData) => previousData,
  });
  const pendingPurchasesQuery = useQuery({
    queryKey: queryKeys.admin.purchaseRequests("PENDING"),
    queryFn: () => getAllPurchaseRequests({ status: "PENDING" }),
    enabled: isAdmin,
  });
  const channelsQuery = useQuery({
    queryKey: queryKeys.admin.channels(),
    queryFn: () => getChannels({ name: channelSearch || undefined }),
    enabled: isAdmin,
  });
  const postsQuery = useQuery({
    queryKey: queryKeys.admin.posts(0, 50),
    queryFn: () => getPosts({ page: 0, size: 50, title: postTitleSearch || undefined }),
    enabled: isAdmin,
  });
  const purchasesQuery = useQuery({
    queryKey: queryKeys.admin.purchaseRequests(purchaseStatus || undefined),
    queryFn: () => getAllPurchaseRequests(purchaseStatus ? { status: purchaseStatus } : undefined),
    enabled: isAdmin,
  });
  const permissionRegistryQuery = useQuery({
    queryKey: queryKeys.admin.permissionRegistry(),
    queryFn: getAssignablePermissions,
    enabled: isAdmin,
  });
  const userDetailQuery = useQuery({
    queryKey: selectedUserId
      ? queryKeys.admin.userDetail(selectedUserId)
      : ["admin", "users", "detail", "none"],
    queryFn: () => getUserDetail({ userId: selectedUserId ?? 0 }),
    enabled: isAdmin && selectedUserId !== null,
  });
  const userPermissionsQuery = useQuery({
    queryKey: selectedUserId
      ? queryKeys.admin.userPermissions(selectedUserId)
      : ["admin", "users", "permissions", "none"],
    queryFn: () => getUserPermissions({ userId: selectedUserId ?? 0 }),
    enabled: isAdmin && selectedUserId !== null,
  });
  const channelDetailQuery = useQuery({
    queryKey: selectedChannelId
      ? queryKeys.admin.channelDetail(selectedChannelId)
      : ["admin", "channels", "detail", "none"],
    queryFn: () => getChannel({ id: selectedChannelId ?? 0 }),
    enabled: isAdmin && selectedChannelId !== null,
  });
  const postDetailQuery = useQuery({
    queryKey: selectedPost
      ? queryKeys.admin.postDetail(selectedPost.channelId, selectedPost.postId)
      : ["admin", "posts", "detail", "none"],
    queryFn: () => getPost(selectedPost ?? { channelId: 0, postId: 0 }),
    enabled: isAdmin && selectedPost !== null,
  });
  const departmentDetailQuery = useQuery({
    queryKey: selectedDepartmentId
      ? queryKeys.admin.departmentDetail(selectedDepartmentId)
      : ["admin", "departments", "detail", "none"],
    queryFn: () => getDepartmentDetail({ id: selectedDepartmentId ?? 0 }),
    enabled: isAdmin && selectedDepartmentId !== null,
  });
  const classroomDetailQuery = useQuery({
    queryKey: selectedClassroomId
      ? queryKeys.admin.classroomDetail(selectedClassroomId)
      : ["admin", "classrooms", "detail", "none"],
    queryFn: () => getClassroomDetail({ id: selectedClassroomId ?? 0 }),
    enabled: isAdmin && selectedClassroomId !== null,
  });
  const purchaseDetailQuery = useQuery({
    queryKey: selectedPurchaseId
      ? queryKeys.admin.purchaseRequestDetail(selectedPurchaseId)
      : ["admin", "purchase-requests", "detail", "none"],
    queryFn: () => getAdminPurchaseRequestDetail({ requestId: selectedPurchaseId ?? 0 }),
    enabled: isAdmin && selectedPurchaseId !== null,
  });

  const users = useMemo(() => usersQuery.data?.content ?? [], [usersQuery.data?.content]);
  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    if (!keyword) {
      return users;
    }
    return users.filter((item) =>
      [item.name, item.nickname, item.email, item.role].some((value) =>
        value?.toLowerCase().includes(keyword),
      ),
    );
  }, [userSearch, users]);
  const departments = departmentsQuery.data?.departments ?? [];
  const classrooms = classroomsQuery.data?.content ?? [];
  const channels = channelsQuery.data ?? [];
  const posts = postsQuery.data?.content ?? [];
  const purchases = purchasesQuery.data ?? [];
  const registry = permissionRegistryQuery.data?.length
    ? permissionRegistryQuery.data
    : fallbackPermissions;
  const permissionOptions = useMemo(() => {
    return registry.filter((option) => option.resourceCode && option.actionCode);
  }, [registry]);
  const availableActions = permissionOptions
    .filter((option) => option.resourceCode === permissionForm.resourceType)
    .map((option) => option.actionCode)
    .filter(
      (value, index, array): value is string => Boolean(value) && array.indexOf(value) === index,
    );
  const selectedPermissionDefinition = permissionOptions.find(
    (option) =>
      option.resourceCode === permissionForm.resourceType &&
      option.actionCode === permissionForm.actionType,
  );
  const canUseGlobalPermission =
    selectedPermissionDefinition?.globalAllowed ??
    selectedPermissionDefinition?.scope !== "TARGET_ONLY";
  const canUseTargetPermission =
    selectedPermissionDefinition?.targetAllowed ??
    selectedPermissionDefinition?.scope !== "GLOBAL_ONLY";
  const generatedPermissionCode = buildPermissionCode(permissionForm);

  const stats = [
    { label: "사용자", value: getTotalFromPage(users.length, usersQuery.data?.totalElements) },
    { label: "부서", value: departments.length },
    {
      label: "분반",
      value: getTotalFromPage(classrooms.length, classroomsQuery.data?.totalElements),
    },
    { label: "대기 중 구매 요청", value: pendingPurchasesQuery.data?.length ?? 0 },
  ];

  function notifySuccess(message: string) {
    toast.success(message);
  }

  function notifyError(message: string) {
    toast.error(message);
  }

  function selectUser(item: (typeof users)[number]) {
    if (!item.id) {
      return;
    }
    setSelectedUserId(item.id);
    setUserForm({
      email: item.email ?? "",
      nickname: item.nickname ?? "",
      password: "",
      name: item.name ?? "",
      phoneNumber: item.phoneNumber ?? "",
      role: item.role ?? "VOLUNTEER",
      departmentId: item.departmentId ? String(item.departmentId) : "",
    });
  }

  function selectChannel(item: (typeof channels)[number]) {
    if (!item.id) {
      return;
    }
    setSelectedChannelId(item.id);
    setChannelForm({
      name: item.name ?? "",
      description: item.description ?? "",
      accessLevel: item.accessLevel ?? "READ_WRITE",
      allowGuestRead: item.allowGuestRead ?? false,
      isDefault: item.isDefault ?? false,
      isActive: item.isActive ?? true,
    });
  }

  function selectPost(item: (typeof posts)[number]) {
    if (!item.id || !item.channelId) {
      return;
    }

    setSelectedPost({ channelId: item.channelId, postId: item.id });
    setIsPostEditing(false);

    if (selectedPost?.channelId !== item.channelId || selectedPost.postId !== item.id) {
      setPostEdit(mapPostToEditState(item));
    }
  }

  function closePostDetail() {
    setSelectedPost(null);
    setIsPostEditing(false);
    setPostEdit(emptyPostEdit);
  }

  function selectDepartment(item: (typeof departments)[number]) {
    if (!item.id) {
      return;
    }
    setSelectedDepartmentId(item.id);
    setDepartmentForm({
      name: item.name ?? "",
      description: item.description ?? "",
    });
  }

  function selectClassroom(item: (typeof classrooms)[number]) {
    if (!item.id) {
      return;
    }
    setSelectedClassroomId(item.id);
    setClassroomForm({
      name: item.name ?? "",
      type: item.type ?? "WEEKDAY",
      description: item.description ?? "",
    });
  }

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const createUserMutation = useMutation({
    mutationFn: () => createUser(mapCreateUserFormToPayload(userForm)),
    onSuccess: () => {
      notifySuccess("사용자를 생성했습니다.");
      setUserForm(emptyUserForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(0, 50) });
    },
    onError: (error) => notifyError(getErrorMessage(error, "사용자 생성에 실패했습니다.")),
  });
  const updateUserMutation = useMutation({
    mutationFn: () =>
      updateUser({ userId: selectedUserId ?? 0 }, mapUpdateUserFormToPayload(userForm)),
    onSuccess: () => {
      notifySuccess("사용자를 수정했습니다.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(0, 50) });
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(selectedUserId) });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "사용자 수정에 실패했습니다.")),
  });
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser({ userId: selectedUserId ?? 0 }),
    onSuccess: () => {
      notifySuccess("사용자를 삭제했습니다.");
      setSelectedUserId(null);
      setUserForm(emptyUserForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(0, 50) });
    },
    onError: (error) => notifyError(getErrorMessage(error, "사용자 삭제에 실패했습니다.")),
  });
  const addPermissionMutation = useMutation({
    mutationFn: () =>
      addUserPermission(
        { userId: selectedUserId ?? 0 },
        { permissionCode: generatedPermissionCode },
      ),
    onSuccess: () => {
      notifySuccess("사용자 권한을 추가했습니다.");
      if (selectedUserId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.userPermissions(selectedUserId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "권한 추가에 실패했습니다.")),
  });
  const removePermissionMutation = useMutation({
    mutationFn: (permissionCode: string) =>
      removeUserPermission({ userId: selectedUserId ?? 0 }, { permissionCode }),
    onSuccess: () => {
      notifySuccess("사용자 권한을 제거했습니다.");
      if (selectedUserId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.userPermissions(selectedUserId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "권한 제거에 실패했습니다.")),
  });

  const createChannelMutation = useMutation({
    mutationFn: () => createChannel(mapChannelFormToPayload(channelForm)),
    onSuccess: () => {
      notifySuccess("채널을 생성했습니다.");
      setChannelForm(emptyChannelForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.channels() });
    },
    onError: (error) => notifyError(getErrorMessage(error, "채널 생성에 실패했습니다.")),
  });
  const updateChannelMutation = useMutation({
    mutationFn: () =>
      updateChannel({ id: selectedChannelId ?? 0 }, mapChannelFormToPayload(channelForm)),
    onSuccess: () => {
      notifySuccess("채널을 수정했습니다.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.channels() });
      if (selectedChannelId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.channelDetail(selectedChannelId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "채널 수정에 실패했습니다.")),
  });
  const deleteChannelMutation = useMutation({
    mutationFn: () => deleteChannel({ id: selectedChannelId ?? 0 }),
    onSuccess: () => {
      notifySuccess("채널을 삭제했습니다.");
      setSelectedChannelId(null);
      setChannelForm(emptyChannelForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.channels() });
    },
    onError: (error) => notifyError(getErrorMessage(error, "채널 삭제에 실패했습니다.")),
  });

  const createPostMutation = useMutation({
    mutationFn: () =>
      createPost(
        { channelId: toNumber(postCreate.channelId) ?? 0 },
        {
          title: postCreate.title.trim(),
          contentHtml: postCreate.contentHtml,
          status: postCreate.status,
          allowComment: postCreate.allowComment,
          isPinned: postCreate.isPinned,
          thumbnailUrl: postCreate.thumbnailUrl || undefined,
        },
      ),
    onSuccess: () => {
      notifySuccess("게시글을 작성했습니다.");
      setPostCreate(emptyPostCreate);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) });
    },
    onError: (error) => notifyError(getErrorMessage(error, "게시글 작성에 실패했습니다.")),
  });

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      const pathParams = selectedPost ?? { channelId: 0, postId: 0 };
      const updatedPost = await updatePost(pathParams, {
        title: postEdit.title,
        status: postEdit.status,
        allowComment: postEdit.allowComment,
        thumbnailUrl: postEdit.thumbnailUrl || undefined,
        contentHtml: postEdit.contentHtml,
      });
      const currentPinned = postDetailQuery.data?.isPinned ?? false;

      if (postEdit.isPinned !== currentPinned) {
        return pinPost(pathParams, { isPinned: postEdit.isPinned });
      }

      return updatedPost;
    },
    onSuccess: (updatedPost) => {
      notifySuccess("게시글을 수정했습니다.");
      setPostEdit(mapPostToEditState(updatedPost));
      setIsPostEditing(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) });
      if (selectedPost) {
        queryClient.setQueryData(
          queryKeys.admin.postDetail(selectedPost.channelId, selectedPost.postId),
          updatedPost,
        );
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.postDetail(selectedPost.channelId, selectedPost.postId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "게시글 수정에 실패했습니다.")),
  });
  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(selectedPost ?? { channelId: 0, postId: 0 }),
    onSuccess: () => {
      notifySuccess("게시글을 삭제했습니다.");
      setSelectedPost(null);
      setIsPostEditing(false);
      setPostEdit(emptyPostEdit);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) });
    },
    onError: (error) => notifyError(getErrorMessage(error, "게시글 삭제에 실패했습니다.")),
  });
  const pinPostMutation = useMutation({
    mutationFn: (isPinned: boolean) =>
      pinPost(selectedPost ?? { channelId: 0, postId: 0 }, { isPinned }),
    onSuccess: () => {
      notifySuccess("게시글 고정 상태를 변경했습니다.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) });
      if (selectedPost) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.postDetail(selectedPost.channelId, selectedPost.postId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "게시글 고정 변경에 실패했습니다.")),
  });

  const createDepartmentMutation = useMutation({
    mutationFn: () => createDepartment(departmentForm),
    onSuccess: () => {
      notifySuccess("부서를 생성했습니다.");
      setDepartmentForm(emptyDepartmentForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.departments() });
    },
    onError: (error) => notifyError(getErrorMessage(error, "부서 생성에 실패했습니다.")),
  });
  const updateDepartmentMutation = useMutation({
    mutationFn: () => updateDepartment({ id: selectedDepartmentId ?? 0 }, departmentForm),
    onSuccess: () => {
      notifySuccess("부서를 수정했습니다.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.departments() });
      if (selectedDepartmentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.departmentDetail(selectedDepartmentId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "부서 수정에 실패했습니다.")),
  });
  const deleteDepartmentMutation = useMutation({
    mutationFn: () => deleteDepartment({ id: selectedDepartmentId ?? 0 }),
    onSuccess: () => {
      notifySuccess("부서를 삭제했습니다.");
      setSelectedDepartmentId(null);
      setDepartmentForm(emptyDepartmentForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.departments() });
    },
    onError: (error) =>
      notifyError(
        getErrorMessage(
          error,
          "부서 삭제에 실패했습니다. 할당된 역할이나 멤버가 있으면 삭제할 수 없습니다.",
        ),
      ),
  });

  const createClassroomMutation = useMutation({
    mutationFn: () => createClassroom(classroomForm),
    onSuccess: () => {
      notifySuccess("분반을 생성했습니다.");
      setClassroomForm(emptyClassroomForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.classrooms() });
    },
    onError: (error) => notifyError(getErrorMessage(error, "분반 생성에 실패했습니다.")),
  });
  const updateClassroomMutation = useMutation({
    mutationFn: () => updateClassroom({ id: selectedClassroomId ?? 0 }, classroomForm),
    onSuccess: () => {
      notifySuccess("분반을 수정했습니다.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.classrooms() });
      if (selectedClassroomId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.classroomDetail(selectedClassroomId),
        });
      }
    },
    onError: (error) => notifyError(getErrorMessage(error, "분반 수정에 실패했습니다.")),
  });
  const deleteClassroomMutation = useMutation({
    mutationFn: () => deleteClassroom({ id: selectedClassroomId ?? 0 }),
    onSuccess: () => {
      notifySuccess("분반을 삭제했습니다.");
      setSelectedClassroomId(null);
      setClassroomForm(emptyClassroomForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.classrooms() });
    },
    onError: (error) => notifyError(getErrorMessage(error, "분반 삭제에 실패했습니다.")),
  });

  const createPurchaseMutation = useMutation({
    mutationFn: () =>
      createPurchaseRequest({
        title: purchaseCreate.title.trim(),
        content: purchaseCreate.content.trim(),
        classroomId: toNumber(purchaseCreate.classroomId) ?? 0,
        ...(purchaseCreate.advancePaymentRequestedAmount
          ? {
              advancePaymentRequestedAmount: toNumber(purchaseCreate.advancePaymentRequestedAmount),
            }
          : {}),
        items: [
          {
            name: purchaseCreate.itemName.trim(),
            reason: purchaseCreate.itemReason.trim() || undefined,
            ...(purchaseCreate.itemExpectedPrice
              ? { expectedPrice: toNumber(purchaseCreate.itemExpectedPrice) }
              : {}),
          },
        ],
      }),
    onSuccess: () => {
      notifySuccess("구매 요청을 작성했습니다.");
      setPurchaseCreate(emptyPurchaseCreate);
      invalidateDashboard();
    },
    onError: (error) => notifyError(getErrorMessage(error, "구매 요청 작성에 실패했습니다.")),
  });

  const approvePurchaseMutation = useMutation({
    mutationFn: () =>
      approveAdminPurchaseRequest(
        { requestId: selectedPurchaseId ?? 0 },
        {
          note: reviewNote || "승인합니다.",
          ...(approvedAmount ? { advancePaymentApprovedAmount: toNumber(approvedAmount) } : {}),
        },
      ),
    onSuccess: () => {
      notifySuccess("구매 요청을 승인했습니다.");
      invalidateDashboard();
    },
    onError: (error) => notifyError(getErrorMessage(error, "구매 요청 승인에 실패했습니다.")),
  });
  const rejectPurchaseMutation = useMutation({
    mutationFn: () =>
      rejectAdminPurchaseRequest(
        { requestId: selectedPurchaseId ?? 0 },
        { note: reviewNote || "반려합니다." },
      ),
    onSuccess: () => {
      notifySuccess("구매 요청을 반려했습니다.");
      invalidateDashboard();
    },
    onError: (error) => notifyError(getErrorMessage(error, "구매 요청 반려에 실패했습니다.")),
  });
  const confirmPurchaseMutation = useMutation({
    mutationFn: () => confirmPurchase({ requestId: selectedPurchaseId ?? 0 }),
    onSuccess: () => {
      notifySuccess("구매 요청을 결재 확인했습니다.");
      invalidateDashboard();
    },
    onError: (error) => notifyError(getErrorMessage(error, "결재 확인에 실패했습니다.")),
  });
  const deletePurchaseMutation = useMutation({
    mutationFn: () => deleteAdminPurchaseRequest({ requestId: selectedPurchaseId ?? 0 }),
    onSuccess: () => {
      notifySuccess("구매 요청을 삭제했습니다.");
      setSelectedPurchaseId(null);
      invalidateDashboard();
    },
    onError: (error) => notifyError(getErrorMessage(error, "구매 요청 삭제에 실패했습니다.")),
  });

  async function handleLogout() {
    await signOut();
    router.replace("/admin/login");
  }

  if (!isAdmin) {
    return (
      <Main>
        <AdminContent>
          <StatePanel>
            <LoadingSpinner label="관리자 권한 확인 중" />
          </StatePanel>
        </AdminContent>
      </Main>
    );
  }

  const currentTitle = navigationItems.find((item) => item.key === activeMenu)?.label ?? "대시보드";
  const currentDescription = {
    dashboard:
      "전체 사용자, 부서, 분반, 승인 대기 구매 요청을 요약하고 주요 관리 화면으로 이동합니다.",
    users:
      "사용자 목록 조회, 역할 확인, 사용자 생성/수정/삭제, 직접 권한 조회와 권한 부여를 제공합니다.",
    channels:
      "채널 목록 조회, 유형과 연결 대상 확인, 채널 생성/수정/삭제 및 활성 상태 관리를 제공합니다.",
    posts:
      "공지/부서/반별 채널 게시글 작성, 이미지 첨부, 게시글 조회/수정/삭제/고정 관리를 제공합니다.",
    departments:
      "부서 목록과 상세 정보를 조회하고 부서 생성/수정/삭제, 소속 사용자와 권한 정보를 확인합니다.",
    classrooms: "분반 목록과 상세 정보를 조회하고 분반 생성/수정/삭제 및 이름 검색을 제공합니다.",
    purchases: "구매 요청 작성, 목록/상세 조회, 승인/반려/결재 확인/삭제 처리를 제공합니다.",
  }[activeMenu];

  return (
    <ConsoleShell>
      <TopLine aria-hidden="true" />
      <Sidebar>
        <Brand href="/" aria-label="홈으로 이동">
          <BrandLogo src="/logo.svg" alt="" aria-hidden="true" />
          <BrandText>
            <BrandTitle>관리자 콘솔</BrandTitle>
            <BrandDescription>금정열린배움터 운영</BrandDescription>
          </BrandText>
        </Brand>

        <SidebarNav aria-label="관리자 메뉴">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.key}
              type="button"
              $active={activeMenu === item.key}
              onClick={() => setActiveMenu(item.key)}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarNav>

        <LogoutButton type="button" onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </Sidebar>

      <Main>
        <AdminContent>
          <AccountText>{user?.email}</AccountText>
          <PageHeader>
            <Title>{currentTitle}</Title>
            <Description>{currentDescription}</Description>
          </PageHeader>
          {activeMenu === "dashboard" ? (
            <AdminMainDashboardSection
              stats={stats}
              usersQuery={usersQuery}
              departmentsQuery={departmentsQuery}
              classroomsQuery={classroomsQuery}
              pendingPurchasesQuery={pendingPurchasesQuery}
              setActiveMenu={setActiveMenu}
              setPurchaseStatus={setPurchaseStatus}
            />
          ) : null}
          {activeMenu === "users" ? (
            <AdminUsersSection
              filteredUsers={filteredUsers}
              selectedUserId={selectedUserId}
              userSearch={userSearch}
              userForm={userForm}
              permissionForm={permissionForm}
              permissionOptions={permissionOptions}
              availableActions={availableActions}
              canUseGlobalPermission={canUseGlobalPermission}
              canUseTargetPermission={canUseTargetPermission}
              generatedPermissionCode={generatedPermissionCode}
              usersQuery={usersQuery}
              userDetailQuery={userDetailQuery}
              userPermissionsQuery={userPermissionsQuery}
              createUserMutation={createUserMutation}
              updateUserMutation={updateUserMutation}
              deleteUserMutation={deleteUserMutation}
              addPermissionMutation={addPermissionMutation}
              removePermissionMutation={removePermissionMutation}
              setSelectedUserId={setSelectedUserId}
              setUserSearch={setUserSearch}
              setUserForm={setUserForm}
              setPermissionForm={setPermissionForm}
              selectUser={selectUser}
              emptyUserForm={emptyUserForm}
            />
          ) : null}
          {activeMenu === "channels" ? (
            <AdminChannelsSection
              channels={channels}
              selectedChannelId={selectedChannelId}
              channelSearch={channelSearch}
              channelForm={channelForm}
              channelsQuery={channelsQuery}
              channelDetailQuery={channelDetailQuery}
              createChannelMutation={createChannelMutation}
              updateChannelMutation={updateChannelMutation}
              deleteChannelMutation={deleteChannelMutation}
              setSelectedChannelId={setSelectedChannelId}
              setChannelSearch={setChannelSearch}
              setChannelForm={setChannelForm}
              selectChannel={selectChannel}
              emptyChannelForm={emptyChannelForm}
            />
          ) : null}
          {activeMenu === "posts" ? (
            <AdminPostsSection
              channels={channels}
              classrooms={classrooms}
              departments={departments}
              posts={posts}
              selectedPost={selectedPost}
              postTitleSearch={postTitleSearch}
              postCreate={postCreate}
              postEdit={postEdit}
              isPostEditing={isPostEditing}
              postsQuery={postsQuery}
              postDetailQuery={postDetailQuery}
              createPostMutation={createPostMutation}
              updatePostMutation={updatePostMutation}
              pinPostMutation={pinPostMutation}
              deletePostMutation={deletePostMutation}
              setPostTitleSearch={setPostTitleSearch}
              setPostCreate={setPostCreate}
              setPostEdit={setPostEdit}
              setIsPostEditing={setIsPostEditing}
              selectPost={selectPost}
              closePostDetail={closePostDetail}
            />
          ) : null}
          {activeMenu === "departments" ? (
            <AdminDepartmentsSection
              departments={departments}
              selectedDepartmentId={selectedDepartmentId}
              departmentForm={departmentForm}
              departmentsQuery={departmentsQuery}
              departmentDetailQuery={departmentDetailQuery}
              createDepartmentMutation={createDepartmentMutation}
              updateDepartmentMutation={updateDepartmentMutation}
              deleteDepartmentMutation={deleteDepartmentMutation}
              setSelectedDepartmentId={setSelectedDepartmentId}
              setDepartmentForm={setDepartmentForm}
              selectDepartment={selectDepartment}
              emptyDepartmentForm={emptyDepartmentForm}
            />
          ) : null}
          {activeMenu === "classrooms" ? (
            <AdminClassroomsSection
              classrooms={classrooms}
              selectedClassroomId={selectedClassroomId}
              classroomSearch={classroomSearch}
              classroomForm={classroomForm}
              classroomsQuery={classroomsQuery}
              classroomDetailQuery={classroomDetailQuery}
              createClassroomMutation={createClassroomMutation}
              updateClassroomMutation={updateClassroomMutation}
              deleteClassroomMutation={deleteClassroomMutation}
              setSelectedClassroomId={setSelectedClassroomId}
              setClassroomSearch={setClassroomSearch}
              setClassroomForm={setClassroomForm}
              selectClassroom={selectClassroom}
              emptyClassroomForm={emptyClassroomForm}
            />
          ) : null}
          {activeMenu === "purchases" ? (
            <AdminPurchasesSection
              classrooms={classrooms}
              purchases={purchases}
              selectedPurchaseId={selectedPurchaseId}
              purchaseStatus={purchaseStatus}
              purchaseCreate={purchaseCreate}
              reviewNote={reviewNote}
              approvedAmount={approvedAmount}
              purchasesQuery={purchasesQuery}
              purchaseDetailQuery={purchaseDetailQuery}
              createPurchaseMutation={createPurchaseMutation}
              approvePurchaseMutation={approvePurchaseMutation}
              rejectPurchaseMutation={rejectPurchaseMutation}
              confirmPurchaseMutation={confirmPurchaseMutation}
              deletePurchaseMutation={deletePurchaseMutation}
              setPurchaseStatus={setPurchaseStatus}
              setPurchaseCreate={setPurchaseCreate}
              setSelectedPurchaseId={setSelectedPurchaseId}
              setReviewNote={setReviewNote}
              setApprovedAmount={setApprovedAmount}
            />
          ) : null}
          <ToastContainer position="top-right" autoClose={2400} newestOnTop pauseOnHover />
        </AdminContent>
      </Main>
    </ConsoleShell>
  );
}

const ConsoleShell = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f5;

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const TopLine = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 0.125rem;
  background-color: #17466b;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  width: 14rem;
  min-height: 100vh;
  padding: 1.5rem 0.875rem 2.25rem;
  background-color: ${colors.white};
  border-right: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    width: 17.4375rem;
    padding: 2.25rem 1.5rem 3rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
    min-height: auto;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  margin-bottom: ${spacing.space24};
  border-radius: 0.375rem;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;

  &:hover {
    opacity: 0.86;
    transform: translateX(0.125rem);
  }

  &:active {
    transform: translateX(0.125rem) scale(0.98);
  }

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    margin-bottom: ${spacing.space40};
  }
`;

const BrandLogo = styled.img`
  width: 1.75rem;
  height: auto;

  @media (min-width: 120rem) {
    width: 2.625rem;
  }
`;

const BrandText = styled.div`
  min-width: 0;
`;

const BrandTitle = styled.p`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const BrandDescription = styled.p`
  margin: ${spacing.space4} 0 0;
  color: #64706c;
  font-size: 0.6875rem;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize14};
  }
`;

const SidebarNav = styled.nav`
  display: grid;
  gap: ${spacing.space8};
`;

const SidebarItem = styled.button<{ $active: boolean }>`
  position: relative;
  min-height: 2.375rem;
  border: 0;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  background-color: ${({ $active }) => ($active ? colors.pointSoft : "transparent")};
  color: ${({ $active }) => ($active ? "#1d9a35" : "#1f2b28")};
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  text-align: left;
  cursor: pointer;
  transform: translateX(${({ $active }) => ($active ? "0.25rem" : "0")});
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? colors.pointSoft : "#f1f5f2")};
    transform: translateX(0.25rem);
  }

  &:active {
    transform: translateX(0.25rem) scale(0.98);
  }

  &::before {
    position: absolute;
    top: 50%;
    left: 0.25rem;
    width: 0.1875rem;
    height: 1.125rem;
    border-radius: ${radii.radius999};
    background-color: ${colors.point};
    content: "";
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: translateY(-50%);
    transition: opacity 0.18s ease;
  }

  @media (min-width: 120rem) {
    min-height: 3.625rem;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }
`;

const LogoutButton = styled.button`
  min-height: 2.375rem;
  margin-top: ${spacing.space20};
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 3.625rem;
    margin-top: ${spacing.space32};
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  background-color: #f4f6f5;
`;

const AdminContent = styled.div`
  position: relative;
  display: grid;
  gap: ${spacing.space16};
  width: 100%;
  max-width: ${layout.adminMaxWidth};
  margin: 0 auto;
  padding: 3.25rem ${spacing.space20} ${spacing.space32};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
    max-width: ${layout.adminMaxWidthLarge};
    padding: 5.625rem ${spacing.space24} 4.125rem;
  }
`;

const AccountText = styled.p`
  position: absolute;
  top: 1.5rem;
  right: ${spacing.space20};
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    top: 2.375rem;
    right: ${spacing.space24};
    font-size: ${typography.fontSize18};
  }
`;

const PageHeader = styled.header`
  display: grid;
  gap: ${spacing.space8};
`;

const Title = styled.h1`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize24};
  font-weight: 900;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const Description = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;
