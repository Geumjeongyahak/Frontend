"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled from "styled-components";
import { setGoogleOAuthIntent } from "@/api/auth/googleOAuthState";
import { baseURL } from "@/api/client/publicClient";
import { updateCurrentUser } from "@/api/user/user.api";
import type { UpdateSelfRequestDto, UserResponseDto } from "@/api/user/user.dto";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
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

export default function MyPage() {
  const router = useRouter();
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
    router.replace("/");
  }

  function startEditing() {
    setForm(createEditableForm(user));
    setIsEditing(true);
  }

  function cancelEditing() {
    setForm(createEditableForm(user));
    setIsEditing(false);
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
    } catch {
      toast.error("회원 정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleGoogleConnect() {
    setGoogleOAuthIntent("connect");
    window.location.assign(`${baseURL}/api/v1/auth/google`);
  }

  return (
    <Main>
      <Content>
        <Panel aria-live="polite">
          <HeaderBlock>
            <Eyebrow>마이페이지</Eyebrow>
            <Title>내 정보</Title>
          </HeaderBlock>

          {status === "loading" ? (
            <StatusSlot>
              <LoadingSpinner label="회원 정보 확인 중" />
            </StatusSlot>
          ) : null}

          {status === "unauthenticated" ? (
            <StatusSlot>
              <StateGroup>
                <StateText>로그인이 필요한 페이지입니다.</StateText>
                <PrimaryLink href="/login">로그인</PrimaryLink>
              </StateGroup>
            </StatusSlot>
          ) : null}

          {status === "error" ? (
            <StatusSlot>
              <StateGroup>
                <StateText>회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</StateText>
                <SecondaryButton type="button" onClick={handleLogout}>
                  로그아웃
                </SecondaryButton>
              </StateGroup>
            </StatusSlot>
          ) : null}

          {status === "authenticated" ? (
            <ProfileContent aria-label="내 정보">
              <ProfileList>
                <ProfileItem>
                  <ProfileLabel htmlFor="mypage-name">이름</ProfileLabel>
                  {isEditing ? (
                    <ProfileInput
                      id="mypage-name"
                      name="name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      required
                    />
                  ) : (
                    <ProfileValue>{getDisplayValue(user?.name, "등록된 이름이 없습니다.")}</ProfileValue>
                  )}
                </ProfileItem>

                <ProfileItem>
                  <ProfileLabel htmlFor="mypage-email">이메일</ProfileLabel>
                  {isEditing ? (
                    <ProfileInput
                      id="mypage-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                      required
                    />
                  ) : (
                    <ProfileValue>
                      {getDisplayValue(user?.email, "등록된 이메일이 없습니다.")}
                    </ProfileValue>
                  )}
                </ProfileItem>

                <ProfileItem>
                  <ProfileLabel htmlFor="mypage-phone">전화번호</ProfileLabel>
                  {isEditing ? (
                    <ProfileInput
                      id="mypage-phone"
                      name="phoneNumber"
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
                    <ProfileLabel htmlFor="mypage-password">새 비밀번호</ProfileLabel>
                    <ProfileInput
                      id="mypage-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="변경할 때만 8자 이상 입력"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, password: event.target.value }))
                      }
                      minLength={8}
                    />
                  </ProfileItem>
                ) : null}

                <ProfileItem>
                  <ProfileLabel htmlFor="mypage-birth-date">생년월일</ProfileLabel>
                  {isEditing ? (
                    <ProfileInput
                      id="mypage-birth-date"
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
                  ) : (
                    <ProfileValue>{formatBirthDate(user?.birthDate ?? user?.residentRegistrationNumberPrefix)}</ProfileValue>
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

              {user?.teacherStartAt || user?.teacherEndAt ? (
                <SubSection>
                  <SubSectionTitle>교원 활동 기간</SubSectionTitle>
                  <PeriodText>
                    {getDisplayValue(user.teacherStartAt, "시작일 미등록")} -{" "}
                    {getDisplayValue(user.teacherEndAt, "종료일 미등록")}
                  </PeriodText>
                </SubSection>
              ) : null}

              <ActionRow>
                {isEditing ? (
                  <>
                    <ActionButton type="button" onClick={saveProfile} disabled={!canSave || isSaving}>
                      {isSaving ? "저장 중" : "확인"}
                    </ActionButton>
                    <ActionButton
                      type="button"
                      $variant="muted"
                      onClick={cancelEditing}
                      disabled={isSaving}
                    >
                      취소
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton type="button" onClick={startEditing}>
                      정보 수정
                    </ActionButton>
                    <ActionButton type="button" $variant="outline" onClick={handleGoogleConnect}>
                      구글 계정 연동
                    </ActionButton>
                    <ActionButton type="button" $variant="muted" onClick={handleLogout}>
                      로그아웃
                    </ActionButton>
                  </>
                )}
              </ActionRow>
            </ProfileContent>
          ) : null}
        </Panel>
      </Content>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.background};
`;

const Content = styled.div`
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  padding: ${spacing.space28} ${spacing.space20} ${spacing.space32};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    min-height: calc(100vh - 7.1875rem);
    padding-top: ${spacing.space46};
    padding-bottom: ${spacing.space47};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    min-height: auto;
    padding-top: ${spacing.space40};
    padding-bottom: ${spacing.space40};
  }
`;

const Panel = styled.section`
  width: 100%;
  max-width: 30.75rem;
  padding: 1.5625rem 1.4375rem 1.5rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 46.125rem;
    padding: 2.375rem 2.1875rem 2.25rem;
  }
`;

const HeaderBlock = styled.header`
  display: grid;
  gap: ${spacing.space4};
  margin-bottom: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: ${spacing.space8};
    margin-bottom: ${spacing.space28};
  }
`;

const Eyebrow = styled.p`
  margin: 0;
  color: ${colors.point};
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const Title = styled.h1`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize24};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const ProfileList = styled.dl`
  display: grid;
  gap: ${spacing.space12};
  margin: 0;

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }
`;

const ProfileContent = styled.div`
  display: block;
`;

const ProfileItem = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const ProfileLabel = styled.label`
  color: #050505;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const profileFieldStyle = `
  width: 100%;
  min-height: 2.5rem;
  padding: 0 ${spacing.space12};
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  color: #050505;
  font-size: ${typography.fontSize14};
`;

const ProfileValue = styled.dd`
  ${profileFieldStyle}
  margin: 0;
  background-color: ${colors.background};
  line-height: 2.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    padding: 0 ${spacing.space20};
    font-size: ${typography.fontSize20};
    line-height: 3.75rem;
  }
`;

const ProfileInput = styled.input`
  ${profileFieldStyle}
  background-color: ${colors.white};
  font-family: inherit;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:focus {
    border-color: ${colors.point};
    outline: 2px solid ${colors.pointSoft};
  }

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    padding: 0 ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const SubSection = styled.section`
  margin-top: ${spacing.space16};
  padding-top: ${spacing.space16};
  border-top: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    margin-top: ${spacing.space24};
    padding-top: ${spacing.space24};
  }
`;

const SubSectionTitle = styled.h2`
  margin: 0 0 ${spacing.space8};
  color: #050505;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const PeriodText = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ActionRow = styled.div`
  margin-top: ${spacing.space24};
  padding-top: ${spacing.space20};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: ${spacing.space8};
  border-top: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    margin-top: ${spacing.space32};
    padding-top: ${spacing.space28};
    gap: ${spacing.space12};
  }
`;

const StateGroup = styled.div`
  display: grid;
  justify-items: center;
  gap: ${spacing.space16};
  text-align: center;
`;

const StatusSlot = styled.div`
  min-height: 16rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 120rem) {
    min-height: 24rem;
  }
`;

const StateText = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 ${spacing.space12};
  border-radius: 0.375rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    padding: 0 ${spacing.space20};
    font-size: ${typography.fontSize18};
  }
`;

const ActionButton = styled.button<{ $variant?: "default" | "muted" | "outline" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "default" ? colors.point : $variant === "muted" ? colors.border : colors.borderStrong};
  border-radius: 0.375rem;
  background-color: ${({ $variant }) => ($variant === "muted" ? colors.background : colors.white)};
  color: ${({ $variant }) => ($variant === "muted" ? colors.text : $variant === "outline" ? colors.text : colors.point)};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${({ $variant }) =>
      $variant === "default" ? colors.pointSoft : colors.background};
    filter: ${({ $variant }) => ($variant === "default" ? "none" : "brightness(0.97)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    border-radius: 0.5rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const SecondaryButton = ActionButton;
