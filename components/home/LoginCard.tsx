"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { login } from "@/api/auth/auth.api";
import { Input as AuthInput } from "@/components/auth/AuthFormParts";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import HomeCard from "@/components/home/HomeCard";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, radii, spacing, typography } from "@/styles/tokens";

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
      <Card title="로그인">
        <SignedInContent>
          <WelcomeGroup>
            <WelcomeTitle>어서오세요, {displayName}님!</WelcomeTitle>
            <WelcomeText>오늘도 수업과 운영 일정을 확인해 주세요.</WelcomeText>
          </WelcomeGroup>
          <ActionRow>
            <PrimaryLink href="/mypage">마이페이지</PrimaryLink>
            <SecondaryButton type="button" onClick={handleLogout}>
              로그아웃
            </SecondaryButton>
          </ActionRow>
        </SignedInContent>
      </Card>
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
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
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

const SignedInContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space40};
`;

const PendingContent = styled.div`
  min-height: 12.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WelcomeGroup = styled.div`
  min-height: 7.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${spacing.space12};
`;

const WelcomeTitle = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize24};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const WelcomeText = styled.p`
  color: #5f6b5a;
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight150};
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.space12};
`;

const PrimaryLink = styled(Link)`
  min-height: 3.5rem;
  border-radius: ${radii.radius12};
  background-color: ${colors.point};
  color: ${colors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
`;

const SecondaryButton = styled.button`
  min-height: 3.5rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    border-color: ${colors.point};
    color: ${colors.point};
  }
`;
