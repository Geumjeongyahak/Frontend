"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { confirmEmailVerification, resendEmailVerification } from "@/api/auth/auth.api";
import {
  Field,
  FieldGroup,
  Form,
  Input,
  Label,
  Status,
  SubmitButton,
} from "@/components/auth/AuthFormParts";
import AuthShell from "@/components/auth/AuthShell";
import { colors, spacing, typography } from "@/styles/tokens";

const RESEND_COOLDOWN_SECONDS = 60;

type EmailVerificationFormProps = {
  email: string;
};

export default function EmailVerificationForm({ email }: EmailVerificationFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"default" | "error">("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const canSubmit = code.length === 6 && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await confirmEmailVerification({ email, verificationCode: code });
      setStatusTone("default");
      setStatusMessage("이메일 인증이 완료되었습니다. 로그인해 주세요.");
      router.replace("/login");
    } catch {
      setStatusTone("error");
      setStatusMessage("인증 코드가 올바르지 않습니다. 다시 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;

    try {
      await resendEmailVerification({ email });
      setStatusTone("default");
      setStatusMessage("인증 메일을 다시 발송했습니다.");
      startCooldown();
    } catch {
      setStatusTone("error");
      setStatusMessage("재발송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <AuthShell switchText="다른 계정으로 가입하시겠어요?" switchLabel="회원가입" switchHref="/register">
      <Form onSubmit={handleSubmit} aria-label="이메일 인증 폼">
        <Description>
          <strong>{email}</strong>으로 발송된 6자리 인증번호를 입력해 주세요.
        </Description>

        <FieldGroup>
          <Field>
            <Label htmlFor="email-verification-code">인증번호</Label>
            <Input
              id="email-verification-code"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6자리 숫자 입력"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </Field>
        </FieldGroup>

        <Status
          role="status"
          aria-live="polite"
          $tone={statusTone}
          $visible={Boolean(statusMessage)}
        >
          {statusMessage || " "}
        </Status>

        <SubmitButton type="submit" disabled={!canSubmit}>
          {isSubmitting ? "확인 중" : "인증 완료"}
        </SubmitButton>

        <ResendRow>
          <ResendText>메일을 받지 못하셨나요?</ResendText>
          <ResendButton type="button" onClick={handleResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `재발송 (${cooldown}초)` : "인증 메일 재발송"}
          </ResendButton>
        </ResendRow>
      </Form>
    </AuthShell>
  );
}

const Description = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;

  strong {
    color: ${colors.point};
    font-weight: 700;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ResendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
`;

const ResendText = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const ResendButton = styled.button`
  border: 0;
  background: none;
  color: ${colors.point};
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    color: ${colors.muted};
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;
