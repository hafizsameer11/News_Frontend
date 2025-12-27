"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memoApi } from "@/lib/api/modules/memo.api";
import { MemoType } from "@/types/memo.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface CreateMemoProps {
  userId: string;
  userName: string;
}

export function CreateMemo({ userId, userName }: CreateMemoProps) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [type, setType] = useState<MemoType>("NOTE");
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("0");

  const createMemoMutation = useMutation({
    mutationFn: memoApi.createMemo,
    onSuccess: async (response) => {
      const newMemo = response?.data;
      
      // Optimistically update the cache immediately
      if (newMemo) {
        queryClient.setQueryData(["memos", userId], (oldData: any) => {
          if (!oldData) {
            return {
              success: true,
              message: "",
              data: [newMemo],
            };
          }
          const currentMemos = Array.isArray(oldData.data) ? oldData.data : [];
          return {
            ...oldData,
            data: [newMemo, ...currentMemos],
          };
        });
      }
      
      // Then invalidate and refetch to sync with server
      queryClient.invalidateQueries({ 
        queryKey: ["memos", userId],
        exact: true
      });
      
      // Small delay to ensure the optimistic update renders first
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ["memos", userId],
          exact: true
        });
      }, 100);
      
      setMessage("");
      setWhen("0");
      setType("NOTE");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    createMemoMutation.mutate({
      type,
      message: message.trim(),
      when: parseInt(when) || 0,
      userId,
    });
  };

  const handleClear = () => {
    setMessage("");
    setWhen("0");
    setType("NOTE");
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-bold text-gray-700 mb-4">Create Memo</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Memo type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MemoType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="NOTE">Note</option>
            <option value="REMINDER">Reminder</option>
            <option value="TASK">Task</option>
            <option value="FOLLOW_UP">Follow Up</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter memo message..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            When
          </label>
          <input
            type="number"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createMemoMutation.isPending || !message.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {createMemoMutation.isPending ? "Creating..." : "Create memo"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition"
          >
            Clear fields
          </button>
        </div>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        Memos are saved to the database and will appear in the list below.
      </p>
    </div>
  );
}

