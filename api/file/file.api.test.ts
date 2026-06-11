import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../mocks/server";
import {
  API_BASE_URL,
  REFRESHED_ACCESS_TOKEN,
  VALID_ACCESS_TOKEN,
} from "../../mocks/handlers/auth.handlers";
import {
  ATTACHMENT_DOWNLOAD_URL_RESPONSE,
  FILE_UPLOAD_RESPONSE,
} from "../../mocks/handlers/file.handlers";
import { setAccessToken } from "../client/tokenStorage";
import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  registerDriveFile,
  uploadAdminPurchaseRequestReceiptImage,
  uploadAdminVendorReceiptImage,
  uploadPurchaseItemImage,
  uploadSiteContentImage,
} from "./file.api";

describe("file.api", () => {
  it("uploads a purchase item image as multipart form data", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedContentType = "";

    server.use(
      http.post(`${API_BASE_URL}/api/v1/files/images/purchase-items`, async ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedContentType = request.headers.get("content-type") ?? "";

        return HttpResponse.json(FILE_UPLOAD_RESPONSE);
      }),
    );

    const response = await uploadPurchaseItemImage(
      new File(["proof"], "receipt.png", { type: "image/png" }),
      "receipt.png",
    );

    expect(response).toEqual(FILE_UPLOAD_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedContentType).toContain("multipart/form-data");
  });

  it("returns a signed attachment download url", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const response = await getAttachmentDownloadUrl({
      fileId: FILE_UPLOAD_RESPONSE.fileId ?? "",
    });

    expect(response).toEqual(ATTACHMENT_DOWNLOAD_URL_RESPONSE);
  });

  it("uploads a site content image through the expected endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedContentType = "";

    server.use(
      http.post(`${API_BASE_URL}/api/v1/files/images/site-contents`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        observedContentType = request.headers.get("content-type") ?? "";
        return HttpResponse.json(FILE_UPLOAD_RESPONSE);
      }),
    );

    const response = await uploadSiteContentImage(
      new File(["image"], "history.png", { type: "image/png" }),
      "history.png",
    );

    expect(response).toEqual(FILE_UPLOAD_RESPONSE);
    expect(observedPathname).toBe("/api/v1/files/images/site-contents");
    expect(observedContentType).toContain("multipart/form-data");
  });

  it("uploads admin receipt images through legacy Swagger endpoints", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const observedPaths: string[] = [];
    const observedContentTypes: string[] = [];

    server.use(
      http.post(`${API_BASE_URL}/admin/request/purchase/vendors/receipt-images`, ({ request }) => {
        observedPaths.push(new URL(request.url).pathname);
        observedContentTypes.push(request.headers.get("content-type") ?? "");
        return HttpResponse.json(FILE_UPLOAD_RESPONSE);
      }),
      http.post(
        `${API_BASE_URL}/admin/request/purchase/purchase-requests/receipt-images`,
        ({ request }) => {
          observedPaths.push(new URL(request.url).pathname);
          observedContentTypes.push(request.headers.get("content-type") ?? "");
          return HttpResponse.json(FILE_UPLOAD_RESPONSE);
        },
      ),
    );

    const file = new File(["image"], "receipt.png", { type: "image/png" });

    await expect(uploadAdminVendorReceiptImage(file, "receipt.png")).resolves.toEqual(
      FILE_UPLOAD_RESPONSE,
    );
    await expect(uploadAdminPurchaseRequestReceiptImage(file, "receipt.png")).resolves.toEqual(
      FILE_UPLOAD_RESPONSE,
    );

    expect(observedPaths).toEqual([
      "/admin/request/purchase/vendors/receipt-images",
      "/admin/request/purchase/purchase-requests/receipt-images",
    ]);
    expect(observedContentTypes.every((contentType) => contentType.includes("multipart/form-data")))
      .toBe(true);
  });

  it("registers Google Drive file metadata", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/files/drive`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json(FILE_UPLOAD_RESPONSE);
      }),
    );

    const body = {
      driveUrl: "https://drive.google.com/file/d/abc123/view",
      originalName: "handover.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
    };

    const response = await registerDriveFile(body);

    expect(response).toEqual(FILE_UPLOAD_RESPONSE);
    expect(observedBody).toEqual(body);
  });

  it("deletes an attachment through the expected endpoint", async () => {
    setAccessToken(REFRESHED_ACCESS_TOKEN);

    let observedPathname = "";

    server.use(
      http.delete(`${API_BASE_URL}/api/v1/files/attachments/:fileId`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await deleteAttachment({
      fileId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(observedPathname).toBe(
      "/api/v1/files/attachments/550e8400-e29b-41d4-a716-446655440000",
    );
  });
});
