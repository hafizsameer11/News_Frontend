"use client";

import { Conversation } from "@/types/chat.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

interface ConversationListProps {
  conversations: Conversation[];
  selectedPartnerId?: string;
  onSelectConversation: (partnerId: string) => void;
  isLoading?: boolean;
  error?: unknown;
}

export function ConversationList({
  conversations,
  selectedPartnerId,
  onSelectConversation,
  isLoading,
  error,
}: ConversationListProps) {
  const { t } = useLanguage();

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

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-5xl mb-4">💬</div>
        <p className="text-sm font-medium mb-1">{t("chat.noConversations")}</p>
        <p className="text-xs">{t("chat.noConversationsHint")}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.partner.id}
          onClick={() => onSelectConversation(conv.partner.id)}
          className={`w-full p-3 sm:p-4 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all text-left ${
            selectedPartnerId === conv.partner.id
              ? "bg-red-50 border-l-4 border-l-red-600"
              : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {conv.partner.avatar ? (
              <Image
                src={conv.partner.avatar}
                alt={conv.partner.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                unoptimized={
                  conv.partner.avatar.includes("localhost") ||
                  conv.partner.avatar.includes("127.0.0.1")
                }
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {conv.partner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {conv.partner.name}
                </h3>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full min-w-[20px] text-center flex-shrink-0">
                    {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">
                {conv.lastMessage.message}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(conv.lastMessage.createdAt, "MMM dd, HH:mm")}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
