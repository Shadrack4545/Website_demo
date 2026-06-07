import { createContext, useState, useEffect, ReactNode } from 'react';
import { ChatRequest, GroupChat, ChatRequestStatus } from '../types';
import { createId } from '../utils/ids';

export interface ChatRequestContextType {
  // Chat Requests
  chatRequests: ChatRequest[];
  pendingRequests: ChatRequest[];
  approvedRequests: ChatRequest[];
  rejectedRequests: ChatRequest[];
  
  // Group Chats
  groupChats: GroupChat[];
  
  // Chat Request Operations
  createChatRequest: (data: Omit<ChatRequest, 'id' | 'createdAt'>) => void;
  approveChatRequest: (requestId: string, approvedBy: string, approvedByName: string) => void;
  rejectChatRequest: (requestId: string, rejectionReason: string) => void;
  deleteChatRequest: (requestId: string) => void;
  
  // Group Chat Operations
  createGroupChat: (data: Omit<GroupChat, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteGroupChat: (groupChatId: string) => void;
  addMemberToChat: (groupChatId: string, memberId: string) => void;
  removeMemberFromChat: (groupChatId: string, memberId: string) => void;
  
  // Stats
  getPendingRequestCount: () => number;
  getGroupChatsByMember: (memberId: string) => GroupChat[];
}

export const ChatRequestContext = createContext<ChatRequestContextType | undefined>(undefined);

const CHAT_REQUESTS_STORAGE_KEY = 'chat_requests';
const GROUP_CHATS_STORAGE_KEY = 'group_chats';

export function ChatRequestProvider({ children }: { children: ReactNode }) {
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedRequests = localStorage.getItem(CHAT_REQUESTS_STORAGE_KEY);
    const storedChats = localStorage.getItem(GROUP_CHATS_STORAGE_KEY);

    if (storedRequests) {
      setChatRequests(JSON.parse(storedRequests));
    }
    if (storedChats) {
      setGroupChats(JSON.parse(storedChats));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(CHAT_REQUESTS_STORAGE_KEY, JSON.stringify(chatRequests));
  }, [chatRequests]);

  useEffect(() => {
    localStorage.setItem(GROUP_CHATS_STORAGE_KEY, JSON.stringify(groupChats));
  }, [groupChats]);

  // Chat Request Operations
  const createChatRequest = (data: Omit<ChatRequest, 'id' | 'createdAt'>) => {
    const newRequest: ChatRequest = {
      ...data,
      id: createId('chat_req'),
      createdAt: Date.now(),
    };
    setChatRequests([...chatRequests, newRequest]);
  };

  const approveChatRequest = (requestId: string, approvedBy: string, approvedByName: string) => {
    const request = chatRequests.find((r) => r.id === requestId);
    if (!request) return;

    // Update request status
    const updatedRequest: ChatRequest = {
      ...request,
      status: 'approved',
      approvedBy,
      approvedByName,
      approvedAt: Date.now(),
    };
    setChatRequests(chatRequests.map((r) => (r.id === requestId ? updatedRequest : r)));

    // Create group chat from request
    const newGroupChat: GroupChat = {
      id: createId('group_chat'),
      name: request.name,
      description: request.description,
      createdBy: request.requestedBy,
      createdByName: request.requestedByName,
      members: request.members,
      chatRequestId: requestId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGroupChats([...groupChats, newGroupChat]);
  };

  const rejectChatRequest = (requestId: string, rejectionReason: string) => {
    const updated = chatRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'rejected' as ChatRequestStatus,
            rejectionReason,
            approvedAt: Date.now(),
          }
        : r
    );
    setChatRequests(updated);
  };

  const deleteChatRequest = (requestId: string) => {
    setChatRequests(chatRequests.filter((r) => r.id !== requestId));
  };

  // Group Chat Operations
  const createGroupChat = (data: Omit<GroupChat, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChat: GroupChat = {
      ...data,
      id: createId('group_chat'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGroupChats([...groupChats, newChat]);
  };

  const deleteGroupChat = (groupChatId: string) => {
    setGroupChats(groupChats.filter((chat) => chat.id !== groupChatId));
  };

  const addMemberToChat = (groupChatId: string, memberId: string) => {
    setGroupChats(
      groupChats.map((chat) => {
        if (chat.id === groupChatId && !chat.members.includes(memberId)) {
          return {
            ...chat,
            members: [...chat.members, memberId],
            updatedAt: Date.now(),
          };
        }
        return chat;
      })
    );
  };

  const removeMemberFromChat = (groupChatId: string, memberId: string) => {
    setGroupChats(
      groupChats.map((chat) => {
        if (chat.id === groupChatId) {
          return {
            ...chat,
            members: chat.members.filter((m) => m !== memberId),
            updatedAt: Date.now(),
          };
        }
        return chat;
      })
    );
  };

  // Computed properties
  const pendingRequests = chatRequests.filter((r) => r.status === 'pending');
  const approvedRequests = chatRequests.filter((r) => r.status === 'approved');
  const rejectedRequests = chatRequests.filter((r) => r.status === 'rejected');

  const getPendingRequestCount = () => pendingRequests.length;

  const getGroupChatsByMember = (memberId: string) => {
    return groupChats.filter((chat) => chat.members.includes(memberId));
  };

  const value: ChatRequestContextType = {
    chatRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    groupChats,
    createChatRequest,
    approveChatRequest,
    rejectChatRequest,
    deleteChatRequest,
    createGroupChat,
    deleteGroupChat,
    addMemberToChat,
    removeMemberFromChat,
    getPendingRequestCount,
    getGroupChatsByMember,
  };

  return (
    <ChatRequestContext.Provider value={value}>{children}</ChatRequestContext.Provider>
  );
}
