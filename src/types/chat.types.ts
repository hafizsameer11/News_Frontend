export interface ChatMessage {
  id: string;
  message: string;
  isRead: boolean;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  partner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  unreadCount?: number;
  lastMessageAt?: string;
}

export interface MessagesResponse {
  data: {
    messages: ChatMessage[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ConversationsResponse {
  data: Conversation[];
}

export interface ChatUsersResponse {
  data: ChatUser[];
}

export interface UnreadCountResponse {
  data: {
    count: number;
  };
}

export interface SendMessageInput {
  receiverId: string;
  message: string;
}
