import StaffCalendarPage from "@/components/staff/calendar/StaffCalendarPage";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

function isValidIsoDate(date?: string) {
  return Boolean(date && /^\d{4}-\d{2}-\d{2}$/.test(date));
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const today = new Date();
  const selectedDate = isValidIsoDate(resolvedSearchParams?.date)
    ? resolvedSearchParams?.date
    : undefined;
  const selectedDateObject = selectedDate ? new Date(`${selectedDate}T00:00:00`) : today;

  return (
    <StaffCalendarPage
      key={selectedDate ?? `${today.getFullYear()}-${today.getMonth() + 1}`}
      initialYear={selectedDateObject.getFullYear()}
      initialMonth={selectedDateObject.getMonth() + 1}
      initialSelectedDate={selectedDate}
    />
  );
}
