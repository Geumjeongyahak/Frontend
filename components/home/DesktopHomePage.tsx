import styled from "styled-components";
import EventPhotoCard from "@/components/home/EventPhotoCard";
import LoginCard from "@/components/home/LoginCard";
import MeetingRecordsCard from "@/components/home/MeetingRecordsCard";
import NoticeCard from "@/components/home/NoticeCard";
import WeeklySchedulePanel from "@/components/home/WeeklySchedulePanel";
import { colors, layout, spacing } from "@/styles/tokens";

export default function DesktopHomePage() {
  return (
    <Main>
      <Content>
        <TopRow>
          <LoginArea>
            <LoginCard />
          </LoginArea>

          <ScheduleArea>
            <WeeklySchedulePanel />
          </ScheduleArea>
        </TopRow>

        <BottomGrid>
          <NoticeArea>
            <NoticeCard />
          </NoticeArea>

          <MeetingArea>
            <MeetingRecordsCard />
          </MeetingArea>

          <EventArea>
            <EventPhotoCard />
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
  display: grid;
  gap: 1.5rem;
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  margin: 0 auto;
  padding: ${spacing.space28} ${spacing.space20} ${spacing.space32};

  @media (min-width: 120rem) {
    gap: ${spacing.space40};
    max-width: ${layout.homeMaxWidthLarge};
    padding-top: ${spacing.space46};
    padding-bottom: ${spacing.space47};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding-bottom: 8rem;
  }
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 23.083rem minmax(0, 1fr);
  gap: 1.9375rem;
  min-height: 18.75rem;

  @media (min-width: 120rem) {
    grid-template-columns: 34.625rem minmax(0, 1fr);
    gap: ${spacing.space47};
    min-height: 26.5rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 34.625rem minmax(0, 1fr);
  grid-template-areas:
    "notice meeting"
    "notice event";
  align-items: start;
  gap: 1.5rem 1.9375rem;

  @media (min-width: 120rem) {
    grid-template-columns: 51.9375rem minmax(0, 1fr);
    gap: 2.1875rem 2.9375rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "notice"
      "meeting"
      "event";
  }
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
  min-height: 19.5rem;

  @media (min-width: 120rem) {
    min-height: 27.25rem;
  }
`;

const EventArea = styled.div`
  grid-area: event;
  align-self: start;
`;
