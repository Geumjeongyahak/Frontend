import StaffSidebar from "@/components/staff/StaffSidebar";

export default function ClassLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <StaffSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
