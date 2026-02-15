import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { api, ApiError } from '@/lib/api';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  joinedDate: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  authMethod: 'email' | 'phone' | 'google' | 'apple';
}

export interface ShareItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  title: string;
  description: string;
  story: string;
  category: string;
  condition: string;
  pickupInfo: string;
  images: string[];
  location: string;
  appreciations: number;
  appreciatedBy: string[];
  commentCount: number;
  comments: Comment[];
  requests: ItemRequest[];
  status: 'available' | 'claimed' | 'completed';
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface ItemRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  ownerId: string;
  ownerName: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface Moment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  itemId: string;
  itemTitle: string;
  caption: string;
  imageUri: string | null;
  role: 'giver' | 'receiver';
  appreciations: number;
  appreciatedBy: string[];
  comments: MomentComment[];
  commentCount: number;
  createdAt: string;
}

export interface MomentComment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participantOneId: string;
  participantOneName: string;
  participantOneAvatar: string | null;
  participantTwoId: string;
  participantTwoName: string;
  participantTwoAvatar: string | null;
  itemId?: string;
  itemTitle?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export type ReportReason = 'spam' | 'selling' | 'inappropriate' | 'fake_account' | 'harassment';

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUsername: string;
  reason: ReportReason;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

const CATEGORIES = ['Books', 'Clothes', 'Electronics', 'Furniture', 'Toys', 'Kitchen', 'Sports', 'Other'];

export const REPORT_REASONS: { key: ReportReason; label: string; icon: string }[] = [
  { key: 'spam', label: 'Spam', icon: 'mail-unread-outline' },
  { key: 'selling', label: 'Selling items', icon: 'cash-outline' },
  { key: 'inappropriate', label: 'Inappropriate behavior', icon: 'warning-outline' },
  { key: 'fake_account', label: 'Fake account', icon: 'person-remove-outline' },
  { key: 'harassment', label: 'Harassment', icon: 'shield-outline' },
];

interface AppContextValue {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  items: ShareItem[];
  moments: Moment[];
  reports: UserReport[];
  chats: Chat[];
  messages: Message[];
  addItem: (item: Omit<ShareItem, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy' | 'commentCount' | 'comments' | 'requests' | 'status'>) => Promise<ShareItem>;
  appreciateItem: (itemId: string) => void;
  addComment: (itemId: string, text: string) => void;
  requestItem: (itemId: string, reason: string) => void;
  approveRequest: (itemId: string, requestId: string) => void;
  declineRequest: (itemId: string, requestId: string) => void;
  completeExchange: (itemId: string) => void;
  getItemById: (id: string) => ShareItem | undefined;
  getUserItems: (userId: string) => ShareItem[];
  getIncomingRequests: () => ItemRequest[];
  getOutgoingRequests: () => ItemRequest[];
  addMoment: (moment: Omit<Moment, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy' | 'comments' | 'commentCount'>) => Promise<Moment>;
  appreciateMoment: (momentId: string) => void;
  addMomentComment: (momentId: string, content: string) => void;
  getUserMoments: (userId: string) => Moment[];
  addReport: (report: Omit<UserReport, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  getUserById: (userId: string) => UserProfile | null;
  getChatWithUser: (userId: string) => Chat | undefined;
  createOrGetChat: (userId: string, itemId?: string) => Chat;
  sendMessage: (chatId: string, content: string) => void;
  getChatMessages: (chatId: string) => Message[];
  markMessagesAsRead: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'email' | 'phone' | 'emailVerified' | 'phoneVerified' | 'avatar'>>) => Promise<void>;
  signUp: (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => Promise<void>;
  logout: () => Promise<void>;
  categories: string[];
  isLoading: boolean;
  setupProfile: (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  USER: '@takeitfree_user',
  ITEMS: '@takeitfree_items',
  MOMENTS: '@takeitfree_moments',
  REPORTS: '@takeitfree_reports',
  CHATS: '@takeitfree_chats',
  MESSAGES: '@takeitfree_messages',
};
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<ShareItem[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, itemsData, momentsData, reportsData, chatsData, messagesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
        AsyncStorage.getItem(STORAGE_KEYS.MOMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
        AsyncStorage.getItem(STORAGE_KEYS.CHATS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
      ]);

      if (userData) {
        try {
          setCurrentUser(JSON.parse(userData));
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
      if (itemsData) {
        try {
          setItems(JSON.parse(itemsData));
        } catch (e) {
          console.error('Failed to parse items data:', e);
          setItems([]);
        }
      } else {
        setItems([]);
      }
      if (momentsData) {
        try {
          setMoments(JSON.parse(momentsData));
        } catch (e) {
          console.error('Failed to parse moments data:', e);
          setMoments([]);
        }
      } else {
        setMoments([]);
      }
      if (reportsData) {
        try {
          setReports(JSON.parse(reportsData));
        } catch (e) {
          console.error('Failed to parse reports data:', e);
        }
      }
      if (chatsData) {
        try {
          setChats(JSON.parse(chatsData));
        } catch (e) {
          console.error('Failed to parse chats data:', e);
        }
      }
      if (messagesData) {
        try {
          setMessages(JSON.parse(messagesData));
        } catch (e) {
          console.error('Failed to parse messages data:', e);
        }
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveItems = useCallback(async (newItems: ShareItem[]) => {
    setItems(newItems);
    await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(newItems));
  }, []);

  const saveMoments = useCallback(async (newMoments: Moment[]) => {
    setMoments(newMoments);
    await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(newMoments));
  }, []);

  const setupProfile = useCallback(async (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    if (!profile.username || !profile.displayName) {
      throw new Error('Missing required profile fields: username and displayName');
    }
    try {
      // Call API to create user account
      const apiResponse = await api.signup({
        username: profile.username,
        password: profile.authMethod === 'email' ? 'temp_password' : '', // TODO: Handle password from auth flow
      });

      const user: UserProfile = {
        ...profile,
        email: profile.email || '',
        phone: profile.phone || '',
        emailVerified: profile.emailVerified || false,
        phoneVerified: profile.phoneVerified || false,
        authMethod: profile.authMethod || 'email',
        id: (apiResponse as any).id || Crypto.randomUUID(),
        joinedDate: new Date().toISOString(),
      };
      setCurrentUser(user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Signup failed: ${error.message}`);
      }
      console.error('Failed to setup profile:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    await setupProfile(profile);
  }, [setupProfile]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'email' | 'phone' | 'emailVerified' | 'phoneVerified' | 'avatar'>>) => {
    if (!currentUser) {
      throw new Error('Cannot update profile: no current user');
    }
    try {
      // TODO: Send profile update to API endpoint
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [currentUser]);

  const addItem = useCallback(async (itemData: Omit<ShareItem, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy' | 'commentCount' | 'comments' | 'requests' | 'status'>) => {
    if (!itemData.title || !itemData.userId) {
      throw new Error('Missing required item fields: title and userId');
    }
    try {
      // TODO: Send item to API endpoint
      const newItem: ShareItem = {
        ...itemData,
        id: Crypto.randomUUID(),
        appreciations: 0, appreciatedBy: [], commentCount: 0, comments: [], requests: [],
        status: 'available', createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...items];
      await saveItems(updated);
      return newItem;
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  }, [items, saveItems]);

  const appreciateItem = useCallback((itemId: string) => {
    if (!currentUser) {
      console.warn('Cannot appreciate item: no current user');
      return;
    }
    try {
      setItems(prev => {
        const item = prev.find(i => i.id === itemId);
        if (!item) {
          console.warn(`Item ${itemId} not found`);
          return prev;
        }
        const updated = prev.map(item => {
          if (item.id === itemId) {
            const already = item.appreciatedBy.includes(currentUser.id);
            return {
              ...item,
              appreciations: already ? item.appreciations - 1 : item.appreciations + 1,
              appreciatedBy: already ? item.appreciatedBy.filter(id => id !== currentUser.id) : [...item.appreciatedBy, currentUser.id],
            };
          }
          return item;
        });
        AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to appreciate item:', error);
    }
  }, [currentUser]);

  const addComment = useCallback((itemId: string, text: string) => {
    if (!currentUser) {
      console.warn('Cannot add comment: no current user');
      return;
    }
    if (!text.trim()) {
      console.warn('Comment text is empty');
      return;
    }
    try {
      const comment: Comment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: currentUser.id, username: currentUser.username, text, createdAt: new Date().toISOString(),
      };
      setItems(prev => {
        const item = prev.find(i => i.id === itemId);
        if (!item) {
          console.warn(`Item ${itemId} not found`);
          return prev;
        }
        const updated = prev.map(item => {
          if (item.id === itemId) {
            return { ...item, comments: [...item.comments, comment], commentCount: item.commentCount + 1 };
          }
          return item;
        });
        AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [currentUser]);

  const requestItem = useCallback((itemId: string, reason: string) => {
    if (!currentUser) {
      console.warn('Cannot request item: no current user');
      return;
    }
    if (!reason.trim()) {
      console.warn('Request reason is empty');
      return;
    }
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) {
        console.warn(`Item ${itemId} not found`);
        return;
      }
      const request: ItemRequest = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        itemId, itemTitle: item.title, requesterId: currentUser.id, requesterName: currentUser.displayName,
        requesterAvatar: currentUser.avatar, ownerId: item.userId, ownerName: item.username, reason,
        status: 'pending', createdAt: new Date().toISOString(),
      };
      setItems(prev => {
        const updated = prev.map(i => i.id === itemId ? { ...i, requests: [...i.requests, request] } : i);
        AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to request item:', error);
    }
  }, [currentUser, items]);

  const approveRequest = useCallback((itemId: string, requestId: string) => {
    try {
      if (!itemId || !requestId) {
        console.warn('Missing itemId or requestId');
        return;
      }
      setItems(prev => {
        const updated = prev.map(item => {
          if (item.id === itemId) {
            return {
              ...item, status: 'claimed' as const,
              requests: item.requests.map(r =>
                r.id === requestId ? { ...r, status: 'approved' as const }
                  : r.status === 'pending' ? { ...r, status: 'declined' as const } : r
              ),
            };
          }
          return item;
        });
        AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  }, []);

  const declineRequest = useCallback((itemId: string, requestId: string) => {
    try {
      if (!itemId || !requestId) {
        console.warn('Missing itemId or requestId');
        return;
      }
      setItems(prev => {
        const updated = prev.map(item => {
          if (item.id === itemId) {
            return { ...item, requests: item.requests.map(r => r.id === requestId ? { ...r, status: 'declined' as const } : r) };
          }
          return item;
        });
        AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  }, []);

  const completeExchange = useCallback((itemId: string) => {
    try {
      if (!itemId) {
        console.warn('Missing itemId');
        return;
      }
      setItems(prev => {
        const updated = prev.map(item => {
          if (item.id === itemId) {
            return { ...item, status: 'completed' as const };
          }
          return item;
        });
        AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to complete exchange:', error);
    }
  }, []);

  const addMoment = useCallback(async (momentData: Omit<Moment, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy'>) => {
    if (!momentData.userId || !momentData.caption) {
      throw new Error('Missing required moment fields: userId and caption');
    }
    try {
      // TODO: Send moment to API endpoint
      const newMoment: Moment = {
        ...momentData,
        id: Crypto.randomUUID(),
        appreciations: 0, appreciatedBy: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [newMoment, ...moments];
      await saveMoments(updated);
      return newMoment;
    } catch (error) {
      console.error('Failed to add moment:', error);
      throw error;
    }
  }, [moments, saveMoments]);

  const appreciateMoment = useCallback((momentId: string) => {
    if (!currentUser) {
      console.warn('Cannot appreciate moment: no current user');
      return;
    }
    try {
      setMoments(prev => {
        const moment = prev.find(m => m.id === momentId);
        if (!moment) {
          console.warn(`Moment ${momentId} not found`);
          return prev;
        }
        const updated = prev.map(m => {
          if (m.id === momentId) {
            const already = m.appreciatedBy.includes(currentUser.id);
            return {
              ...m,
              appreciations: already ? m.appreciations - 1 : m.appreciations + 1,
              appreciatedBy: already ? m.appreciatedBy.filter(id => id !== currentUser.id) : [...m.appreciatedBy, currentUser.id],
            };
          }
          return m;
        });
        AsyncStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to appreciate moment:', error);
    }
  }, [currentUser]);

  const getUserMoments = useCallback((userId: string) => moments.filter(m => m.userId === userId), [moments]);

  const addMomentComment = useCallback((momentId: string, content: string) => {
    if (!currentUser) {
      console.warn('Cannot add comment: no current user');
      return;
    }
    if (!content.trim()) {
      console.warn('Comment content is empty');
      return;
    }
    try {
      // TODO: Send moment comment to API when backend is ready
      // await api.addMomentComment(momentId, { userId: currentUser.id, content });

      const comment: MomentComment = {
        id: Crypto.randomUUID(),
        userId: currentUser.id,
        username: currentUser.username,
        content,
        createdAt: new Date().toISOString(),
      };
      setMoments(prev => {
        const moment = prev.find(m => m.id === momentId);
        if (!moment) {
          console.warn(`Moment ${momentId} not found`);
          return prev;
        }
        const updated = prev.map(m => {
          if (m.id === momentId) {
            return { ...m, comments: [...m.comments, comment], commentCount: m.commentCount + 1 };
          }
          return m;
        });
        AsyncStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to add moment comment:', error);
    }
  }, [currentUser]);

  const addReport = useCallback(async (reportData: Omit<UserReport, 'id' | 'createdAt' | 'status'>) => {
    if (!reportData.reporterId || !reportData.reportedUserId || !reportData.reason) {
      throw new Error('Missing required report fields');
    }
    try {
      // Send report to API endpoint
      const apiResponse = await api.createReport({
        reporterId: reportData.reporterId,
        reportedUserId: reportData.reportedUserId,
        reason: reportData.reason,
        details: reportData.details,
      });

      const report: UserReport = {
        ...reportData,
        id: (apiResponse as any).id || Crypto.randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const updated = [report, ...reports];
      setReports(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create report: ${error.message}`);
      }
      console.error('Failed to create report:', error);
      throw error;
    }
  }, [reports]);

  const getUserById = useCallback((userId: string) => {
    if (!userId) {
      console.warn('Invalid userId');
      return null;
    }
    // Check if it's the current user
    if (currentUser?.id === userId) return currentUser;
    // TODO: Fetch user from server or database using API
    // const user = await fetch(`/api/users/${userId}`).then(r => r.json());
    console.warn(`User ${userId} not found in local cache`);
    return null;
  }, [currentUser]);

  const getChatWithUser = useCallback((userId: string) => {
    if (!currentUser) return undefined;
    return chats.find(c => 
      (c.participantOneId === currentUser.id && c.participantTwoId === userId) ||
      (c.participantTwoId === currentUser.id && c.participantOneId === userId)
    );
  }, [currentUser, chats]);

  const createOrGetChat = useCallback((userId: string, itemId?: string): Chat => {
    if (!currentUser) {
      throw new Error('Cannot create chat: no current user');
    }
    if (!userId) {
      throw new Error('Invalid userId');
    }
    
    try {
      const existingChat = getChatWithUser(userId);
      if (existingChat) return existingChat;

      const otherUser = getUserById(userId);
      if (!otherUser) {
        throw new Error('User not found');
      }

      const newChat: Chat = {
        id: Crypto.randomUUID(),
        participantOneId: currentUser.id,
        participantOneName: currentUser.displayName,
        participantOneAvatar: currentUser.avatar,
        participantTwoId: userId,
        participantTwoName: otherUser.displayName,
        participantTwoAvatar: otherUser.avatar,
        itemId,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updated = [newChat, ...chats];
      setChats(updated);
      AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updated));
      return newChat;
    } catch (error) {
      console.error('Failed to create or get chat:', error);
      throw error;
    }
  }, [currentUser, chats, getChatWithUser, getUserById]);

  const sendMessage = useCallback((chatId: string, content: string) => {
    if (!currentUser) {
      console.warn('Cannot send message: no current user');
      return;
    }
    if (!content.trim()) {
      console.warn('Message content is empty');
      return;
    }
    if (!chatId) {
      console.warn('Invalid chatId');
      return;
    }
    try {
      // TODO: Send message to API when backend is ready
      // await api.sendMessage({ chatId, senderId: currentUser.id, content });

      const message: Message = {
        id: Crypto.randomUUID(),
        chatId,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const newMessages = [message, ...messages];
      setMessages(newMessages);
      AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(newMessages));

      // Update chat's last message
      setChats(prev => {
        const updated = prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: content.substring(0, 50),
              lastMessageTime: new Date().toISOString(),
            };
          }
          return c;
        });
        AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentUser, messages]);

  const getChatMessages = useCallback((chatId: string) => {
    return messages.filter(m => m.chatId === chatId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [messages]);

  const markMessagesAsRead = useCallback((chatId: string) => {
    if (!currentUser) {
      console.warn('Cannot mark messages as read: no current user');
      return;
    }
    if (!chatId) {
      console.warn('Invalid chatId');
      return;
    }
    try {
      setMessages(prev => {
        const updated = prev.map(m => {
          if (m.chatId === chatId && !m.isRead) {
            return { ...m, isRead: true };
          }
          return m;
        });
        AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [currentUser]);

  const deleteChat = useCallback((chatId: string) => {
    if (!chatId) {
      console.warn('Invalid chatId');
      return;
    }
    try {
      setChats(prev => {
        const updated = prev.filter(c => c.id !== chatId);
        AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updated));
        return updated;
      });
      setMessages(prev => {
        const updated = prev.filter(m => m.chatId !== chatId);
        AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  }, []);

  const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);
  const getUserItems = useCallback((userId: string) => items.filter(i => i.userId === userId), [items]);

  const getIncomingRequests = useCallback(() => {
    if (!currentUser) return [];
    return items.flatMap(item => item.userId === currentUser.id ? item.requests : []);
  }, [currentUser, items]);

  const getOutgoingRequests = useCallback(() => {
    if (!currentUser) return [];
    return items.flatMap(item => item.requests.filter(r => r.requesterId === currentUser.id));
  }, [currentUser, items]);

  const value = useMemo(() => ({
    currentUser, setCurrentUser, items, moments, reports, chats, messages,
    addItem, appreciateItem, addComment, requestItem, approveRequest, declineRequest, completeExchange,
    getItemById, getUserItems, getIncomingRequests, getOutgoingRequests,
    addMoment, appreciateMoment, addMomentComment, getUserMoments,
    addReport, getUserById, getChatWithUser, createOrGetChat, sendMessage, getChatMessages, markMessagesAsRead, deleteChat,
    updateProfile, signUp, logout, categories: CATEGORIES, isLoading, setupProfile,
  }), [currentUser, items, moments, reports, chats, messages, addItem, appreciateItem, addComment, requestItem,
    approveRequest, declineRequest, completeExchange, getItemById, getUserItems, getIncomingRequests,
    getOutgoingRequests, addMoment, appreciateMoment, addMomentComment, getUserMoments, addReport, getUserById,
    getChatWithUser, createOrGetChat, sendMessage, getChatMessages, markMessagesAsRead, deleteChat, updateProfile,
    signUp, logout, isLoading, setupProfile]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
