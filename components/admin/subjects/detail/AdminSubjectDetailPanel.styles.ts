import styled from "styled-components";
import { ButtonRow, Label } from "@/components/admin/AdminDashboardSectionParts";
import { colors, layout, spacing, typography } from "@/styles/tokens";

export const DetailStack = styled.div`
  display: grid;
  gap: ${spacing.space20};
`;

export const DetailFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space16};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

export const DetailField = styled.div<{ $fullWidth?: boolean; $compact?: boolean }>`
  display: grid;
  gap: ${({ $compact }) => ($compact ? spacing.space4 : spacing.space8)};
  min-width: 0;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
`;

export const DetailFieldLabel = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

export const EditLabel = styled(Label)`
  gap: ${spacing.space8};
`;

export const DetailFieldValue = styled.div`
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: break-word;
`;

export const UnassignedTeacherBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.25rem 0.625rem;
  border: 1px solid #f3c6c2;
  border-radius: 999px;
  background: ${colors.noticeSoft};
  color: ${colors.notice};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;

export const DetailTextBox = styled.div`
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  background: #fafbfa;
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const CompactDivider = styled.hr`
  width: 100%;
  margin: ${spacing.space8} 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

export const DescriptionSection = styled.section`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
`;

export const ActionSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
`;

export const ActionButtonRow = styled(ButtonRow)`
  justify-content: flex-end;
`;

export const ScheduleEditGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

export const ScheduleTimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

export const DayChoiceGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

export const DayChoiceButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  margin: 0;
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid ${({ $selected }) => ($selected ? colors.point : "#e1e5e3")};
  border-radius: 0.5rem;
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : colors.white)};
  font-family: inherit;
  cursor: pointer;

  &:hover {
    border-color: ${colors.point};
  }
`;

export const DayChoiceLabel = styled.span<{ $selected?: boolean }>`
  color: ${({ $selected }) => ($selected ? colors.text : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;
