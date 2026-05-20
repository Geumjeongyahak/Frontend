"use client";

import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import styled, { css } from "styled-components";
import { createAbsenceRequest } from "@/api/request/request.api";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function AbsenceRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createAbsenceMutation = useMutation({
    mutationFn: createAbsenceRequest,
    onSuccess: () => {
      router.push("/staff/class-management/absence-request");
      router.refresh();
    },
    onError: () => {
      window.alert("결강 신청서 생성에 실패했습니다.");
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createAbsenceMutation.isPending) return;

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") ?? "").trim();
    const lessonId = Number(searchParams.get("lessonId") ?? "1");

    if (!reason || !Number.isInteger(lessonId) || lessonId < 1) {
      window.alert("필수 입력값을 확인해주세요.");
      return;
    }

    createAbsenceMutation.mutate({ lessonId, reason });
  };

  return (
    <PageWrapper>
      <HeaderRow>
        <Title>결강 신청서 작성하기</Title>

        <SubmitButton type="submit" form="absence-form" disabled={createAbsenceMutation.isPending}>
          {createAbsenceMutation.isPending ? "작성 중..." : "작성 완료"}
        </SubmitButton>
      </HeaderRow>

      <Form id="absence-form" onSubmit={handleSubmit}>
        <Section>
          <Label htmlFor="title">제목</Label>
          <TitleInput id="title" name="title" placeholder="제목" />
        </Section>

        <Section>
          <SectionTitle>신청자 정보</SectionTitle>

          <InfoRow>
            <FieldLabel htmlFor="className">반 이름</FieldLabel>
            <InlineInput id="className" name="className" placeholder="개나리반" />

            <FieldLabel htmlFor="lessonDate">수업 일자</FieldLabel>
            <InlineInput id="lessonDate" name="lessonDate" placeholder="00.00.00" />

            <FieldLabel htmlFor="writer">작성자</FieldLabel>
            <InlineInput id="writer" name="writer" placeholder="홍길동" />
          </InfoRow>
        </Section>

        <Section>
          <Label htmlFor="reason">결강 신청 사유</Label>
          <TextArea id="reason" name="reason" placeholder="결강 신청 사유" />
        </Section>
      </Form>
    </PageWrapper>
  );
}

const inputStyle = css`
  min-width: 0;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.3125rem 3.125rem 4rem;
  background: ${colors.white};

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
  margin-bottom: 2.125rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    border-color: #d4d4d4;
    background-color: #d4d4d4;
    color: #7b7b7b;
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const labelStyle = css`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Label = styled.label`
  ${labelStyle}
`;

const SectionTitle = styled.h2`
  ${labelStyle}
`;

const InlineInput = styled.input`
  ${inputStyle}
`;

const TitleInput = styled.input`
  ${inputStyle}
  width: 100%;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const FieldLabel = styled.label`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 6.875rem;
  padding: 0.75rem ${spacing.space12};
  border: 0;
  background: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  resize: none;
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: 1.1875rem ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
