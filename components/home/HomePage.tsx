"use client";

import styled from "styled-components";
import EventPhotoCard from "@/components/home/EventPhotoCard";
import LoginCard from "@/components/home/LoginCard";
import MeetingMinutesCard from "@/components/home/MeetingMinutesCard";
import NoticeCard from "@/components/home/NoticeCard";
import WeeklyScheduleCard from "@/components/home/WeeklyScheduleCard";
import {
  eventPhotos,
  meetingMinutes,
  notices,
  weeklySchedule,
} from "@/mocks/home";
import { colors, layout, spacing } from "@/styles/tokens";

export default function HomePage() {
  return (
    <Main>
      <ContentGrid>
        <LoginArea>
          <LoginCard />
        </LoginArea>
        <ScheduleArea>
          <WeeklyScheduleCard schedule={weeklySchedule} />
        </ScheduleArea>
        <NoticeArea>
          <NoticeCard notices={notices} />
        </NoticeArea>
        <RightStack>
          <MeetingMinutesCard meetingMinutes={meetingMinutes} />
          <EventPhotoCard photos={eventPhotos} />
        </RightStack>
      </ContentGrid>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.background};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(18rem, 0.78fr) minmax(0, 1.22fr);
  grid-template-areas:
    "login schedule"
    "notice right";
  gap: ${spacing.space24};
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: ${spacing.space40} ${spacing.space20} ${spacing.space47};

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "login"
      "schedule"
      "notice"
      "right";
  }
`;

const LoginArea = styled.div`
  grid-area: login;
`;

const ScheduleArea = styled.div`
  grid-area: schedule;
`;

const NoticeArea = styled.div`
  grid-area: notice;
`;

const RightStack = styled.div`
  grid-area: right;
  display: grid;
  gap: ${spacing.space24};
  align-content: start;
`;
