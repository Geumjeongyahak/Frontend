"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

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
    content: "내용내용내용내용내용내용내용내용내용내용내용내용내용내용",
    createdAt: "00.00.00",
  },
  {
    id: 2,
    className: "개나리반",
    lessonDate: "00.00.00",
    writer: "최양진",
    content: "내용내용내용내용내용내용내용내용내용내용내용내용내용내용",
    createdAt: "00.00.00",
  },
];

export default function ExchangePostPage({ params }: PageProps) {
  const { postId } = params;
  const router = useRouter();

  const handleAcceptProposal = () => {
    router.push(`/staff/class/exchange/${postId}/accepted`);
  };

  return (
    <PageWrapper>
      <TopButtonRow>
        <ActionButton type="button">삭제</ActionButton>
        <ActionButton type="button">수정</ActionButton>
        <LinkButton href="/staff/class/exchange">목록</LinkButton>
      </TopButtonRow>

      <ContentColumn>
        <DateBar>00.00.00</DateBar>

        <PostSection>
          <Label>제목</Label>
          <ValueBox $weight="semibold">제목</ValueBox>

          <Label>신청자 정보</Label>
          <InfoRow>
            <FieldLabel>반 이름</FieldLabel>
            <FieldValue>개나리반</FieldValue>
            <FieldLabel>수업 일자</FieldLabel>
            <FieldValue>00.00.00</FieldValue>
            <FieldLabel>작성자</FieldLabel>
            <FieldValue>홍길동</FieldValue>
          </InfoRow>

          <Label>교환 신청 사유</Label>
          <TextBox>교환 신청 사유</TextBox>

          <Label>만료일</Label>
          <DateBox>00.00.00</DateBox>

          <Label>신청 현황</Label>
          <StatusBox>대기 중</StatusBox>
        </PostSection>

        <Divider />

        <ProposalHeader>
          <ProposalTitle>교환 제안서</ProposalTitle>
          <SecondaryButton type="button">작성 완료</SecondaryButton>
        </ProposalHeader>

        <ProposalForm>
          <ProposalInput placeholder="반 이름" />
          <ProposalInput placeholder="수업 일자" />
          <ProposalInput placeholder="작성자" />
          <ProposalTextarea placeholder="내용" />
        </ProposalForm>

        <ProposalList>
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id}>
              <ProposalMetaRow>
                <ProposalMeta>
                  <MetaLabel>반 이름</MetaLabel>
                  <span>{proposal.className}</span>
                </ProposalMeta>
                <ProposalMeta>
                  <MetaLabel>수업일자</MetaLabel>
                  <span>{proposal.lessonDate}</span>
                </ProposalMeta>
                <ProposalMeta>
                  <MetaLabel>작성자</MetaLabel>
                  <span>{proposal.writer}</span>
                </ProposalMeta>
              </ProposalMetaRow>
              <ProposalContent>{proposal.content}</ProposalContent>
              <ProposalFooter>
                <ProposalDate>{proposal.createdAt}</ProposalDate>
                <AcceptButton type="button" onClick={handleAcceptProposal}>
                  제안 수락하기
                </AcceptButton>
              </ProposalFooter>
            </ProposalCard>
          ))}
        </ProposalList>
      </ContentColumn>
    </PageWrapper>
  );
}

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 1.8125rem 3.125rem 4rem;
  background: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const TopButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  background: #e4e4e4;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    background: #d9d9d9;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  background: #e4e4e4;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    background: #d9d9d9;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1.3125rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space32};
  }
`;

const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #a9a9a9;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const PostSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const Label = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ValueBox = styled.div<{ $weight?: "regular" | "semibold" }>`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: ${({ $weight }) => ($weight === "semibold" ? 600 : 400)};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
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

const FieldLabel = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const FieldValue = styled(ValueBox)`
  min-width: 0;
`;

const TextBox = styled(ValueBox)`
  align-items: flex-start;
  min-height: 6.875rem;
  padding-top: 0.75rem;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding-top: 1.125rem;
  }
`;

const DateBox = styled(ValueBox)`
  width: 7.75rem;

  @media (min-width: 120rem) {
    width: 11.625rem;
  }
`;

const StatusBox = styled(ValueBox)`
  width: fit-content;
  padding-inline: ${spacing.space20};

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid #a9a9a9;
  margin: 0;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space24};
`;

const ProposalTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  background: #a0a0a0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalForm = styled.form`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProposalInput = styled.input`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid #000000;
  background: #e9e9e9;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalTextarea = styled.textarea`
  grid-column: 1 / -1;
  min-height: 6.75rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid #000000;
  background: #e9e9e9;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  resize: none;
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    min-height: 10.0625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};
`;

const ProposalCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.8125rem;
  padding-top: ${spacing.space20};
  border-top: 1px solid #a9a9a9;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: 1.875rem;
  }
`;

const ProposalMetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProposalMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #e8e8e8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    gap: 0.625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const MetaLabel = styled.span`
  color: #878787;
  font-weight: 600;
`;

const ProposalContent = styled.div`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #e8e8e8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space20};
  padding-left: ${spacing.space12};

  @media (min-width: 120rem) {
    padding-left: ${spacing.space20};
  }
`;

const ProposalDate = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const AcceptButton = styled(SecondaryButton)`
  background: #9d9d9d;
`;
