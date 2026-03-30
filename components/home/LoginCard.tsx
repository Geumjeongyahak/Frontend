"use client";

import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, radii, spacing, typography } from "@/styles/tokens";

export default function LoginCard() {
  return (
    <Card title="로그인">
      <Form aria-label="로그인 목업 폼">
        <Input type="text" placeholder="아이디" readOnly />
        <Input type="password" placeholder="비밀번호" readOnly />
        <SubmitButton type="button">로그인</SubmitButton>
      </Form>
    </Card>
  );
}

const Card = styled(HomeCard)`
  height: 100%;
`;

const Form = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const Input = styled.input`
  width: 100%;
  height: 3.25rem;
  padding: 0 ${spacing.space16};
  border: 0.0625rem solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.text};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize16};

  &::placeholder {
    color: ${colors.muted};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 3.25rem;
  border: 0;
  border-radius: ${radii.radius15};
  background-color: ${colors.point};
  color: ${colors.white};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize16};
  font-weight: 600;
  cursor: pointer;
`;
