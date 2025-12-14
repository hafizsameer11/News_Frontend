"use client";

import { Conversation } from "@/types/chat.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

interface ConversationListProps {
  conversations: Conversation[];
  selectedPartnerId?: string;
  onSelectConversation: (partnerId: string) => void;
  isLoading?: boolean;
  error?: any;
}

export function ConversationList({
  conversations,
  selectedPartnerId,
  onSelectConversation,
  isLoading,
  error,
}: ConversationListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.partner.id}
          onClick={() => onSelectConversation(conv.partner.id)}
          className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition text-left ${
            selectedPartnerId === conv.partner.id ? "bg-red-50 border-red-200" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {conv.partner.avatar ? (
              <img
                src={conv.partner.avatar}
                alt={conv.partner.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                {conv.partner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conv.partner.name}
                </h3>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conv.lastMessage.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(conv.lastMessage.createdAt, "MMM dd, HH:mm")}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
