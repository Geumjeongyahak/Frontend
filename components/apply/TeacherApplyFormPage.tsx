"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { createTeacherApplication, getAvailableTeacherSchedules, getMyTeacherApplication } from "@/api/teacherApplication/teacherApplication.api";
import type { CreateTeacherApplicationRequestDto } from "@/api/teacherApplication/teacherApplication.dto";
import { ApplyActionButton } from "@/components/apply/ApplyAction";
import ApplyLayout from "@/components/apply/ApplyLayout";
import { toTeacherScheduleOption } from "@/components/apply/teacherApplicationUtils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { toBirthDateInputValue } from "@/utils/birthDate";

type FormState = {
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  educationAndMajor: string;
  preferredSubjectId: string;
  motivation: string;
  desiredTeacherImage: string;
  meaningOfSharing: string;
};

const initialFormState: FormState = {
  birthDate: "",
  phoneNumber: "",
  email: "",
  address: "",
  educationAndMajor: "",
  preferredSubjectId: "",
  motivation: "",
  desiredTeacherImage: "",
  meaningOfSharing: "",
};

const questions = [
  {
    id: "motivation",
    label: "금정열린배움터에 관심을 가지게 된 동기가 무엇입니까?",
  },
  {
    id: "desiredTeacherImage",
    label: "금정열린배움터에서 어떠한 선생님이 되시길 희망하십니까?",
  },
  {
    id: "meaningOfSharing",
    label: "지원자께서 생각하시는 '나눔' 의 의미를 간단하게 서술해 주십시오. (2~3문장 내외)",
  },
] as const;

export default function TeacherApplyFormPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (status === "unauthenticated" || status === "error") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setForm((current) => ({
      ...current,
      birthDate:
        current.birthDate ||
        toBirthDateInputValue(user?.birthDate ?? user?.residentRegistrationNumberPrefix) ||
        "",
      email: current.email || user?.email || "",
      phoneNumber: current.phoneNumber || user?.phoneNumber || "",
    }));
  }, [
    isAuthenticated,
    user?.birthDate,
    user?.email,
    user?.phoneNumber,
    user?.residentRegistrationNumberPrefix,
  ]);

  const applicationQuery = useQuery({
    queryKey: queryKeys.teacherApplications.my(),
    queryFn: getMyTeacherApplication,
    enabled: isAuthenticated,
  });

  const schedulesQuery = useQuery({
    queryKey: queryKeys.teacherApplications.availableSchedules(),
    queryFn: getAvailableTeacherSchedules,
    enabled: isAuthenticated,
  });

  const scheduleOptions = useMemo(
    () =>
      (schedulesQuery.data ?? [])
        .map(toTeacherScheduleOption)
        .filter(
          (
            option,
          ): option is {
            key: string;
            preferredSubjectId: number;
            label: string;
          } => option !== null,
        ),
    [schedulesQuery.data],
  );

  useEffect(() => {
    if (!form.preferredSubjectId && scheduleOptions[0]) {
      setForm((current) => ({
        ...current,
        preferredSubjectId: String(scheduleOptions[0].preferredSubjectId),
      }));
    }
  }, [form.preferredSubjectId, scheduleOptions]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeacherApplicationRequestDto) => createTeacherApplication(payload),
    onSuccess: async () => {
      setSubmitError("");
      setSubmitSuccess("지원서가 제출되었습니다.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.my() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.adminList() }),
      ]);
      router.replace("/apply/status");
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error && typeof error.message === "string"
          ? error.message
          : "지원서를 제출하지 못했습니다.";
      setSubmitSuccess("");
      setSubmitError(message);
    },
  });

  if (!isAuthenticated) {
    return (
      <ApplyLayout activeItem="apply">
        <LoadingSection>
          <LoadingSpinner label="교사 신청 페이지를 불러오는 중" />
        </LoadingSection>
      </ApplyLayout>
    );
  }

  const existingApplication = applicationQuery.data?.application;
  const hasBlockingApplication =
    existingApplication?.status === "PENDING" || existingApplication?.status === "APPROVED";
  const isSubmitting = createMutation.isPending;

  function handleInputChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSubmitError("");
    setSubmitSuccess("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasBlockingApplication || isSubmitting) {
      return;
    }

    const preferredSubjectId = Number(form.preferredSubjectId);
    if (!Number.isFinite(preferredSubjectId)) {
      setSubmitSuccess("");
      setSubmitError("지원 희망 과목을 선택해 주세요.");
      return;
    }

    createMutation.mutate({
      birthDate: form.birthDate,
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      educationAndMajor: form.educationAndMajor.trim(),
      preferredSubjectId,
      motivation: form.motivation.trim(),
      desiredTeacherImage: form.desiredTeacherImage.trim(),
      meaningOfSharing: form.meaningOfSharing.trim(),
    });
  }

  return (
    <ApplyLayout activeItem="apply">
      <PageSection>
        <HeaderRow>
          <Title>교사 지원서 작성하기</Title>
          <ApplyActionButton
            type="submit"
            form="teacher-apply-form"
            disabled={
              isSubmitting ||
              hasBlockingApplication ||
              applicationQuery.isLoading ||
              schedulesQuery.isLoading
            }
          >
            제출
          </ApplyActionButton>
        </HeaderRow>

        {hasBlockingApplication ? (
          <StatusNotice role="status">
            이미 대기 또는 승인 상태의 교사 신청이 있습니다.{" "}
            <StatusLink href="/apply/status">지원 현황</StatusLink>에서 내용을 확인해 주세요.
          </StatusNotice>
        ) : null}
        {submitError ? <ErrorMessage role="alert">{submitError}</ErrorMessage> : null}
        {submitSuccess ? <SuccessMessage role="status">{submitSuccess}</SuccessMessage> : null}

        <Form id="teacher-apply-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldLabel htmlFor="birthDate">생년 월일</FieldLabel>
            <TextInput
              id="birthDate"
              name="birthDate"
              type="date"
              value={form.birthDate}
              readOnly
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="applicantName">이름</FieldLabel>
            <TextInput id="applicantName" name="applicantName" value={user?.name ?? ""} readOnly />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="phoneNumber">연락처</FieldLabel>
            <TextInput
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="000-0000-0000"
              value={form.phoneNumber}
              readOnly
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="email">이메일</FieldLabel>
            <TextInput
              id="email"
              name="email"
              type="email"
              placeholder="이메일"
              value={form.email}
              readOnly
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="address">주소</FieldLabel>
            <TextInput
              id="address"
              name="address"
              type="text"
              placeholder="주소"
              value={form.address}
              onChange={(event) => handleInputChange("address", event.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="educationAndMajor">최종 학력 및 전공</FieldLabel>
            <TextInput
              id="educationAndMajor"
              name="educationAndMajor"
              type="text"
              placeholder="학력, 전공 순으로 작성해주세요"
              value={form.educationAndMajor}
              onChange={(event) => handleInputChange("educationAndMajor", event.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="preferredSubjectId">지원 희망하는 과목과 요일</FieldLabel>
            {schedulesQuery.isLoading ? (
              <InlineStateBox>
                <LoadingSpinner label="신청 가능 시간표를 불러오는 중" />
              </InlineStateBox>
            ) : schedulesQuery.isError ? (
              <InlineStateBox role="alert">신청 가능 시간표를 불러오지 못했습니다.</InlineStateBox>
            ) : scheduleOptions.length === 0 ? (
              <InlineStateBox>현재 신청 가능한 시간표가 없습니다.</InlineStateBox>
            ) : (
              <SelectInput
                id="preferredSubjectId"
                name="preferredSubjectId"
                value={form.preferredSubjectId}
                onChange={(event) => handleInputChange("preferredSubjectId", event.target.value)}
                required
              >
                {scheduleOptions.map((option) => (
                  <option key={option.key} value={option.preferredSubjectId}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            )}
          </FieldGroup>

          {questions.map((question) => (
            <FieldGroup key={question.id}>
              <FieldLabel htmlFor={question.id}>{question.label}</FieldLabel>
              <TextArea
                id={question.id}
                name={question.id}
                value={form[question.id]}
                onChange={(event) => handleInputChange(question.id, event.target.value)}
                placeholder="답변을 작성해주세요"
                required
              />
            </FieldGroup>
          ))}
        </Form>
      </PageSection>
    </ApplyLayout>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 4rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 1.5rem;

  @media (min-width: 120rem) {
    margin-bottom: 2.25rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 0.75rem;

  @media (min-width: 120rem) {
    gap: 1.25rem;
  }
`;

const FieldLabel = styled.label`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const inputBaseStyle = `
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  &:focus {
    border-color: ${colors.point};
  }

  &:read-only {
    background-color: #f8f8f8;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const TextInput = styled.input`
  ${inputBaseStyle}
`;

const TextArea = styled.textarea`
  ${inputBaseStyle}
  min-height: 8rem;
  resize: vertical;
`;

const SelectInput = styled.select`
  ${inputBaseStyle}
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 2.75rem;
  border-color: ${colors.muted};
  background-color: #ffffff !important;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;

  option {
    background-color: ${colors.white} !important;
    color: #000000;
  }
`;

const BaseMessage = styled.p`
  margin: 0 0 1rem;
  padding: ${spacing.space12} ${spacing.space16};
  border-radius: 0.5rem;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const StatusNotice = styled(BaseMessage)`
  background-color: ${colors.pointSoft};
  color: ${colors.text};
`;

const ErrorMessage = styled(BaseMessage)`
  background-color: #fff1f0;
  color: ${colors.notice};
`;

const SuccessMessage = styled(BaseMessage)`
  background-color: #f3faed;
  color: ${colors.point};
`;

const InlineStateBox = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  margin: 0;
  color: #606060;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const StatusLink = styled(Link)`
  color: ${colors.point};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;

const LoadingSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - ${layout.headerHeight});
  padding: ${spacing.space40} ${spacing.space20};
`;
