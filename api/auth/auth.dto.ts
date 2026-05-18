export interface SignupRequestDto {
  password: string;
  nickname: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  phoneNumber?: string;
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

export interface GoogleCallbackQueryParamsDto {
  code: string;
}

export interface GoogleSignupRequestDto {
  tempToken: string;
  nickname: string;
  name: string;
  phoneNumber?: string;
}

export interface GoogleLoginRequestDto {
  tempToken: string;
}
