"use client";

import { IconArrowsExchange, IconChevronRight, IconCreditCardPay } from "@tabler/icons-react";
import styled from "styled-components";
import {
  MOBILE_HOME_CARD_RADIUS,
  MOBILE_HOME_CARD_SHADOW,
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_SECTION_TITLE_FONT,
  mobileHomeTone,
} from "@/pwa/pages/mobile-home/constants";

type RequestShortcutSectionProps = {
  onPaymentClick: () => void;
  onClassRequestClick: () => void;
};

export default function RequestShortcutSection({
  onPaymentClick,
  onClassRequestClick,
}: RequestShortcutSectionProps) {
  return (
    <Section>
      <Title>신청서 작성하기</Title>
      <Grid>
        <ShortcutButton type="button" onClick={onPaymentClick}>
          <IconWrap $tone="payment">
            <IconCreditCardPay size={24} stroke={1.85} />
          </IconWrap>
          <TextGroup>
            <CardTitle>결제 신청</CardTitle>
            <CardDescription>
              필요한 품목에 대해 결제 신청을 작성하고 진행 상태를 확인합니다.
            </CardDescription>
          </TextGroup>
          <ArrowWrap>
            <IconChevronRight size={18} stroke={2} />
          </ArrowWrap>
        </ShortcutButton>

        <ShortcutButton type="button" onClick={onClassRequestClick}>
          <IconWrap $tone="class">
            <IconArrowsExchange size={24} stroke={1.85} />
          </IconWrap>
          <TextGroup>
            <CardTitle>교환 · 결강 신청</CardTitle>
            <CardDescription>수업 교환 및 결강을 신청하고 신청 내역을 확인합니다.</CardDescription>
          </TextGroup>
          <ArrowWrap>
            <IconChevronRight size={18} stroke={2} />
          </ArrowWrap>
        </ShortcutButton>
      </Grid>
    </Section>
  );
}

const Section = styled.section`
  display: grid;
  gap: 1rem;
  margin-top: 5vw;
  padding-inline: ${MOBILE_HOME_INLINE_SPACE};
  padding-bottom: 8vw;
`;

const Title = styled.h2`
  color: ${mobileHomeTone.strong};
  font-size: ${MOBILE_HOME_SECTION_TITLE_FONT};
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  gap: 0.875rem;
`;

const ShortcutButton = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 1.125rem 1rem;
  border: 0;
  border-radius: ${MOBILE_HOME_CARD_RADIUS};
  background: ${mobileHomeTone.white};
  box-shadow: ${MOBILE_HOME_CARD_SHADOW};
  text-align: left;
`;

const IconWrap = styled.span<{ $tone: "payment" | "class" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.125rem;
  color: ${({ $tone }) => ($tone === "payment" ? "#346f1f" : "#13596b")};
  background: ${({ $tone }) =>
    $tone === "payment"
      ? "linear-gradient(135deg, rgba(136, 205, 90, 0.32) 0%, rgba(95, 192, 119, 0.24) 100%)"
      : "linear-gradient(135deg, rgba(107, 199, 214, 0.28) 0%, rgba(172, 222, 195, 0.24) 100%)"};
`;

const TextGroup = styled.span`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;

const CardTitle = styled.span`
  color: ${mobileHomeTone.strong};
  font-size: 1rem;
  font-weight: 700;
`;

const CardDescription = styled.span`
  color: ${mobileHomeTone.muted};
  font-size: 0.8125rem;
  line-height: 1.45;
  word-break: keep-all;
`;

const ArrowWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${mobileHomeTone.muted};
`;
