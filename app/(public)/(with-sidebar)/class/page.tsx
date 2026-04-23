"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";
import PageTemplate from "@/components/common/PageTemplate";
export default function Page() {
  const router = useRouter();

  const handleCreateClassNote = () => {
    router.push("/class/new");
  };

  return (
    <main className="flex-1">
      <ButtonWrapper onClick={handleCreateClassNote}>새 수업 일지 작성하기</ButtonWrapper>
      <PageTemplate title="수업 대시보드" description="대시보드 페이지" />
    </main>
  );
}

const ButtonWrapper = styled.button`
  position: fixed;
  right: 40px;
  top: 100px;

  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;

  background-color: #e5e7eb;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #d1d5db;
  }
`;
