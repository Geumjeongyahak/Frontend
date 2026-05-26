"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLesson } from "@/api/lesson/lesson.api";
import {
  normalizeLessonTimeForApi,
  resolveLessonCreateErrorMessage,
} from "@/components/admin/lesson-management/lessonCreateError";

type UseLessonCreateSubmitParams = {
  teacherId: number | null;
  subjectId: number | null;
};

export function useLessonCreateSubmit({ teacherId, subjectId }: UseLessonCreateSubmitParams) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createLessonMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: async () => {
      setSubmitError(null);
      setDate("");
      setPeriod("1");
      setStartTime("");
      setEndTime("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "lessons"] });
    },
    onError: (error) => {
      setSubmitError(resolveLessonCreateErrorMessage(error));
    },
  });

  const parsedPeriod = Number(period);
  const canSubmit =
    teacherId != null &&
    teacherId > 0 &&
    subjectId != null &&
    subjectId > 0 &&
    date.trim().length > 0 &&
    Number.isInteger(parsedPeriod) &&
    parsedPeriod > 0 &&
    startTime.trim().length > 0 &&
    endTime.trim().length > 0 &&
    !createLessonMutation.isPending;

  const submitLesson = () => {
    if (!canSubmit || teacherId == null || subjectId == null) return;

    setSubmitError(null);
    createLessonMutation.mutate({
      subjectId,
      teacherId,
      date,
      startTime: normalizeLessonTimeForApi(startTime),
      endTime: normalizeLessonTimeForApi(endTime),
      period: parsedPeriod,
    });
  };

  const clearSubmitError = () => {
    if (submitError) setSubmitError(null);
  };

  return {
    date,
    setDate,
    period,
    setPeriod,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    submitError,
    canSubmit,
    submitLesson,
    clearSubmitError,
    isSubmitting: createLessonMutation.isPending,
  };
}
