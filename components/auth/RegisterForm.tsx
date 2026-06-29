"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import styled from "styled-components";
import { signup } from "@/api/auth/auth.api";
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
import { colors } from "@/styles/tokens";
import { openDatePicker } from "@/utils/datePicker";
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

function getSignupErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
      return data.detail;
    }
  }
  return "회원가입 정보를 확인해 주세요.";
}

export default function RegisterForm() {
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
        birthDate: form.birthDate,
        phoneNumber: form.phoneNumber.trim() || undefined,
      });
      router.replace(`/auth/email-verification?email=${encodeURIComponent(form.email.trim())}`);
    } catch (error) {
      setStatusMessage(getSignupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      switchText="이미 계정이 있나요?"
      switchLabel="로그인"
      switchHref="/login"
      panelSize="wide"
    >
      <Form onSubmit={handleSubmit} aria-label="회원가입 폼">
        <FieldGroup>
          <Field>
            <Label htmlFor="register-email">이메일</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="이메일"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </Field>

          <Field>
            <Label htmlFor="register-password">비밀번호</Label>
            <PasswordInput
              id="register-password"
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
              $matchState={passwordMatchState}
            />
          </Field>

          <Field>
            <Label htmlFor="register-confirm-password">비밀번호 확인</Label>
            <PasswordInput
              id="register-confirm-password"
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
              $matchState={passwordMatchState}
            />
          </Field>

          <Field>
            <Label htmlFor="register-name">이름</Label>
            <Input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="이름"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="register-birth-date">생년월일</Label>
            <DateInput
              id="register-birth-date"
              name="birthDate"
              type="date"
              autoComplete="bday"
              value={form.birthDate}
              onClick={(event) => openDatePicker(event.currentTarget)}
              onChange={(event) =>
                setForm((current) => ({ ...current, birthDate: event.target.value }))
              }
              required
            />
          </Field>

          <Field>
            <Label htmlFor="register-phone">전화번호</Label>
            <Input
              id="register-phone"
              name="phoneNumber"
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
        </FieldGroup>

        <RegisterStatus
          role="status"
          aria-live="polite"
          $tone={statusMessage.startsWith("회원가입 정보") ? "error" : "default"}
          $matchState={passwordMatchState}
          $visible={Boolean(statusMessage) || form.confirmPassword.length > 0}
        >
          {statusMessage ||
            (form.confirmPassword.length > 0 && !isPasswordConfirmed
              ? "비밀번호와 비밀번호 확인이 일치하지 않습니다."
              : " ")}
        </RegisterStatus>

        <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "가입 중" : "회원가입"}
        </SubmitButton>
      </Form>
    </AuthShell>
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
      $matchState === "matched" ? colors.point : $matchState === "mismatched" ? "#de8c85" : colors.point};
    outline: 2px solid
      ${({ $matchState }) =>
        $matchState === "matched"
          ? colors.pointSoft
          : $matchState === "mismatched"
            ? "#f8d8d4"
            : colors.pointSoft};
  }
`;

const DateInput = styled(Input)`
  cursor: pointer;
  padding-right: 3.25rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2387C25C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 2v4'/%3E%3Cpath d='M16 2v4'/%3E%3Crect width='18' height='18' x='3' y='4' rx='2'/%3E%3Cpath d='M3 10h18'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.125rem;

  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    width: 2.5rem;
    height: 100%;
    margin: 0;
    cursor: pointer;
  }
`;

const RegisterStatus = styled(Status)<{
  $matchState: "idle" | "matched" | "mismatched";
}>`
  color: ${({ $tone, $matchState }) =>
    $matchState === "mismatched"
      ? "#d98882"
      : $tone === "error"
        ? colors.notice
        : "#52604c"};
`;
