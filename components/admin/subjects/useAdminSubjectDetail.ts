"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteSubject, updateSubject, updateSubjectSchedule } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { getSubjectId } from "@/components/admin/subjects/subjectDisplay";
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
} from "@/components/admin/subjects/subjectDetailForm";
import { queryKeys } from "@/lib/queryKeys";

type UseAdminSubjectDetailParams = {
  subject: SubjectDetailResponseDto | null;
  onClearSelection: () => void;
};

export function useAdminSubjectDetail({ subject, onClearSelection }: UseAdminSubjectDetailParams) {
  const queryClient = useQueryClient();
  const subjectId = subject ? getSubjectId(subject) : null;

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [infoForm, setInfoForm] = useState<SubjectInfoFormValues>({ name: "", description: "" });
  const [scheduleForm, setScheduleForm] = useState<SubjectScheduleFormValues>({
    startAt: "",
    endAt: "",
    dayOfWeek: null,
    startTime: "",
    endTime: "",
    period: "1",
  });
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setIsEditingInfo(false);
    setIsEditingSchedule(false);
    setActionError(null);
  }, [subjectId]);

  useEffect(() => {
    if (!subject) return;

    if (!isEditingInfo) {
      setInfoForm(mapSubjectToInfoForm(subject));
    }
    if (!isEditingSchedule) {
      setScheduleForm(mapSubjectToScheduleForm(subject));
    }
  }, [subject, isEditingInfo, isEditingSchedule]);

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
      setIsEditingInfo(false);
      await invalidateSubjects();
    },
    onError: (error) => {
      setActionError(resolveSubjectMutationError(error, "과목 수정에 실패했습니다."));
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
      setIsEditingSchedule(false);
      await invalidateSubjects();
    },
    onError: (error) => {
      setActionError(resolveSubjectMutationError(error, "과목 일정 수정에 실패했습니다."));
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
      setActionError(resolveSubjectMutationError(error, "과목 삭제에 실패했습니다."));
    },
  });

  const isActionPending =
    updateInfoMutation.isPending || updateScheduleMutation.isPending || deleteMutation.isPending;

  const startInfoEdit = () => {
    if (!subject) return;
    setActionError(null);
    setIsEditingSchedule(false);
    setInfoForm(mapSubjectToInfoForm(subject));
    setIsEditingInfo(true);
  };

  const cancelInfoEdit = () => {
    if (subject) {
      setInfoForm(mapSubjectToInfoForm(subject));
    }
    setActionError(null);
    setIsEditingInfo(false);
  };

  const startScheduleEdit = () => {
    if (!subject) return;
    setActionError(null);
    setIsEditingInfo(false);
    setScheduleForm(mapSubjectToScheduleForm(subject));
    setIsEditingSchedule(true);
  };

  const cancelScheduleEdit = () => {
    if (subject) {
      setScheduleForm(mapSubjectToScheduleForm(subject));
    }
    setActionError(null);
    setIsEditingSchedule(false);
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
