"use client";

import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, spacing, typography } from "@/styles/tokens";
import type { MeetingMinute } from "@/types/home";

type MeetingMinutesCardProps = {
  meetingMinutes: MeetingMinute[];
};

export default function MeetingMinutesCard({ meetingMinutes }: MeetingMinutesCardProps) {
  return (
    <Card title="교직회의록" actionLabel="더보기">
      <List>
        {meetingMinutes.map((minute) => (
          <ListItem key={minute.id}>
            <Title>{minute.title}</Title>
            <Date>{minute.date}</Date>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}

const Card = styled(HomeCard)`
  height: 100%;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.article`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing.space16};
  min-height: 3rem;
  border-bottom: 0.0625rem solid ${colors.border};
`;

const Title = styled.h3`
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Date = styled.time`
  color: ${colors.muted};
  font-size: ${typography.fontSize18};
  line-height: ${typography.lineHeight130};
  font-weight: 300;
  white-space: nowrap;
`;
