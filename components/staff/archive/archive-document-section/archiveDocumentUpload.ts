import { attachPostAttachment, createPost, pinPost, publishPost, updatePost } from "@/api/post/post.api";
import type { PostDetailResponseDto } from "@/api/post/post.dto";
import type { ArchiveDocumentCategory } from "@/config/archiveDocuments";

type PublishArchivePostWithNewFilesParams = {
  channelId: number;
  title: string;
  contentHtml: string;
  allowComment: boolean;
  isPinned: boolean;
  files: File[];
  errorLabel: string;
} & ({ mode: "create" } | { mode: "update"; postId: number; initialPinned: boolean });

/** DRAFT 저장 → Drive 메타 등록 → 첨부 연동 → 발행 */
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

  const publishedPost = await publishPost({ channelId, postId: draftPost.id }, publishBody);

  const shouldUpdatePinned =
    params.mode === "create" ? isPinned : isPinned !== params.initialPinned;

  if (shouldUpdatePinned) {
    await pinPost({ channelId, postId: draftPost.id }, { isPinned });
  }

  return publishedPost;
}
