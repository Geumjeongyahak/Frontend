export type Notice = {
  id: number;
  title: string;
  date: string;
};

export type MeetingMinute = {
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
  time: string;
  title: string;
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
