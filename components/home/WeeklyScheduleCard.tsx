"use client";

import dayjs from "dayjs";
import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import type { WeeklyScheduleDay } from "@/types/home";

type WeeklyScheduleCardProps = {
  schedule: WeeklyScheduleDay[];
};

const getMondayBasedIndex = (date = dayjs()) => {
  const d = date.day();
  return d === 0 ? 6 : d - 1;
};

export default function WeeklyScheduleCard({ schedule }: WeeklyScheduleCardProps) {
  const todayIndex = getMondayBasedIndex();

  return (
    <Card title="주간 일정" actionLabel="전체일정 보기">
      <Schedule>
        {schedule.map((daySchedule, index) => {
          const isHighlighted = index === todayIndex;

          return (
            <DayColumn key={daySchedule.day} $highlighted={isHighlighted}>
              <DayLabel $highlighted={isHighlighted}>{daySchedule.day}</DayLabel>
              <Divider />
              <ItemList>
                {daySchedule.items.slice(0, 2).map((item) => (
                  <Item key={`${daySchedule.day}-${item.time}-${item.title}`}>
                    <Time>{item.time}</Time>
                    <ItemTitle>{item.title}</ItemTitle>
                    <Divider />
                  </Item>
                ))}
                {daySchedule.items.length > 2 && <MoreText>...</MoreText>}
                <Divider />
              </ItemList>
            </DayColumn>
          );
        })}
      </Schedule>
    </Card>
  );
}

const Card = styled(HomeCard)`
  width: 100%;
  height: 100%;
  border: none;
`;

const Schedule = styled.div`
  display: flex;
`;

const DayColumn = styled.article<{ $highlighted: boolean }>`
  min-width: 0;
  padding: ${spacing.space16};
  border: 0.0625rem solid ${({ $highlighted }) => ($highlighted ? colors.point : colors.white)};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
`;

const DayLabel = styled.h3<{ $highlighted: boolean }>`
  color: ${({ $highlighted }) => ($highlighted ? colors.point : colors.muted)};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-align: center;
`;

const Divider = styled.div`
  height: 0.0625rem;
  margin: ${spacing.space4} 0 ${spacing.space4};
  background-color: ${colors.border};
`;

const ItemList = styled.div``;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Time = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

const ItemTitle = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const MoreText = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;
