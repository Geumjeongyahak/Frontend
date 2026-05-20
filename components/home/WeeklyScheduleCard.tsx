import dayjs from "dayjs";
import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import type { WeeklyScheduleDay } from "@/types/home";

type WeeklyScheduleCardProps = {
  schedule: WeeklyScheduleDay[];
  onViewAllClick?: () => void;
};

const getMondayBasedIndex = (date = dayjs()) => {
  const d = date.day();
  return d === 0 ? 6 : d - 1;
};

export default function WeeklyScheduleCard({ schedule, onViewAllClick }: WeeklyScheduleCardProps) {
  const todayIndex = getMondayBasedIndex();

  return (
    <Card title="주간 일정" actionLabel="전체일정 보기" onActionClick={onViewAllClick}>
      <Schedule>
        {schedule.map((daySchedule, index) => {
          const isHighlighted = index === todayIndex;

          return (
            <DayColumn key={daySchedule.day} $highlighted={isHighlighted}>
              <DayLabel $highlighted={isHighlighted}>{daySchedule.day}</DayLabel>
              <Divider />
              <ItemList>
                {daySchedule.items.length === 0 ? (
                  <EmptyText>
                    예정된
                    <br />
                    수업이
                    <br />
                    없습니다
                  </EmptyText>
                ) : (
                  <>
                    {daySchedule.items.slice(0, 2).map((item) => (
                      <Item key={`${daySchedule.day}-${item.time}-${item.title}`}>
                        <Time>{item.time}</Time>
                        <ItemTitle>{item.title}</ItemTitle>
                        <Divider />
                      </Item>
                    ))}
                    {daySchedule.items.length > 2 && (
                      <MoreText>
                        ...
                        <Divider />
                      </MoreText>
                    )}
                  </>
                )}
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
  min-height: 18.75rem;
  border: none;
`;

const Schedule = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;

  @media (min-width: 120rem) {
    gap: 1.625rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const DayColumn = styled.article<{ $highlighted: boolean }>`
  min-width: 0;
  min-height: 12.125rem;
  padding: ${spacing.space8} ${spacing.space12};
  border: 0.0625rem solid ${({ $highlighted }) => ($highlighted ? colors.point : colors.white)};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: 18.3125rem;
    padding: ${spacing.space12} ${spacing.space20};
  }
`;

const DayLabel = styled.h3<{ $highlighted: boolean }>`
  color: ${({ $highlighted }) => ($highlighted ? colors.point : colors.muted)};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-align: center;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Divider = styled.div`
  height: 0.0625rem;
  margin: ${spacing.space4} 0 ${spacing.space4};
  background-color: ${colors.border};
`;

const ItemList = styled.div`
  min-height: 8rem;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Time = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ItemTitle = styled.span`
  color: ${colors.text};
  display: -webkit-box;
  overflow: hidden;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: normal;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const MoreText = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const EmptyText = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  text-align: center;
  padding: ${spacing.space12} 0;
`;
