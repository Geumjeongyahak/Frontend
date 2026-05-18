import styled from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 2.9375rem 4rem 3.125rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
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
  margin-top: 0.375rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: #b3b3b3;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: ${colors.point};
  }

  @media (min-width: 120rem) {
    margin-top: 0.5625rem;
    font-size: ${typography.fontSize20};
  }
`;

export const CompleteEditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.125rem;
  border: 0;
  border-radius: 0.625rem;
  padding: 0.625rem ${spacing.space20};
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    filter: brightness(0.95);
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

export const RulesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.6875rem;
  margin: 0;
  padding-left: ${spacing.space20};
  list-style: disc;

  @media (min-width: 120rem) {
    gap: 1.125rem;
    padding-left: 1.875rem;
  }
`;

export const RuleItem = styled.li`
  color: #000000;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

export const RuleInput = styled.textarea`
  display: block;
  width: 100%;
  min-height: 1.25rem;
  border: 0;
  padding: 0;
  resize: vertical;
  overflow: hidden;
  background: transparent;
  color: #000000;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: none;

  &:focus {
    outline: 1px solid rgba(136, 205, 90, 0.65);
    outline-offset: 0.125rem;
  }

  @media (min-width: 120rem) {
    min-height: 1.875rem;
  }
`;
