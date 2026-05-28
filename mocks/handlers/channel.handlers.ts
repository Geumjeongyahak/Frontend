import { HttpResponse, http, type RequestHandler } from "msw";

import type {
  CreateChannelRequestDto,
  UpdateChannelRequestDto,
} from "../../api/channel/channel.dto";
import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const CHANNEL_RESPONSE = {
  id: 1,
  name: "Notice",
  description: "General notices",
  channelType: "NOTICE",
  bindingType: "STANDALONE",
  refId: null,
  accessLevel: "READ_ONLY",
  allowGuestRead: false,
  isDefault: true,
  isActive: true,
  lastPostedAt: "2026-04-10T19:30:00",
};

export const CHANNEL_LIST_RESPONSE = [CHANNEL_RESPONSE];
export const EVENT_CHANNEL_RESPONSE = {
  ...CHANNEL_RESPONSE,
  id: 4,
  name: "행사 정보",
  description: "행사 정보 기본 채널",
  channelType: "EVENT",
  bindingType: "STANDALONE",
  refId: null,
  accessLevel: "READ_WRITE",
  allowGuestRead: true,
  isDefault: true,
  isActive: true,
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const channelHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/channels`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const channelType = url.searchParams.get("channelType");

    if (channelType === "EVENT") {
      return HttpResponse.json([EVENT_CHANNEL_RESPONSE]);
    }

    return HttpResponse.json([...CHANNEL_LIST_RESPONSE, EVENT_CHANNEL_RESPONSE]);
  }),
  http.post(`${API_BASE_URL}/api/v1/channels`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateChannelRequestDto;

    if (!body.name || !body.accessLevel) {
      return HttpResponse.json({ message: "Invalid channel payload" }, { status: 400 });
    }

    return HttpResponse.json({
      ...CHANNEL_RESPONSE,
      id: 2,
      name: body.name,
      description: body.description,
      accessLevel: body.accessLevel,
      allowGuestRead: body.allowGuestRead,
      isDefault: body.isDefault,
      isActive: body.isActive,
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/channels/:id`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      ...CHANNEL_RESPONSE,
      id: Number(params.id),
    });
  }),
  http.put(`${API_BASE_URL}/api/v1/channels/:id`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateChannelRequestDto;

    return HttpResponse.json({
      ...CHANNEL_RESPONSE,
      ...body,
      id: Number(params.id),
    });
  }),
  http.delete(`${API_BASE_URL}/api/v1/channels/:id`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
