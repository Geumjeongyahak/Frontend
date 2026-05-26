"use client";

import {
  SectionCard,
  SectionDescription,
  SectionTitle,
  StatePanel,
} from "@/components/admin/AdminDashboardSectionParts";

export function AdminLessonManagementSection() {
  return (
    <SectionCard>
      <SectionTitle>수업 관리</SectionTitle>
      <SectionDescription>수업 목록을 조회하고 새 수업을 생성합니다.</SectionDescription>
      <StatePanel>수업 관리 화면을 준비 중입니다.</StatePanel>
    </SectionCard>
  );
}
