import StaffCalendarPage from "@/components/staff/calendar/StaffCalendarPage";

export const dynamic = "force-dynamic";

export default function Page() {
  const today = new Date();

  return (
    <StaffCalendarPage initialYear={today.getFullYear()} initialMonth={today.getMonth() + 1} />
  );
}
