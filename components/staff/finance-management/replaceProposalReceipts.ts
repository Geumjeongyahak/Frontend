type ExistingReceipt = { id?: number; fileId?: string };

// 새 파일을 모두 붙인 뒤에 쓰지 않는 기존 영수증을 지운다.
// 중간에 실패해도 기존 영수증은 남는다 (첨부는 fileId 기준으로 멱등).
export async function replaceProposalReceipts(
  existing: ExistingReceipt[],
  nextFileIds: string[],
  api: {
    attach: (fileId: string) => Promise<unknown>;
    remove: (receiptId: number) => Promise<unknown>;
  },
) {
  if (!existing.every((receipt) => typeof receipt.id === "number")) {
    throw new Error("기존 품의서 영수증 정보를 확인할 수 없습니다.");
  }

  for (const fileId of nextFileIds) {
    await api.attach(fileId);
  }

  const keep = new Set(nextFileIds);
  for (const receipt of existing) {
    if (!receipt.fileId || !keep.has(receipt.fileId)) await api.remove(receipt.id as number);
  }
}
