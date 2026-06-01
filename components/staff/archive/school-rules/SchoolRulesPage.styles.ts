import styled from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32};
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 2.1875rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
  }
`;

export const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

export const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

export const CompleteEditButton = styled.button<{ $variant?: "danger" | "default" | "muted" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.125rem;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "muted" ? colors.border : $variant === "danger" ? colors.notice : colors.point};
  border-radius: ${radii.radius15};
  padding: 0.625rem ${spacing.space20};
  background-color: ${({ $variant }) =>
    $variant === "muted" || $variant === "danger" ? colors.white : colors.pointSoft};
  color: ${({ $variant }) =>
    $variant === "muted" ? colors.text : $variant === "danger" ? colors.notice : colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${({ $variant }) =>
      $variant === "muted"
        ? colors.background
        : $variant === "danger"
          ? colors.noticeSoft
          : colors.point};
    color: ${({ $variant }) => ($variant ? undefined : colors.white)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    border-radius: ${radii.radius15};
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

export const RulesPanel = styled.section`
  width: 100%;
  border-radius: ${radii.radius15};
  background-color: #eef9e6;
  padding: ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

export const RulesViewerBox = styled.div`
  border-radius: ${radii.radius12};
  background-color: transparent;
  color: #000000;

  .toastui-editor-contents {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: ${typography.lineHeight150};
    color: #000000;
  }

  .toastui-editor-contents > :first-child {
    margin-top: 0;
  }

  .toastui-editor-contents > :last-child {
    margin-bottom: 0;
  }

  @media (min-width: 120rem) {
    .toastui-editor-contents {
      font-size: ${typography.fontSize20};
    }
  }
`;

export const RulesEditorBox = styled.div`
  display: grid;
  gap: ${spacing.space16};
  justify-items: start;

  > div {
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing.space12};
  }

  .toastui-editor-defaultUI {
    width: 100%;
    overflow: hidden;
    border-color: ${colors.border};
    border-radius: ${radii.radius12};
  }
`;

export const StateMessage = styled.p`
  margin: 0;
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;
