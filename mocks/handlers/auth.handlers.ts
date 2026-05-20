import { HttpResponse, http } from "msw";

import type {
  LoginRequestDto,
  LogoutRequestDto,
  RefreshTokenRequestDto,
  SignupRequestDto,
  TokenResponseDto,
} from "../../api/auth/auth.dto";

export const API_BASE_URL = "http://localhost:8080";

/** MSW 로그인 성공에 사용하는 이메일(백엔드 login API는 `email` 필드 기준) */
export const VALID_LOGIN_EMAIL = "valid-user@example.com";
export const VALID_PASSWORD = "correct-password";
export const VALID_ACCESS_TOKEN = "valid-access-token";
export const EXPIRED_ACCESS_TOKEN = "expired-access-token";
export const REFRESHED_ACCESS_TOKEN = "refreshed-access-token";
export const VALID_REFRESH_TOKEN = "valid-refresh-token";
export const REFRESHED_REFRESH_TOKEN = "refreshed-refresh-token";
export const INVALID_REFRESH_TOKEN = "invalid-refresh-token";

export const DEFAULT_LOGIN_REQUEST: LoginRequestDto = {
  email: VALID_LOGIN_EMAIL,
  password: VALID_PASSWORD,
};

export const DEFAULT_SIGNUP_REQUEST: SignupRequestDto = {
  password: "signup-password",
  name: "New User",
  email: "new-user@example.com",
  phoneNumber: "010-0000-0000",
};

export const DEFAULT_TOKEN_RESPONSE: TokenResponseDto = {
  accessToken: VALID_ACCESS_TOKEN,
  refreshToken: VALID_REFRESH_TOKEN,
  tokenType: "Bearer",
};

function createUnauthorizedResponse(message: string) {
  return HttpResponse.json({ message }, { status: 401 });
}

export const authHandlers = [
  http.post(`${API_BASE_URL}/api/v1/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginRequestDto;

    if (body.email !== VALID_LOGIN_EMAIL || body.password !== VALID_PASSWORD) {
      return createUnauthorizedResponse("Invalid credentials");
    }

    return HttpResponse.json(DEFAULT_TOKEN_RESPONSE);
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as SignupRequestDto;

    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json({ message: "Invalid signup payload" }, { status: 400 });
    }

    return HttpResponse.json(DEFAULT_TOKEN_RESPONSE, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as RefreshTokenRequestDto;

    if (body.refreshToken !== VALID_REFRESH_TOKEN) {
      return createUnauthorizedResponse("Invalid refresh token");
    }

    return HttpResponse.json({
      accessToken: REFRESHED_ACCESS_TOKEN,
      refreshToken: REFRESHED_REFRESH_TOKEN,
      tokenType: "Bearer",
    } satisfies TokenResponseDto);
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/logout`, async ({ request }) => {
    const authorizationHeader = request.headers.get("authorization");
    const body = (await request.json()) as LogoutRequestDto;

    if (
      authorizationHeader !== `Bearer ${VALID_ACCESS_TOKEN}` &&
      authorizationHeader !== `Bearer ${REFRESHED_ACCESS_TOKEN}`
    ) {
      return createUnauthorizedResponse("Unauthorized");
    }

    if (
      body.refreshToken !== VALID_REFRESH_TOKEN &&
      body.refreshToken !== REFRESHED_REFRESH_TOKEN
    ) {
      return createUnauthorizedResponse("Invalid refresh token");
    }

    return HttpResponse.json({ message: "Logged out" });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/logout-all`, ({ request }) => {
    const authorizationHeader = request.headers.get("authorization");

    if (
      authorizationHeader !== `Bearer ${VALID_ACCESS_TOKEN}` &&
      authorizationHeader !== `Bearer ${REFRESHED_ACCESS_TOKEN}`
    ) {
      return createUnauthorizedResponse("Unauthorized");
    }

    return HttpResponse.json({ message: "Logged out from all devices" });
  }),
];
