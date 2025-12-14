import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/modules/chat.api";
import { SendMessageInput, ConversationsResponse, ChatUsersResponse } from "@/types/chat.types";

// Get all conversations
export const useConversations = () => {
  return useQuery<ConversationsResponse>({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatApi.getConversations(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

// Get messages between current user and a partner
export const useMessages = (partnerId: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: ["chat", "messages", partnerId, page, limit],
    queryFn: () => chatApi.getMessages(partnerId, page, limit),
    enabled: !!partnerId,
    refetchInterval: 5000, // Refetch every 5 seconds when viewing messages
  });
};

// Send a message mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageInput) => chatApi.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate conversations and messages
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ["chat", "unread-count"] });
    },
  });
};

// Mark messages as read mutation
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => chatApi.markAsRead(partnerId),
    onSuccess: (_, partnerId) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["chat", "unread-count"] });
    },
  });
};

// Get unread message count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["chat", "unread-count"],
    queryFn: () => chatApi.getUnreadCount(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

// Get all users that admin can chat with (admin only)
export const useChatUsers = () => {
  return useQuery<ChatUsersResponse>({
    queryKey: ["chat", "users"],
    queryFn: () => chatApi.getChatUsers(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get available admins for users to chat with
export const useAvailableAdmins = () => {
  return useQuery<ChatUsersResponse>({
    queryKey: ["chat", "admins"],
    queryFn: () => chatApi.getAvailableAdmins(),
  });
};
