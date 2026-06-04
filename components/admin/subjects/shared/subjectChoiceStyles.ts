import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

export const ChoiceGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

export const ChoiceStack = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

export const ChoiceButton = styled.button<{ $selected?: boolean; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing.space4};
  min-width: 9rem;
  margin: 0;
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid
    ${({ $selected, $disabled }) => {
      if ($disabled) return "#e1e5e3";
      return $selected ? colors.point : "#e1e5e3";
    }};
  border-radius: 0.5rem;
  background-color: ${({ $selected, $disabled }) => {
    if ($disabled) return "#f4f6f5";
    return $selected ? colors.pointSoft : colors.white;
  }};
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};

  &:hover:not(:disabled) {
    border-color: ${colors.point};
  }
`;

export const ChoiceTitle = styled.span<{ $selected?: boolean; $disabled?: boolean }>`
  color: ${({ $selected, $disabled }) => {
    if ($disabled) return "#94a39d";
    return $selected ? colors.text : "#64706c";
  }};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

export const ChoiceMeta = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

export const CenteredChoiceButton = styled(ChoiceButton)`
  position: relative;
  text-align: center;
`;

export const CenteredChoiceTitle = styled(ChoiceTitle)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const ChoiceHeightPlaceholder = styled.div`
  visibility: hidden;
  display: flex;
  flex-direction: column;
  gap: ${spacing.space4};
`;
