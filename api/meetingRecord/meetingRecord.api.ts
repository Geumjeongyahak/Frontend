import authClient from "../client/authClient";
import type {
  CreateMeetingRecordRequestDto,
  LinkMeetingRecordAttachmentRequestDto,
  MeetingAbsenceReportPathParamsDto,
  MeetingAbsenceReportResponseDto,
  MeetingRecordAttachmentDto,
  MeetingRecordAttachmentPathParamsDto,
  MeetingRecordDetailResponseDto,
  MeetingRecordListQueryParamsDto,
  MeetingRecordListResponseDto,
  MeetingRecordPathParamsDto,
  UpdateMeetingRecordRequestDto,
  UpsertMeetingAbsenceReportRequestDto,
} from "./meetingRecord.dto";

// 교학 회의록 목록을 조회하는 요청
export async function getMeetingRecords(query: MeetingRecordListQueryParamsDto) {
  const response = await authClient.get<MeetingRecordListResponseDto>(
    "/api/v1/meeting-records",
    { params: query },
  );
  return response.data;
}

// 교학 회의록을 생성하는 요청
export async function createMeetingRecord(body: CreateMeetingRecordRequestDto) {
  const response = await authClient.post<MeetingRecordDetailResponseDto>(
    "/api/v1/meeting-records",
    body,
  );
  return response.data;
}

// 교학 회의록 상세를 조회하는 요청
export async function getMeetingRecord(pathParams: MeetingRecordPathParamsDto) {
  const response = await authClient.get<MeetingRecordDetailResponseDto>(
    `/api/v1/meeting-records/${pathParams.recordId}`,
  );
  return response.data;
}

// 교학 회의록을 수정하는 요청
export async function updateMeetingRecord(
  pathParams: MeetingRecordPathParamsDto,
  body: UpdateMeetingRecordRequestDto,
) {
  const response = await authClient.patch<MeetingRecordDetailResponseDto>(
    `/api/v1/meeting-records/${pathParams.recordId}`,
    body,
  );
  return response.data;
}

// 교학 회의록을 삭제하는 요청
export async function deleteMeetingRecord(pathParams: MeetingRecordPathParamsDto) {
  await authClient.delete(`/api/v1/meeting-records/${pathParams.recordId}`);
}

// 교학 회의록에 불참 사유서를 추가하는 요청
export async function createAbsenceReport(
  pathParams: MeetingRecordPathParamsDto,
  body: UpsertMeetingAbsenceReportRequestDto,
) {
  const response = await authClient.post<MeetingAbsenceReportResponseDto>(
    `/api/v1/meeting-records/${pathParams.recordId}/absence-reports`,
    body,
  );
  return response.data;
}

// 교학 회의록의 불참 사유서를 수정하는 요청
export async function updateAbsenceReport(
  pathParams: MeetingAbsenceReportPathParamsDto,
  body: UpsertMeetingAbsenceReportRequestDto,
) {
  const response = await authClient.patch<MeetingAbsenceReportResponseDto>(
    `/api/v1/meeting-records/${pathParams.recordId}/absence-reports/${pathParams.absenceReportId}`,
    body,
  );
  return response.data;
}

// 교학 회의록의 불참 사유서를 삭제하는 요청
export async function deleteAbsenceReport(pathParams: MeetingAbsenceReportPathParamsDto) {
  await authClient.delete(
    `/api/v1/meeting-records/${pathParams.recordId}/absence-reports/${pathParams.absenceReportId}`,
  );
}

// 교학 회의록에 파일을 직접 업로드하는 요청 (multipart/form-data)
export async function attachMeetingRecordFile(
  pathParams: MeetingRecordPathParamsDto,
  file: Blob,
  filename?: string,
) {
  const formData = new FormData();
  formData.append("file", filename ? new File([file], filename) : file);
  const response = await authClient.post<MeetingRecordAttachmentDto>(
    `/api/v1/meeting-records/${pathParams.recordId}/attachments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

// 이미 등록된 파일을 교학 회의록에 연결하는 요청
export async function linkMeetingRecordAttachment(
  pathParams: MeetingRecordPathParamsDto,
  body: LinkMeetingRecordAttachmentRequestDto,
) {
  const response = await authClient.post<MeetingRecordAttachmentDto>(
    `/api/v1/meeting-records/${pathParams.recordId}/attachments`,
    body,
  );
  return response.data;
}

// 교학 회의록 첨부파일을 삭제하는 요청
export async function deleteMeetingRecordAttachment(
  pathParams: MeetingRecordAttachmentPathParamsDto,
) {
  await authClient.delete(
    `/api/v1/meeting-records/${pathParams.recordId}/attachments/${pathParams.fileId}`,
  );
}
