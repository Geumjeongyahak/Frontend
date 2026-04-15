import PageTemplate from "@/components/common/PageTemplate";
import PageSidebar from "@/components/common/PageSidebar";

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <PageSidebar />
      <main className="flex-1">
        <PageTemplate title="수업 대시보드" description="대시보드 페이지" />
      </main>
    </div>
  );
}
