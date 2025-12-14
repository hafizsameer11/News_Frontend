"use client";

import { ChatUser } from "@/types/chat.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Image from "next/image";

interface UserListProps {
  users: ChatUser[];
  selectedUserId?: string;
  onSelectUser: (userId: string) => void;
  isLoading?: boolean;
  error?: unknown;
}

export function UserList({
  users,
  selectedUserId,
  onSelectUser,
  isLoading,
  error,
}: UserListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No users to chat with yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition text-left ${
            selectedUserId === user.id ? "bg-red-50 border-red-200" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
                unoptimized={user.avatar.includes("localhost") || user.avatar.includes("127.0.0.1")}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                {user.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                    {user.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Last message: {formatDate(user.lastMessageAt, "MMM dd, HH:mm")}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
