import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  joinedDate: string;
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

const CATEGORIES = ['Books', 'Clothes', 'Electronics', 'Furniture', 'Toys', 'Kitchen', 'Sports', 'Other'];

interface AppContextValue {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  items: ShareItem[];
  addItem: (item: Omit<ShareItem, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy' | 'commentCount' | 'comments' | 'requests' | 'status'>) => Promise<ShareItem>;
  appreciateItem: (itemId: string) => void;
  addComment: (itemId: string, text: string) => void;
  requestItem: (itemId: string, reason: string) => void;
  approveRequest: (itemId: string, requestId: string) => void;
  declineRequest: (itemId: string, requestId: string) => void;
  getItemById: (id: string) => ShareItem | undefined;
  getUserItems: (userId: string) => ShareItem[];
  getIncomingRequests: () => ItemRequest[];
  getOutgoingRequests: () => ItemRequest[];
  categories: string[];
  isLoading: boolean;
  setupProfile: (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  USER: '@takeitfree_user',
  ITEMS: '@takeitfree_items',
};

function generateSeedData(userId: string): ShareItem[] {
  const now = Date.now();
  const seedUsers = [
    { id: 'seed_1', username: 'maya_gives', displayName: 'Maya Chen', avatar: null },
    { id: 'seed_2', username: 'alex_shares', displayName: 'Alex Rivera', avatar: null },
    { id: 'seed_3', username: 'priya_free', displayName: 'Priya Sharma', avatar: null },
    { id: 'seed_4', username: 'sam_reuse', displayName: 'Sam Okafor', avatar: null },
    { id: 'seed_5', username: 'nina_kind', displayName: 'Nina Park', avatar: null },
  ];

  return [
    {
      id: 'item_1',
      userId: seedUsers[0].id,
      username: seedUsers[0].username,
      userAvatar: null,
      title: 'Vintage Fiction Collection',
      description: '12 well-loved novels including classics by Austen, Bronte, and Hemingway. Some spine wear but all pages intact.',
      story: 'These books carried me through college and many quiet evenings. Now that I\'ve moved to a smaller place, I want them to bring the same joy to someone else.',
      category: 'Books',
      condition: 'Good - minor wear',
      pickupInfo: 'Available evenings after 6pm, downtown area',
      images: [],
      location: 'Downtown',
      appreciations: 24,
      appreciatedBy: ['seed_2', 'seed_3'],
      commentCount: 3,
      comments: [
        { id: 'c1', userId: 'seed_2', username: 'alex_shares', text: 'Beautiful collection! Love the classics.', createdAt: new Date(now - 3600000).toISOString() },
        { id: 'c2', userId: 'seed_3', username: 'priya_free', text: 'My daughter would love the Austen novels!', createdAt: new Date(now - 1800000).toISOString() },
      ],
      requests: [],
      status: 'available',
      createdAt: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'item_2',
      userId: seedUsers[1].id,
      username: seedUsers[1].username,
      userAvatar: null,
      title: 'Kids Bicycle - Age 6-8',
      description: 'Blue and white 20-inch bike with training wheels. Recently tuned up with new brake pads.',
      story: 'My son outgrew this bike faster than I expected. It taught him to ride and I hope it does the same for another child.',
      category: 'Sports',
      condition: 'Great - recently serviced',
      pickupInfo: 'Weekends preferred, can help load into car',
      images: [],
      location: 'Westside',
      appreciations: 38,
      appreciatedBy: ['seed_3', 'seed_4', 'seed_5'],
      commentCount: 5,
      comments: [
        { id: 'c3', userId: 'seed_4', username: 'sam_reuse', text: 'This is so generous! My niece needs exactly this.', createdAt: new Date(now - 7200000).toISOString() },
      ],
      requests: [],
      status: 'available',
      createdAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'item_3',
      userId: seedUsers[2].id,
      username: seedUsers[2].username,
      userAvatar: null,
      title: 'Standing Desk Converter',
      description: 'Adjustable standing desk riser, fits on any table. Holds monitor and keyboard. Gas spring mechanism.',
      story: 'Switching to a full standing desk so this converter needs a new home. It helped me so much with back pain during WFH.',
      category: 'Furniture',
      condition: 'Excellent',
      pickupInfo: 'Available anytime, ground floor access',
      images: [],
      location: 'Midtown',
      appreciations: 45,
      appreciatedBy: ['seed_1', 'seed_4'],
      commentCount: 8,
      comments: [
        { id: 'c4', userId: 'seed_1', username: 'maya_gives', text: 'Wish I saw this sooner!', createdAt: new Date(now - 5400000).toISOString() },
      ],
      requests: [],
      status: 'available',
      createdAt: new Date(now - 86400000 * 3).toISOString(),
    },
    {
      id: 'item_4',
      userId: seedUsers[3].id,
      username: seedUsers[3].username,
      userAvatar: null,
      title: 'Winter Coat - Women\'s M',
      description: 'Warm down parka in forest green, women\'s medium. Hood with faux fur trim. Worn two seasons.',
      story: 'I received a new coat as a gift and want to make sure this one keeps someone else warm this winter.',
      category: 'Clothes',
      condition: 'Very good',
      pickupInfo: 'Can meet at central station anytime',
      images: [],
      location: 'East Village',
      appreciations: 19,
      appreciatedBy: ['seed_1', 'seed_5'],
      commentCount: 2,
      comments: [],
      requests: [],
      status: 'available',
      createdAt: new Date(now - 86400000 * 4).toISOString(),
    },
    {
      id: 'item_5',
      userId: seedUsers[4].id,
      username: seedUsers[4].username,
      userAvatar: null,
      title: 'Instant Pot Duo 6qt',
      description: 'Multi-use pressure cooker with all accessories, manual, and recipe booklet included. Works perfectly.',
      story: 'Upgraded to a larger model for my growing family. This little pot made hundreds of meals and has lots of life left.',
      category: 'Kitchen',
      condition: 'Good - fully functional',
      pickupInfo: 'Available mornings, please message first',
      images: [],
      location: 'Northside',
      appreciations: 31,
      appreciatedBy: ['seed_2', 'seed_3', 'seed_4'],
      commentCount: 4,
      comments: [
        { id: 'c5', userId: 'seed_2', username: 'alex_shares', text: 'Perfect for a college student!', createdAt: new Date(now - 9000000).toISOString() },
      ],
      requests: [],
      status: 'available',
      createdAt: new Date(now - 86400000 * 5).toISOString(),
    },
    {
      id: 'item_6',
      userId: seedUsers[0].id,
      username: seedUsers[0].username,
      userAvatar: null,
      title: 'LEGO Creator Set',
      description: '3-in-1 Creator set, over 500 pieces. All pieces accounted for, includes original box and instructions.',
      story: 'My kids built this a dozen times and moved on to bigger sets. Time for another family to enjoy the creativity.',
      category: 'Toys',
      condition: 'Complete - all pieces',
      pickupInfo: 'Porch pickup available',
      images: [],
      location: 'Suburb Heights',
      appreciations: 52,
      appreciatedBy: ['seed_3', 'seed_4', 'seed_5'],
      commentCount: 6,
      comments: [],
      requests: [],
      status: 'available',
      createdAt: new Date(now - 3600000 * 8).toISOString(),
    },
  ];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<ShareItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, itemsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
      ]);

      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      if (itemsData) {
        setItems(JSON.parse(itemsData));
      } else {
        const seed = generateSeedData('');
        setItems(seed);
        await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(seed));
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

  const setupProfile = useCallback(async (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    const user: UserProfile = {
      ...profile,
      id: Crypto.randomUUID(),
      joinedDate: new Date().toISOString(),
    };
    setCurrentUser(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, []);

  const addItem = useCallback(async (itemData: Omit<ShareItem, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy' | 'commentCount' | 'comments' | 'requests' | 'status'>) => {
    const newItem: ShareItem = {
      ...itemData,
      id: Crypto.randomUUID(),
      appreciations: 0,
      appreciatedBy: [],
      commentCount: 0,
      comments: [],
      requests: [],
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    await saveItems(updated);
    return newItem;
  }, [items, saveItems]);

  const appreciateItem = useCallback((itemId: string) => {
    if (!currentUser) return;
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const alreadyAppreciated = item.appreciatedBy.includes(currentUser.id);
          return {
            ...item,
            appreciations: alreadyAppreciated ? item.appreciations - 1 : item.appreciations + 1,
            appreciatedBy: alreadyAppreciated
              ? item.appreciatedBy.filter(id => id !== currentUser.id)
              : [...item.appreciatedBy, currentUser.id],
          };
        }
        return item;
      });
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser]);

  const addComment = useCallback((itemId: string, text: string) => {
    if (!currentUser) return;
    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      text,
      createdAt: new Date().toISOString(),
    };
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            comments: [...item.comments, comment],
            commentCount: item.commentCount + 1,
          };
        }
        return item;
      });
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser]);

  const requestItem = useCallback((itemId: string, reason: string) => {
    if (!currentUser) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const request: ItemRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      itemId,
      itemTitle: item.title,
      requesterId: currentUser.id,
      requesterName: currentUser.displayName,
      requesterAvatar: currentUser.avatar,
      ownerId: item.userId,
      ownerName: item.username,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setItems(prev => {
      const updated = prev.map(i => {
        if (i.id === itemId) {
          return { ...i, requests: [...i.requests, request] };
        }
        return i;
      });
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser, items]);

  const approveRequest = useCallback((itemId: string, requestId: string) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'claimed' as const,
            requests: item.requests.map(r =>
              r.id === requestId
                ? { ...r, status: 'approved' as const }
                : r.status === 'pending'
                  ? { ...r, status: 'declined' as const }
                  : r
            ),
          };
        }
        return item;
      });
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const declineRequest = useCallback((itemId: string, requestId: string) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            requests: item.requests.map(r =>
              r.id === requestId ? { ...r, status: 'declined' as const } : r
            ),
          };
        }
        return item;
      });
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

  const getUserItems = useCallback((userId: string) => items.filter(i => i.userId === userId), [items]);

  const getIncomingRequests = useCallback(() => {
    if (!currentUser) return [];
    return items.flatMap(item =>
      item.userId === currentUser.id ? item.requests : []
    );
  }, [currentUser, items]);

  const getOutgoingRequests = useCallback(() => {
    if (!currentUser) return [];
    return items.flatMap(item =>
      item.requests.filter(r => r.requesterId === currentUser.id)
    );
  }, [currentUser, items]);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    items,
    addItem,
    appreciateItem,
    addComment,
    requestItem,
    approveRequest,
    declineRequest,
    getItemById,
    getUserItems,
    getIncomingRequests,
    getOutgoingRequests,
    categories: CATEGORIES,
    isLoading,
    setupProfile,
  }), [currentUser, items, addItem, appreciateItem, addComment, requestItem, approveRequest, declineRequest, getItemById, getUserItems, getIncomingRequests, getOutgoingRequests, isLoading, setupProfile]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
