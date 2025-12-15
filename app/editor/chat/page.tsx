"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversations, useAvailableAdmins } from "@/lib/hooks/useChat";
import { ConversationsResponse, ChatUsersResponse } from "@/types/chat.types";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { ConversationList } from "@/components/chat/conversation-list";
import { UserList } from "@/components/chat/user-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { cn } from "@/lib/helpers/cn";

export default function EditorChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [selectedPartnerId, setSelectedPartnerId] = useState<
    string | undefined
  >();
  const [viewMode, setViewMode] = useState<"conversations" | "admins">(
    "conversations"
  );
  const [showChatWindow, setShowChatWindow] = useState(false);

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();
  const {
    data: adminsData,
    isLoading: adminsLoading,
    error: adminsError,
  } = useAvailableAdmins();

  const conversations = (conversationsData as ConversationsResponse | undefined)?.data || [];
  const admins = (adminsData as ChatUsersResponse | undefined)?.data || [];

  // Get selected partner info
  const selectedPartner = selectedPartnerId
    ? conversations.find((c) => c.partner.id === selectedPartnerId)?.partner ||
      admins.find((a) => a.id === selectedPartnerId)
    : null;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin-login");
      return;
    }
    // Redirect non-EDITOR roles
    if (user) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/chat");
        return;
      } else if (user.role === "ADVERTISER") {
        router.push("/advertiser/chat");
        return;
      } else if (user.role === "USER") {
        router.push("/dashboard/chat");
        return;
      }
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== "EDITOR") {
    return null;
  }

  const handleSelectConversation = (userId: string) => {
    setSelectedPartnerId(userId);
    setShowChatWindow(true);
  };

  const handleSelectAdmin = (userId: string) => {
    setSelectedPartnerId(userId);
    setShowChatWindow(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("dashboard.chatWithAdmin")}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {t("editor.chatDescription")}
        </p>
      </div>

      <div
        className="bg-white rounded-lg shadow-md overflow-hidden flex-1 flex flex-col min-h-0"
        style={{
          height: "calc(100vh - 180px)",
          maxHeight: "calc(100vh - 180px)",
        }}
      >
        <div className="flex h-full flex-1 min-h-0">
          {/* Sidebar */}
          <div
            className={cn(
              "border-r border-gray-200 flex flex-col transition-all duration-300",
              "w-full lg:w-80",
              showChatWindow && selectedPartnerId ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setViewMode("conversations")}
                className={cn(
                  "flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition",
                  viewMode === "conversations"
                    ? "bg-red-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                {t("chat.conversations")}
              </button>
              <button
                onClick={() => setViewMode("admins")}
                className={cn(
                  "flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition",
                  viewMode === "admins"
                    ? "bg-red-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                {t("admin.admin")}
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {viewMode === "conversations" ? (
                <ConversationList
                  conversations={conversations}
                  selectedPartnerId={selectedPartnerId}
                  onSelectConversation={handleSelectConversation}
                  isLoading={conversationsLoading}
                  error={conversationsError}
                />
              ) : (
                <UserList
                  users={admins.map((admin) => ({
                    ...admin,
                    unreadCount: 0,
                    lastMessageAt: new Date().toISOString(),
                  }))}
                  selectedUserId={selectedPartnerId}
                  onSelectUser={handleSelectAdmin}
                  isLoading={adminsLoading}
                  error={adminsError}
                />
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={cn(
              "flex-1 flex flex-col min-h-0",
              showChatWindow && selectedPartnerId ? "flex" : "hidden lg:flex"
            )}
          >
            {selectedPartnerId && selectedPartner ? (
              <>
                {/* Mobile back button */}
                <div className="lg:hidden flex items-center gap-3 p-3 border-b border-gray-200 bg-white flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowChatWindow(false);
                      setSelectedPartnerId(undefined);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md transition"
                    aria-label={t("chat.backToConversations")}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selectedPartner.avatar ? (
                      <img
                        src={selectedPartner.avatar}
                        alt={selectedPartner.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold text-sm">
                        {selectedPartner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {selectedPartner.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("common.online")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatWindow
                    partnerId={selectedPartnerId}
                    partnerName={selectedPartner.name}
                    partnerAvatar={selectedPartner.avatar}
                    currentUserId={user.id}
                    currentUserName={user.name}
                  />
                </div>
              </>
            ) : conversations.length > 0 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500 px-4">
                  <p className="text-base sm:text-lg font-medium mb-2">
                    {t("chat.selectConversation")}
                  </p>
                  <p className="text-xs sm:text-sm">{t("chat.chooseAdmin")}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500 px-4">
                  <p className="text-base sm:text-lg font-medium mb-2">
                    {t("chat.noConversations")}
                  </p>
                  <p className="text-xs sm:text-sm">
                    {t("chat.startConversation")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
