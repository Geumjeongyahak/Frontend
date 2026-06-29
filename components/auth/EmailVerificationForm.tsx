"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconCircleCheck, IconMailCheck } from "@tabler/icons-react";
import { confirmEmailVerification, resendEmailVerification } from "@/api/auth/auth.api";
import AuthActionCard, {
  ActionButton,
  ActionForm,
  InlineActionButton,
  type ActionTone,
} from "@/components/auth/AuthActionCard";

const RESEND_COOLDOWN_SECONDS = 60;

type EmailVerificationFormProps = {
  email: string;
  verificationCode: string;
  resultStatus?: string;
};

export default function EmailVerificationForm({
  email,
  verificationCode,
  resultStatus = "",
}: EmailVerificationFormProps) {
  const router = useRouter();
  const isSuccessRedirect = resultStatus === "success";
  const isFailureRedirect = resultStatus === "invalid" || resultStatus === "expired";
  const hasVerificationLink = Boolean(email && verificationCode);
  const [statusMessage, setStatusMessage] = useState(
    isSuccessRedirect
      ? "이메일 인증이 완료되었습니다. 로그인해 주세요."
      : isFailureRedirect
        ? "인증 링크가 만료되었거나 올바르지 않습니다. 인증 메일을 다시 받아 주세요."
        : hasVerificationLink
          ? "이메일 인증을 확인하고 있습니다."
          : "메일의 인증하기 버튼을 눌러 인증을 완료해 주세요.",
  );
  const [statusTone, setStatusTone] = useState<ActionTone>(
    isSuccessRedirect ? "success" : isFailureRedirect ? "error" : "default",
  );
  const [isSubmitting, setIsSubmitting] = useState(hasVerificationLink && !resultStatus);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmittedRef = useRef(false);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    if (resultStatus || !email || !verificationCode || autoSubmittedRef.current) {
      return;
    }

    autoSubmittedRef.current = true;
    confirmEmailVerification({ email, verificationCode })
      .then(() => {
        setStatusTone("success");
        setStatusMessage("이메일 인증이 완료되었습니다. 로그인 화면으로 이동합니다.");
        setTimeout(() => router.replace("/login"), 900);
      })
      .catch(() => {
        setStatusTone("error");
        setStatusMessage("인증 링크가 만료되었거나 올바르지 않습니다. 인증 메일을 다시 받아 주세요.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [email, resultStatus, router, verificationCode]);

  async function handleResend() {
    if (!email || cooldown > 0) return;

    try {
      await resendEmailVerification({ email });
      setStatusTone("success");
      setStatusMessage("인증 메일을 다시 발송했습니다.");
      startCooldown();
    } catch {
      setStatusTone("error");
      setStatusMessage("재발송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  const isError = statusTone === "error";
  const showLoginAction = hasVerificationLink || isSuccessRedirect;
  const isComplete = statusTone === "success" && showLoginAction && !isSubmitting;
  const icon = isError ? (
    <IconAlertTriangle aria-hidden="true" />
  ) : isComplete ? (
    <IconCircleCheck aria-hidden="true" />
  ) : (
    <IconMailCheck aria-hidden="true" />
  );
  const title = isError
    ? "인증 링크를 다시 받아 주세요"
    : isSubmitting
      ? "이메일 인증을 확인하고 있어요"
      : showLoginAction
        ? "이메일 인증이 완료되었습니다"
        : "메일함을 확인해 주세요";
  const description = email ? (
    <>
      <strong>{email}</strong>으로 발송된 인증 링크로 회원가입을 완료합니다.
    </>
  ) : (
    "인증할 이메일 정보가 없습니다. 회원가입 후 받은 메일의 버튼을 다시 열어 주세요."
  );

  return (
    <AuthActionCard
      icon={icon}
      title={title}
      description={description}
      status={statusMessage}
      statusTone={statusTone}
      showProgress={isSubmitting}
      footer={
        <>
          메일을 받지 못하셨나요?{" "}
          <InlineActionButton type="button" onClick={handleResend} disabled={!email || cooldown > 0}>
            {cooldown > 0 ? `재발송 ${cooldown}초` : "인증 메일 재발송"}
          </InlineActionButton>
        </>
      }
    >
      {showLoginAction ? (
        <ActionForm as="div">
          <ActionButton type="button" onClick={() => router.replace("/login")} disabled={isSubmitting}>
            {isSubmitting ? "인증 확인 중" : "로그인으로 이동"}
          </ActionButton>
        </ActionForm>
      ) : null}
    </AuthActionCard>
  );
}
