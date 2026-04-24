"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/api/auth/auth.api";
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

type LoginFormState = {
  username: string;
  password: string;
};

const initialState: LoginFormState = {
  username: "",
  password: "",
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = form.username.trim().length > 0 && form.password.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await login({
        username: form.username.trim(),
        password: form.password,
      });
      setStatusMessage("로그인되었습니다. 잠시 후 메인으로 이동합니다.");
      router.replace("/");
    } catch {
      setStatusMessage("입력하신 정보를 다시 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      switchText="아직 계정이 없나요?"
      switchLabel="회원가입"
      switchHref="/register"
    >
      <Form onSubmit={handleSubmit} aria-label="로그인 폼">
        <FieldGroup>
          <Field>
            <Label htmlFor="login-username">아이디</Label>
            <Input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="아이디를 입력하세요"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
              required
            />
          </Field>

          <Field>
            <Label htmlFor="login-password">비밀번호</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </Field>
        </FieldGroup>

        <Status
          role="status"
          aria-live="polite"
          $tone={statusMessage.startsWith("입력") ? "error" : "default"}
          $visible={Boolean(statusMessage)}
        >
          {statusMessage}
        </Status>

        <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "로그인 중" : "로그인"}
        </SubmitButton>
      </Form>
    </AuthShell>
  );
}
