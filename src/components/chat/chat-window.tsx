"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  useMessages,
  useSendMessage,
  useMarkAsRead,
} from "@/lib/hooks/useChat";
import { ChatMessage } from "@/types/chat.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

interface ChatWindowProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  currentUserId: string;
  currentUserName: string;
}

export function ChatWindow({
  partnerId,
  partnerName,
  partnerAvatar,
  currentUserId,
  currentUserName: _currentUserName,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useMessages(partnerId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const { t, language } = useLanguage();

  const messages = useMemo(() => data?.data?.messages || [], [data?.data?.messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when component mounts or partner changes
  useEffect(() => {
    if (partnerId) {
      markAsReadMutation.mutate(partnerId);
    }
  }, [partnerId, markAsReadMutation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    try {
      await sendMessageMutation.mutateAsync({
        receiverId: partnerId,
        message: message.trim(),
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-3 sm:p-4 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          {partnerAvatar ? (
            <Image
              src={partnerAvatar}
              alt={partnerName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              unoptimized={
                partnerAvatar.includes("localhost") ||
                partnerAvatar.includes("127.0.0.1")
              }
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {partnerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {partnerName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {t("common.online")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-sm font-medium mb-1">
              {language === "it"
                ? "Nessun messaggio ancora"
                : "No messages yet"}
            </p>
            <p className="text-xs">
              {language === "it"
                ? "Inizia la conversazione!"
                : "Start the conversation!"}
            </p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isOwnMessage = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                } animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-2 shadow-sm ${
                    isOwnMessage
                      ? "bg-red-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                    {msg.message}
                  </p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isOwnMessage ? "text-red-100" : "text-gray-500"
                    }`}
                  >
                    {formatDate(msg.createdAt, "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-white flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              language === "it" ? "Scrivi un messaggio..." : "Type a message..."
            }
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base font-medium flex-shrink-0"
          >
            {sendMessageMutation.isPending
              ? language === "it"
                ? "Invio..."
                : "Sending..."
              : language === "it"
              ? "Invia"
              : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
