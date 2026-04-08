"use client";

import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, radii, spacing, typography } from "@/styles/tokens";

export default function LoginCard() {
  return (
    <Card title="로그인">
      <Form aria-label="로그인 목업 폼">
        <InputGroup>
          <Input type="text" placeholder="아이디" />
          <Input type="password" placeholder="비밀번호" />
        </InputGroup>
        <SubmitButton type="button">로그인</SubmitButton>
      </Form>
    </Card>
  );
}

const Card = styled(HomeCard)`
  min-width: 400px;
  background-color: ${colors.background};
  border: 0.0625rem solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: ${spacing.space16};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space40};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
`;

const Input = styled.input`
  width: 100%;
  height: 3.25rem;
  padding: 0 ${spacing.space16};
  background-color: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  color: ${colors.text};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize16};
  outline: none;
  transition: all 0.3s ease-in-out;

  &:focus::placeholder {
    color: transparent;
  }

  &::placeholder {
    color: ${colors.muted};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 3.5rem;
  border: 0;
  border-radius: ${radii.radius12};
  background-color: ${colors.point};
  color: ${colors.white};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize16};
  font-weight: 600;
  cursor: pointer;
`;
