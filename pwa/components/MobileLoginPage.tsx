"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { login } from "@/api/auth/auth.api";
import { setGoogleOAuthIntent } from "@/api/auth/googleOAuthState";
import { baseURL } from "@/api/client/publicClient";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type LoginFormState = {
  email: string;
  password: string;
};

const initialState: LoginFormState = {
  email: "",
  password: "",
};

export default function MobileLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = form.email.trim().length > 0 && form.password.length > 0;
  const passwordResetHref = form.email.trim()
    ? `/auth/password-reset?email=${encodeURIComponent(form.email.trim())}`
    : "/auth/password-reset";

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
      router.replace("/", { scroll: true });
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
    <Page>
      <Header>
        <Eyebrow>금정열린배움터</Eyebrow>
        <Title>어서오세요, 여기는 &quot;금정열린배움터&quot;입니다.</Title>
      </Header>

      <Panel>
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="mobile-login-email">이메일</Label>
            <Input
              id="mobile-login-email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </Field>

          <Field>
            <Label htmlFor="mobile-login-password">비밀번호</Label>
            <Input
              id="mobile-login-password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </Field>

          <PasswordHelpLink href={passwordResetHref}>비밀번호를 잊으셨나요?</PasswordHelpLink>

          <Status role="status" aria-live="polite" $visible={Boolean(statusMessage)}>
            {statusMessage}
          </Status>

          <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "로그인 중" : "로그인"}
          </SubmitButton>

          <GoogleLoginButton
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            size="compact"
          >
            Google로 계속하기
          </GoogleLoginButton>
        </Form>
      </Panel>

      <Footer>
        <FooterText>아직 계정이 없나요?</FooterText>
        <FooterLink href="/register">회원가입</FooterLink>
      </Footer>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  padding: 4.5rem 1.5625rem 2.5rem;
  background:
    radial-gradient(circle at top right, rgba(136, 205, 90, 0.22), transparent 34%),
    linear-gradient(180deg, #f7faf4 0%, #f3f3f3 42%, #f3f3f3 100%);
`;

const Header = styled.header`
  display: grid;
  gap: ${spacing.space12};
  margin-bottom: 1rem;
`;

const Eyebrow = styled.p`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.25;
  word-break: keep-all;
`;

const Panel = styled.section`
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const Form = styled.form`
  display: grid;
  gap: ${spacing.space16};
`;

const Field = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const Label = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const Input = styled.input`
  width: 100%;
  min-height: 3.25rem;
  padding: 0 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const PasswordHelpLink = styled(Link)`
  justify-self: flex-end;
  margin-top: -${spacing.space8};
  color: #5b6a55;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: ${colors.point};
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }

  &:focus-visible {
    border-radius: 0.25rem;
    outline: 2px solid rgba(136, 205, 90, 0.32);
    outline-offset: 2px;
  }
`;

const Status = styled.p<{ $visible: boolean }>`
  min-height: 1.125rem;
  color: ${colors.notice};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;

const SubmitButton = styled.button`
  width: 100%;
  min-height: 3.25rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  margin-top: ${spacing.space24};
`;

const FooterText = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
`;

const FooterLink = styled(Link)`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  text-decoration: none;
`;
