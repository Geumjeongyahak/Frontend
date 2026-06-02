import Link from "next/link";
import styled, { css } from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export const DocumentSection = styled.section`
  min-height: 0;
  overflow: visible;
  padding: 1.8125rem 3.125rem 4rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.1875rem;

  @media (min-width: 120rem) {
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};
  margin-left: auto;

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const actionStyle = css<{ $variant?: "default" | "danger" | "edit" | "muted" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: ${({ $variant }) =>
    $variant === "danger"
      ? `1px solid ${colors.notice}`
      : $variant === "edit"
        ? `1px solid ${colors.point}`
        : $variant === "muted"
          ? `1px solid ${colors.border}`
          : `1px solid ${colors.point}`};
  border-radius: ${radii.radius15};
  background-color: ${({ $variant }) =>
    $variant === "danger"
      ? colors.white
      : $variant === "edit"
        ? colors.white
        : $variant === "muted"
          ? colors.background
          : colors.white};
  padding: 0.8125rem ${spacing.space20};
  color: ${({ $variant }) =>
    $variant === "danger"
      ? colors.notice
      : $variant === "edit"
        ? colors.point
        : $variant === "muted"
          ? colors.text
          : colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${({ $variant }) =>
      $variant === "danger"
        ? colors.noticeSoft
        : $variant === "edit"
          ? colors.pointSoft
          : $variant === "muted"
            ? undefined
            : colors.pointSoft};
    filter: ${({ $variant }) =>
      $variant === "danger" || $variant === "edit" || $variant === "default" || !$variant
        ? "none"
        : "brightness(0.97)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

export const ActionLink = styled(Link)<{ $variant?: "default" | "danger" | "edit" | "muted" }>`
  ${actionStyle}
`;

export const ActionButton = styled.button<{ $variant?: "default" | "danger" | "edit" | "muted" }>`
  ${actionStyle}
`;

export const PageTitle = styled.h1`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

export const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid #b4b4b4;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

export const ContentStack = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

export const Label = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

export const FieldBox = styled.div<{ $isMuted?: boolean }>`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  min-width: 0;
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space12};
  color: ${({ $isMuted }) => ($isMuted ? "#949494" : "#000000")};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const TextBox = styled(FieldBox)`
  align-items: flex-start;
  min-height: 6.875rem;
  white-space: pre-wrap;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
  }
`;

export const ViewerBox = styled.div`
  min-height: 6.875rem;
  background-color: ${colors.background};
  padding: 0.2rem ${spacing.space12};

  .toastui-editor-contents {
    color: #000000;
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight150};
  }

  .toastui-editor-contents img {
    max-width: 100%;
    height: auto;
  }

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: 0.4rem ${spacing.space20};

    .toastui-editor-contents {
      font-size: ${typography.fontSize20};
    }
  }
`;

export const Divider = styled.hr`
  width: 100%;
  margin: ${spacing.space8} 0;
  border: 0;
  border-top: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    margin: ${spacing.space12} 0;
  }
`;

export const StateMessage = styled.p`
  margin: 0;
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

export const AbsenceReportTopBar = styled(DateBar)`
  align-items: center;
  gap: ${spacing.space12};
  border-bottom: 0;
`;

export const UnderlineTextButton = styled.button<{ $tone?: "default" | "danger" }>`
  border: 0;
  background: transparent;
  padding: 0;
  color: ${({ $tone }) => ($tone === "danger" ? colors.notice : colors.muted)};
  font: inherit;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AbsenceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const AbsenceTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 1.375rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

export const AbsenceStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

export const AbsenceBox = styled.div<{
  $tone?: "draft" | "submitted";
  $height?: "short" | "medium" | "large";
}>`
  display: flex;
  flex-direction: ${({ $tone }) => ($tone === "draft" ? "row" : "column")};
  align-items: ${({ $tone }) => ($tone === "draft" ? "center" : "flex-start")};
  justify-content: ${({ $tone }) => ($tone === "draft" ? "center" : "flex-start")};
  gap: ${({ $tone }) => ($tone === "draft" ? spacing.space12 : spacing.space8)};
  min-height: ${({ $tone }) => ($tone === "draft" ? "2.6875rem" : "auto")};
  border: 0;
  background-color: transparent;
  padding: ${({ $tone }) => ($tone === "draft" ? 0 : `0.8125rem ${spacing.space12}`)};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    gap: ${({ $tone }) => ($tone === "draft" ? "1.25rem" : "0.625rem")};
    min-height: ${({ $tone }) => ($tone === "draft" ? "4rem" : "auto")};
    padding: ${({ $tone }) => ($tone === "draft" ? 0 : `${spacing.space20}`)};
    font-size: ${typography.fontSize20};
  }
`;

export const AbsenceBoxLabel = styled.strong<{ $draft?: boolean }>`
  color: ${({ $draft }) => ($draft ? "#9c9c9c" : "#a1a1a1")};
  font-weight: 600;
  flex: ${({ $draft }) => ($draft ? "0 0 4.625rem" : "initial")};
  white-space: nowrap;
`;

export const AbsenceInput = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  border: 1px solid #c0c0c0;
  background: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font: inherit;
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
  }
`;

export const AbsenceTextarea = styled.textarea`
  width: 100%;
  min-height: 2.6875rem;
  height: auto;
  field-sizing: content;
  resize: vertical;
  border: 1px solid #c0c0c0;
  background: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font: inherit;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
  }
`;

export const AbsenceValue = styled.span`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

export const TabRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  min-width: 0;
  min-height: 2.6875rem;
  border: 1px solid ${colors.point};
  background-color: ${({ $active }) => ($active ? colors.point : colors.white)};
  padding: 0.8125rem ${spacing.space12};
  color: ${({ $active }) => ($active ? colors.white : "#000000")};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-align: left;
  cursor: pointer;

  &:not(:disabled):hover {
    filter: brightness(0.97);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  border: 1px solid #c0c0c0;
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  &::placeholder {
    color: #949494;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const EditorBox = styled.div`
  width: 100%;
  border: 1px solid #c0c0c0;
  background-color: ${colors.white};

  .toastui-editor-defaultUI {
    border: 0;
  }

  .toastui-editor-defaultUI,
  .toastui-editor-main {
    font-family: ${typography.fontFamily};
  }

  .toastui-editor-contents {
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight150};
  }

  @media (min-width: 120rem) {
    .toastui-editor-contents {
      font-size: ${typography.fontSize20};
    }
  }
`;
