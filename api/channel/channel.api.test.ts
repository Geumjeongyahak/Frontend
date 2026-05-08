import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { CHANNEL_LIST_RESPONSE, CHANNEL_RESPONSE } from "../../mocks/handlers/channel.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createChannel, getChannel, getChannels, updateChannel } from "./channel.api";

describe("channel.api", () => {
  it("returns channels with authorization header and query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/channels`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(CHANNEL_LIST_RESPONSE);
      }),
    );

    const response = await getChannels({ channelType: "NOTICE", isActive: true });

    expect(response).toEqual(CHANNEL_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("channelType=NOTICE");
    expect(observedQueryString).toContain("isActive=true");
  });

  it("creates a channel with the expected request body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/channels`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ ...CHANNEL_RESPONSE, id: 2, name: "Board" });
      }),
    );

    const body = {
      name: "Board",
      accessLevel: "READ_WRITE",
    };

    const response = await createChannel(body);

    expect(response).toEqual({ ...CHANNEL_RESPONSE, id: 2, name: "Board" });
    expect(observedBody).toEqual(body);
  });

  it("uses detail and update endpoints", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    await expect(getChannel({ id: 1 })).resolves.toMatchObject({ id: 1 });
    await expect(updateChannel({ id: 1 }, { isActive: false })).resolves.toMatchObject({
      id: 1,
      isActive: false,
    });
  });
});
