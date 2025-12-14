"use client";

import { useState } from "react";
import { useConversations, useChatUsers } from "@/lib/hooks/useChat";
import { ConversationsResponse, ChatUsersResponse } from "@/types/chat.types";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { ConversationList } from "@/components/chat/conversation-list";
import { UserList } from "@/components/chat/user-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { cn } from "@/lib/helpers/cn";

export default function AdminChatPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"conversations" | "users">("conversations");
  const [showChatWindow, setShowChatWindow] = useState(false); // For mobile: toggle between list and chat

  const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError } = useConversations();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useChatUsers();

  const conversations = (conversationsData as ConversationsResponse | undefined)?.data || [];
  const users = (usersData as ChatUsersResponse | undefined)?.data || [];

  // If user is selected from users list, switch to conversations view
  const handleSelectUser = (userId: string) => {
    setSelectedPartnerId(userId);
    setViewMode("conversations");
    setShowChatWindow(true); // Show chat window on mobile
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedPartnerId(userId);
    setShowChatWindow(true); // Show chat window on mobile
  };

  // Get selected partner info
  const selectedPartner = selectedPartnerId
    ? conversations.find((c: { partner: { id: string } }) => c.partner.id === selectedPartnerId)?.partner ||
      users.find((u: { id: string }) => u.id === selectedPartnerId)
    : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("admin.chat")}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {language === "it" ? "Comunica con gli utenti" : "Communicate with users"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden flex-1 flex flex-col min-h-0" style={{ height: "calc(100vh - 180px)", maxHeight: "calc(100vh - 180px)" }}>
        <div className="flex h-full flex-1 min-h-0">
          {/* Sidebar - Hidden on mobile when chat is open */}
          <div className={cn(
            "border-r border-gray-200 flex flex-col transition-all duration-300",
            "w-full lg:w-80",
            showChatWindow && selectedPartnerId ? "hidden lg:flex" : "flex"
          )}>
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
                {language === "it" ? "Conversazioni" : "Conversations"}
              </button>
              <button
                onClick={() => setViewMode("users")}
                className={cn(
                  "flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition",
                  viewMode === "users"
                    ? "bg-red-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                {language === "it" ? "Tutti gli Utenti" : "All Users"}
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
                  users={users}
                  selectedUserId={selectedPartnerId}
                  onSelectUser={handleSelectUser}
                  isLoading={usersLoading}
                  error={usersError}
                />
              )}
            </div>
          </div>

          {/* Chat Window - Full width on mobile when selected */}
          <div className={cn(
            "flex-1 flex flex-col min-h-0",
            showChatWindow && selectedPartnerId ? "flex" : "hidden lg:flex"
          )}>
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
                    aria-label={language === "it" ? "Torna alle conversazioni" : "Back to conversations"}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                      <p className="font-medium text-gray-900 truncate">{selectedPartner.name}</p>
                      <p className="text-xs text-gray-500">
                        {language === "it" ? "Online" : "Online"}
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
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500 px-4">
                  <p className="text-base sm:text-lg font-medium mb-2">
                    {language === "it" ? "Seleziona una conversazione" : "Select a conversation"}
                  </p>
                  <p className="text-xs sm:text-sm">
                    {language === "it" 
                      ? "Scegli un utente dall'elenco per iniziare a chattare" 
                      : "Choose a user from the list to start chatting"}
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
