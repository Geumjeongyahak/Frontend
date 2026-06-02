"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

export type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type BoardDropdownProps<T extends string> = {
  label: string;
  options: readonly DropdownOption<T>[];
  value: T;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
  width?: "compact" | "default" | "wide";
};

export default function BoardDropdown<T extends string>({
  label,
  options,
  value,
  disabled = false,
  isOpen,
  onToggle,
  onSelect,
  width = "default",
}: BoardDropdownProps<T>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentMouseDown(event: MouseEvent) {
      if (!rootRef.current || rootRef.current.contains(event.target as Node)) {
        return;
      }

      onToggle();
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, [isOpen, onToggle]);

  return (
    <DropdownControl ref={rootRef} $width={width}>
      <DropdownLabel>{label}</DropdownLabel>
      <DropdownButton
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={onToggle}
      >
        <DropdownButtonText>{selectedOption.label}</DropdownButtonText>
        <SelectIcon aria-hidden="true" size={18} />
      </DropdownButton>

      {isOpen ? (
        <DropdownMenu role="listbox" aria-label={label}>
          {options.map((option) => (
            <DropdownOptionButton
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              $isSelected={option.value === value}
              onClick={() => onSelect(option.value)}
            >
              {option.label}
            </DropdownOptionButton>
          ))}
        </DropdownMenu>
      ) : null}
    </DropdownControl>
  );
}

const dropdownWidth = {
  compact: "9rem",
  default: "10.5rem",
  wide: "12rem",
} as const;

const dropdownWidthLarge = {
  compact: "12.1875rem",
  default: "12.5rem",
  wide: "14.5rem",
} as const;

const DropdownControl = styled.div<{ $width: "compact" | "default" | "wide" }>`
  position: relative;
  z-index: 2;
  width: ${({ $width }) => dropdownWidth[$width]};

  @media (min-width: 120rem) {
    width: ${({ $width }) => dropdownWidthLarge[$width]};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;

const DropdownLabel = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
`;

const DropdownButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 2.1875rem;
  border: 1px solid ${colors.point};
  border-radius: 8px;
  background-color: ${colors.white};
  color: ${colors.text};
  cursor: pointer;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  padding: 0.5rem ${spacing.space16};
  text-align: left;

  &:disabled {
    border-color: ${colors.border};
    color: ${colors.muted};
    cursor: not-allowed;
  }

  &:disabled svg {
    color: ${colors.muted};
  }

  @media (min-width: 120rem) {
    min-height: 2.75rem;
    padding: 0.625rem ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const DropdownButtonText = styled.span`
  min-width: 0;
  overflow: visible;
  white-space: nowrap;
`;

const SelectIcon = styled(IconChevronDown)`
  flex: 0 0 auto;
  color: ${colors.point};
`;

const DropdownMenu = styled.div`
  position: absolute;
  left: 0;
  top: calc(100% + 1px);
  width: 100%;
  border: 1px solid ${colors.border};
  background-color: ${colors.white};
  box-shadow: 0 0.25rem 0.75rem rgb(0 0 0 / 8%);
`;

const DropdownOptionButton = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2rem;
  border: 0;
  background-color: ${({ $isSelected }) => ($isSelected ? colors.pointSoft : colors.white)};
  color: ${colors.text};
  cursor: pointer;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  padding: ${spacing.space8} ${spacing.space16};
  text-align: left;
  white-space: nowrap;

  &:hover {
    background-color: ${colors.pointSoft};
  }

  @media (min-width: 120rem) {
    min-height: 2.75rem;
    padding: 0.625rem ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
