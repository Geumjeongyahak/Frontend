import type { FileUploadResponseDto } from "@/api/file/file.dto";
import { attachPostFile, createPost, pinPost, publishPost, updatePost } from "@/api/post/post.api";
import type { PostDetailResponseDto } from "@/api/post/post.dto";
import {
  uploadDocumentFormsDocument,
  uploadExamMaterialsDocument,
  uploadHandoverDocument,
} from "@/lib/googleDrive";
import type { ArchiveDocumentCategory } from "@/mocks/archiveDocuments";

export type UploadArchiveDocumentFn = (file: File) => Promise<FileUploadResponseDto>;

export function getUploadArchiveDocument(
  category: ArchiveDocumentCategory,
): UploadArchiveDocumentFn | null {
  switch (category) {
    case "handover":
      return uploadHandoverDocument;
    case "exam":
      return uploadExamMaterialsDocument;
    case "forms":
      return uploadDocumentFormsDocument;
    default:
      return null;
  }
}

type PublishArchivePostWithNewFilesParams = {
  channelId: number;
  title: string;
  contentHtml: string;
  allowComment: boolean;
  isPinned: boolean;
  files: File[];
  uploadDocument: UploadArchiveDocumentFn;
  sortOrderStart: number;
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
    uploadDocument,
    sortOrderStart,
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

  const registeredFiles = await Promise.all(files.map((file) => uploadDocument(file)));

  for (const [index, registered] of registeredFiles.entries()) {
    if (!registered.fileId) {
      throw new Error(`${errorLabel} 파일 메타데이터 등록에 실패했습니다.`);
    }

    await attachPostFile(
      { channelId, postId: draftPost.id },
      { fileId: registered.fileId, sortOrder: sortOrderStart + index },
    );
  }

  const publishedPost = await publishPost({ channelId, postId: draftPost.id }, publishBody);

  const shouldUpdatePinned =
    params.mode === "create" ? isPinned : isPinned !== params.initialPinned;

  if (shouldUpdatePinned) {
    await pinPost({ channelId, postId: draftPost.id }, { isPinned });
  }

  return publishedPost;
}
