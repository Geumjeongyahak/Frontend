"use client";

import { IconBook2, IconChevronRight, IconPencil } from "@tabler/icons-react";
import styled from "styled-components";
import {
  MOBILE_HOME_CARD_RADIUS,
  MOBILE_HOME_CARD_SHADOW,
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_SECTION_TITLE_FONT,
  mobileHomeTone,
} from "@/pwa/pages/mobile-home/constants";

type ClassJournalShortcutSectionProps = {
  onWriteClick: () => void;
  onListClick: () => void;
};

export default function ClassJournalShortcutSection({
  onWriteClick,
  onListClick,
}: ClassJournalShortcutSectionProps) {
  return (
    <Section>
      <Title>수업 일지 작성하기</Title>
      <Grid>
        <ShortcutButton type="button" onClick={onWriteClick}>
          <IconWrap>
            <IconPencil size={24} stroke={1.85} />
          </IconWrap>
          <TextGroup>
            <CardTitle>새 수업 일지 작성</CardTitle>
            <CardDescription>오늘의 수업 내용을 작성하고 퇴근을 마무리합니다.</CardDescription>
          </TextGroup>
          <ArrowWrap>
            <IconChevronRight size={18} stroke={2} />
          </ArrowWrap>
        </ShortcutButton>
        <ShortcutButton type="button" onClick={onListClick}>
          <IconWrap>
            <IconBook2 size={24} stroke={1.85} />
          </IconWrap>
          <TextGroup>
            <CardTitle>수업 일지 목록</CardTitle>
            <CardDescription>작성된 수업 일지를 확인합니다.</CardDescription>
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

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.125rem;
  color: #6a4d93;
  background: linear-gradient(135deg, rgba(190, 166, 244, 0.32) 0%, rgba(225, 211, 255, 0.28) 100%);
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
