import authClient from "../client/authClient";
import publicClient from "../client/publicClient";
import { clearTokens, setTokens } from "../client/tokenStorage";
import type {
  AuthMessageResponseDto,
  LoginRequestDto,
  LogoutRequestDto,
  RefreshTokenRequestDto,
  SignupRequestDto,
  TokenResponseDto,
} from "./auth.dto";

// 회원가입 후 토큰을 발급받는 요청
export async function signup(body: SignupRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/signup", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

// 로그인 후 토큰을 발급받는 요청
export async function login(body: LoginRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/login", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

// Refresh Token으로 액세스 토큰을 재발급받는 요청
export async function refreshToken(body: RefreshTokenRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/refresh", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

// 현재 인증 상태를 종료하고 저장된 토큰을 정리하는 요청
export async function logout(body: LogoutRequestDto) {
  const response = await authClient.post<AuthMessageResponseDto>("/api/v1/auth/logout", body);
  clearTokens();
  return response.data;
}
