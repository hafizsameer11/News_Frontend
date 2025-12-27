export type MemoType = "NOTE" | "REMINDER" | "TASK" | "FOLLOW_UP";

export interface Memo {
  id: string;
  type: MemoType;
  message: string;
  when: number;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemoInput {
  type: MemoType;
  message: string;
  when: number;
  userId: string;
}

export type MemosResponse = Memo[];


