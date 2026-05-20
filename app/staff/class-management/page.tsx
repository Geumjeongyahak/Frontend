import Link from "next/link";
import { IconEdit } from "@tabler/icons-react";
import styled from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

const classJournalTemplates = [
  { id: 1, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 2, className: "장미반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 3, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 4, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 5, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 6, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 7, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
  { id: 8, className: "주말 스마트폰반 수학", teacher: "최양진", date: "26.00.00" },
];

const JOURNALS_PER_PAGE = 8;
const classJournals = Array.from({ length: 40 }, (_, index) => {
  const template = classJournalTemplates[index % classJournalTemplates.length];
  const id = index + 1;

  return {
    ...template,
    id,
  };
});

const journalLessons = [
  { period: "1교시", content: "수업일지 내용 수업일지 내용" },
  { period: "2교시", content: "수업일지 내용 수업일지 내용 수업일지 내용" },
  { period: "3교시", content: "수업일지 내용 수업일지 내용 수업일지 내용" },
];

function buildPageHref(page: number) {
  return page === 1 ? "/staff/class-management" : `/staff/class-management?page=${page}`;
}

export default async function StaffClassPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const pageParam = Number(resolvedSearchParams?.page);
  const totalPages = Math.ceil(classJournals.length / JOURNALS_PER_PAGE);
  const currentPage = Number.isInteger(pageParam)
    ? Math.min(Math.max(pageParam, 1), totalPages)
    : 1;
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const startIndex = (currentPage - 1) * JOURNALS_PER_PAGE;
  const visibleJournals = classJournals.slice(startIndex, startIndex + JOURNALS_PER_PAGE);

  return (
    <PageSection>
      <HeaderRow>
        <Title>수업 일지</Title>
        <ActionGroup>
          <ActionButton type="button">수업 일지 출력</ActionButton>
          <ActionLink href="/staff/class-management/class-journal">
            <span>새 수업 일지 작성하기</span>
            <IconEdit aria-hidden="true" size={16} stroke={2} />
          </ActionLink>
        </ActionGroup>
      </HeaderRow>

      <JournalGrid aria-label="수업 일지 목록">
        {visibleJournals.map((journal) => (
          <JournalCard key={journal.id} href={`/staff/class-management/${journal.id}`}>
            <LessonList>
              {journalLessons.map((lesson) => (
                <LessonItem key={lesson.period}>
                  <Period>{lesson.period}</Period>
                  <LessonContent>{lesson.content}</LessonContent>
                </LessonItem>
              ))}
            </LessonList>

            <CardFooter>
              <ClassName>{journal.className}</ClassName>
              <MetaGroup>
                <Teacher>{journal.teacher}</Teacher>
                <DateText>{journal.date}</DateText>
              </MetaGroup>
            </CardFooter>
          </JournalCard>
        ))}
      </JournalGrid>

      <FooterRow>
        <MineOnlyLabel>
          <span>내가 작성한 일지만 보기</span>
          <SwitchInput type="checkbox" aria-label="내가 작성한 일지만 보기" />
          <SwitchTrack aria-hidden="true">
            <SwitchThumb />
          </SwitchTrack>
        </MineOnlyLabel>

        <Pagination aria-label="페이지 이동">
          <PageArrow
            href={buildPageHref(prevPage)}
            aria-label="이전 페이지"
            $isDisabled={currentPage === 1}
          >
            ◀
          </PageArrow>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <PageNumber
                key={pageNumber}
                href={buildPageHref(pageNumber)}
                $isActive={pageNumber === currentPage}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber}
              </PageNumber>
            );
          })}
          <PageArrow
            href={buildPageHref(nextPage)}
            aria-label="다음 페이지"
            $isDisabled={currentPage === totalPages}
          >
            ▶
          </PageArrow>
        </Pagination>
      </FooterRow>
    </PageSection>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 0;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 3.875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 2.1875rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.125rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: #eef9e6;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: #eef9e6;
  }

  svg {
    flex: 0 0 auto;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const JournalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem 1.375rem;

  @media (min-width: 120rem) {
    gap: 1.875rem 2.0625rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const JournalCard = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 12.6875rem;
  color: #000000;
  text-decoration: none;
  border: 1px solid #88cd5a;
  overflow: hidden;
  border-radius: ${radii.radius20};

  @media (min-width: 120rem) {
    height: 19.0625rem;
  }
`;

const LessonList = styled.div`
  display: grid;
  gap: 0.625rem;
  padding: 1.1875rem ${spacing.space16} 1rem;

  @media (min-width: 120rem) {
    gap: 0.6875rem;
    padding: 1.8125rem ${spacing.space24} 1.5rem;
  }
`;

const LessonItem = styled.div`
  display: grid;
  gap: 0.375rem;

  @media (min-width: 120rem) {
    gap: 0.875rem;
  }
`;

const Period = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const LessonContent = styled.p`
  margin: 0;
  overflow: hidden;
  color: #000000;
  font-size: 0.6875rem;
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const CardFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space8};
  min-height: 2.625rem;
  padding: 0 ${spacing.space16};
  background-color: #88cd5a;

  @media (min-width: 120rem) {
    min-height: 3.9375rem;
    padding: 0 ${spacing.space24};
  }
`;

const ClassName = styled.strong`
  min-width: 0;
  overflow: hidden;
  color: #ffffff;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const MetaGroup = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${spacing.space8};

  @media (min-width: 120rem) {
    gap: 0.8125rem;
  }
`;

const Teacher = styled.span`
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const DateText = styled(Teacher)``;

const FooterRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2.5rem;

  @media (min-width: 120rem) {
    margin-top: 3.25rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing.space24};
  }
`;

const MineOnlyLabel = styled.label`
  position: absolute;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    gap: 1.1875rem;
    font-size: ${typography.fontSize20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    position: static;
  }
`;

const SwitchInput = styled.input`
  position: absolute;
  opacity: 0;

  &:checked + span {
    background-color: #eef9e6;
  }

  &:checked + span span {
    transform: translateX(1.3125rem);
    background-color: #88cd5a;

    @media (min-width: 120rem) {
      transform: translateX(2.125rem);
    }
  }

  &:focus-visible + span {
    outline: 2px solid ${colors.point};
    outline-offset: 3px;
  }
`;

const SwitchTrack = styled.span`
  position: relative;
  display: inline-flex;
  width: 3rem;
  height: 1.75rem;
  border-radius: ${radii.radius999};
  background-color: #d9d9d9;
  transition: background-color 0.2s ease;

  @media (min-width: 120rem) {
    width: 4.5rem;
    height: 2.375rem;
  }
`;

const SwitchThumb = styled.span`
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #616161;
  transition: transform 0.2s ease;

  @media (min-width: 120rem) {
    width: 2.125rem;
    height: 2.125rem;
  }
`;

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 auto;
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const PageArrow = styled(Link)<{ $isDisabled?: boolean }>`
  border: 0;
  background: transparent;
  color: #666666;
  text-decoration: none;
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? "none" : "auto")};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.3 : 1)};
`;

const PageNumber = styled(Link)<{ $isActive?: boolean }>`
  border: 0;
  background: transparent;
  padding: 0;
  text-decoration: none;
  font-size: ${typography.fontSize16};
  color: ${({ $isActive }) => ($isActive ? "#111111" : "#9a9a9a")};
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;
