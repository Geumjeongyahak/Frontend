import styled from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export const PhoneBookPageSection = styled.section`
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

export const PageTitle = styled.h1`
  margin: 0 0 2.1875rem;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
    font-size: 2.5rem;
  }
`;

export const ContactGroup = styled.section`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  padding: ${spacing.space12} ${spacing.space20} ${spacing.space20};

  & + & {
    margin-top: 2.5rem;
  }

  @media (min-width: 120rem) {
    padding: ${spacing.space20} 1.875rem 1.875rem;

    & + & {
      margin-top: 5rem;
    }
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space20};
  margin-bottom: 1.25rem;

  @media (min-width: 120rem) {
    margin-bottom: 1.875rem;
  }
`;

export const SectionLabel = styled.h2`
  min-width: 5.375rem;
  margin: 0;
  border-top: 1px solid ${colors.point};
  border-bottom: 1px solid ${colors.point};
  padding: 0 ${spacing.space20};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: 2.125rem;
  text-align: center;
  white-space: nowrap;

  @media (min-width: 120rem) {
    min-width: 7.8125rem;
    padding: 0 1.875rem;
    font-size: ${typography.fontSize20};
    line-height: 3.125rem;
  }
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space8} ${spacing.space20};

  @media (min-width: 120rem) {
    gap: ${spacing.space12} 1.875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

export const ContactCard = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${spacing.space12};
  min-width: 0;
  padding: ${spacing.space8};
  color: #000000;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: 2.125rem;
  white-space: nowrap;

  strong {
    font-weight: 700;
  }

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding: ${spacing.space12};
    font-size: ${typography.fontSize20};
    line-height: 3.125rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    white-space: normal;
  }
`;

export const Divider = styled.span`
  display: block;
  flex: 0 0 auto;
  width: 1px;
  height: 0.875rem;
  background-color: #000000;

  @media (min-width: 120rem) {
    height: 1.3125rem;
  }
`;

export const ContactValue = styled.span`
  min-width: 0;
`;

export const StudentClassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

export const SectionBody = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space8};

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
  }
`;

export const ClassHeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space12};
  align-self: flex-start;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

export const ClassName = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: 2.125rem;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
    line-height: 3.125rem;
  }
`;

export const ToggleIcon = styled.span<{ $isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.875rem;
  color: #777777;
  font-size: ${typography.fontSize13};
  transform: rotate(${({ $isOpen }) => ($isOpen ? "90deg" : "0deg")});

  @media (min-width: 120rem) {
    width: 1.25rem;
    font-size: ${typography.fontSize20};
  }
`;

export const StudentGrid = styled(ContactGrid)`
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;
