"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import { login } from "@/api/auth/auth.api";
import { Input as AuthInput } from "@/components/auth/AuthFormParts";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import HomeCard from "@/components/home/HomeCard";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type LoginFormState = {
  email: string;
  password: string;
};

const initialLoginForm: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginCard() {
  const router = useRouter();
  const { status, user, signOut } = useAuthSession();
  const [form, setForm] = useState(initialLoginForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayName = user?.name ?? "회원";
  const canSubmit = form.email.trim().length > 0 && form.password.length > 0;

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });
      setForm(initialLoginForm);
    } catch {
      setErrorMessage("입력하신 정보를 다시 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <Card title="로그인">
        <PendingContent aria-label="로그인 상태 확인 중" aria-live="polite">
          <LoadingSpinner label="로그인 상태 확인 중" />
        </PendingContent>
      </Card>
    );
  }

  if (status === "authenticated") {
    return (
      <SignedInCard aria-label="로그인 사용자 정보">
        <Flower aria-hidden="true" />
        <WelcomeMessage>
          <GreetingText>안녕하세요</GreetingText>
          <NameText>
            <strong>{displayName}</strong>
            <span> 선생님</span>
          </NameText>
        </WelcomeMessage>
        <LogoutButton type="button" onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </SignedInCard>
    );
  }

  return (
    <Card title="로그인">
      <Form aria-label="로그인 폼" onSubmit={handleLogin}>
        <InputGroup>
          <Input
            type="email"
            placeholder="이메일"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </InputGroup>
        <ErrorText role="status" aria-live="polite" $visible={Boolean(errorMessage)}>
          {errorMessage}
        </ErrorText>
        <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "로그인 중" : "로그인"}
        </SubmitButton>
      </Form>
    </Card>
  );
}

const Card = styled(HomeCard)`
  min-width: 0;
  height: 100%;
  background-color: ${colors.background};
  border: 0.0625rem solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
`;

const SignedInCard = styled.section`
  position: relative;
  min-width: 0;
  height: 100%;
  min-height: 18.75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.25rem 1.75rem;
  border-radius: ${radii.radius30};
  background: ${colors.point};

  @media (min-width: 120rem) {
    min-height: 26.5rem;
    padding: 3.75rem 2.5rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    min-height: 16rem;
  }
`;

const Flower = styled.span`
  position: absolute;
  top: 2.25rem;
  right: 2.125rem;
  width: 2.375rem;
  height: 2.375rem;
  border-radius: 50%;
  background: ${colors.white};
  box-shadow:
    0 -0.6875rem 0 ${colors.white},
    0 0.6875rem 0 ${colors.white},
    -0.6875rem 0 0 ${colors.white},
    0.6875rem 0 0 ${colors.white},
    -0.5rem -0.5rem 0 ${colors.white},
    0.5rem -0.5rem 0 ${colors.white},
    -0.5rem 0.5rem 0 ${colors.white},
    0.5rem 0.5rem 0 ${colors.white};

  @media (min-width: 120rem) {
    top: 3.5rem;
    right: 3.125rem;
    width: 3.5rem;
    height: 3.5rem;
    box-shadow:
      0 -1rem 0 ${colors.white},
      0 1rem 0 ${colors.white},
      -1rem 0 0 ${colors.white},
      1rem 0 0 ${colors.white},
      -0.75rem -0.75rem 0 ${colors.white},
      0.75rem -0.75rem 0 ${colors.white},
      -0.75rem 0.75rem 0 ${colors.white},
      0.75rem 0.75rem 0 ${colors.white};
  }
`;

const slideFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const WelcomeMessage = styled.p`
  margin: 0;
  color: ${colors.white};
  font-size: ${typography.fontSize32};
  font-weight: 300;
  line-height: 1.25;
  word-break: keep-all;

  strong {
    font-weight: 800;
  }

  @media (min-width: 120rem) {
    font-size: 3rem;
    line-height: 1.25;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    font-size: ${typography.fontSize24};
  }
`;

const GreetingText = styled.span`
  display: block;
  opacity: 0;
  animation: ${slideFadeIn} 1.2s ease-out forwards;
`;

const NameText = styled.span`
  display: block;
  opacity: 0;
  animation: ${slideFadeIn} 1.6s ease-out 0.7s forwards;
`;

const Form = styled.form`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${spacing.space28};

  @media (min-width: 120rem) {
    gap: ${spacing.space40};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }
`;

const ErrorText = styled.p<{ $visible: boolean }>`
  position: absolute;
  top: calc(7.25rem + ${spacing.space8});
  left: 0;
  right: 0;
  min-height: 1.375rem;
  color: #d97b7b;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};

  @media (min-width: 120rem) {
    top: calc(10.375rem + ${spacing.space8});
    font-size: ${typography.fontSize18};
  }
`;

const Input = styled(AuthInput)`
  font-family: ${typography.fontFamily};
  height: 3.375rem;
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    height: 4.6875rem;
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize24};
  }

  &:focus::placeholder {
    color: transparent;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 3.5rem;
  border: 0;
  border-radius: ${radii.radius12};
  background-color: ${colors.point};
  color: ${colors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  @media (min-width: 120rem) {
    height: 4.9375rem;
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize24};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const PendingContent = styled.div`
  min-height: 12.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoutButton = styled.button`
  position: absolute;
  top: ${spacing.space20};
  left: ${spacing.space20};
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: ${radii.radius999};
  padding: ${spacing.space8} ${spacing.space16};
  background: transparent;
  color: ${colors.white};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }
`;
