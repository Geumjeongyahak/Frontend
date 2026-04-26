"use client";

import Link from "next/link";
import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

type PageProps = {
  params: {
    postId: string;
  };
};

export default function ExchangePostAcceptedPage({ params }: PageProps) {
  const { postId } = params;

  return (
    <PageWrapper>
      <TopButtonRow>
        <ActionButton type="button">삭제</ActionButton>
        <ActionButton type="button">수정</ActionButton>
        <LinkButton href="/staff/class/absence">목록</LinkButton>
      </TopButtonRow>

      <Section>
        <Label>제목</Label>
        <ValueBox>제목</ValueBox>
      </Section>

      <Section>
        <Label>신청자 정보</Label>
        <InfoRow>
          <InfoItem>
            <FieldLabel>반 이름</FieldLabel>
            <FieldValue>개나리반</FieldValue>
          </InfoItem>

          <InfoItem>
            <FieldLabel>수업 일자</FieldLabel>
            <FieldValue>00.00.00</FieldValue>
          </InfoItem>

          <InfoItem>
            <FieldLabel>작성자</FieldLabel>
            <FieldValue>홍길동</FieldValue>
          </InfoItem>
        </InfoRow>
      </Section>

      <Section>
        <Label>결강 신청 사유</Label>
        <TextBox>결강 신청 사유</TextBox>
      </Section>

      <Section>
        <Label>신청 현황</Label>
        <StatusBox>대기 중</StatusBox>
      </Section>
    </PageWrapper>
  );
}

const PageWrapper = styled.main`
  width: 100%;
  min-height: 100vh;
  padding: 36px 72px 80px;
  background: ${colors.white};
`;

const TopButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space28};
  margin-bottom: 44px;
`;

const ActionButton = styled.button`
  width: 92px;
  height: 62px;
  border: none;
  background: #e6e6e6;
  font-size: ${typography.fontSize18};
  font-weight: 700;
  cursor: pointer;
`;

const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 62px;
  background: #e6e6e6;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 700;
  text-decoration: none;
`;

const Section = styled.section`
  margin-bottom: 28px;
`;

const Label = styled.h3`
  margin: 0 0 22px;
  font-size: ${typography.fontSize18};
  font-weight: 700;
`;

const ValueBox = styled.div`
  width: 100%;
  height: 62px;
  padding: 0 20px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  font-size: ${typography.fontSize18};
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 42px;
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 74px 1fr;
  align-items: center;
  gap: 24px;
`;

const FieldLabel = styled.span`
  font-size: ${typography.fontSize18};
  font-weight: 700;
`;

const FieldValue = styled.div`
  height: 62px;
  padding: 0 20px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  font-size: ${typography.fontSize18};
`;

const TextBox = styled.div`
  width: 100%;
  height: 150px;
  padding: 20px;
  background: #f5f5f5;
  font-size: ${typography.fontSize18};
`;

const StatusBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 114px;
  height: 62px;
  background: #f5f5f5;
  font-size: ${typography.fontSize18};
  font-weight: 700;
`;
