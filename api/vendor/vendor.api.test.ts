import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { chargeVendor, createVendor, getVendorHistories, getVendors } from "./vendor.api";

describe("vendor.api", () => {
  it("returns vendors with keyword query and authorization header", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/admin/vendors`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json([{ id: 1, name: "금정문구", balance: 10000 }]);
      }),
    );

    const response = await getVendors({ keyword: "문구" });

    expect(response).toEqual([expect.objectContaining({ id: 1, name: "금정문구" })]);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("keyword=");
  });

  it("creates a vendor and charges its balance with expected bodies", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedChargeBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/admin/vendors`, async ({ request }) => {
        observedCreateBody = await request.json();
        return HttpResponse.json({ id: 2, name: "금정문구", balance: 0 });
      }),
      http.post(`${API_BASE_URL}/api/v1/admin/vendors/2/charges`, async ({ request }) => {
        observedChargeBody = await request.json();
        return HttpResponse.json({ id: 2, name: "금정문구", balance: 50000 });
      }),
    );

    await createVendor({ name: "금정문구", description: "문구류" });
    await chargeVendor({ vendorId: 2 }, { amount: 50000, memo: "충전" });

    expect(observedCreateBody).toEqual({ name: "금정문구", description: "문구류" });
    expect(observedChargeBody).toEqual({ amount: 50000, memo: "충전" });
  });

  it("returns vendor balance histories", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/admin/vendors/2/histories`, () => {
        return HttpResponse.json([{ id: 1, type: "CHARGE", amount: 50000 }]);
      }),
    );

    await expect(getVendorHistories({ vendorId: 2 })).resolves.toEqual([
      expect.objectContaining({ type: "CHARGE", amount: 50000 }),
    ]);
  });
});
