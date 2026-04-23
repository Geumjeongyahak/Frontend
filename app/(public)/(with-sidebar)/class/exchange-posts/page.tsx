"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";

const mockRows = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  no: "01",
  className: "개나리반",
  title: "개나리반 수학 수업 교환 신청합니다",
  author: "작성자",
  date: "00.00.00",
  status: "대기 중",
}));

export default function Page() {
  const router = useRouter();

  const handleCreateExchangeNote = () => {
    router.push("/class/exchange/new");
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-20">
        <HeaderRow>
          <Title>수업 교환</Title>
          <WriteButton type="button" onClick={handleCreateExchangeNote}>
            수업 교환 신청하기
          </WriteButton>
        </HeaderRow>

        <TableSection>
          <Table>
            <thead>
              <tr>
                <Th width="72px">no.</Th>
                <Th width="120px">반</Th>
                <Th>제목</Th>
                <Th width="140px">작성자</Th>
                <Th width="140px">작성일</Th>
                <Th width="140px">신청 현황</Th>
              </tr>
            </thead>

            <tbody>
              {mockRows.map((row) => (
                <Tr key={row.id}>
                  <Td width="72px">{row.no}</Td>
                  <Td width="120px">{row.className}</Td>
                  <TitleTd>{row.title}</TitleTd>
                  <Td width="140px">{row.author}</Td>
                  <Td width="140px">{row.date}</Td>
                  <Td width="140px">{row.status}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableSection>

        <BottomRow>
          <ToggleArea>
            <ToggleLabel>내가 작성한 신청서만 보기</ToggleLabel>
            <ToggleButton type="button" aria-label="내 신청서만 보기">
              <ToggleThumb />
            </ToggleButton>
          </ToggleArea>
        </BottomRow>
      </main>
    </div>
  );
}

const Container = styled.main`
  min-height: 100vh;
  padding: 40px 56px 48px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const WriteButton = styled.button`
  padding: 14px 24px;
  border: none;
  background: #e9e9e9;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
`;

const TableSection = styled.section`
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th<{ width?: string }>`
  width: ${({ width }) => width ?? "auto"};
  padding: 0 20px 14px;
  border-bottom: 1px solid #a8a8a8;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #a8a8a8;
`;

const Td = styled.td<{ width?: string }>`
  width: ${({ width }) => width ?? "auto"};
  padding: 14px 20px;
  font-size: 15px;
  text-align: center;
  white-space: nowrap;
`;

const TitleTd = styled.td`
  padding: 14px 20px;
  font-size: 15px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 48px;
`;

const ToggleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ToggleLabel = styled.span`
  font-size: 15px;
`;

const ToggleButton = styled.button`
  position: relative;
  width: 48px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: #d9d9d9;
  cursor: pointer;
  padding: 0;
`;

const ToggleThumb = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6d6d6d;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 auto;
`;

const ArrowButton = styled.button`
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: #666;
`;

const PageNumber = styled.button<{ $active?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  font-size: 16px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? "#111" : "#9a9a9a")};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
`;
