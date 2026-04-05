"use client";

import styled from "styled-components";
import EventPhotoCard from "@/components/home/EventPhotoCard";
import LoginCard from "@/components/home/LoginCard";
import MeetingMinutesCard from "@/components/home/MeetingMinutesCard";
import NoticeCard from "@/components/home/NoticeCard";
import WeeklyScheduleCard from "@/components/home/WeeklyScheduleCard";
import { eventPhotos, meetingMinutes, notices, weeklySchedule } from "@/mocks/home";
import { colors, layout, spacing } from "@/styles/tokens";

export default function HomePage() {
  return (
    <Main>
      <Content>
        <TopRow>
          <LoginArea>
            <LoginCard />
          </LoginArea>

          <ScheduleArea>
            <WeeklyScheduleCard schedule={weeklySchedule} />
          </ScheduleArea>
        </TopRow>

        <BottomGrid>
          <NoticeArea>
            <NoticeCard notices={notices} />
          </NoticeArea>

          <MeetingArea>
            <MeetingMinutesCard meetingMinutes={meetingMinutes} />
          </MeetingArea>

          <EventArea>
            <EventPhotoCard photos={eventPhotos} />
          </EventArea>
        </BottomGrid>
      </Content>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.background};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space40};
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: ${spacing.space40} ${spacing.space20} ${spacing.space47};
`;

const TopRow = styled.div`
  display: flex;
  min-height: 20rem;
  gap: ${spacing.space24};
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  grid-template-areas:
    "notice meeting"
    "notice event";
  gap: ${spacing.space24};
`;

const LoginArea = styled.div`
  height: 100%;
`;

const ScheduleArea = styled.div`
  height: 100%;
`;

const NoticeArea = styled.div`
  grid-area: notice;
`;

const MeetingArea = styled.div`
  grid-area: meeting;
`;

const EventArea = styled.div`
  grid-area: event;
`;
