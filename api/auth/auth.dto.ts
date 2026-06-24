export interface SignupRequestDto {
  password: string;
  name: string;
  email: string;
  phoneNumber?: string;
  birthDate: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

export interface AuthMessageResponseDto {
  message?: string;
}

export interface GoogleSignupRequestDto {
  tempToken: string;
  name: string;
  phoneNumber?: string;
  birthDate: string;
}

export interface GoogleLoginRequestDto {
  tempToken: string;
}

export interface GoogleCallbackRedirectQueryParamsDto {
  tempToken?: string;
  signupRequired?: string;
  errorCode?: string;
}

export type AdminLoginRequestDto = LoginRequestDto;
