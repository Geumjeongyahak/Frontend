export type MobileHomeDayValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MobileHomeDay = {
  value: MobileHomeDayValue;
  label: string;
};

export type MobileScheduleMode = "all" | "mine";

export type MyLessonCardItem = {
  id: string;
  dayValue: MobileHomeDayValue;
  title: string;
  classroomName?: string;
  subjectName?: string;
  timeLabel: string;
  date?: string;
  isCancelled: boolean;
  periods: Array<{
    period?: number;
    subjectName?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }>;
};

export type WeeklyScheduleListItem = {
  id: string;
  dayValue: MobileHomeDayValue;
  title: string;
  timeLabel: string;
  date?: string;
  classroomName?: string;
  kind: "lesson" | "event";
  isCancelled: boolean;
  emoji?: string;
  description?: string;
  periods?: Array<{
    period?: number;
    subjectName?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }>;
};
