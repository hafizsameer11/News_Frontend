import { apiClient } from "../apiClient";
import { MemosResponse, CreateMemoInput } from "@/types/memo.types";

export const memoApi = {
  // Create a new memo
  createMemo: (data: CreateMemoInput) => {
    return apiClient.post<{ data: any }>("/memo", data);
  },

  // Get all memos for a specific user
  getMemosByUser: (userId: string) => {
    return apiClient.get<MemosResponse>(`/memo/user/${userId}`);
  },

  // Delete a memo
  deleteMemo: (memoId: string) => {
    return apiClient.delete<{ message: string }>(`/memo/${memoId}`);
  },
};


