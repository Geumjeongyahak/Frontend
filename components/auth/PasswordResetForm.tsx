"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconLockCheck } from "@tabler/icons-react";
import styled from "styled-components";
import { confirmPasswordReset } from "@/api/auth/auth.api";
import {
  Field,
  FieldGroup,
  Input,
  Label,
  Status,
} from "@/components/auth/AuthFormParts";
import AuthActionCard, {
  AccountPill,
  ActionButton,
  ActionForm,
  InlineActionButton,
  type ActionTone,
} from "@/components/auth/AuthActionCard";
import { colors } from "@/styles/tokens";

type PasswordResetFormProps = {
  email: string;
  resetCode: string;
};

type PasswordResetFormState = {
  password: string;
  confirmPassword: string;
};

const initialState: PasswordResetFormState = {
  password: "",
  confirmPassword: "",
};

export default function PasswordResetForm({ email, resetCode }: PasswordResetFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<ActionTone>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordMatchState =
    form.confirmPassword.length === 0
      ? "idle"
      : form.password === form.confirmPassword
        ? "matched"
        : "mismatched";
  const isPasswordConfirmed =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const hasValidLink = Boolean(email && resetCode);
  const canSubmit = hasValidLink && form.password.length >= 8 && isPasswordConfirmed;
  const visibleStatus =
    statusMessage ||
    (!hasValidLink
      ? "메일의 비밀번호 변경 링크를 다시 확인해 주세요."
      : form.confirmPassword.length > 0 && !isPasswordConfirmed
        ? "비밀번호와 비밀번호 확인이 일치하지 않습니다."
        : " ");
  const effectiveTone = passwordMatchState === "mismatched" ? "error" : statusTone;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      if (form.confirmPassword.length > 0 && !isPasswordConfirmed) {
        setStatusTone("error");
        setStatusMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      }
      return;
    }

    setIsSubmitting(true);
    setStatusTone("default");
    setStatusMessage("");

    try {
      await confirmPasswordReset({
        email,
        resetCode,
        newPassword: form.password,
      });
      setStatusTone("success");
      setStatusMessage("비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다.");
      setTimeout(() => router.replace("/login"), 900);
    } catch {
      setStatusTone("error");
      setStatusMessage("비밀번호 변경 링크가 만료되었거나 올바르지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthActionCard
      icon={
        effectiveTone === "error" ? (
          <IconAlertTriangle aria-hidden="true" />
        ) : (
          <IconLockCheck aria-hidden="true" />
        )
      }
      eyebrow="비밀번호 변경"
      title={hasValidLink ? "새 비밀번호를 설정해 주세요" : "변경 링크를 다시 확인해 주세요"}
      description={
        hasValidLink
          ? "메일 링크에서 계정을 확인했습니다. 새 비밀번호만 입력하면 됩니다."
          : "비밀번호 변경 링크가 올바르지 않습니다. 메일의 비밀번호 변경하기 버튼을 다시 열어 주세요."
      }
      status={visibleStatus}
      statusTone={effectiveTone}
      showProgress={isSubmitting}
      footer={
        <>
          비밀번호가 기억나셨나요?{" "}
          <InlineActionButton type="button" onClick={() => router.replace("/login")}>
            로그인
          </InlineActionButton>
        </>
      }
    >
      <ActionForm onSubmit={handleSubmit} aria-label="비밀번호 변경 폼">
        {hasValidLink ? <AccountPill>{email}</AccountPill> : null}

        <FieldGroup>
          <Field>
            <Label htmlFor="reset-password">새 비밀번호</Label>
            <PasswordInput
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="8자 이상 입력"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
              minLength={8}
              disabled={!hasValidLink || isSubmitting}
              $matchState={passwordMatchState}
            />
          </Field>

          <Field>
            <Label htmlFor="reset-confirm-password">새 비밀번호 확인</Label>
            <PasswordInput
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              required
              minLength={8}
              disabled={!hasValidLink || isSubmitting}
              $matchState={passwordMatchState}
            />
          </Field>
        </FieldGroup>

        <ResetStatus
          role="status"
          aria-live="polite"
          $tone={effectiveTone === "error" ? "error" : "default"}
          $matchState={passwordMatchState}
          $visible={Boolean(statusMessage) || !hasValidLink || form.confirmPassword.length > 0}
        >
          {visibleStatus}
        </ResetStatus>

        <ActionButton type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "변경 중" : "비밀번호 변경"}
        </ActionButton>
      </ActionForm>
    </AuthActionCard>
  );
}

const PasswordInput = styled(Input)<{ $matchState: "idle" | "matched" | "mismatched" }>`
  border-color: ${({ $matchState }) =>
    $matchState === "matched"
      ? colors.point
      : $matchState === "mismatched"
        ? "#e5a19b"
        : colors.border};
  background-color: ${({ $matchState }) =>
    $matchState === "matched"
      ? "#f4faef"
      : $matchState === "mismatched"
        ? "#fff6f5"
        : colors.white};

  &:focus {
    border-color: ${({ $matchState }) =>
      $matchState === "matched"
        ? colors.point
        : $matchState === "mismatched"
          ? "#de8c85"
          : colors.point};
    outline: 2px solid
      ${({ $matchState }) =>
        $matchState === "matched"
          ? colors.pointSoft
          : $matchState === "mismatched"
            ? "#f8d8d4"
            : colors.pointSoft};
  }
`;

const ResetStatus = styled(Status)<{
  $matchState: "idle" | "matched" | "mismatched";
}>`
  margin: 0;
  color: ${({ $tone, $matchState }) =>
    $matchState === "mismatched"
      ? "#d98882"
      : $tone === "error"
        ? colors.notice
        : "#52604c"};
`;
