"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconMailCheck } from "@tabler/icons-react";
import { requestPasswordReset } from "@/api/auth/auth.api";
import {
  Field,
  FieldGroup,
  Input,
  Label,
} from "@/components/auth/AuthFormParts";
import AuthActionCard, {
  ActionButton,
  ActionForm,
  InlineActionButton,
  type ActionTone,
} from "@/components/auth/AuthActionCard";

type PasswordResetRequestFormProps = {
  initialEmail: string;
};

export default function PasswordResetRequestForm({
  initialEmail,
}: PasswordResetRequestFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<ActionTone>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedEmail = email.trim();
  const canSubmit = trimmedEmail.length > 0 && !isSubmitting;
  const isSuccess = statusTone === "success";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatusTone("default");
    setStatusMessage("");

    try {
      await requestPasswordReset({ email: trimmedEmail });
      setStatusTone("success");
      setStatusMessage("비밀번호 변경 링크를 보냈습니다. 메일함에서 링크를 열어 주세요.");
    } catch {
      setStatusTone("error");
      setStatusMessage("메일 발송에 실패했습니다. 이메일을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthActionCard
      icon={
        statusTone === "error" ? (
          <IconAlertTriangle aria-hidden="true" />
        ) : (
          <IconMailCheck aria-hidden="true" />
        )
      }
      eyebrow="비밀번호 변경"
      title={isSuccess ? "메일을 보냈습니다" : "비밀번호 변경 링크 받기"}
      description={
        isSuccess
          ? "메일의 비밀번호 변경하기 버튼을 누르면 새 비밀번호를 설정할 수 있습니다."
          : "가입한 이메일 주소를 입력하면 비밀번호 변경 링크를 보내드립니다."
      }
      status={statusMessage}
      statusTone={statusTone}
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
      <ActionForm onSubmit={handleSubmit} aria-label="비밀번호 변경 링크 요청 폼">
        <FieldGroup>
          <Field>
            <Label htmlFor="password-reset-email">이메일</Label>
            <Input
              id="password-reset-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </Field>
        </FieldGroup>

        <ActionButton type="submit" disabled={!canSubmit}>
          {isSubmitting ? "발송 중" : isSuccess ? "다시 보내기" : "변경 링크 보내기"}
        </ActionButton>
      </ActionForm>
    </AuthActionCard>
  );
}
