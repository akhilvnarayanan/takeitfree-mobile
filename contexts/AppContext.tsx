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
  addMoment: (moment: Omit<Moment, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy'>) => Promise<Moment>;
  appreciateMoment: (momentId: string) => void;
  getUserMoments: (userId: string) => Moment[];
  addReport: (report: Omit<UserReport, 'id' | 'createdAt' | 'status'>) => Promise<void>;
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
      id: 'item_1', userId: seedUsers[0].id, username: seedUsers[0].username, userAvatar: null,
      title: 'Vintage Fiction Collection',
      description: '12 well-loved novels including classics by Austen, Bronte, and Hemingway. Some spine wear but all pages intact.',
      story: 'These books carried me through college and many quiet evenings. Now that I\'ve moved to a smaller place, I want them to bring the same joy to someone else.',
      category: 'Books', condition: 'Good - minor wear', pickupInfo: 'Available evenings after 6pm, downtown area',
      images: [], location: 'Downtown', appreciations: 24, appreciatedBy: ['seed_2', 'seed_3'], commentCount: 3,
      comments: [
        { id: 'c1', userId: 'seed_2', username: 'alex_shares', text: 'Beautiful collection! Love the classics.', createdAt: new Date(now - 3600000).toISOString() },
        { id: 'c2', userId: 'seed_3', username: 'priya_free', text: 'My daughter would love the Austen novels!', createdAt: new Date(now - 1800000).toISOString() },
      ],
      requests: [], status: 'available', createdAt: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'item_2', userId: seedUsers[1].id, username: seedUsers[1].username, userAvatar: null,
      title: 'Kids Bicycle - Age 6-8',
      description: 'Blue and white 20-inch bike with training wheels. Recently tuned up with new brake pads.',
      story: 'My son outgrew this bike faster than I expected. It taught him to ride and I hope it does the same for another child.',
      category: 'Sports', condition: 'Great - recently serviced', pickupInfo: 'Weekends preferred, can help load into car',
      images: [], location: 'Westside', appreciations: 38, appreciatedBy: ['seed_3', 'seed_4', 'seed_5'], commentCount: 5,
      comments: [
        { id: 'c3', userId: 'seed_4', username: 'sam_reuse', text: 'This is so generous! My niece needs exactly this.', createdAt: new Date(now - 7200000).toISOString() },
      ],
      requests: [], status: 'available', createdAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'item_3', userId: seedUsers[2].id, username: seedUsers[2].username, userAvatar: null,
      title: 'Standing Desk Converter',
      description: 'Adjustable standing desk riser, fits on any table. Holds monitor and keyboard. Gas spring mechanism.',
      story: 'Switching to a full standing desk so this converter needs a new home. It helped me so much with back pain during WFH.',
      category: 'Furniture', condition: 'Excellent', pickupInfo: 'Available anytime, ground floor access',
      images: [], location: 'Midtown', appreciations: 45, appreciatedBy: ['seed_1', 'seed_4'], commentCount: 8,
      comments: [
        { id: 'c4', userId: 'seed_1', username: 'maya_gives', text: 'Wish I saw this sooner!', createdAt: new Date(now - 5400000).toISOString() },
      ],
      requests: [], status: 'available', createdAt: new Date(now - 86400000 * 3).toISOString(),
    },
    {
      id: 'item_4', userId: seedUsers[3].id, username: seedUsers[3].username, userAvatar: null,
      title: 'Winter Coat - Women\'s M',
      description: 'Warm down parka in forest green, women\'s medium. Hood with faux fur trim. Worn two seasons.',
      story: 'I received a new coat as a gift and want to make sure this one keeps someone else warm this winter.',
      category: 'Clothes', condition: 'Very good', pickupInfo: 'Can meet at central station anytime',
      images: [], location: 'East Village', appreciations: 19, appreciatedBy: ['seed_1', 'seed_5'], commentCount: 2,
      comments: [], requests: [], status: 'available', createdAt: new Date(now - 86400000 * 4).toISOString(),
    },
    {
      id: 'item_5', userId: seedUsers[4].id, username: seedUsers[4].username, userAvatar: null,
      title: 'Instant Pot Duo 6qt',
      description: 'Multi-use pressure cooker with all accessories, manual, and recipe booklet included. Works perfectly.',
      story: 'Upgraded to a larger model for my growing family. This little pot made hundreds of meals and has lots of life left.',
      category: 'Kitchen', condition: 'Good - fully functional', pickupInfo: 'Available mornings, please message first',
      images: [], location: 'Northside', appreciations: 31, appreciatedBy: ['seed_2', 'seed_3', 'seed_4'], commentCount: 4,
      comments: [
        { id: 'c5', userId: 'seed_2', username: 'alex_shares', text: 'Perfect for a college student!', createdAt: new Date(now - 9000000).toISOString() },
      ],
      requests: [], status: 'available', createdAt: new Date(now - 86400000 * 5).toISOString(),
    },
    {
      id: 'item_6', userId: seedUsers[0].id, username: seedUsers[0].username, userAvatar: null,
      title: 'LEGO Creator Set',
      description: '3-in-1 Creator set, over 500 pieces. All pieces accounted for, includes original box and instructions.',
      story: 'My kids built this a dozen times and moved on to bigger sets. Time for another family to enjoy the creativity.',
      category: 'Toys', condition: 'Complete - all pieces', pickupInfo: 'Porch pickup available',
      images: [], location: 'Suburb Heights', appreciations: 52, appreciatedBy: ['seed_3', 'seed_4', 'seed_5'], commentCount: 6,
      comments: [], requests: [], status: 'available', createdAt: new Date(now - 3600000 * 8).toISOString(),
    },
  ];
}

function generateSeedMoments(): Moment[] {
  const now = Date.now();
  return [
    {
      id: 'moment_1', userId: 'seed_3', username: 'priya_free', userAvatar: null,
      itemId: 'seed_item', itemTitle: 'Children\'s Book Set',
      caption: 'My daughter was thrilled to receive these books! She started reading immediately. Thank you to this amazing community!',
      imageUri: null, role: 'receiver', appreciations: 15, appreciatedBy: ['seed_1', 'seed_2'],
      createdAt: new Date(now - 86400000 * 1).toISOString(),
    },
    {
      id: 'moment_2', userId: 'seed_1', username: 'maya_gives', userAvatar: null,
      itemId: 'seed_item2', itemTitle: 'Ceramic Plant Pots',
      caption: 'So happy these pots found a new home with someone who truly loves plants. Seeing them put to good use brings me joy!',
      imageUri: null, role: 'giver', appreciations: 22, appreciatedBy: ['seed_4', 'seed_5'],
      createdAt: new Date(now - 86400000 * 3).toISOString(),
    },
    {
      id: 'moment_3', userId: 'seed_4', username: 'sam_reuse', userAvatar: null,
      itemId: 'seed_item3', itemTitle: 'Guitar for Beginners',
      caption: 'First chords on my new (to me) guitar! Never thought I\'d start learning at 30. Grateful for this generous gift.',
      imageUri: null, role: 'receiver', appreciations: 31, appreciatedBy: ['seed_1', 'seed_2', 'seed_3'],
      createdAt: new Date(now - 86400000 * 5).toISOString(),
    },
  ];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<ShareItem[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, itemsData, momentsData, reportsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
        AsyncStorage.getItem(STORAGE_KEYS.MOMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
      ]);

      if (userData) setCurrentUser(JSON.parse(userData));
      if (itemsData) {
        setItems(JSON.parse(itemsData));
      } else {
        const seed = generateSeedData('');
        setItems(seed);
        await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(seed));
      }
      if (momentsData) {
        setMoments(JSON.parse(momentsData));
      } else {
        const seedM = generateSeedMoments();
        setMoments(seedM);
        await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(seedM));
      }
      if (reportsData) setReports(JSON.parse(reportsData));
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
    const user: UserProfile = {
      ...profile,
      email: profile.email || '',
      phone: profile.phone || '',
      emailVerified: profile.emailVerified || false,
      phoneVerified: profile.phoneVerified || false,
      authMethod: profile.authMethod || 'email',
      id: Crypto.randomUUID(),
      joinedDate: new Date().toISOString(),
    };
    setCurrentUser(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, []);

  const signUp = useCallback(async (profile: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    await setupProfile(profile);
  }, [setupProfile]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'email' | 'phone' | 'emailVerified' | 'phoneVerified' | 'avatar'>>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  }, [currentUser]);

  const addItem = useCallback(async (itemData: Omit<ShareItem, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy' | 'commentCount' | 'comments' | 'requests' | 'status'>) => {
    const newItem: ShareItem = {
      ...itemData,
      id: Crypto.randomUUID(),
      appreciations: 0, appreciatedBy: [], commentCount: 0, comments: [], requests: [],
      status: 'available', createdAt: new Date().toISOString(),
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
  }, [currentUser]);

  const addComment = useCallback((itemId: string, text: string) => {
    if (!currentUser) return;
    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id, username: currentUser.username, text, createdAt: new Date().toISOString(),
    };
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return { ...item, comments: [...item.comments, comment], commentCount: item.commentCount + 1 };
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
      itemId, itemTitle: item.title, requesterId: currentUser.id, requesterName: currentUser.displayName,
      requesterAvatar: currentUser.avatar, ownerId: item.userId, ownerName: item.username, reason,
      status: 'pending', createdAt: new Date().toISOString(),
    };
    setItems(prev => {
      const updated = prev.map(i => i.id === itemId ? { ...i, requests: [...i.requests, request] } : i);
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser, items]);

  const approveRequest = useCallback((itemId: string, requestId: string) => {
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
  }, []);

  const declineRequest = useCallback((itemId: string, requestId: string) => {
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
  }, []);

  const completeExchange = useCallback((itemId: string) => {
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
  }, []);

  const addMoment = useCallback(async (momentData: Omit<Moment, 'id' | 'createdAt' | 'appreciations' | 'appreciatedBy'>) => {
    const newMoment: Moment = {
      ...momentData,
      id: Crypto.randomUUID(),
      appreciations: 0, appreciatedBy: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newMoment, ...moments];
    await saveMoments(updated);
    return newMoment;
  }, [moments, saveMoments]);

  const appreciateMoment = useCallback((momentId: string) => {
    if (!currentUser) return;
    setMoments(prev => {
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
  }, [currentUser]);

  const getUserMoments = useCallback((userId: string) => moments.filter(m => m.userId === userId), [moments]);

  const addReport = useCallback(async (reportData: Omit<UserReport, 'id' | 'createdAt' | 'status'>) => {
    const report: UserReport = {
      ...reportData,
      id: Crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [report, ...reports];
    setReports(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  }, [reports]);

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
    currentUser, setCurrentUser, items, moments, reports,
    addItem, appreciateItem, addComment, requestItem, approveRequest, declineRequest, completeExchange,
    getItemById, getUserItems, getIncomingRequests, getOutgoingRequests,
    addMoment, appreciateMoment, getUserMoments, addReport, updateProfile, signUp, logout,
    categories: CATEGORIES, isLoading, setupProfile,
  }), [currentUser, items, moments, reports, addItem, appreciateItem, addComment, requestItem,
    approveRequest, declineRequest, completeExchange, getItemById, getUserItems, getIncomingRequests,
    getOutgoingRequests, addMoment, appreciateMoment, getUserMoments, addReport, updateProfile,
    signUp, logout, isLoading, setupProfile]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
