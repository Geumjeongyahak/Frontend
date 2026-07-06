"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getMeetingRecords } from "@/api/meetingRecord/meetingRecord.api";
import HomeCard from "@/components/home/HomeCard";
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { queryKeys } from "@/lib/queryKeys";
import { colors, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const RECENT_MEETING_RECORDS_SIZE = 5;

export default function MeetingRecordsCard() {
  const { isAuthenticated, navigateWhenAuthenticated } = useProtectedHomeNavigation();
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.meetingRecords.list({
      page: 0,
      size: RECENT_MEETING_RECORDS_SIZE,
    }),
    queryFn: () =>
      getMeetingRecords({
        page: 0,
        size: RECENT_MEETING_RECORDS_SIZE,
      }),
    enabled: isAuthenticated,
    retry: false,
  });

  const meetingRecords = data?.content ?? [];

  return (
    <Card
      title="교학회의록"
      actionLabel="더보기"
      onActionClick={() => navigateWhenAuthenticated("/staff/archive/meeting-records")}
    >
      <List>
        {!isAuthenticated && <Fallback>로그인이 필요합니다.</Fallback>}
        {isAuthenticated && isLoading && <Fallback>교학 회의록 불러오는 중...</Fallback>}
        {isAuthenticated && isError && <Fallback>교학 회의록을 불러오지 못했습니다.</Fallback>}
        {isAuthenticated && !isLoading && !isError && meetingRecords.length === 0 && (
          <Fallback>교학 회의록이 없습니다.</Fallback>
        )}
        {isAuthenticated &&
          !isLoading &&
          !isError &&
          meetingRecords.map((minute) => (
            <ListItem
              key={minute.id}
              type="button"
              onClick={() =>
                minute.id
                  ? navigateWhenAuthenticated(`/staff/archive/meeting-records/${minute.id}`)
                  : undefined
              }
            >
              <Title>{minute.title ?? "제목 없음"}</Title>
              <Date>{formatUtcToKstShortDate(minute.createdAt)}</Date>
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
  min-height: 13.125rem;

  @media (min-width: 120rem) {
    min-height: 18.4375rem;
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

const ListItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: ${spacing.space16};
  min-height: 2.625rem;
  border: 0;
  border-bottom: 0.0625rem solid ${colors.border};
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;

  &:hover ${Title}, &:focus-visible ${Title} {
    color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 3.6875rem;
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
