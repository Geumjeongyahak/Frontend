import { describe, expect, it, vi } from "vitest";

import {
  ATTACHMENT_AUTHOR_ONLY_MESSAGE,
  assertAttachmentChangeAllowed,
  detachRemovedAttachments,
  needsDraftForAttachmentChanges,
} from "./attachmentChanges";

describe("attachment changes", () => {
  it("needs a draft only when files are added or removed", () => {
    expect(needsDraftForAttachmentChanges({ newFileCount: 0, removedFileIds: [] })).toBe(false);
    expect(needsDraftForAttachmentChanges({ newFileCount: 1, removedFileIds: [] })).toBe(true);
    expect(needsDraftForAttachmentChanges({ newFileCount: 0, removedFileIds: ["a"] })).toBe(true);
  });

  it("blocks attachment changes on someone else's post before it becomes a draft", () => {
    expect(() =>
      assertAttachmentChangeAllowed({
        isEditMode: true,
        isAuthor: false,
        newFileCount: 1,
        removedFileIds: [],
      }),
    ).toThrow(ATTACHMENT_AUTHOR_ONLY_MESSAGE);
    expect(() =>
      assertAttachmentChangeAllowed({
        isEditMode: true,
        isAuthor: false,
        newFileCount: 0,
        removedFileIds: ["a"],
      }),
    ).toThrow(ATTACHMENT_AUTHOR_ONLY_MESSAGE);
  });

  it("allows edits without attachment changes by non-authors, and any change by the author", () => {
    expect(() =>
      assertAttachmentChangeAllowed({
        isEditMode: true,
        isAuthor: false,
        newFileCount: 0,
        removedFileIds: [],
      }),
    ).not.toThrow();
    expect(() =>
      assertAttachmentChangeAllowed({
        isEditMode: true,
        isAuthor: true,
        newFileCount: 2,
        removedFileIds: ["a"],
      }),
    ).not.toThrow();
    expect(() =>
      assertAttachmentChangeAllowed({
        isEditMode: false,
        isAuthor: false,
        newFileCount: 2,
        removedFileIds: [],
      }),
    ).not.toThrow();
  });

  it("detaches removed attachments in order and stops at the first failure", async () => {
    const calls: string[] = [];
    const detach = vi.fn(async (fileId: string) => {
      calls.push(fileId);
      if (fileId === "b") throw new Error("detach failed");
    });

    await expect(detachRemovedAttachments(["a", "b", "c"], detach)).rejects.toThrow("detach failed");
    expect(calls).toEqual(["a", "b"]);
  });
});
