"use client";

import styled from "styled-components";
import {
  ButtonRow,
  DangerButton,
  SmallButton,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type AdminLessonDeleteConfirmModalProps = {
  open: boolean;
  message: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminLessonDeleteConfirmModal({
  open,
  message,
  isPending,
  onCancel,
  onConfirm,
}: AdminLessonDeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <Backdrop onClick={onCancel} role="presentation">
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Title id="lesson-delete-title">수업 삭제</Title>
        <Message>{message}</Message>
        <ButtonRow>
          <SmallButton type="button" disabled={isPending} onClick={onCancel}>
            취소
          </SmallButton>
          <DangerButton type="button" disabled={isPending} onClick={onConfirm}>
            {isPending ? "삭제 중..." : "삭제"}
          </DangerButton>
        </ButtonRow>
      </Dialog>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space16};
  background-color: rgb(0 0 0 / 35%);
`;

const Dialog = styled.div`
  width: min(100%, 24rem);
  padding: ${spacing.space20};
  background-color: ${colors.white};
  border-radius: ${radii.radius12};
  box-shadow: 0 12px 32px rgb(0 0 0 / 12%);
`;

const Title = styled.h3`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const Message = styled.p`
  margin: ${spacing.space12} 0 ${spacing.space20};
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;
