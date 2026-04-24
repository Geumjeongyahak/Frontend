import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const FILE_UPLOAD_RESPONSE = {
  fileId: "550e8400-e29b-41d4-a716-446655440000",
  originalName: "receipt.png",
  contentType: "image/png",
  fileSize: 102400,
  ext: "png",
  url: "https://storage.googleapis.com/example-bucket/purchase-items/receipt.png",
};

export const ATTACHMENT_DOWNLOAD_URL_RESPONSE = {
  downloadUrl:
    "https://storage.googleapis.com/example-bucket/documents/attachments/example.pdf",
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");

  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

function unauthorizedWhenNeeded(request: Request) {
  if (!hasValidAuthorization(request)) {
    return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export const fileHandlers: RequestHandler[] = [
  http.post(`${API_BASE_URL}/api/v1/files/images/purchase-items`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(FILE_UPLOAD_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/files/images/profile`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(FILE_UPLOAD_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/files/images/posts`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(FILE_UPLOAD_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/files/attachments`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(FILE_UPLOAD_RESPONSE);
  }),
  http.get(`${API_BASE_URL}/api/v1/files/attachments/:fileId/download-url`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(ATTACHMENT_DOWNLOAD_URL_RESPONSE);
  }),
  http.delete(`${API_BASE_URL}/api/v1/files/attachments/:fileId`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 200 });
  }),
];
