"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { GoogleCallbackRedirectQueryParamsDto } from "@/api/auth/auth.dto";
import { connectLocalAccount, googleLogin } from "@/api/auth/auth.api";
import {
  clearGoogleOAuthIntent,
  getGoogleOAuthIntent,
} from "@/api/auth/googleOAuthState";
import {
  getAccessToken,
  getRefreshToken,
} from "@/api/client/tokenStorage";
import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { colors, spacing, typography } from "@/styles/tokens";

function hasStoredToken() {
  return Boolean(getAccessToken() || getRefreshToken());
}

type GoogleCallbackPageProps = {
  searchParams: GoogleCallbackRedirectQueryParamsDto;
};

export default function GoogleCallbackPage({ searchParams }: GoogleCallbackPageProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("구글 로그인 정보를 확인하고 있습니다.");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const { tempToken, errorCode } = searchParams;
    const signupRequired = searchParams.signupRequired === "true";

    async function handleCallback() {
      if (errorCode) {
        setHasError(true);
        setStatusMessage("구글 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
        clearGoogleOAuthIntent();
        return;
      }

      if (!tempToken) {
        setHasError(true);
        setStatusMessage("구글 로그인 정보를 확인할 수 없습니다.");
        clearGoogleOAuthIntent();
        return;
      }

      if (signupRequired) {
        router.replace(`/auth/google/signup?tempToken=${encodeURIComponent(tempToken)}`);
        return;
      }

      try {
        const intent = getGoogleOAuthIntent();

        if (intent === "connect" && hasStoredToken()) {
          await connectLocalAccount({ tempToken });
          setStatusMessage("구글 계정 연동이 완료되었습니다. 마이페이지로 이동합니다.");
          clearGoogleOAuthIntent();
          router.replace("/mypage");
          return;
        }

        await googleLogin({ tempToken });
        setStatusMessage("구글 로그인되었습니다. 잠시 후 메인으로 이동합니다.");
        clearGoogleOAuthIntent();
        router.replace("/");
      } catch {
        setHasError(true);
        setStatusMessage("구글 로그인 처리에 실패했습니다. 다시 시도해 주세요.");
        clearGoogleOAuthIntent();
      }
    }

    void handleCallback();
  }, [router, searchParams]);

  return (
    <AuthShell switchText="일반 로그인으로 돌아가시겠어요?" switchLabel="로그인" switchHref="/login">
      <ContentSection aria-live="polite">
        {hasError ? null : <LoadingSpinner label="구글 로그인 처리 중" />}
        <StatusText $tone={hasError ? "error" : "default"}>{statusMessage}</StatusText>
      </ContentSection>
    </AuthShell>
  );
}

const ContentSection = styled.section`
  min-height: 12rem;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: ${spacing.space16};
`;

const StatusText = styled.p<{ $tone: "default" | "error" }>`
  margin: 0;
  color: ${({ $tone }) => ($tone === "error" ? colors.notice : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
  text-align: center;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;
