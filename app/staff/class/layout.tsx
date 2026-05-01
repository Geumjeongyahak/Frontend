import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { colors, layout } from "@/styles/tokens";

export default function ClassLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClassShell>
      <ClassStage>
        <StaffSidebar />
        <ClassContent>{children}</ClassContent>
      </ClassStage>
    </ClassShell>
  );
}

const ClassShell = styled.div`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const ClassStage = styled.div`
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

const ClassContent = styled.main`
  flex: 1;
  min-width: 0;
`;
