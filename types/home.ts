export type Notice = {
  id: number;
  title: string;
  date: string;
};

export type MeetingRecord = {
  id: number;
  title: string;
  date: string;
};

export type EventPhoto = {
  id: number;
  title: string;
  date: string;
  imageUrl: string;
};

export type WeeklyScheduleItem = {
  id?: number;
  type?: "event" | "lesson";
  time: string;
  title: string;
  date?: string;
  classroomName?: string;
  periods?: Array<{
    period: number;
    subjectName: string;
    status?: string;
  }>;
};

export type WeeklyScheduleDay = {
  day: string;
  items: WeeklyScheduleItem[];
};

export type HeaderDropdownMenu = {
  label: string;
  href: string;
  items: {
    label: string;
    href: string;
  }[];
};
