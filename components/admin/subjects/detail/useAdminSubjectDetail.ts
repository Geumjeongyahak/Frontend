"use client";

import { useState } from "react";
import type { SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteSubject, updateSubject, updateSubjectSchedule } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { getSubjectId } from "@/components/admin/subjects/shared/subjectDisplay";
import {
  mapSubjectInfoFormToPayload,
  mapSubjectScheduleFormToPayload,
  mapSubjectToInfoForm,
  mapSubjectToScheduleForm,
  resolveSubjectMutationError,
  validateSubjectInfoForm,
  validateSubjectScheduleForm,
  type SubjectInfoFormValues,
  type SubjectScheduleFormValues,
} from "@/components/admin/subjects/detail/subjectDetailForm";
import { queryKeys } from "@/lib/queryKeys";

type UseAdminSubjectDetailParams = {
  subject: SubjectDetailResponseDto | null;
  onClearSelection: () => void;
};

const emptyInfoForm: SubjectInfoFormValues = { name: "", description: "" };
const emptyScheduleForm: SubjectScheduleFormValues = {
  startAt: "",
  endAt: "",
  dayOfWeek: null,
  startTime: "",
  endTime: "",
  period: "1",
};

export function useAdminSubjectDetail({ subject, onClearSelection }: UseAdminSubjectDetailParams) {
  const queryClient = useQueryClient();
  const subjectId = subject ? getSubjectId(subject) : null;

  const [editState, setEditState] = useState({
    subjectId: null as number | null,
    isEditingInfo: false,
    isEditingSchedule: false,
    actionError: null as string | null,
  });
  const [formState, setFormState] = useState<{
    subjectId: number | null;
    infoForm: SubjectInfoFormValues;
    scheduleForm: SubjectScheduleFormValues;
  }>({
    subjectId: null,
    infoForm: emptyInfoForm,
    scheduleForm: emptyScheduleForm,
  });
  const isCurrentSubject = editState.subjectId === subjectId;
  const isEditingInfo = isCurrentSubject && editState.isEditingInfo;
  const isEditingSchedule = isCurrentSubject && editState.isEditingSchedule;
  const actionError = isCurrentSubject ? editState.actionError : null;
  const infoForm =
    formState.subjectId === subjectId && isEditingInfo
      ? formState.infoForm
      : subject
        ? mapSubjectToInfoForm(subject)
        : emptyInfoForm;
  const scheduleForm =
    formState.subjectId === subjectId && isEditingSchedule
      ? formState.scheduleForm
      : subject
        ? mapSubjectToScheduleForm(subject)
        : emptyScheduleForm;
  const updateEditState = (
    patch: Partial<Omit<typeof editState, "subjectId">>,
  ) => {
    setEditState((current) => ({
      ...(current.subjectId === subjectId
        ? current
        : { subjectId, isEditingInfo: false, isEditingSchedule: false, actionError: null }),
      ...patch,
      subjectId,
    }));
  };
  const setActionError = (actionError: string | null) => updateEditState({ actionError });
  const setInfoForm = (updater: SetStateAction<SubjectInfoFormValues>) => {
    setFormState((current) => {
      const baseForm =
        current.subjectId === subjectId
          ? current.infoForm
          : subject
            ? mapSubjectToInfoForm(subject)
            : emptyInfoForm;
      return {
        subjectId,
        infoForm: typeof updater === "function" ? updater(baseForm) : updater,
        scheduleForm:
          current.subjectId === subjectId
            ? current.scheduleForm
            : subject
              ? mapSubjectToScheduleForm(subject)
              : emptyScheduleForm,
      };
    });
  };
  const setScheduleForm = (updater: SetStateAction<SubjectScheduleFormValues>) => {
    setFormState((current) => {
      const baseForm =
        current.subjectId === subjectId
          ? current.scheduleForm
          : subject
            ? mapSubjectToScheduleForm(subject)
            : emptyScheduleForm;
      return {
        subjectId,
        infoForm:
          current.subjectId === subjectId
            ? current.infoForm
            : subject
              ? mapSubjectToInfoForm(subject)
              : emptyInfoForm,
        scheduleForm: typeof updater === "function" ? updater(baseForm) : updater,
      };
    });
  };

  const invalidateSubjects = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
  };

  const updateInfoMutation = useMutation({
    mutationFn: async () => {
      if (subjectId == null) throw new Error("과목을 선택해 주세요.");
      return updateSubject({ subjectId }, mapSubjectInfoFormToPayload(infoForm));
    },
    onSuccess: async () => {
      toast.success("과목 정보를 수정했습니다.");
      setActionError(null);
      updateEditState({ isEditingInfo: false });
      await invalidateSubjects();
    },
    onError: (error) => {
      setActionError(null);
      toast.error(resolveSubjectMutationError(error, "과목 수정에 실패했습니다."));
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async () => {
      if (subjectId == null) throw new Error("과목을 선택해 주세요.");
      return updateSubjectSchedule({ subjectId }, mapSubjectScheduleFormToPayload(scheduleForm));
    },
    onSuccess: async () => {
      toast.success("과목 일정을 수정했습니다.");
      setActionError(null);
      updateEditState({ isEditingSchedule: false });
      await invalidateSubjects();
    },
    onError: (error) => {
      setActionError(null);
      toast.error(resolveSubjectMutationError(error, "과목 일정 수정에 실패했습니다."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (subjectId == null) throw new Error("과목을 선택해 주세요.");
      await deleteSubject({ subjectId });
    },
    onSuccess: async () => {
      setActionError(null);
      onClearSelection();
      await invalidateSubjects();
      toast.success("과목이 삭제되었습니다.");
    },
    onError: (error) => {
      setActionError(null);
      toast.error(resolveSubjectMutationError(error, "과목 삭제에 실패했습니다."));
    },
  });

  const isActionPending =
    updateInfoMutation.isPending || updateScheduleMutation.isPending || deleteMutation.isPending;

  const startInfoEdit = () => {
    if (!subject) return;
    setActionError(null);
    updateEditState({ isEditingSchedule: false });
    setInfoForm(mapSubjectToInfoForm(subject));
    updateEditState({ isEditingInfo: true });
  };

  const cancelInfoEdit = () => {
    if (subject) {
      setInfoForm(mapSubjectToInfoForm(subject));
    }
    setActionError(null);
    updateEditState({ isEditingInfo: false });
  };

  const startScheduleEdit = () => {
    if (!subject) return;
    setActionError(null);
    updateEditState({ isEditingInfo: false });
    setScheduleForm(mapSubjectToScheduleForm(subject));
    updateEditState({ isEditingSchedule: true });
  };

  const cancelScheduleEdit = () => {
    if (subject) {
      setScheduleForm(mapSubjectToScheduleForm(subject));
    }
    setActionError(null);
    updateEditState({ isEditingSchedule: false });
  };

  const saveInfo = () => {
    const validationError = validateSubjectInfoForm(infoForm);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    setActionError(null);
    updateInfoMutation.mutate();
  };

  const saveSchedule = () => {
    const validationError = validateSubjectScheduleForm(scheduleForm);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    setActionError(null);
    updateScheduleMutation.mutate();
  };

  const removeSubject = () => {
    if (subjectId == null) return;
    if (!window.confirm("선택한 과목을 삭제할까요?")) return;
    setActionError(null);
    deleteMutation.mutate();
  };

  const clearActionError = () => setActionError(null);

  return {
    isEditingInfo,
    isEditingSchedule,
    infoForm,
    setInfoForm,
    scheduleForm,
    setScheduleForm,
    actionError,
    clearActionError,
    isActionPending,
    startInfoEdit,
    cancelInfoEdit,
    startScheduleEdit,
    cancelScheduleEdit,
    saveInfo,
    saveSchedule,
    removeSubject,
  };
}

export type AdminSubjectDetailViewModel = ReturnType<typeof useAdminSubjectDetail>;
