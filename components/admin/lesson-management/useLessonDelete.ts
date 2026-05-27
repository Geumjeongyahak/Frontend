"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteLesson } from "@/api/lesson/lesson.api";
import { resolveLessonDeleteErrorMessage } from "@/components/admin/lesson-management/lessonCreateError";

type UseLessonDeleteParams = {
  onDeleted?: () => void;
};

export function useLessonDelete({ onDeleted }: UseLessonDeleteParams = {}) {
  const queryClient = useQueryClient();

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: number) => deleteLesson({ lessonId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "lessons"] });
      toast.success("수업을 삭제했습니다.");
      onDeleted?.();
    },
    onError: (error) => {
      toast.error(resolveLessonDeleteErrorMessage(error));
    },
  });

  return {
    deleteLessonById: deleteLessonMutation.mutate,
    isDeleting: deleteLessonMutation.isPending,
  };
}
