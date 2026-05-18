import {
  SchoolRulesEditAction,
  SchoolRulesEditorProvider,
  SchoolRulesListPanel,
} from "@/components/archive/schoolRules/SchoolRulesEditor";
import {
  HeaderRow,
  PageSection,
  Title,
} from "@/components/archive/schoolRules/SchoolRulesPage.styles";

const SCHOOL_RULES = [
  "제5조(학습의 의무) 학생은 학교의 교육 활동에 성실히 참여하고 수업 질서를 존중해야 한다.",
  "제6조(시설물 아끼기) 학생은 학교의 시설과 설비를 소중히 다루어야 하며, 파손 시 변상 책임을 질 수 있다.",
  "제7조(타인 존중) 동급생 및 상하급생 간에 폭언, 폭행, 따돌림 등 인권을 침해하는 행위를 해서는 안 된다.",
  "제8조(소지품 제한) 수업에 방해가 되는 물품이나 안전을 위협하는 인화 물질 등의 소지를 금지한다.",
  "제9조(정보 윤리) 교내외에서 타인의 정보를 무단으로 유출하거나 사이버 폭력을 행사해서는 안 된다.",
] as const;

export default function SchoolRulesPage() {
  return (
    <PageSection>
      <SchoolRulesEditorProvider initialRules={SCHOOL_RULES}>
        <HeaderRow>
          <Title>교칙</Title>
          <SchoolRulesEditAction />
        </HeaderRow>
        <SchoolRulesListPanel />
      </SchoolRulesEditorProvider>
    </PageSection>
  );
}
