"use client";

import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type DataStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
  compact?: boolean;
  children: ReactNode;
};

export function DataState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel,
  errorLabel,
  emptyLabel,
  compact = false,
  children,
}: DataStateProps) {
  if (isLoading) {
    return (
      <DataStateBox $compact={compact}>
        <StatePanel $compact={compact}>
          <LoadingSpinner label={loadingLabel} />
        </StatePanel>
      </DataStateBox>
    );
  }

  if (isError) {
    return (
      <DataStateBox $compact={compact}>
        <StatePanel $compact={compact} role="alert">
          {errorLabel}
        </StatePanel>
      </DataStateBox>
    );
  }

  if (isEmpty) {
    return (
      <DataStateBox $compact={compact}>
        <StatePanel $compact={compact}>{emptyLabel}</StatePanel>
      </DataStateBox>
    );
  }

  return <>{children}</>;
}

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(20rem, 0.8fr);
  gap: ${spacing.space16};

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const DashboardStack = styled.div`
  display: grid;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }
`;

export const RequestSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.section`
  min-height: 5.125rem;
  padding: 1rem 0.875rem;
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};

  @media (min-width: 120rem) {
    padding: 1.5rem;
  }
`;

export const StatLabel = styled.p`
  margin: 0 0 ${spacing.space8};
  color: #64706c;
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

export const StatValue = styled.p`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize24};
  font-weight: 900;
  line-height: ${typography.lineHeight100};
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

export const SectionCard = styled.section`
  min-width: 0;
  padding: 1.25rem 1rem;
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};

  @media (min-width: 120rem) {
    padding: 2rem 1.75rem;
  }
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SectionTitle = styled.h2`
  color: #050505;
  font-size: ${typography.fontSize18};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

export const SectionDescription = styled.p`
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
`;

export const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

export const SingleActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing.space12};
`;

export const ActionCardButton = styled.button`
  min-height: 4.25rem;
  border: 1px solid #e1e5e3;
  border-radius: 0.5rem;
  padding: ${spacing.space16};
  background-color: ${colors.white};
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 5rem;
    padding: 1.5rem;
  }

  &:hover {
    border-color: ${colors.point};
  }
`;

export const ActionTitle = styled.p<{ $accent?: boolean }>`
  margin: 0 0 ${spacing.space4};
  color: ${({ $accent }) => ($accent ? "#b27600" : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

export const ActionDescription = styled.p<{ $alert?: boolean }>`
  margin: 0;
  color: ${({ $alert }) => ($alert ? "#d86a63" : "#64706c")};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

export const StatePanel = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: ${({ $compact }) => ($compact ? "5.5rem" : "8rem")};
  padding: ${({ $compact }) =>
    $compact ? `${spacing.space8} ${spacing.space12}` : spacing.space20};
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};
  color: #64706c;
  font-size: ${typography.fontSize14};
`;

export const DataStateBox = styled.div<{ $compact?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: ${({ $compact }) => ($compact ? "0" : "16rem")};
  margin-bottom: ${({ $compact }) => ($compact ? "0" : spacing.space12)};
`;

export const StableListArea = styled.div`
  min-height: 16rem;
`;

export const InlineStatus = styled.p`
  margin: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;

export const ControlRow = styled.div`
  display: flex;
  gap: ${spacing.space8};
  margin: ${spacing.space12} 0;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${typography.fontSize13};

  th,
  td {
    border-bottom: 1px solid #e6e9e7;
    padding: ${spacing.space8};
    text-align: left;
    vertical-align: top;
  }

  th {
    color: #64706c;
    font-weight: 800;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background-color: ${colors.pointSoft};
  }
`;

export const FormGrid = styled.form`
  display: grid;
  gap: ${spacing.space12};
`;

export const Label = styled.label`
  display: grid;
  gap: ${spacing.space4};
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
`;

export const EditorLabel = styled(Label)`
  .toastui-editor-defaultUI {
    border-color: ${colors.border};
    border-radius: 0.375rem;
    overflow: hidden;
  }
`;

export const EditorField = styled.div`
  display: grid;
  gap: ${spacing.space4};

  .toastui-editor-defaultUI {
    border-color: ${colors.border};
    border-radius: 0.375rem;
    overflow: hidden;
  }

  .toastui-editor-mode-switch {
    display: none;
  }

  .toastui-editor-md-tab-container {
    display: none;
  }

  .toastui-editor-contents {
    color: #111827;
    font-size: ${typography.fontSize14};
    font-weight: 400;
  }

  .toastui-editor-contents strong,
  .toastui-editor-contents b {
    font-weight: 800;
  }

  .toastui-editor-ww-container strong,
  .toastui-editor-ww-container b {
    font-weight: 800;
  }
`;

export const EditorFieldTitle = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

export const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
`;

const inputFocusStyle = css`
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.point};
  }
`;

export const TextInput = styled.input`
  width: 100%;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 ${spacing.space12};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  ${inputFocusStyle}
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: ${spacing.space12};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  resize: vertical;
  ${inputFocusStyle}
`;

export const Select = styled.select`
  width: 100%;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 ${spacing.space12};
  background-color: ${colors.white};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  ${inputFocusStyle}
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

export const PrimaryButton = styled.button`
  min-height: 2.375rem;
  border: 0;
  border-radius: 0.375rem;
  padding: 0 ${spacing.space16};
  background-color: ${colors.point};
  color: ${colors.white};
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    background-color: #74bd48;
    color: ${colors.white};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const SmallButton = styled.button`
  min-height: 2.25rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 ${spacing.space16};
  background-color: ${colors.white};
  color: #1f2b28;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    border-color: #88cd5a;
    background-color: #f5fff0;
    color: #5eb63a;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const DangerButton = styled(SmallButton)`
  border-color: #eb665c;
  color: ${colors.notice};

  &:not(:disabled):hover {
    border-color: #da3a30;
    background-color: #fff1f0;
    color: #da3a30;
  }
`;

export const Divider = styled.hr`
  width: 100%;
  margin: ${spacing.space20} 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

export const List = styled.ul`
  display: grid;
  gap: ${spacing.space8};
  margin: ${spacing.space12} 0;
  padding: 0;
  list-style: none;
`;

export const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.space12};
  padding: ${spacing.space8};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  color: #1f2b28;
  font-size: ${typography.fontSize13};
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space8};
  margin-bottom: ${spacing.space12};
`;

export const MetaItem = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;
