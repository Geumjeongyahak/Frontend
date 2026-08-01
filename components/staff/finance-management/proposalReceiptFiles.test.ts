import { describe, expect, it } from "vitest";

import {
  getInvalidProposalReceiptImages,
  isProposalReceiptImage,
  proposalReceiptImageAccept,
} from "./proposalReceiptFiles";

describe("proposal receipt file validation", () => {
  it("allows the purchase item image types supported by the receipt upload endpoint", () => {
    expect(isProposalReceiptImage(new File(["receipt"], "proof.JPG"))).toBe(true);
    expect(isProposalReceiptImage(new File(["receipt"], "receipt.jpeg"))).toBe(true);
    expect(isProposalReceiptImage(new File(["receipt"], "photo.png"))).toBe(true);
    expect(isProposalReceiptImage(new File(["receipt"], "receipt.gif"))).toBe(true);
    expect(isProposalReceiptImage(new File(["receipt"], "receipt.webp"))).toBe(true);
    expect(isProposalReceiptImage(new File(["receipt"], "statement.xlsx"))).toBe(false);
    expect(proposalReceiptImageAccept).toBe(
      "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp",
    );
  });

  it("returns only files that must be rejected before upload", () => {
    const document = new File(["document"], "receipt.docx");
    const image = new File(["image"], "receipt.png", { type: "image/png" });

    expect(getInvalidProposalReceiptImages([document, image])).toEqual([document]);
  });
});
