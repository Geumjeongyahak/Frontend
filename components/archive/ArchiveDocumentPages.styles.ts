import Link from "next/link";
import styled from "styled-components";
import { colors, radii, spacing, typography } from "@/styles/tokens";

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space16};
`;

export const FileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;

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

export const FileUploadPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space20};
  width: 100%;
  background-color: ${colors.background};
  padding: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
    padding: ${spacing.space20};
  }
`;

export const FileSelectLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  min-height: 2.1875rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: #eef9e6;
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
