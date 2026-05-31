import {
  SchoolRulesEditAction,
  SchoolRulesEditorProvider,
  SchoolRulesContentPanel,
} from "@/components/staff/archive/school-rules/SchoolRulesEditor";
import {
  HeaderRow,
  PageSection,
  Title,
} from "@/components/staff/archive/school-rules/SchoolRulesPage.styles";

export default function SchoolRulesPage() {
  return (
    <PageSection>
      <SchoolRulesEditorProvider>
        <HeaderRow>
          <Title>교칙</Title>
          <SchoolRulesEditAction />
        </HeaderRow>
        <SchoolRulesContentPanel />
      </SchoolRulesEditorProvider>
    </PageSection>
  );
}
