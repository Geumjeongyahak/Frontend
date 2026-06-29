"use client";

import { IconChevronRight, IconLayoutGrid } from "@tabler/icons-react";
import styled from "styled-components";
import {
  MOBILE_HOME_CARD_RADIUS,
  MOBILE_HOME_CARD_SHADOW,
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_SECTION_TITLE_FONT,
  mobileHomeTone,
} from "@/pwa/pages/mobile-home/constants";

type TimetableShortcutSectionProps = {
  onScheduleClick: () => void;
};

export default function TimetableShortcutSection({
  onScheduleClick,
}: TimetableShortcutSectionProps) {
  return (
    <Section>
      <Title>시간표 보기</Title>
      <Grid>
        <ShortcutButton type="button" onClick={onScheduleClick}>
          <IconWrap>
            <IconLayoutGrid size={24} stroke={1.85} />
          </IconWrap>
          <TextGroup>
            <CardTitle>주간 시간표</CardTitle>
            <CardDescription>
              주차별 수업 편성과 교환, 결강, 대체 상태를 한 번에 확인합니다.
            </CardDescription>
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
  color: #72511a;
  background: linear-gradient(135deg, rgba(255, 227, 134, 0.34) 0%, rgba(255, 244, 200, 0.3) 100%);
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
