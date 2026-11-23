export const ATTACHMENT_AUTHOR_ONLY_MESSAGE = "다른 사람이 작성한 글의 첨부파일은 변경할 수 없습니다.";

type AttachmentChangeParams = {
  isEditMode: boolean;
  isAuthor: boolean;
  newFileCount: number;
  removedFileIds: string[];
};

/** 첨부 추가·삭제가 하나라도 있으면 초안으로 바꿔 처리해야 한다. */
export function needsDraftForAttachmentChanges({
  newFileCount,
  removedFileIds,
}: Pick<AttachmentChangeParams, "newFileCount" | "removedFileIds">) {
  return newFileCount > 0 || removedFileIds.length > 0;
}

/**
 * 첨부 연결·해제는 백엔드에서 작성자 본인의 초안에만 허용한다.
 * 다른 사람 글이면 초안으로 바꾸기 전에 막아 글이 DRAFT로 남는 일을 없앤다.
 */
export function assertAttachmentChangeAllowed(params: AttachmentChangeParams) {
  if (params.isEditMode && needsDraftForAttachmentChanges(params) && !params.isAuthor) {
    throw new Error(ATTACHMENT_AUTHOR_ONLY_MESSAGE);
  }
}

/** 화면에서 뺀 첨부를 저장 시점에 서버에서 연결 해제한다. */
export async function detachRemovedAttachments(
  removedFileIds: string[],
  detach: (fileId: string) => Promise<unknown>,
) {
  for (const fileId of removedFileIds) {
    await detach(fileId);
  }
}
