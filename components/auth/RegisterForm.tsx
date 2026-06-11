"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
import { formatPhoneNumber } from "@/utils/phoneNumber";

type RegisterFormState = {
  password: string;
  name: string;
  email: string;
  birthDate: string;
  phoneNumber: string;
};

const initialState: RegisterFormState = {
  password: "",
  name: "",
  email: "",
  birthDate: "",
  phoneNumber: "",
};

function toResidentRegistrationNumberPrefix(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${year.slice(-2)}${month}${day}`;
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    form.email.trim().length > 0 &&
    form.password.length >= 8 &&
    form.name.trim().length > 0 &&
    form.birthDate.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
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
      setStatusMessage("회원가입이 완료되었습니다. 잠시 후 메인으로 이동합니다.");
      router.replace("/");
    } catch {
      setStatusMessage("회원가입 정보를 확인해 주세요.");
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
            <Input
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
            <Input
              id="register-birth-date"
              name="birthDate"
              type="date"
              autoComplete="bday"
              value={form.birthDate}
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

        <Status
          role="status"
          aria-live="polite"
          $tone={statusMessage.startsWith("회원가입 정보") ? "error" : "default"}
          $visible={Boolean(statusMessage)}
        >
          {statusMessage}
        </Status>

        <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "가입 중" : "회원가입"}
        </SubmitButton>
      </Form>
    </AuthShell>
  );
}
