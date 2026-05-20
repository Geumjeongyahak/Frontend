"use client";

import { type FormEvent } from "react";
import styled from "styled-components";
import ApplyLayout from "@/components/apply/ApplyLayout";
import { ApplyActionButton } from "@/components/apply/ApplyAction";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatPhoneNumber } from "@/utils/phoneNumber";

const subjectOptions = [
  "개나리반 한글 - 화요일 19:00-22:00",
  "민들레반 한글 - 금요일 19:00-22:00",
  "국화반 국어 - 금요일 19:00-22:00",
  "해바라기반 수학 - 금요일 19:00-22:00",
  "스마트폰반 - 토요일 11:30-13:30",
];

const fields = [
  { id: "birthDate", label: "생년 월일", placeholder: "00.00.00", type: "date" },
  { id: "name", label: "이름", placeholder: "홍길동", type: "text" },
  { id: "phone", label: "연락처", placeholder: "000-0000-0000", type: "tel" },
  { id: "email", label: "이메일", placeholder: "이메일", type: "email" },
  { id: "address", label: "주소", placeholder: "주소", type: "text" },
  {
    id: "education",
    label: "최종 학력 및 전공",
    placeholder: "학력, 전공 순으로 작성해주세요",
    type: "text",
  },
] as const;

const questions = [
  "금정열린배움터에 관심을 가지게 된 동기가 무엇입니까?",
  "금정열린배움터에서 어떠한 선생님이 되시길 희망하십니까?",
  "지원자께서 생각하시는 '나눔' 의 의미를 간단하게 서술해 주십시오. (2~3문장 내외)",
];

export default function TeacherApplyFormPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert("지원서가 제출되었습니다.");
  };

  return (
    <ApplyLayout>
      <PageSection>
        <HeaderRow>
          <Title>교사 지원서 작성하기</Title>
          <ApplyActionButton type="submit" form="teacher-apply-form">
            제출
          </ApplyActionButton>
        </HeaderRow>

        <Form id="teacher-apply-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <FieldGroup key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <TextInput
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                onChange={
                  field.id === "phone"
                    ? (event) => {
                        event.target.value = formatPhoneNumber(event.target.value);
                      }
                    : undefined
                }
              />
            </FieldGroup>
          ))}

          <FieldGroup>
            <FieldLabel>지원 희망하는 과목과 요일</FieldLabel>
            <OptionPanel>
              {subjectOptions.map((option, index) => (
                <OptionLabel key={option}>
                  <RadioInput
                    type="radio"
                    name="subject"
                    value={option}
                    defaultChecked={index === 0}
                  />
                  <span>{option}</span>
                </OptionLabel>
              ))}
            </OptionPanel>
          </FieldGroup>

          {questions.map((question, index) => (
            <FieldGroup key={question}>
              <FieldLabel htmlFor={`question-${index + 1}`}>{question}</FieldLabel>
              <TextInput
                id={`question-${index + 1}`}
                name={`question${index + 1}`}
                type="text"
                placeholder="답변을 작성해주세요"
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

const TextInput = styled.input`
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

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const OptionPanel = styled.div`
  display: grid;
  gap: 0.625rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    gap: 0.9375rem;
    padding: ${spacing.space20};
  }
`;

const OptionLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  color: #0d0d0d;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const RadioInput = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  accent-color: ${colors.point};

  @media (min-width: 120rem) {
    width: 1.875rem;
    height: 1.875rem;
  }
`;
