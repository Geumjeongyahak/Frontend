"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { setGoogleOAuthIntent } from "@/api/auth/googleOAuthState";
import { baseURL } from "@/api/client/publicClient";
import { updateCurrentUser } from "@/api/user/user.api";
import type { UpdateSelfRequestDto, UserResponseDto } from "@/api/user/user.dto";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAppBackNavigation } from "@/hooks/useAppBackNavigation";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import {
  formatBirthDate,
  toBirthDateInputValue,
} from "@/utils/birthDate";
import { openDatePicker } from "@/utils/datePicker";
import { formatPhoneNumber } from "@/utils/phoneNumber";

type EditableProfileForm = {
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  password: string;
};

function getDisplayValue(value: string | number | null | undefined, fallback: string) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatRole(role?: string) {
  const roleLabels: Record<string, string> = {
    ADMIN: "관리자",
    MANAGER: "운영진",
    VOLUNTEER: "교원",
    GUEST: "일반 회원",
  };

  return role ? (roleLabels[role] ?? role) : "역할 정보가 없습니다.";
}

function createEditableForm(user: UserResponseDto | null): EditableProfileForm {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    birthDate: toBirthDateInputValue(user?.birthDate ?? user?.residentRegistrationNumberPrefix) || "",
    password: "",
  };
}

function buildUpdatePayload(form: EditableProfileForm): UpdateSelfRequestDto {
  const payload: UpdateSelfRequestDto = {
    name: form.name.trim(),
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim() || undefined,
    birthDate: form.birthDate,
  };

  if (form.password.length > 0) {
    payload.password = form.password;
  }

  return payload;
}

export default function MobileMyPage() {
  const router = useRouter();
  const { handleBack } = useAppBackNavigation({ fallbackHref: "/" });
  const { status, user, refreshSession, signOut } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditableProfileForm>(() => createEditableForm(user));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setForm(createEditableForm(user));
    }
  }, [isEditing, user]);

  const canSave =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.birthDate.length > 0 &&
    (form.password.length === 0 || form.password.length >= 8);

  async function handleLogout() {
    await signOut();
    router.replace("/", { scroll: true });
  }

  async function saveProfile() {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await updateCurrentUser(buildUpdatePayload(form));
      await refreshSession();
      setIsEditing(false);
      toast.success("회원 정보를 수정했습니다.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "회원 정보 수정에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleGoogleConnect() {
    setGoogleOAuthIntent("connect");
    window.location.assign(`${baseURL}/api/v1/auth/google`);
  }

  return (
    <Page>
      <Header>
        <BackButton type="button" onClick={handleBack} aria-label="이전 페이지로 이동">
          <IconChevronLeft size={24} stroke={1.9} />
        </BackButton>
      </Header>

      <Intro>
        <Eyebrow>마이페이지</Eyebrow>
        <Title>내 정보</Title>
      </Intro>

      <Panel>
        {status === "loading" ? <StateBlock>회원 정보 확인 중...</StateBlock> : null}

        {status === "unauthenticated" ? (
          <StateBlock>
            <StateText>로그인이 필요한 페이지입니다.</StateText>
            <PrimaryLink href="/login">로그인</PrimaryLink>
          </StateBlock>
        ) : null}

        {status === "error" ? (
          <StateBlock>
            <StateText>회원 정보를 불러오지 못했습니다.</StateText>
            <ActionButton type="button" $variant="muted" onClick={handleLogout}>
              로그아웃
            </ActionButton>
          </StateBlock>
        ) : null}

        {status === "authenticated" ? (
          <>
            <ProfileList>
              <ProfileItem>
                <ProfileLabel htmlFor="mobile-mypage-name">이름</ProfileLabel>
                {isEditing ? (
                  <ProfileInput
                    id="mobile-mypage-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                ) : (
                  <ProfileValue>
                    {getDisplayValue(user?.name, "등록된 이름이 없습니다.")}
                  </ProfileValue>
                )}
              </ProfileItem>

              <ProfileItem>
                <ProfileLabel htmlFor="mobile-mypage-email">이메일</ProfileLabel>
                {isEditing ? (
                  <ProfileInput
                    id="mobile-mypage-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                ) : (
                  <ProfileValue>
                    {getDisplayValue(user?.email, "등록된 이메일이 없습니다.")}
                  </ProfileValue>
                )}
              </ProfileItem>

              <ProfileItem>
                <ProfileLabel htmlFor="mobile-mypage-phone">전화번호</ProfileLabel>
                {isEditing ? (
                  <ProfileInput
                    id="mobile-mypage-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    value={form.phoneNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phoneNumber: formatPhoneNumber(event.target.value),
                      }))
                    }
                  />
                ) : (
                  <ProfileValue>
                    {getDisplayValue(user?.phoneNumber, "등록된 전화번호가 없습니다.")}
                  </ProfileValue>
                )}
              </ProfileItem>

              {isEditing ? (
                <ProfileItem>
                  <ProfileLabel htmlFor="mobile-mypage-password">새 비밀번호</ProfileLabel>
                  <ProfileInput
                    id="mobile-mypage-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="변경할 때만 8자 이상 입력"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </ProfileItem>
              ) : null}

              <ProfileItem>
                <ProfileLabel htmlFor="mobile-mypage-birth-date">생년월일</ProfileLabel>
                {isEditing ? (
                  <DateInput
                    id="mobile-mypage-birth-date"
                    type="date"
                    autoComplete="bday"
                    value={form.birthDate}
                    onClick={(event) => openDatePicker(event.currentTarget)}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, birthDate: event.target.value }))
                    }
                  />
                ) : (
                  <ProfileValue>
                    {formatBirthDate(user?.birthDate ?? user?.residentRegistrationNumberPrefix)}
                  </ProfileValue>
                )}
              </ProfileItem>

              <ProfileItem>
                <ProfileLabel>역할</ProfileLabel>
                <ProfileValue>{formatRole(user?.role)}</ProfileValue>
              </ProfileItem>

              <ProfileItem>
                <ProfileLabel>소속</ProfileLabel>
                <ProfileValue>
                  {user?.department?.name ?? user?.classroom?.name ?? "등록된 소속이 없습니다."}
                </ProfileValue>
              </ProfileItem>
            </ProfileList>

            <ActionRow>
              {isEditing ? (
                <>
                  <ActionButton type="button" onClick={saveProfile} disabled={!canSave || isSaving}>
                    {isSaving ? "저장 중" : "확인"}
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="muted"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    취소
                  </ActionButton>
                </>
              ) : (
                <>
                  <ActionButton type="button" $textTone="dark" onClick={() => setIsEditing(true)}>
                    정보 수정
                  </ActionButton>
                  <ActionButton type="button" $variant="outline" onClick={handleGoogleConnect}>
                    <GoogleConnectContent>
                      <GoogleMark aria-hidden="true" viewBox="0 0 18 18">
                        <path
                          fill="#4285F4"
                          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62Z"
                        />
                        <path
                          fill="#34A853"
                          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.46.35 2.84.96 4.06l3.02-2.34Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M9 3.58c1.32 0 2.5.46 3.44 1.34l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34c.7-2.12 2.68-3.7 5.02-3.7Z"
                        />
                      </GoogleMark>
                      <span>구글 계정 연동</span>
                    </GoogleConnectContent>
                  </ActionButton>
                  <ActionButton type="button" $variant="muted" onClick={handleLogout}>
                    로그아웃
                  </ActionButton>
                </>
              )}
            </ActionRow>
          </>
        ) : null}
      </Panel>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100lvh;
  padding: 3.5rem 1.5625rem 2.5rem;
  background:
    radial-gradient(circle at top right, rgba(136, 205, 90, 0.2), transparent 34%),
    linear-gradient(180deg, #f7faf4 0%, #f3f3f3 42%, #f3f3f3 100%);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  min-height: 2.75rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: ${colors.text};
  padding: 0;
  cursor: pointer;
`;

const Intro = styled.header`
  display: grid;
  gap: ${spacing.space12};
  margin-top: ${spacing.space20};
  margin-bottom: 1rem;
`;

const Eyebrow = styled.p`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.25;
`;

const Description = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const Panel = styled.section`
  display: grid;
  gap: ${spacing.space20};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const StateBlock = styled.div`
  display: grid;
  justify-items: center;
  gap: ${spacing.space16};
  min-height: 16rem;
  align-content: center;
  text-align: center;
`;

const StateText = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0 ${spacing.space20};
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  text-decoration: none;
`;

const ProfileList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ProfileItem = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const ProfileLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const fieldStyle = `
  width: 100%;
  min-height: 3rem;
  padding: 0 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  font-size: ${typography.fontSize16};
`;

const ProfileValue = styled.div`
  ${fieldStyle}
  display: flex;
  align-items: center;
  background: #fbfcfa;
  color: ${colors.text};
`;

const ProfileInput = styled.input`
  ${fieldStyle}
  background: #fbfcfa;
  color: ${colors.text};
  outline: none;

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const DateInput = styled(ProfileInput)`
  padding-right: 3.25rem;
  cursor: pointer;
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

const ActionRow = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const GoogleConnectContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
`;

const GoogleMark = styled.svg`
  width: 1.125rem;
  height: 1.125rem;
  flex: 0 0 auto;
`;

const ActionButton = styled.button<{
  $variant?: "default" | "muted" | "outline";
  $textTone?: "dark";
}>`
  min-height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "default"
        ? colors.point
        : $variant === "muted"
          ? colors.border
          : colors.borderStrong};
  border-radius: ${radii.radius15};
  background: ${({ $variant }) => ($variant === "muted" ? colors.background : colors.white)};
  color: ${({ $textTone, $variant }) =>
    $textTone === "dark" ? colors.text : $variant === "default" ? colors.point : colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
  }
`;
