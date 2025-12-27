"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memoApi } from "@/lib/api/modules/memo.api";
import { Memo } from "@/types/memo.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface MemoListProps {
  userId: string;
}

export function MemoList({ userId }: MemoListProps) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: memosData, isLoading, refetch } = useQuery({
    queryKey: ["memos", userId],
    queryFn: () => memoApi.getMemosByUser(userId),
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const deleteMemoMutation = useMutation({
    mutationFn: memoApi.deleteMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memos", userId] });
      refetch();
    },
  });

  // The API returns ApiResponse<Memo[]>, so memosData.data is Memo[]
  const memos: Memo[] = Array.isArray(memosData?.data) 
    ? (memosData.data as Memo[])
    : [];

  const handleDelete = (memoId: string) => {
    if (confirm("Are you sure you want to delete this memo?")) {
      deleteMemoMutation.mutate(memoId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === "it" ? "it-IT" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading && !memos.length) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-4">Created Memos</h3>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col h-full">
      <h3 className="font-bold text-gray-700 mb-4">Created Memos</h3>
      <div className="flex-1 overflow-y-auto space-y-3">
        {memos.length === 0 ? (
          <p className="text-sm text-gray-500">No memos created yet.</p>
        ) : (
          memos.map((memo: Memo) => (
            <div
              key={memo.id}
              className="border-b border-gray-200 pb-3 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {memo.type}
                    </span>
                    {memo.createdBy && (
                      <span className="text-xs text-gray-500">
                        · {memo.createdBy.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{memo.message}</p>
                  <p className="text-xs text-gray-500">
                    When: {memo.when} · Created: {formatDate(memo.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(memo.id)}
                  disabled={deleteMemoMutation.isPending}
                  className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

