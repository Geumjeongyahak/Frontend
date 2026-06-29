"use client";

import styled from "styled-components";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type AttendanceCheckoutModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AttendanceCheckoutModal({
  onConfirm,
  onCancel,
}: AttendanceCheckoutModalProps) {
  return (
    <Backdrop onMouseDown={onCancel}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-checkout-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Title id="attendance-checkout-modal-title">
          퇴근을 완료하려면 출석 일지를 작성해야 합니다. 작성하시겠습니까?
        </Title>
        <ActionRow>
          <SecondaryButton type="button" onClick={onCancel}>
            취소
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onConfirm}>
            확인
          </PrimaryButton>
        </ActionRow>
      </Dialog>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 45;
  display: grid;
  place-items: center;
  padding: ${spacing.space20};
  background: rgba(0, 0, 0, 0.45);
`;

const Dialog = styled.div`
  display: grid;
  gap: ${spacing.space20};
  width: min(100%, 22rem);
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 1.25rem 3rem rgba(0, 0, 0, 0.16);
`;

const Title = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
  text-align: center;
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const buttonStyle = `
  min-height: 3rem;
  border-radius: ${radii.radius999};
  font-size: ${typography.fontSize14};
  font-weight: 800;
`;

const SecondaryButton = styled.button`
  ${buttonStyle}
  border: 1px solid ${colors.border};
  background: ${colors.background};
  color: ${colors.text};
`;

const PrimaryButton = styled.button`
  ${buttonStyle}
  border: 0;
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
`;
