import { setupServer } from "msw/node";

import {
  authHandlers,
  channelHandlers,
  classroomHandlers,
  commentHandlers,
  departmentHandlers,
  fileHandlers,
  lessonHandlers,
  meetingRecordHandlers,
  postHandlers,
  requestHandlers,
  studentHandlers,
  subjectHandlers,
  userHandlers,
  vendorHandlers,
} from "./handlers";

export const server = setupServer(
  ...authHandlers,
  ...channelHandlers,
  ...classroomHandlers,
  ...commentHandlers,
  ...departmentHandlers,
  ...fileHandlers,
  ...lessonHandlers,
  ...meetingRecordHandlers,
  ...postHandlers,
  ...requestHandlers,
  ...studentHandlers,
  ...subjectHandlers,
  ...userHandlers,
  ...vendorHandlers,
);
