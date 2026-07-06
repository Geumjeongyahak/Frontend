"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { login } from "@/api/auth/auth.api";
import { clearTokens } from "@/api/client/tokenStorage";
import { getCurrentUser } from "@/api/user/user.api";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type AdminLoginForm = {
  email: string;
  password: string;
};

const initialForm: AdminLoginForm = {
  email: "",
  password: "",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = form.email.trim().length > 0 && form.password.length > 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loginUrl = window.location.href;
    window.history.pushState({ __adminLoginBackGuard: true }, "", loginUrl);

    function handlePopState() {
      window.history.pushState({ __adminLoginBackGuard: true }, "", loginUrl);
      router.replace("/");
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

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

      const user = await getCurrentUser();

      if (user.role !== "ADMIN") {
        clearTokens();
        setStatusMessage("관리자 계정으로만 접근할 수 있습니다.");
        return;
      }

      router.replace("/admin");
    } catch {
      clearTokens();
      setStatusMessage("입력하신 관리자 계정 정보를 다시 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Main>
      <AdminContent>
        <LoginPanel aria-labelledby="admin-login-title">
          <PanelHeader>
            <Logo src="/logo.svg" alt="" aria-hidden="true" />
            <HeadingGroup>
              <Title id="admin-login-title">관리자 로그인</Title>
              <Description>사용자, 부서, 분반, 구매 요청 관리</Description>
            </HeadingGroup>
          </PanelHeader>

          <Form onSubmit={handleSubmit}>
            <Field>
              <Label htmlFor="admin-login-email">이메일</Label>
              <Input
                id="admin-login-email"
                name="email"
                type="text"
                autoComplete="username"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </Field>

            <Field>
              <Label htmlFor="admin-login-password">비밀번호</Label>
              <Input
                id="admin-login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </Field>

            <Status role="status" aria-live="polite" $visible={Boolean(statusMessage)}>
              {statusMessage}
            </Status>

            <SubmitButton type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "로그인 중" : "로그인"}
            </SubmitButton>
          </Form>
        </LoginPanel>
      </AdminContent>
    </Main>
  );
}

const Main = styled.main`
  min-height: 100vh;
  background-color: #f5f7f6;
`;

const AdminContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: ${layout.adminMaxWidth};
  min-height: 100vh;
  margin: 0 auto;
  padding: ${spacing.space28} ${spacing.space20} ${spacing.space32};

  @media (min-width: 120rem) {
    max-width: ${layout.adminMaxWidthLarge};
    padding-top: ${spacing.space46};
    padding-bottom: ${spacing.space47};
  }
`;

const LoginPanel = styled.section`
  width: 100%;
  max-width: 20.5rem;
  padding: 1.5625rem 1.4375rem 1.5rem;
  background-color: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};

  @media (min-width: 120rem) {
    max-width: 30.75rem;
    padding: 2.375rem 2.1875rem 2.25rem;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
  margin-bottom: 1.375rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    margin-bottom: ${spacing.space32};
  }
`;

const Logo = styled.img`
  width: 1.75rem;
  height: auto;

  @media (min-width: 120rem) {
    width: 2.625rem;
  }
`;

const HeadingGroup = styled.div`
  min-width: 0;
`;

const Title = styled.h1`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const Description = styled.p`
  margin: ${spacing.space4} 0 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-top: ${spacing.space8};
    font-size: ${typography.fontSize18};
  }
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
  color: #050505;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const Input = styled.input`
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 ${spacing.space12};
  color: #050505;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    padding: 0 ${spacing.space20};
    font-size: ${typography.fontSize20};
  }

  &:focus {
    border-color: ${colors.point};
    outline: 2px solid ${colors.pointSoft};
  }
`;

const Status = styled.p<{ $visible: boolean }>`
  min-height: 1.125rem;
  margin: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};

  @media (min-width: 120rem) {
    min-height: 1.5rem;
    font-size: ${typography.fontSize16};
  }
`;

const SubmitButton = styled.button`
  min-height: 2.5rem;
  border: 0;
  border-radius: 0.375rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;
