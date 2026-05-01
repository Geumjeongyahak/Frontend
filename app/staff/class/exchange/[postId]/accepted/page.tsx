"use client";

import Link from "next/link";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

const exchangeTarget = {
  className: "개나리반",
  lessonDate: "00.00.00",
  writer: "최양진",
  content: "내용내용내용내용내용내용내용내용내용내용내용내용내용내용",
};

export default function ExchangeAcceptedPage() {
  return (
    <PageWrapper>
      <TopButtonRow>
        <ActionButton type="button">삭제</ActionButton>
        <ActionButton type="button">수정</ActionButton>
        <LinkButton href="/staff/class/exchange">목록</LinkButton>
      </TopButtonRow>

      <ContentColumn>
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

          <Label>신청 현황</Label>
          <StatusBox>대기 중</StatusBox>

          <Label>교환 대상</Label>
          <TargetSection>
            <TargetMetaRow>
              <TargetMeta>
                <MetaLabel>반 이름</MetaLabel>
                <span>{exchangeTarget.className}</span>
              </TargetMeta>
              <TargetMeta>
                <MetaLabel>수업일자</MetaLabel>
                <span>{exchangeTarget.lessonDate}</span>
              </TargetMeta>
              <TargetMeta>
                <MetaLabel>작성자</MetaLabel>
                <span>{exchangeTarget.writer}</span>
              </TargetMeta>
            </TargetMetaRow>

            <TargetContent>{exchangeTarget.content}</TargetContent>
            <ChangeTargetButton type="button">교환 대상 변경하기</ChangeTargetButton>
          </TargetSection>
        </PostSection>
      </ContentColumn>
    </PageWrapper>
  );
}

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 0.3125rem 3.125rem 4rem;
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
  margin-bottom: ${spacing.space20};

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
  width: 100%;
`;

const PostSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

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
  min-height: 5.1875rem;
  padding-top: 0.75rem;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding-top: 1.125rem;
  }
`;

const StatusBox = styled(ValueBox)`
  width: fit-content;
  padding-inline: ${spacing.space20};

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;

const TargetSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${spacing.space8};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const TargetMetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};
  width: 100%;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const TargetMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f7f7f7;
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

const TargetContent = styled.div`
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f7f7f7;
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

const ChangeTargetButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  background: #9d9d9d;
  color: #1c1c1c;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    background: #8f8f8f;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
