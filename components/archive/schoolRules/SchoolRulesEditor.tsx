"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  CompleteEditButton,
  EditButton,
  RuleInput,
  RuleItem,
  RulesList,
  RulesPanel,
} from "@/components/archive/schoolRules/SchoolRulesPage.styles";

type SchoolRulesEditorContextValue = {
  completeEditing: () => void;
  draftRules: string[];
  isEditing: boolean;
  rules: string[];
  startEditing: () => void;
  updateDraftRule: (index: number, value: string) => void;
};

const SchoolRulesEditorContext = createContext<SchoolRulesEditorContextValue | null>(null);

function useSchoolRulesEditor() {
  const context = useContext(SchoolRulesEditorContext);

  if (!context) {
    throw new Error("SchoolRulesEditor components must be used within SchoolRulesEditorProvider.");
  }

  return context;
}

type SchoolRulesEditorProviderProps = {
  children: ReactNode;
  initialRules: readonly string[];
};

export function SchoolRulesEditorProvider({
  children,
  initialRules,
}: SchoolRulesEditorProviderProps) {
  const [rules, setRules] = useState<string[]>([...initialRules]);
  const [draftRules, setDraftRules] = useState<string[]>([...initialRules, ""]);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraftRules([...rules, ""]);
    setIsEditing(true);
  };

  const updateDraftRule = (index: number, value: string) => {
    setDraftRules((currentRules) => {
      const nextRules = [...currentRules];
      nextRules[index] = value;

      const hasEmptyLastRule = nextRules[nextRules.length - 1]?.trim() === "";
      return hasEmptyLastRule ? nextRules : [...nextRules, ""];
    });
  };

  const completeEditing = () => {
    const nextRules = draftRules.map((rule) => rule.trim()).filter(Boolean);

    setRules(nextRules);
    setDraftRules([...nextRules, ""]);
    setIsEditing(false);
  };

  return (
    <SchoolRulesEditorContext.Provider
      value={{
        completeEditing,
        draftRules,
        isEditing,
        rules,
        startEditing,
        updateDraftRule,
      }}
    >
      {children}
    </SchoolRulesEditorContext.Provider>
  );
}

export function SchoolRulesEditAction() {
  const { completeEditing, isEditing, startEditing } = useSchoolRulesEditor();

  return isEditing ? (
    <CompleteEditButton type="button" onClick={completeEditing}>
      편집 완료
    </CompleteEditButton>
  ) : (
    <EditButton type="button" onClick={startEditing}>
      편집
    </EditButton>
  );
}

export function SchoolRulesListPanel() {
  const { draftRules, isEditing, rules, updateDraftRule } = useSchoolRulesEditor();

  return (
    <RulesPanel aria-label="교칙 목록">
      <RulesList>
        {isEditing
          ? draftRules.map((rule, index) => (
              <RuleItem key={`draft-rule-${index}`}>
                <RuleInput
                  aria-label={`${index + 1}번째 교칙`}
                  value={rule}
                  onChange={(event) => updateDraftRule(index, event.target.value)}
                />
              </RuleItem>
            ))
          : rules.map((rule) => <RuleItem key={rule}>{rule}</RuleItem>)}
      </RulesList>
    </RulesPanel>
  );
}
