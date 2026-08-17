"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { googleSignup } from "@/api/auth/auth.api";
import { clearGoogleOAuthIntent, getGoogleOAuthReturnTo } from "@/api/auth/googleOAuthState";
import type { GoogleCallbackRedirectQueryParamsDto } from "@/api/auth/auth.dto";
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
import { openDatePicker } from "@/utils/datePicker";
import { formatPhoneNumber } from "@/utils/phoneNumber";
import { getSafeLoginReturnTo } from "@/lib/navigation/loginRedirect";

type GoogleSignupFormState = {
  name: string;
  phoneNumber: string;
  birthDate: string;
};

const initialState: GoogleSignupFormState = {
  name: "",
  phoneNumber: "",
  birthDate: "",
};

type GoogleSignupFormProps = {
  searchParams: GoogleCallbackRedirectQueryParamsDto;
};

export default function GoogleSignupForm({ searchParams }: GoogleSignupFormProps) {
  const router = useRouter();
  const tempToken = searchParams.tempToken ?? "";
  const [form, setForm] = useState<GoogleSignupFormState>({
    ...initialState,
    name: searchParams.name ?? "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    tempToken.length > 0 && form.name.trim().length > 0 && form.birthDate.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tempToken) {
      setStatusMessage("구글 회원가입 정보를 다시 확인해 주세요.");
      return;
    }

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await googleSignup({
        tempToken,
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        birthDate: form.birthDate,
      });
      const returnTo = getSafeLoginReturnTo(getGoogleOAuthReturnTo());
      clearGoogleOAuthIntent();
      setStatusMessage("구글 회원가입이 완료되었습니다. 잠시 후 이동합니다.");
      router.replace(returnTo);
    } catch {
      setStatusMessage("구글 회원가입 처리에 실패했습니다. 입력 정보를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell switchText="기존 로그인으로 돌아가시겠어요?" switchLabel="로그인" switchHref="/login">
      <Form onSubmit={handleSubmit} aria-label="구글 추가 회원가입 폼">
        <FieldGroup>
          <Field>
            <Label htmlFor="google-signup-name">이름</Label>
            <Input
              id="google-signup-name"
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
            <Label htmlFor="google-signup-birth-date">생년월일</Label>
            <Input
              id="google-signup-birth-date"
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
            <Label htmlFor="google-signup-phone">전화번호</Label>
            <Input
              id="google-signup-phone"
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
          $tone={statusMessage.startsWith("구글 회원가입 처리") || statusMessage.startsWith("구글 회원가입 정보를") ? "error" : "default"}
          $visible={Boolean(statusMessage) || !tempToken}
        >
          {statusMessage || (!tempToken ? "구글 회원가입 정보를 다시 확인해 주세요." : " ")}
        </Status>

        <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "가입 중" : "추가 정보 제출"}
        </SubmitButton>
      </Form>
    </AuthShell>
  );
}
