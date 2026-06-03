import type { QueryClient, QueryKey } from "@tanstack/react-query";

import type { PostListResponseDto } from "@/api/post/post.dto";
import { queryKeys } from "@/lib/queryKeys";

type HandlePostDeleteSuccessOptions = {
  channelId: number;
  postId: number;
  redirect: () => void;
  extraInvalidateKeys?: QueryKey[];
};

export function handlePostDeleteSuccess(
  queryClient: QueryClient,
  { channelId, postId, redirect, extraInvalidateKeys = [] }: HandlePostDeleteSuccessOptions,
) {
  const detailKey = queryKeys.posts.boardDetail(channelId, postId);

  queryClient.cancelQueries({ queryKey: detailKey });

  redirect();

  queryClient.removeQueries({ queryKey: detailKey });

  queryClient.setQueriesData<PostListResponseDto>({ queryKey: ["posts"] }, (current) => {
    if (!current?.content) return current;

    return {
      ...current,
      content: current.content.filter((post) => post.id !== postId),
      totalElements:
        typeof current.totalElements === "number"
          ? Math.max(0, current.totalElements - 1)
          : current.totalElements,
    };
  });

  void queryClient.invalidateQueries({ queryKey: ["posts"], refetchType: "none" });

  for (const queryKey of extraInvalidateKeys) {
    void queryClient.invalidateQueries({ queryKey, refetchType: "none" });
  }
}
