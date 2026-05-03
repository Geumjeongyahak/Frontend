import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { colors, layout } from "@/styles/tokens";

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <ArchiveShell>
      <ArchiveStage>
        <StaffSidebar />
        <ArchiveContent>{children}</ArchiveContent>
      </ArchiveStage>
    </ArchiveShell>
  );
}

const ArchiveShell = styled.div`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const ArchiveStage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const ArchiveContent = styled.main`
  flex: 1;
  min-width: 0;
`;
