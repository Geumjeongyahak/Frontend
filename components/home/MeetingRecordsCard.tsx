"use client";

import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { colors, spacing, typography } from "@/styles/tokens";
import type { MeetingRecord } from "@/types/home";

type MeetingRecordsCardProps = {
  meetingRecords: MeetingRecord[];
};

export default function MeetingRecordsCard({ meetingRecords }: MeetingRecordsCardProps) {
  const { isAuthenticated, navigateWhenAuthenticated } = useProtectedHomeNavigation();

  return (
    <Card
      title="교학회의록"
      actionLabel="더보기"
      onActionClick={() => navigateWhenAuthenticated("/staff/archive/meeting-records")}
    >
      <List>
        {!isAuthenticated ? (
          <Fallback>로그인이 필요합니다.</Fallback>
        ) : (
          meetingRecords.map((minute) => (
            <ListItem key={minute.id}>
              <Title>{minute.title}</Title>
              <Date>{minute.date}</Date>
            </ListItem>
          ))
        )}
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
  min-height: 2.625rem;
  border-bottom: 0.0625rem solid ${colors.border};

  @media (min-width: 120rem) {
    min-height: 3.6875rem;
  }
`;

const Title = styled.h3`
  min-width: 0;
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const Date = styled.time`
  color: ${colors.muted};
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight130};
  font-weight: 300;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const Fallback = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  padding: ${spacing.space8} 0;
`;
