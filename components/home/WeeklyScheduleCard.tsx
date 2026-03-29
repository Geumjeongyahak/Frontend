"use client";

import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import type { WeeklyScheduleDay } from "@/types/home";

type WeeklyScheduleCardProps = {
  schedule: WeeklyScheduleDay[];
};

export default function WeeklyScheduleCard({
  schedule,
}: WeeklyScheduleCardProps) {
  return (
    <Card title="주간 일정" actionLabel="전체일정 보기">
      <ScheduleGrid>
        {schedule.map((daySchedule, index) => {
          const isHighlighted = daySchedule.day === "토";

          return (
            <DayColumn key={daySchedule.day} $highlighted={isHighlighted}>
              <DayLabel>{daySchedule.day}</DayLabel>
              <Divider />
              <ItemList>
                {daySchedule.items.map((item) => (
                  <Item key={`${daySchedule.day}-${item.time}-${item.title}`}>
                    <Time>{item.time}</Time>
                    <ItemTitle>{item.title}</ItemTitle>
                  </Item>
                ))}
                {index < schedule.length - 1 ? <MoreText>...</MoreText> : null}
              </ItemList>
            </DayColumn>
          );
        })}
      </ScheduleGrid>
    </Card>
  );
}

const Card = styled(HomeCard)`
  height: 100%;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: ${spacing.space16};

  @media (max-width: 80rem) {
    grid-template-columns: repeat(7, minmax(8rem, 1fr));
    overflow-x: auto;
    padding-bottom: ${spacing.space8};
  }
`;

const DayColumn = styled.article<{ $highlighted: boolean }>`
  min-width: 0;
  padding: ${spacing.space16};
  border: 0.0625rem solid
    ${({ $highlighted }) => ($highlighted ? colors.point : colors.white)};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
`;

const DayLabel = styled.h3`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-align: center;
`;

const Divider = styled.div`
  height: 0.0625rem;
  margin: ${spacing.space12} 0 ${spacing.space12};
  background-color: ${colors.border};
`;

const ItemList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const Item = styled.div`
  display: grid;
  gap: 0.25rem;
`;

const Time = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

const ItemTitle = styled.span`
  display: -webkit-box;
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight150};
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MoreText = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;
