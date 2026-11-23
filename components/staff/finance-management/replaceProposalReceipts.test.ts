import { describe, expect, it, vi } from "vitest";

import { replaceProposalReceipts } from "./replaceProposalReceipts";

function createCalls() {
  const calls: string[] = [];
  return {
    calls,
    attach: vi.fn(async (fileId: string) => {
      calls.push(`attach:${fileId}`);
    }),
    remove: vi.fn(async (receiptId: number) => {
      calls.push(`remove:${receiptId}`);
    }),
  };
}

describe("replaceProposalReceipts", () => {
  it("attaches every new file before removing the old receipts", async () => {
    const { calls, attach, remove } = createCalls();

    await replaceProposalReceipts({
      existingReceipts: [
        { id: 1, fileId: "old-1" },
        { id: 2, fileId: "old-2" },
      ],
      nextFileIds: ["new-1", "new-2"],
      attach,
      remove,
    });

    expect(calls).toEqual(["attach:new-1", "attach:new-2", "remove:1", "remove:2"]);
  });

  it("keeps the old receipts when attaching a new file fails", async () => {
    const { calls, remove } = createCalls();
    const attach = vi.fn(async (fileId: string) => {
      calls.push(`attach:${fileId}`);
      if (fileId === "new-2") throw new Error("attach failed");
    });

    await expect(
      replaceProposalReceipts({
        existingReceipts: [
          { id: 1, fileId: "old-1" },
          { id: 2, fileId: "old-2" },
        ],
        nextFileIds: ["new-1", "new-2"],
        attach,
        remove,
      }),
    ).rejects.toThrow("attach failed");

    expect(remove).not.toHaveBeenCalled();
    expect(calls).toEqual(["attach:new-1", "attach:new-2"]);
  });

  it("only attaches new files and only removes receipts missing from the new list", async () => {
    const { calls, attach, remove } = createCalls();

    await replaceProposalReceipts({
      existingReceipts: [
        { id: 1, fileId: "keep" },
        { id: 2, fileId: "drop" },
      ],
      nextFileIds: ["keep", "added"],
      attach,
      remove,
    });

    expect(calls).toEqual(["attach:added", "remove:2"]);
  });

  it("does nothing to the server when the receipt list is unchanged", async () => {
    const { attach, remove } = createCalls();

    await replaceProposalReceipts({
      existingReceipts: [{ id: 1, fileId: "same" }],
      nextFileIds: ["same"],
      attach,
      remove,
    });

    expect(attach).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("refuses to change anything when an existing receipt has no id", async () => {
    const { attach, remove } = createCalls();

    await expect(
      replaceProposalReceipts({
        existingReceipts: [{ fileId: "old" }],
        nextFileIds: ["new"],
        attach,
        remove,
      }),
    ).rejects.toThrow("기존 품의서 영수증 정보를 확인할 수 없습니다.");

    expect(attach).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
});
