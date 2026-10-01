type AttachmentRef = { fileId?: string | null };

// 수정 화면에서 지운 기존 첨부의 fileId. 저장할 때 게시글과의 연결을 끊는 데 쓴다.
export function getRemovedAttachmentFileIds(original: AttachmentRef[], current: AttachmentRef[]) {
  const kept = new Set(current.map((file) => file.fileId));
  return original
    .map((file) => file.fileId)
    .filter((fileId): fileId is string => Boolean(fileId) && !kept.has(fileId));
}

// 첨부 추가·해제 API는 작성자 본인만 허용한다(관리자 포함). 초안으로 바꾸기 전에 막아 글이 DRAFT에 갇히지 않게 한다.
export function assertCanEditPostAttachments(
  post: { authorId?: number } | null | undefined,
  userId: number | undefined,
) {
  if (typeof post?.authorId === "number" && post.authorId !== userId) {
    throw new Error(
      "다른 사람이 작성한 글의 첨부파일은 바꿀 수 없습니다. 작성자에게 요청해 주세요.",
    );
  }
}
