import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { detachRemovedAttachments } from "./postAttachmentEdit";

function notFound() {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Not Found", "ERR_BAD_REQUEST", config, null, {
    status: 404,
    statusText: "",
    headers: {},
    config,
    data: {},
  });
}

describe("detachRemovedAttachments", () => {
  it("skips attachments that were already removed by an earlier attempt", async () => {
    const detached: string[] = [];
    await detachRemovedAttachments(["gone", "b"], async (fileId) => {
      if (fileId === "gone") throw notFound();
      detached.push(fileId);
    });
    expect(detached).toEqual(["b"]);
  });

  it("stops on other errors", async () => {
    await expect(
      detachRemovedAttachments(["a"], async () => {
        throw new Error("network");
      }),
    ).rejects.toThrow("network");
  });
});
