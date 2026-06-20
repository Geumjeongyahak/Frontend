import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  createClassInfo,
  createDepartmentInfo,
  getClassInfos,
  getDepartmentInfos,
  getHistories,
  updateHistory,
} from "./siteContent.api";

describe("siteContent.api", () => {
  it("returns public site content sections", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/site-contents/history`, () => {
        return HttpResponse.json({ history: [{ id: 1, title: "개교", historyDate: "2026-06-21" }] });
      }),
      http.get(`${API_BASE_URL}/api/v1/site-contents/departments`, () => {
        return HttpResponse.json({
          principal: { id: 1, title: "교장", name: "홍길동" },
          departments: [],
        });
      }),
      http.get(`${API_BASE_URL}/api/v1/site-contents/classes`, () => {
        return HttpResponse.json({
          weekday: [{ id: 1, name: "주중반", description: ["설명"] }],
          weekendMorning: [],
          weekendAfternoon: [],
        });
      }),
    );

    await expect(getHistories()).resolves.toMatchObject({ history: [{ id: 1 }] });
    await expect(getDepartmentInfos()).resolves.toMatchObject({
      principal: { title: "교장" },
    });
    await expect(getClassInfos()).resolves.toMatchObject({ weekday: [{ id: 1 }] });
  });

  it("creates and updates site content with the expected body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedDepartmentBody: unknown;
    let observedClassBody: unknown;
    let observedHistoryBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/site-contents/departments`, async ({ request }) => {
        observedDepartmentBody = await request.json();
        return HttpResponse.json({ id: 2, title: "교무부", name: "김교사" });
      }),
      http.post(`${API_BASE_URL}/api/v1/site-contents/classes`, async ({ request }) => {
        observedClassBody = await request.json();
        return HttpResponse.json({ id: 3, name: "주말반", description: ["오전"] });
      }),
      http.put(`${API_BASE_URL}/api/v1/site-contents/history/1`, async ({ request }) => {
        observedHistoryBody = await request.json();
        return HttpResponse.json({ id: 1, title: "2026.06.21", historyDate: "2026-06-21" });
      }),
    );

    await createDepartmentInfo({
      title: "교무부",
      name: "김교사",
      responsibilities: ["학사"],
    });
    await createClassInfo({
      name: "주말반",
      groupId: "weekendMorning",
      description: ["오전"],
    });
    await updateHistory({ historyId: 1 }, { title: "2026.06.21", historyDate: "2026-06-21" });

    expect(observedDepartmentBody).toEqual({
      title: "교무부",
      name: "김교사",
      responsibilities: ["학사"],
    });
    expect(observedClassBody).toEqual({
      name: "주말반",
      groupId: "weekendMorning",
      description: ["오전"],
    });
    expect(observedHistoryBody).toEqual({ title: "2026.06.21", historyDate: "2026-06-21" });
  });
});
