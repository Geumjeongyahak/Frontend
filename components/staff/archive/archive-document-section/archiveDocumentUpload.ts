import {
  attachPostAttachment,
  createPost,
  detachPostAttachment,
  pinPost,
  publishPost,
  updatePost,
} from "@/api/post/post.api";
import type { PostDetailResponseDto } from "@/api/post/post.dto";
import type { ArchiveDocumentCategory } from "@/config/archiveDocuments";
import { detachRemovedAttachments } from "@/lib/post/postAttachmentEdit";

type PublishArchivePostWithNewFilesParams = {
  channelId: number;
  title: string;
  contentHtml: string;
  allowComment: boolean;
  isPinned: boolean;
  files: File[];
  /** 수정 화면에서 지운 기존 첨부. 초안 상태에서 연결을 끊는다 */
  removedFileIds?: string[];
  errorLabel: string;
} & ({ mode: "create" } | { mode: "update"; postId: number; initialPinned: boolean });

/** DRAFT 저장 → Drive 메타 등록 → 첨부 연동 → 지운 첨부 해제 → 발행 */
export async function publishArchivePostWithNewFiles(
  params: PublishArchivePostWithNewFilesParams,
): Promise<PostDetailResponseDto> {
  const {
    channelId,
    title,
    contentHtml,
    allowComment,
    isPinned,
    files,
    errorLabel,
  } = params;
  const publishBody = { title, contentHtml, allowComment };

  const draftPost =
    params.mode === "create"
      ? await createPost({ channelId }, { title, contentHtml, status: "DRAFT", allowComment })
      : await updatePost(
          { channelId, postId: params.postId },
          { title, contentHtml, status: "DRAFT", allowComment },
        );

  if (typeof draftPost.id !== "number") {
    throw new Error(`${errorLabel} 초안을 저장하지 못했습니다.`);
  }

  for (const file of files) {
    const uploaded = await attachPostAttachment(
      { channelId, postId: draftPost.id },
      file,
      file.name,
    );

    if (!uploaded.fileId) {
      throw new Error(`${errorLabel} 파일 업로드에 실패했습니다.`);
    }
  }

  // 새 첨부를 모두 붙인 뒤에 지운 첨부를 해제한다 (해제는 저장소 파일까지 삭제)
  const postId = draftPost.id;
  await detachRemovedAttachments(params.removedFileIds ?? [], (fileId) =>
    detachPostAttachment({ channelId, postId, fileId }),
  );

  const publishedPost = await publishPost({ channelId, postId: draftPost.id }, publishBody);

  const shouldUpdatePinned =
    params.mode === "create" ? isPinned : isPinned !== params.initialPinned;

  if (shouldUpdatePinned) {
    await pinPost({ channelId, postId: draftPost.id }, { isPinned });
  }

  return publishedPost;
}
