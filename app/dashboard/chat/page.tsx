"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConversations, useAvailableAdmins } from "@/lib/hooks/useChat";
import { ConversationsResponse, ChatUsersResponse } from "@/types/chat.types";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { ConversationList } from "@/components/chat/conversation-list";
import { UserList } from "@/components/chat/user-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { cn } from "@/lib/helpers/cn";

export default function UserChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [selectedPartnerId, setSelectedPartnerId] = useState<
    string | undefined
  >();
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
  const [viewMode, setViewMode] = useState<"conversations" | "admins">(
    "conversations"
  );

  // Get selected partner info
  const selectedPartner = selectedPartnerId
    ? conversations.find((c) => c.partner.id === selectedPartnerId)?.partner ||
      admins.find((a) => a.id === selectedPartnerId)
    : null;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Redirect non-USER roles
    if (user) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/chat");
        return;
      } else if (user.role === "EDITOR") {
        router.push("/editor");
        return;
      } else if (user.role === "ADVERTISER") {
        router.push("/advertiser/dashboard");
        return;
      }
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== "USER") {
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
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-red-600 transition">
          {t("dashboard.title")}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t("chat.title")}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("chat.title")}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {t("chat.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            style={{
              minHeight: "calc(100vh - 300px)",
              maxHeight: "calc(100vh - 300px)",
            }}
          >
            <div className="flex h-full flex-1 min-h-0">
              {/* Sidebar */}
              <div
                className={cn(
                  "border-r border-gray-200 flex flex-col transition-all duration-300",
                  "w-full lg:w-80",
                  showChatWindow && selectedPartnerId
                    ? "hidden lg:flex"
                    : "flex"
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
                    {t("chat.admins")}
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
                  showChatWindow && selectedPartnerId
                    ? "flex"
                    : "hidden lg:flex"
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
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-base sm:text-lg font-medium mb-2">
                        {t("chat.selectConversation")}
                      </p>
                      <p className="text-xs sm:text-sm">
                        {t("chat.selectConversationHint")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500 px-4 max-w-md">
                      <div className="text-6xl mb-4">💭</div>
                      <p className="text-base sm:text-lg font-medium mb-2">
                        {t("chat.noConversations")}
                      </p>
                      <p className="text-xs sm:text-sm mb-4">
                        {t("chat.noConversationsHint")}
                      </p>
                      {admins.length > 0 && (
                        <button
                          onClick={() => setViewMode("admins")}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                        >
                          {t("chat.startConversation")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Links Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t("chat.relatedLinks.title")}
            </h2>
            <div className="space-y-3">
              <Link
                href="/bookmarks"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <span className="text-2xl">🔖</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition">
                  {t("nav.bookmarks")}
                </span>
              </Link>
              <Link
                href="/report"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <span className="text-2xl">⚠️</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition">
                  {t("report.reportContent")}
                </span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <span className="text-2xl">📰</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition">
                  {t("dashboard.exploreNews")}
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <span className="text-2xl">📊</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition">
                  {t("dashboard.title")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
