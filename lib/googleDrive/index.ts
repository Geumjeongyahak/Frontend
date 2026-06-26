import {
  registerAppsScriptFile,
  registerAppsScriptFileWithMetadata,
  uploadAppsScriptFile,
} from "@/lib/googleDrive/appsScriptFile.api";
import type {
  RegisteredAppsScriptFileDto,
  UploadedAppsScriptFileDto,
} from "@/lib/googleDrive/appsScriptFile.dto";
import type { AppsScriptFileTarget, UploadTargetConfig } from "@/lib/googleDrive/uploadTargets";

function createTargetUploader(target: AppsScriptFileTarget) {
  return async (file: File): Promise<RegisteredAppsScriptFileDto> => {
    const uploaded = await uploadAppsScriptFile({ file, target });
    return registerAppsScriptFile(uploaded);
  };
}

export function uploadBoardDocument(file: File, target: UploadTargetConfig) {
  return registerAppsScriptFileWithMetadata({ file, target });
}

export const uploadEventDocument = createTargetUploader("event");
export const uploadMeetingRecordDocument = createTargetUploader("meetingRecord");
export const uploadHandoverDocument = createTargetUploader("handover");
export const uploadExamMaterialsDocument = createTargetUploader("examMaterials");
export const uploadDocumentFormsDocument = createTargetUploader("documentForms");
export const uploadMeetingRecordDocumentWithMetadata = (file: File) =>
  registerAppsScriptFileWithMetadata({ file, target: "meetingRecord" });

export type { AppsScriptFileTarget, UploadTargetConfig, UploadedAppsScriptFileDto };
