import type { ChannelAccessLevel } from "@/api/channel/channel.dto";
import type { ClassroomType } from "@/api/classroom/classroom.dto";
import type { PostStatus } from "@/api/post/post.dto";
import type { UserRole } from "@/api/user/user.dto";

export type AdminMenu =
  | "dashboard"
  | "users"
  | "channels"
  | "posts"
  | "departments"
  | "classrooms"
  | "subjects"
  | "lessons"
  | "purchases"
  | "absenceRequests";

export type UserFormState = {
  email: string;
  nickname: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  departmentId: string;
};

export type ChannelFormState = {
  name: string;
  description: string;
  accessLevel: ChannelAccessLevel;
  allowGuestRead: boolean;
  isDefault: boolean;
  isActive: boolean;
};

export type DepartmentFormState = {
  name: string;
  description: string;
};

export type ClassroomFormState = {
  name: string;
  type: ClassroomType;
  description: string;
};

export type PostEditState = {
  title: string;
  status: PostStatus;
  allowComment: boolean;
  isPinned: boolean;
  thumbnailUrl: string;
  contentHtml: string;
};

export type PostCreateState = {
  channelScope: "" | "NOTICE" | "CLASSROOM" | "DEPARTMENT" | "CUSTOM";
  channelTargetId: string;
  channelId: string;
  title: string;
  status: PostStatus;
  allowComment: boolean;
  isPinned: boolean;
  thumbnailUrl: string;
  contentHtml: string;
};

export type PurchaseCreateState = {
  title: string;
  content: string;
  classroomId: string;
  itemName: string;
  itemQuantity: string;
  itemReason: string;
  itemPaymentType: "PREPAID" | "ACTUAL";
};

export type PermissionFormState = {
  resourceType: string;
  actionType: string;
  scope: "GLOBAL" | "TARGET";
  target: string;
};
