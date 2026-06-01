import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const VENDOR_LIST_RESPONSE = [
  { id: 1, name: "예소디자인", description: "디자인", balance: 120000, isActive: true },
  { id: 2, name: "목민서관", description: "도서", balance: 85000, isActive: true },
  { id: 3, name: "지성문구", description: "문구", balance: 43000, isActive: true },
];

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const vendorHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/admin/vendors`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(VENDOR_LIST_RESPONSE);
  }),
];
