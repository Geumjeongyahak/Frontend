const proposalReceiptImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"] as const;

export const proposalReceiptImageAccept =
  "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";

export function isProposalReceiptImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return proposalReceiptImageExtensions.some((allowedExtension) => allowedExtension === extension);
}

export function getInvalidProposalReceiptImages(files: File[]) {
  return files.filter((file) => !isProposalReceiptImage(file));
}
