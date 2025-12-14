import { apiClient } from "../apiClient";
import {
  ConversationsResponse,
  MessagesResponse,
  ChatUsersResponse,
  UnreadCountResponse,
  SendMessageInput,
} from "@/types/chat.types";

export const chatApi = {
  // Get all conversations for current user
  getConversations: () => {
    return apiClient.get<ConversationsResponse>("/chat/conversations");
  },

  // Get messages between current user and a partner
  getMessages: (partnerId: string, page?: number, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());

    const url = `/chat/messages/${partnerId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<MessagesResponse>(url);
  },

  // Send a message
  sendMessage: (data: SendMessageInput) => {
    return apiClient.post<{ data: { id: string; message: string; createdAt: string } }>("/chat/send", data);
  },

  // Mark messages as read
  markAsRead: (partnerId: string) => {
    return apiClient.post<{ message: string }>(`/chat/read/${partnerId}`);
  },

  // Get unread message count
  getUnreadCount: () => {
    return apiClient.get<UnreadCountResponse>("/chat/unread-count");
  },

  // Get all users that admin can chat with (admin only)
  getChatUsers: () => {
    return apiClient.get<ChatUsersResponse>("/chat/users");
  },

  // Get available admins for users to chat with
  getAvailableAdmins: () => {
    return apiClient.get<ChatUsersResponse>("/chat/admins");
  },
};
