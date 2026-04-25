import { HttpResponse, http, type RequestHandler } from "msw";

import type {
  CreateChannelRequestDto,
  UpdateChannelRequestDto,
} from "../../api/channel/channel.dto";
import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const CHANNEL_RESPONSE = {
  id: 1,
  name: "Notice",
  slug: "notice",
  description: "General notices",
  channelType: "ALL",
  classroomId: null,
  departmentId: null,
  customRefId: null,
  writerPolicy: "ADMIN_MANAGER_ONLY",
  isDefault: true,
  isActive: true,
  lastPostedAt: "2026-04-10T19:30:00",
};

export const CHANNEL_LIST_RESPONSE = [CHANNEL_RESPONSE];

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

    return HttpResponse.json(CHANNEL_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/channels`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateChannelRequestDto;

    if (!body.name || !body.slug || !body.channelType) {
      return HttpResponse.json({ message: "Invalid channel payload" }, { status: 400 });
    }

    return HttpResponse.json({
      ...CHANNEL_RESPONSE,
      id: 2,
      name: body.name,
      slug: body.slug,
      description: body.description,
      channelType: body.channelType,
      classroomId: body.classroomId ?? null,
      departmentId: body.departmentId ?? null,
      customRefId: body.customRefId ?? null,
      writerPolicy: body.writerPolicy,
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
  http.patch(`${API_BASE_URL}/api/v1/channels/:id/show`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      ...CHANNEL_RESPONSE,
      id: Number(params.id),
      isActive: true,
    });
  }),
  http.patch(`${API_BASE_URL}/api/v1/channels/:id/hide`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      ...CHANNEL_RESPONSE,
      id: Number(params.id),
      isActive: false,
    });
  }),
];
