"use client";

import Link from "next/link";
import styled from "styled-components";

type PageProps = {
  params: {
    postId: string;
  };
};

const proposals = [
  {
    id: 1,
    className: "개나리반",
    lessonDate: "00.00.00",
    writer: "최양진",
    content: "내용내용내용내용내용내용내용내용내용내용내용내용",
    createdAt: "00.00.00",
  },
  {
    id: 2,
    className: "개나리반",
    lessonDate: "00.00.00",
    writer: "최양진",
    content: "내용내용내용내용내용내용내용내용내용내용내용내용",
    createdAt: "00.00.00",
  },
];

export default function ExchangePostAcceptedPage({ params }: PageProps) {
  const { postId } = params;

  return (
    <PageWrapper>
      <TopButtonRow>
        <ActionButton type="button">삭제</ActionButton>
        <ActionButton type="button">수정</ActionButton>
        <LinkButton href="/exchange-posts">목록</LinkButton>
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
        <Label>만료일</Label>
        <ValueBoxSmall>00.00.00</ValueBoxSmall>
      </Section>

      <Section>
        <Label>신청 현황</Label>
        <StatusBox>대기 중</StatusBox>
      </Section>

      <Divider />

      <ProposalHeader>
        <ProposalTitle>교환 제안서</ProposalTitle>
        <ActionButton type="button">작성 완료</ActionButton>
      </ProposalHeader>

      <FormRow>
        <Input placeholder="반 이름" />
        <Input placeholder="수업 일자" />
        <Input placeholder="작성자" />
      </FormRow>

      <Textarea placeholder="내용" />

      <ProposalList>
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id}>
            <MetaRow>
              <MetaBox>• {proposal.className}</MetaBox>
              <MetaBox>• {proposal.lessonDate}</MetaBox>
              <MetaBox>• {proposal.writer}</MetaBox>
            </MetaRow>

            <ContentBox>{proposal.content}</ContentBox>

            <CardBottom>
              <DateText>{proposal.createdAt}</DateText>
              <ActionButton type="button">제안 수락하기</ActionButton>
            </CardBottom>
          </ProposalCard>
        ))}
      </ProposalList>

      <BottomRow>
        <LinkButton href={`/exchange-posts/${postId}`}>기본 상세로 돌아가기</LinkButton>
      </BottomRow>
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
  min-width: 80px;
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

const ValueBoxSmall = styled.div`
  width: 120px;
  height: 48px;
  padding: 0 12px;
  background: #f3f3f3;
  display: flex;
  align-items: center;
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

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #d7d7d7;
  margin: 32px 0 28px;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ProposalTitle = styled.h2`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const Input = styled.input`
  height: 48px;
  padding: 0 14px;
  border: 1px solid #999;
  outline: none;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 14px;
  border: 1px solid #999;
  resize: none;
  outline: none;
  margin-bottom: 24px;
`;

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const ProposalCard = styled.article`
  border-top: 1px solid #d7d7d7;
  padding-top: 18px;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const MetaBox = styled.div`
  height: 48px;
  padding: 0 14px;
  background: #f3f3f3;
  display: flex;
  align-items: center;
`;

const ContentBox = styled.div`
  min-height: 48px;
  padding: 14px;
  background: #f3f3f3;
`;

const CardBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 12px;
`;

const DateText = styled.span`
  color: #b8b8b8;
`;

const BottomRow = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
`;
