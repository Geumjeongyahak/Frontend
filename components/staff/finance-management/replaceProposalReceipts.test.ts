import { describe, expect, it } from "vitest";
import { replaceProposalReceipts } from "./replaceProposalReceipts";

describe("replaceProposalReceipts", () => {
  it("attaches new files before deleting receipts that are no longer used", async () => {
    const calls: string[] = [];

    await replaceProposalReceipts(
      [
        { id: 1, fileId: "keep" },
        { id: 2, fileId: "old" },
      ],
      ["keep", "new"],
      {
        attach: async (fileId) => void calls.push(`attach:${fileId}`),
        remove: async (receiptId) => void calls.push(`remove:${receiptId}`),
      },
    );

    expect(calls).toEqual(["attach:keep", "attach:new", "remove:2"]);
  });

  it("keeps existing receipts when an attach fails", async () => {
    const removed: number[] = [];

    await expect(
      replaceProposalReceipts([{ id: 1, fileId: "old" }], ["new"], {
        attach: async () => {
          throw new Error("upload failed");
        },
        remove: async (receiptId) => void removed.push(receiptId),
      }),
    ).rejects.toThrow("upload failed");
    expect(removed).toEqual([]);
  });
});
