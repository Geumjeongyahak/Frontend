import authClient from "../client/authClient";
import publicClient from "../client/publicClient";
import { clearTokens, setTokens } from "../client/tokenStorage";
import type {
  AuthMessageResponseDto,
  AdminLoginRequestDto,
  EmailVerificationConfirmRequestDto,
  EmailVerificationResendRequestDto,
  GoogleLoginRequestDto,
  GoogleSignupRequestDto,
  LoginRequestDto,
  LogoutRequestDto,
  RefreshTokenRequestDto,
  SignupRequestDto,
  TokenResponseDto,
} from "./auth.dto";

// 회원가입 — 이메일 인증 필요, 토큰 미발급
export async function signup(body: SignupRequestDto) {
  const response = await publicClient.post<AuthMessageResponseDto>("/api/v1/auth/signup", body);
  return response.data;
}

// 이메일 인증 코드 확인
export async function confirmEmailVerification(body: EmailVerificationConfirmRequestDto) {
  const response = await publicClient.post<AuthMessageResponseDto>(
    "/api/v1/auth/email-verification/confirm",
    body,
  );
  return response.data;
}

// 이메일 인증 코드 재발송
export async function resendEmailVerification(body: EmailVerificationResendRequestDto) {
  const response = await publicClient.post<AuthMessageResponseDto>(
    "/api/v1/auth/email-verification/resend",
    body,
  );
  return response.data;
}

// 로그인 후 토큰을 발급받는 요청
export async function login(body: LoginRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/login", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

// 관리자 로그인 후 토큰을 발급받는 요청
export async function adminLogin(body: AdminLoginRequestDto) {
  const response = await publicClient.post<TokenResponseDto>(
    "/api/v1/auth/admin/login",
    body,
  );
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

export async function logoutAllDevices() {
  const response = await authClient.post<AuthMessageResponseDto>("/api/v1/auth/logout-all");
  clearTokens();
  return response.data;
}

export async function googleSignup(body: GoogleSignupRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/google/signup", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function googleLogin(body: GoogleLoginRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/google/login", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function connectLocalAccount(body: GoogleLoginRequestDto) {
  const response = await authClient.post<TokenResponseDto>("/api/v1/auth/google/connect", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

// 비로그인 상태에서 Google 계정과 기존 Local 계정 연결 (콜백 signupRequired+connectedToLocal 흐름)
export async function connectGoogleToLocalAccount(body: GoogleLoginRequestDto) {
  const response = await publicClient.post<TokenResponseDto>("/api/v1/auth/google/connect", body);
  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
}
