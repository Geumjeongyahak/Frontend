"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { signup } from "@/api/auth/auth.api";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import { toResidentRegistrationNumberPrefix } from "@/utils/birthDate";
import { formatPhoneNumber } from "@/utils/phoneNumber";

type RegisterFormState = {
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  birthDate: string;
  phoneNumber: string;
};

const initialState: RegisterFormState = {
  password: "",
  confirmPassword: "",
  name: "",
  email: "",
  birthDate: "",
  phoneNumber: "",
};

export default function MobileRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMatchState =
    form.confirmPassword.length === 0
      ? "idle"
      : form.password === form.confirmPassword
        ? "matched"
        : "mismatched";
  const isPasswordConfirmed =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  const canSubmit =
    form.email.trim().length > 0 &&
    form.password.length >= 8 &&
    isPasswordConfirmed &&
    form.name.trim().length > 0 &&
    form.birthDate.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      if (form.confirmPassword.length > 0 && !isPasswordConfirmed) {
        setStatusMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      }
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await signup({
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim(),
        residentRegistrationNumberPrefix: toResidentRegistrationNumberPrefix(form.birthDate),
        phoneNumber: form.phoneNumber.trim() || undefined,
      });
      router.replace("/", { scroll: true });
    } catch {
      setStatusMessage("회원가입 정보를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Page>
      <Header>
        <Eyebrow>금정열린배움터</Eyebrow>
        <Title>회원가입</Title>
      </Header>

      <Panel>
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="mobile-register-email">이메일</Label>
            <Input
              id="mobile-register-email"
              type="email"
              autoComplete="email"
              placeholder="이메일"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </Field>

          <Field>
            <Label htmlFor="mobile-register-password">비밀번호</Label>
            <PasswordInput
              id="mobile-register-password"
              type="password"
              autoComplete="new-password"
              placeholder="8자 이상 입력"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              $matchState={passwordMatchState}
            />
          </Field>

          <Field>
            <Label htmlFor="mobile-register-confirm-password">비밀번호 확인</Label>
            <PasswordInput
              id="mobile-register-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              $matchState={passwordMatchState}
            />
          </Field>

          <Field>
            <Label htmlFor="mobile-register-name">이름</Label>
            <Input
              id="mobile-register-name"
              type="text"
              autoComplete="name"
              placeholder="이름"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>

          <Field>
            <Label htmlFor="mobile-register-birth-date">생년월일</Label>
            <DateInput
              id="mobile-register-birth-date"
              type="date"
              autoComplete="bday"
              value={form.birthDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, birthDate: event.target.value }))
              }
            />
          </Field>

          <Field>
            <Label htmlFor="mobile-register-phone">전화번호</Label>
            <Input
              id="mobile-register-phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={form.phoneNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phoneNumber: formatPhoneNumber(event.target.value),
                }))
              }
            />
          </Field>

          <Status
            role="status"
            aria-live="polite"
            $visible={Boolean(statusMessage) || form.confirmPassword.length > 0}
          >
            {statusMessage ||
              (form.confirmPassword.length > 0 && !isPasswordConfirmed
                ? "비밀번호와 비밀번호 확인이 일치하지 않습니다."
                : " ")}
          </Status>

          <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "가입 중" : "회원가입"}
          </SubmitButton>
        </Form>
      </Panel>

      <Footer>
        <FooterText>이미 계정이 있나요?</FooterText>
        <FooterLink href="/login">로그인</FooterLink>
      </Footer>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100lvh;
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

const Description = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
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

const PasswordInput = styled(Input)<{ $matchState: "idle" | "matched" | "mismatched" }>`
  border-color: ${({ $matchState }) =>
    $matchState === "matched"
      ? colors.point
      : $matchState === "mismatched"
        ? "#e5a19b"
        : "#d7ddd3"};
  background-color: ${({ $matchState }) =>
    $matchState === "matched" ? "#f4faef" : $matchState === "mismatched" ? "#fff6f5" : "#fbfcfa"};
`;

const DateInput = styled(Input)`
  appearance: none;
  -webkit-appearance: none;
  padding-right: 3.25rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2387C25C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 2v4'/%3E%3Cpath d='M16 2v4'/%3E%3Crect width='18' height='18' x='3' y='4' rx='2'/%3E%3Cpath d='M3 10h18'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.125rem;

  &::-webkit-inner-spin-button,
  &::-webkit-clear-button {
    display: none;
  }

  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    width: 2.5rem;
    height: 100%;
    margin: 0;
    cursor: pointer;
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
