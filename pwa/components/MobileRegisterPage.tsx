"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCalendarMonth } from "@tabler/icons-react";
import styled from "styled-components";
import { signup } from "@/api/auth/auth.api";
import { getSignupErrorMessage } from "@/components/auth/authErrorMessages";
import { setPendingEmailVerificationEmail } from "@/components/auth/emailVerificationSession";
import { colors, radii, spacing, typography } from "@/styles/tokens";
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

export default function MobileRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [birthDateText, setBirthDateText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const birthDateInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!form.birthDate) {
      setBirthDateText("");
      return;
    }

    const [year, month, day] = form.birthDate.split("-");
    if (!year || !month || !day) {
      setBirthDateText("");
      return;
    }

    setBirthDateText(`${year.slice(-2)}.${month}.${day}`);
  }, [form.birthDate]);

  function handleOpenBirthDatePicker() {
    const input = birthDateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function handleBirthDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, birthDate: event.target.value }));
  }

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
      const email = form.email.trim();
      await signup({
        password: form.password,
        name: form.name.trim(),
        email,
        birthDate: form.birthDate,
        phoneNumber: form.phoneNumber.trim() || undefined,
      });
      setPendingEmailVerificationEmail(email);
      router.replace("/auth/email-verification");
    } catch (error) {
      setStatusMessage(getSignupErrorMessage(error));
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
            <DateRow>
              <DateTextInput
                id="mobile-register-birth-date"
                name="birthDateText"
                autoComplete="bday"
                placeholder="00.00.00"
                value={birthDateText}
                readOnly
                onClick={handleOpenBirthDatePicker}
              />
              <HiddenNativeDateInput
                ref={birthDateInputRef}
                name="birthDate"
                type="date"
                value={form.birthDate}
                onClick={(event) => openDatePicker(event.currentTarget)}
                onChange={handleBirthDateChange}
                aria-hidden="true"
                tabIndex={-1}
              />
              <CalendarButton
                type="button"
                aria-label="생년월일 달력 열기"
                onClick={handleOpenBirthDatePicker}
              >
                <IconCalendarMonth size={18} stroke={2} color={colors.point} />
              </CalendarButton>
            </DateRow>
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

const DateRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 3.25rem;
  padding: 0.4375rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
`;

const DateTextInput = styled.input`
  width: 4.375rem;
  border: 0;
  background: transparent;
  color: ${colors.text};
  font-family: inherit;
  font-size: ${typography.fontSize16};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;
  cursor: pointer;

  &::placeholder {
    color: ${colors.placeholder};
  }
`;

const HiddenNativeDateInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const CalendarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: ${colors.point};
  cursor: pointer;
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
