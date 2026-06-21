"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/api/auth/auth.api";
import { setGoogleOAuthIntent } from "@/api/auth/googleOAuthState";
import { baseURL } from "@/api/client/publicClient";
import {
  Field,
  FieldGroup,
  Form,
  Input,
  Label,
  Status,
  SubmitButton,
} from "@/components/auth/AuthFormParts";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import AuthShell from "@/components/auth/AuthShell";

type LoginFormState = {
  email: string;
  password: string;
};

const initialState: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = form.email.trim().length > 0 && form.password.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await login({
        email: form.email.trim(),
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

  function handleGoogleLogin() {
    setGoogleOAuthIntent("login");
    window.location.assign(`${baseURL}/api/v1/auth/google`);
  }

  return (
    <AuthShell switchText="아직 계정이 없나요?" switchLabel="회원가입" switchHref="/register">
      <Form onSubmit={handleSubmit} aria-label="로그인 폼">
        <FieldGroup>
          <Field>
            <Label htmlFor="login-email">이메일</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
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

        <GoogleLoginButton type="button" onClick={handleGoogleLogin} disabled={isSubmitting} />
      </Form>
    </AuthShell>
  );
}
