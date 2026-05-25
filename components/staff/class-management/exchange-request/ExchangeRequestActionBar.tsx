"use client";

import styled from "styled-components";
import { Button } from "@/components/common/VariantButton";
import { layout, spacing } from "@/styles/tokens";

interface ExchangeRequestActionBarProps {
  canDelete: boolean;
  canEdit: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  onDelete: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onStartEdit: () => void;
  onBackToList: () => void;
}

export function ExchangeRequestActionBar({
  canDelete,
  canEdit,
  isEditing,
  isUpdating,
  onDelete,
  onCancelEdit,
  onSaveEdit,
  onStartEdit,
  onBackToList,
}: ExchangeRequestActionBarProps) {
  return (
    <TopButtonRow>
      {canDelete ? (
        <Button type="button" $variant="danger" onClick={onDelete}>
          삭제
        </Button>
      ) : null}

      {isEditing ? (
        <>
          <Button type="button" $variant="edit" onClick={onCancelEdit} disabled={isUpdating}>
            취소
          </Button>

          <Button type="button" onClick={onSaveEdit} disabled={isUpdating}>
            저장
          </Button>
        </>
      ) : (
        <>
          {canEdit ? (
            <Button type="button" $variant="edit" onClick={onStartEdit}>
              수정
            </Button>
          ) : null}

          <Button type="button" $variant="neutral" onClick={onBackToList}>
            목록
          </Button>
        </>
      )}
    </TopButtonRow>
  );
}

const TopButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;
