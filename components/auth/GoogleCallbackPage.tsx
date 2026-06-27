"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { GoogleCallbackRedirectQueryParamsDto } from "@/api/auth/auth.dto";
import {
  connectGoogleToLocalAccount,
  connectLocalAccount,
  googleLogin,
} from "@/api/auth/auth.api";
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
  const [pendingConnect, setPendingConnect] = useState<{ tempToken: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const { tempToken, error, errorCode } = searchParams;
    const signupRequired = searchParams.signupRequired === "true";
    const connectedToLocal = searchParams.connectedToLocal === "true";

    async function handleCallback() {
      if (error === "oauth_failed" || errorCode) {
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

      if (signupRequired && connectedToLocal) {
        // 같은 이메일의 Local 계정 존재 → 계정 연결 확인 UI
        setStatusMessage("이미 가입된 계정이 있습니다. 구글 계정을 연결하시겠어요?");
        setPendingConnect({ tempToken });
        return;
      }

      if (signupRequired) {
        // 신규 Google 회원가입 — name/email/profileImageUrl prefill
        const params = new URLSearchParams({ tempToken });
        if (searchParams.name) params.set("name", searchParams.name);
        if (searchParams.email) params.set("email", searchParams.email);
        if (searchParams.profileImageUrl) params.set("profileImageUrl", searchParams.profileImageUrl);
        router.replace(`/auth/google/signup?${params.toString()}`);
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

  async function handleConfirmConnect() {
    if (!pendingConnect || isConnecting) return;

    setIsConnecting(true);
    try {
      await connectGoogleToLocalAccount({ tempToken: pendingConnect.tempToken });
      clearGoogleOAuthIntent();
      setStatusMessage("계정 연결이 완료되었습니다. 잠시 후 메인으로 이동합니다.");
      setPendingConnect(null);
      router.replace("/");
    } catch {
      setHasError(true);
      setStatusMessage("계정 연결에 실패했습니다. 다시 시도해 주세요.");
      setPendingConnect(null);
      clearGoogleOAuthIntent();
    } finally {
      setIsConnecting(false);
    }
  }

  function handleCancelConnect() {
    clearGoogleOAuthIntent();
    setPendingConnect(null);
    router.replace("/login");
  }

  return (
    <AuthShell switchText="일반 로그인으로 돌아가시겠어요?" switchLabel="로그인" switchHref="/login">
      <ContentSection aria-live="polite">
        {!hasError && !pendingConnect && <LoadingSpinner label="구글 로그인 처리 중" />}
        <StatusText $tone={hasError ? "error" : "default"}>{statusMessage}</StatusText>

        {pendingConnect && !hasError && (
          <ButtonRow>
            <ConnectButton onClick={handleConfirmConnect} disabled={isConnecting}>
              {isConnecting ? "연결 중" : "연결하기"}
            </ConnectButton>
            <CancelButton onClick={handleCancelConnect} disabled={isConnecting}>
              취소
            </CancelButton>
          </ButtonRow>
        )}
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

const ButtonRow = styled.div`
  display: flex;
  gap: ${spacing.space12};
`;

const ConnectButton = styled.button`
  min-height: 2.5rem;
  padding: 0 ${spacing.space20};
  border: 0;
  border-radius: 0.375rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }
`;

const CancelButton = styled(ConnectButton)`
  background-color: transparent;
  border: 1px solid ${colors.border};
  color: ${colors.text};
`;
