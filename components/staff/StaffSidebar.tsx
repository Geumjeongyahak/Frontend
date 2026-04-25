import Link from "next/link";
import styled from "styled-components";
import { staffSections } from "@/mocks/staffFinance";
import { colors, layout, typography } from "@/styles/tokens";

type StaffSidebarProps = {
  currentItem: string;
};

export default function StaffSidebar({
  currentItem,
}: StaffSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>교원</SidebarHeader>
      <SidebarContent>
        {staffSections.map((section) => (
          <SectionBlock key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionList>
              {section.items.map((item) => {
                const isCurrent = item.label === currentItem;

                return (
                  <SectionItem key={item.label}>
                    <SectionLink
                      href={item.href}
                      $isCurrent={isCurrent}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {item.label}
                    </SectionLink>
                  </SectionItem>
                );
              })}
            </SectionList>
          </SectionBlock>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

const Sidebar = styled.aside`
  width: 15.12rem;
  flex-shrink: 0;
  background-color: #efefef;

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
  }
`;

const SidebarHeader = styled.h1`
  display: flex;
  align-items: center;
  min-height: 3.5rem;
  padding: 0 1.5rem;
  background-color: #a3a3a3;
  color: ${colors.text};
  font-size: 1.2rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const SidebarContent = styled.div`
  padding: 1.5rem 0 2rem;
`;

const SectionBlock = styled.section`
  & + & {
    margin-top: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  padding: 0 1.5rem;
  color: #88cd5a;
  font-size: 1rem;
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const SectionList = styled.ul`
  margin-top: 0.375rem;
`;

const SectionItem = styled.li`
  display: block;
`;

const SectionLink = styled(Link)<{ $isCurrent: boolean }>`
  display: block;
  padding: 0.45rem 1.5rem;
  background-color: ${({ $isCurrent }) =>
    $isCurrent ? "#88cd5a" : "transparent"};
  color: ${({ $isCurrent }) => ($isCurrent ? colors.white : colors.text)};
  font-size: 1rem;
  font-weight: ${({ $isCurrent }) => ($isCurrent ? 800 : 600)};
  line-height: ${typography.lineHeight130};
  text-decoration: none;
`;
