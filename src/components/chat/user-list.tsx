"use client";

import { ChatUser } from "@/types/chat.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";
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
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-5xl mb-4">👤</div>
        <p className="text-sm font-medium mb-1">
          {language === "it"
            ? "Nessun admin disponibile"
            : "No admins available"}
        </p>
        <p className="text-xs">
          {language === "it"
            ? "Controlla più tardi o contatta il supporto"
            : "Check back later or contact support"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          className={`w-full p-3 sm:p-4 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all text-left ${
            selectedUserId === user.id
              ? "bg-red-50 border-l-4 border-l-red-600"
              : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                unoptimized={
                  user.avatar.includes("localhost") ||
                  user.avatar.includes("127.0.0.1")
                }
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {user.name}
                </h3>
                {user.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full min-w-[20px] text-center flex-shrink-0">
                    {user.unreadCount > 99 ? "99+" : user.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate mb-1">
                {user.email}
              </p>
              {user.lastMessageAt && (
                <p className="text-xs text-gray-400">
                  {language === "it" ? "Ultimo messaggio" : "Last message"}:{" "}
                  {formatDate(user.lastMessageAt, "MMM dd, HH:mm")}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
