export type ArchiveDocumentCategory = "handover" | "exam" | "forms";

export type ArchiveDocument = {
  id: number;
  category: ArchiveDocumentCategory;
  title: string;
  author: string;
  date: string;
  description: string;
  files: string[];
};

export type ArchiveDocumentConfig = {
  category: ArchiveDocumentCategory;
  channelId: number;
  listPath: string;
  title: string;
  writeTitle: string;
  writeLabel: string;
  emptyMessage: string;
  titleTemplate: string;
  fileBaseName: string;
};

export const ARCHIVE_DOCUMENTS_PER_PAGE = 9;

export const archiveDocumentConfigs: Record<ArchiveDocumentCategory, ArchiveDocumentConfig> = {
  handover: {
    category: "handover",
    channelId: 20, //채널 id 변경시 수정
    listPath: "/staff/archive/handover",
    title: "인수인계서",
    writeTitle: "인수인계서 작성하기",
    writeLabel: "인수인계서 작성하기",
    emptyMessage: "인수인계서가 없습니다.",
    titleTemplate: "00반 인수인계서 입니다",
    fileBaseName: "00반 인수인계자료",
  },
  exam: {
    category: "exam",
    channelId: 22, //채널 id 변경시 수정
    listPath: "/staff/archive/exam",
    title: "시험 문제 자료",
    writeTitle: "시험 문제 자료 작성하기",
    writeLabel: "시험 문제 자료 작성하기",
    emptyMessage: "시험 문제 자료가 없습니다.",
    titleTemplate: "00반 시험 문제 자료 입니다",
    fileBaseName: "00반 시험문제자료",
  },
  forms: {
    category: "forms",
    channelId: 23, //채널 id 변경시 수정
    listPath: "/staff/archive/forms",
    title: "서류 양식",
    writeTitle: "서류 양식 작성하기",
    writeLabel: "서류 양식 작성하기",
    emptyMessage: "서류 양식이 없습니다.",
    titleTemplate: "서류 양식 자료 입니다",
    fileBaseName: "서류양식자료",
  },
};

function createDocuments(category: ArchiveDocumentCategory) {
  const config = archiveDocumentConfigs[category];

  return Array.from({ length: 45 }, (_, index): ArchiveDocument => {
    const id = index + 1;
    const day = String((index % 24) + 1).padStart(2, "0");

    return {
      id,
      category,
      title: config.titleTemplate,
      author: id % 4 === 0 ? "홍길동" : "작성자",
      date: `26.04.${day}`,
      description: `${config.title} 관련 자료 설명입니다.`,
      files: [`${config.fileBaseName}.pdf`, `${config.fileBaseName}.png`],
    };
  });
}

export const archiveDocuments: Record<ArchiveDocumentCategory, ArchiveDocument[]> = {
  handover: createDocuments("handover"),
  exam: createDocuments("exam"),
  forms: createDocuments("forms"),
};

export function getArchiveDocuments(category: ArchiveDocumentCategory) {
  return archiveDocuments[category];
}

export function getArchiveDocumentById(category: ArchiveDocumentCategory, id: number) {
  return archiveDocuments[category].find((document) => document.id === id);
}
