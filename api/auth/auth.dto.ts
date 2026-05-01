export interface SignupRequestDto {
  username: string;
  password: string;
  name: string;
  email?: string;
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
