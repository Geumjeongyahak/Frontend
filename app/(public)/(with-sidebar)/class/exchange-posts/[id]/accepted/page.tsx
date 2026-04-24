"use client";

import Link from "next/link";
import styled from "styled-components";

type PageProps = {
  params: {
    postId: string;
  };
};

export default function ExchangePostDetailPage({ params }: PageProps) {
  const { postId } = params;

  return (
    <PageWrapper>
      <TopButtonRow>
        <ActionButton type="button">삭제</ActionButton>
        <ActionButton type="button">수정</ActionButton>
        <LinkButton href="/class/exchange-posts">목록</LinkButton>
      </TopButtonRow>

      <Section>
        <Label>제목</Label>
        <ValueBox>제목</ValueBox>
      </Section>

      <Section>
        <Label>신청자 정보</Label>
        <Row>
          <FieldBox>
            <FieldLabel>반 이름</FieldLabel>
            <FieldValue>개나리반</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>수업 일자</FieldLabel>
            <FieldValue>00.00.00</FieldValue>
          </FieldBox>
        </Row>
      </Section>

      <Section>
        <Label>교환 신청 사유</Label>
        <TextBox>교환 신청 사유</TextBox>
      </Section>

      <Section>
        <Label>신청 현황</Label>
        <StatusBox>대기 중</StatusBox>
      </Section>

      <Section>
        <Label>교환 대상</Label>

        <TargetMetaRow>
          <MetaBox>개나리반</MetaBox>
          <MetaBox>00.00.00</MetaBox>
          <MetaBox>최양진</MetaBox>
        </TargetMetaRow>

        <TargetContent>내용내용내용내용내용내용내용내용내용내용내용내용</TargetContent>
        <TargetDate>00.00.00</TargetDate>
      </Section>
    </PageWrapper>
  );
}

const PageWrapper = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  background: #fff;
`;

const TopButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 32px;
`;

const ActionButton = styled.button`
  width: 80px;
  height: 48px;
  border: none;
  background: #e6e6e6;
  cursor: pointer;
`;

const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 48px;
  padding: 0 16px;
  background: #e6e6e6;
  color: #111;
  text-decoration: none;
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const Label = styled.h3`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
`;

const ValueBox = styled.div`
  min-height: 48px;
  padding: 14px 16px;
  background: #f3f3f3;
`;

const Row = styled.div`
  display: flex;
  gap: 18px;
`;

const FieldBox = styled.div`
  flex: 1;
  min-height: 48px;
  padding: 14px 16px;
  background: #f3f3f3;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FieldLabel = styled.span`
  font-weight: 700;
`;

const FieldValue = styled.span``;

const TextBox = styled.div`
  min-height: 100px;
  padding: 16px;
  background: #f3f3f3;
`;

const StatusBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  height: 42px;
  padding: 0 16px;
  background: #f3f3f3;
`;

const TargetMetaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
`;

const MetaBox = styled.div`
  height: 48px;
  padding: 0 14px;
  background: #f3f3f3;
  display: flex;
  align-items: center;
`;

const TargetContent = styled.div`
  min-height: 48px;
  padding: 14px;
  background: #f3f3f3;
`;

const TargetDate = styled.div`
  margin-top: 10px;
  color: #b8b8b8;
`;

const BottomRow = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
`;
