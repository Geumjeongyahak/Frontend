import { setupServer } from "msw/node";

import {
  authHandlers,
  classroomHandlers,
  departmentHandlers,
  lessonHandlers,
  requestHandlers,
  studentHandlers,
  subjectHandlers,
  userHandlers,
} from "./handlers";

export const server = setupServer(
  ...authHandlers,
  ...classroomHandlers,
  ...departmentHandlers,
  ...lessonHandlers,
  ...requestHandlers,
  ...studentHandlers,
  ...subjectHandlers,
  ...userHandlers,
);
