export type ExistingProposalReceipt = {
  id?: number;
  fileId?: string;
};

type ReplaceProposalReceiptsParams = {
  existingReceipts: ExistingProposalReceipt[];
  nextFileIds: string[];
  attach: (fileId: string) => Promise<unknown>;
  remove: (receiptId: number) => Promise<unknown>;
};

/**
 * 품의서 영수증을 새 목록으로 교체한다.
 * 새 파일을 먼저 붙이고, 새 목록에 없는 기존 영수증만 나중에 지운다.
 * attach가 중간에 실패해도 기존 영수증은 지워지지 않는다.
 */
export async function replaceProposalReceipts({
  existingReceipts,
  nextFileIds,
  attach,
  remove,
}: ReplaceProposalReceiptsParams) {
  if (existingReceipts.some((receipt) => typeof receipt.id !== "number")) {
    throw new Error("기존 품의서 영수증 정보를 확인할 수 없습니다.");
  }

  const nextFileIdSet = new Set(nextFileIds);
  const attachedFileIds = new Set(
    existingReceipts.map((receipt) => receipt.fileId).filter((fileId): fileId is string => !!fileId),
  );

  for (const fileId of nextFileIdSet) {
    if (!attachedFileIds.has(fileId)) {
      await attach(fileId);
    }
  }

  for (const receipt of existingReceipts) {
    if (!receipt.fileId || !nextFileIdSet.has(receipt.fileId)) {
      await remove(receipt.id as number);
    }
  }
}
