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
  justify-content: space-between;
  gap: ${spacing.space20};
  margin-bottom: 2rem;

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
        : $variant === "muted" || $variant === "default"
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
  color: ${colors.text};
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
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

export const MetaBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.space20};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid ${colors.borderStrong};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const Label = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

export const FieldBox = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  min-width: 0;
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space12};
  color: ${colors.placeholder};
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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

export const BoardSelectRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const ViewerBox = styled.div`
  min-height: 6.875rem;
  background-color: ${colors.background};
  padding: 0.2rem ${spacing.space12};

  .toastui-editor-contents {
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight150};
    color: ${colors.text};
  }

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: 0.4rem ${spacing.space20};

    .toastui-editor-contents {
      font-size: ${typography.fontSize20};
    }
  }
`;

export const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};
  flex-wrap: wrap;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

export const CheckboxInput = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${colors.point};

  @media (min-width: 120rem) {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  border: 0;
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space12};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  &::placeholder {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 6.875rem;
  resize: vertical;
  border: 0;
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space12};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  &::placeholder {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const FileUploadPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space20};
  width: 100%;
  background-color: ${colors.background};
  padding: ${spacing.space20};
`;

export const FileSelectLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-height: 2.1875rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.pointSoft};
  padding: 0.625rem 0.9375rem;
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 2.9375rem;
    font-size: ${typography.fontSize20};
  }
`;

export const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space16};
`;

export const FileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space12};
  border: 0;
  background: transparent;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const DownloadBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${colors.point};
  color: ${colors.white};

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

export const StateMessage = styled.p`
  margin: 0;
  padding: ${spacing.space32} 0;
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;
