import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Heart, Crown, ShoppingBag, ArrowRight, Shield, Flame, UserCheck, Search, Filter, MessageSquare, AlertTriangle, Eye, RefreshCw, Bell, ImageOff, ShieldAlert, Gift, Upload, MailCheck } from 'lucide-react';
import { SingleProfile, User, CartItem, DateType, SubscriptionPlan, PaymentTransaction, AdminStats, ReelItem, StoryItem, FeedPost, Conversation, DirectMessage, NotificationItem, CentralizedLoadingState } from './types';
import { hasValidProfilePhoto, getValidProfilePhotos } from './utils/format';
import { Navbar, MainTabType } from './components/Navbar';
import { SinglesFilterBar } from './components/SinglesFilterBar';
import { SingleCard } from './components/SingleCard';
import { CartDrawer } from './components/CartDrawer';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { PaymentModal } from './components/PaymentModal';
import { UserProfileEditorModal } from './components/UserProfileEditorModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal, AuthModalMode } from './components/AuthModal';
import { ToastNotification, Toast } from './components/ToastNotification';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { markNotificationReceived, getNotificationDedupeKeys } from './utils/pushNotification';
import { dataCache, INITIAL_LOADING_STATE } from './utils/dataCache';

// Dating with Bouncer Components
import { HeroSection } from './components/HeroSection';
import { DiscoverDeck } from './components/DiscoverDeck';
import { BouncerReels } from './components/BouncerReels';
import { StoriesBar } from './components/StoriesBar';
import { SocialFeed } from './components/SocialFeed';
import { WhoLikedMe } from './components/WhoLikedMe';
import { VerificationModal } from './components/VerificationModal';
import { SafetyCenterModal } from './components/SafetyCenterModal';
import { ReportModal } from './components/ReportModal';
import { MatchQuizModal } from './components/MatchQuizModal';
import { FeaturedSingles } from './components/FeaturedSingles';
import { auth, onAuthStateChanged, signOut, db, doc, getDoc } from './lib/firebase';
import { INITIAL_PROFILES } from './data/mockData';

export default function App() {
  // Navigation & Tabs state - Default to Home tab
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check URL pathname for /admin - only if authenticated as admin
  useEffect(() => {
    if (window.location.pathname === '/admin' && currentUser?.role === 'admin') {
      setActiveTab('admin');
    }
  }, [currentUser]);

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState<{
    siteName: string;
    tagline: string;
    logoUrl: string;
    iconUrl: string;
    whatsappSupportNumber?: string;
    affiliateRewardPerInvite?: number;
    minWithdrawalAmount?: number;
  }>({
    siteName: 'DATING WITH BOUNCER',
    tagline: 'Real People. Real Connections. Real Possibilities.',
    logoUrl: '',
    iconUrl: '',
    whatsappSupportNumber: '+263 71 578 6859'
  });

  // Admin Profile Link Preview & Summary State
  const [adminPreview, setAdminPreview] = useState<{
    name: string;
    email: string;
    role: string;
    location: string;
    avatar: string;
    bio: string;
    summaryTitle: string;
    summaryText: string;
  }>({
    name: 'Super Admin',
    email: 'jobsatespace@gmail.com',
    role: 'Super Admin & Head Bouncer',
    location: 'Harare HQ, Zimbabwe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    bio: 'Head Bouncer and Dating Platform Administrator for DATING WITH BOUNCER Zimbabwe.',
    summaryTitle: 'Summary of DATING WITH BOUNCER',
    summaryText:
      "DATING WITH BOUNCER is Zimbabwe's #1 Bouncer-vetted singles & matchmaking platform across all 10 provinces (Harare, Bulawayo, Mutare, Gweru, Victoria Falls & 60+ centres). Every profile is verified for identity, honest HIV disclosure (HIV- / HIV+), and dating intent (Seeking Marriage or Funny & Good Vibe). Men exclusively see Single Ladies, and Ladies exclusively see Single Gentlemen. Add your chosen singles to your Cart ($3 for 1 Single, $6 for 2–3 Singles, $10 for 4–10 Singles, or $15 VIP 30+ Singles), pay via Paynow, and unlock direct private WhatsApp contact numbers."
  });

  // Sync OpenGraph / Link Preview Meta Tags with Admin Profile & Summary
  useEffect(() => {
    const titleText = `${adminPreview.name} • ${siteSettings.siteName || 'DATING WITH BOUNCER'} | Official Admin Profile & Summary`;
    document.title = titleText;
    const setMeta = (id: string, content: string) => {
      const el = document.getElementById(id) as HTMLMetaElement | null;
      if (el) el.content = content;
    };
    setMeta('og-title', titleText);
    setMeta('twitter-title', titleText);
    setMeta('og-description', adminPreview.summaryText);
    setMeta('twitter-description', adminPreview.summaryText);
    const ogImgUrl = `${window.location.origin}/api/og-admin-image`;
    setMeta('og-image', ogImgUrl);
    setMeta('twitter-image', ogImgUrl);
  }, [adminPreview, siteSettings.siteName]);

  const handleUpdateSiteSettings = async (updated: Partial<{
    siteName: string;
    tagline: string;
    logoUrl: string;
    iconUrl: string;
    whatsappSupportNumber: string;
    affiliateRewardPerInvite: number;
    minWithdrawalAmount: number;
  }>) => {
    setSiteSettings(prev => ({ ...prev, ...updated }));
    if (updated.siteName) {
      document.title = updated.siteName;
    }
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
          'x-user-email': currentUser?.email || 'jobsatespace@gmail.com'
        },
        body: JSON.stringify(updated)
      });
      addToast('Settings Saved! ✨', 'Site settings and WhatsApp support number updated.', 'success');
    } catch (err) {
      console.error('Failed to update site settings on server:', err);
    }
  };

  // Sync favicon with site settings iconUrl
  useEffect(() => {
    if (siteSettings.iconUrl) {
      const faviconEl = document.getElementById('site-favicon') as HTMLLinkElement;
      if (faviconEl) {
        faviconEl.href = siteSettings.iconUrl;
      }
    }
  }, [siteSettings.iconUrl]);

  // Data states
  const [profiles, setProfiles] = useState<SingleProfile[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [likers, setLikers] = useState<SingleProfile[]>([]);

  // Centralized Loading State Management
  const [loadingState, setLoadingState] = useState<CentralizedLoadingState>(INITIAL_LOADING_STATE);

  const updateLoading = (patch: Partial<CentralizedLoadingState>) => {
    setLoadingState((prev) => ({ ...prev, ...patch }));
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSubLocation, setSelectedSubLocation] = useState('all');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedChildren, setSelectedChildren] = useState('all');
  const [selectedIntent, setSelectedIntent] = useState('all');
  const [selectedHivStatus, setSelectedHivStatus] = useState('all');
  const [selectedBouncerStatus, setSelectedBouncerStatus] = useState('all');
  const [sortByStars, setSortByStars] = useState(true);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Dynamic Tiered Pricing: 1 = $3, 2-3 = $6, 4-10 = $10, 11+ = $15
  const calculateSinglesFee = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 3;
    if (count <= 3) return 6;
    if (count <= 10) return 10;
    return 15;
  };

  // Modals state
  const [selectedProfileModal, setSelectedProfileModal] = useState<SingleProfile | null>(null);
  const [photoGalleryProfile, setPhotoGalleryProfile] = useState<SingleProfile | null>(null);
  const [photoGalleryInitialIdx, setPhotoGalleryInitialIdx] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<AuthModalMode>('user_login');

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isMatchQuizModalOpen, setIsMatchQuizModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: 'profile' | 'post' | 'message' } | null>(null);

  // Admin Data states
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [matchOrders, setMatchOrders] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalProfiles: 0,
    verifiedProfiles: 0,
    pendingBouncerQueue: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalCartOrders: 0
  });

  // Toast Notifications & Push Alerts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const seenNotifIdsRef = useRef<Set<string>>(new Set());

  // Deduplicate notifications list so a user never sees repeated notifications
  const dedupeNotificationsList = (list: NotificationItem[]): NotificationItem[] => {
    const seen = new Set<string>();
    const result: NotificationItem[] = [];
    for (const item of list) {
      if (!item) continue;
      const keys = getNotificationDedupeKeys(item);
      if (keys.some((k) => seen.has(k))) continue;
      keys.forEach((k) => seen.add(k));
      result.push(item);
    }
    return result;
  };

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'cart' | 'bouncer' | 'new_single' | 'love' = 'success',
    extra?: { photo?: string; profileId?: string; actionLabel?: string; onAction?: () => void }
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => {
      // Do not repeat an identical active toast
      if (prev.some((t) => t.title === title && t.message === message)) {
        return prev;
      }
      return [...prev, { id, title, message, type, ...extra }];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Push Notification & New Single Alert trigger (strictly deduplicated so it never repeats once received)
  const notifyNewSingleSignedUp = (single: {
    age?: number;
    city?: string;
    location?: string;
    name?: string;
    photos?: string[];
    id?: string;
    gender?: 'male' | 'female' | string;
    forceSimulate?: boolean;
  }) => {
    const age = single.age || 24;
    const location = single.city || single.location || 'Harare';
    const singleGender = (single.gender || 'female').toLowerCase();

    // Smart Gender Routing:
    // If male registered -> sent to females
    // If female registered -> sent to males
    const notifInfo = formatGenderTargetedNotification({
      age,
      city: location,
      location,
      gender: singleGender
    });

    const dedupeKeys = getNotificationDedupeKeys({
      id: single.id ? `notif_single_${single.id}` : undefined,
      profileId: single.id,
      title: notifInfo.title,
      message: notifInfo.message
    });

    // Do not repeat notification if user has already received it
    if (!single.forceSimulate && hasReceivedNotification(dedupeKeys)) {
      return;
    }
    markNotificationReceived(dedupeKeys);

    const userGender = currentUser?.gender?.toLowerCase();
    const isAdmin = currentUser?.role === 'admin';
    // Deliver if admin, visitor, or gender matches target
    const shouldAlertUser = isAdmin || !userGender || notifInfo.targetGender === 'all' || notifInfo.targetGender === userGender;

    if (shouldAlertUser) {
      // 1. Play sweet romantic chime via Web Audio API
      playRomanticChime();

      // 2. Trigger native browser push notification
      triggerBrowserPushNotification(notifInfo.title, notifInfo.message, {
        icon: single.photos?.[0],
        tag: single.id ? `single_${single.id}` : undefined,
        onClick: () => {
          if (single.id) {
            const found = profiles.find((p) => p.id === single.id);
            if (found) setSelectedProfileModal(found);
          } else {
            setActiveTab('home');
          }
        }
      });

      // 3. Show rich in-app Toast with romantic dating colors and click action
      addToast(notifInfo.title, notifInfo.message, 'new_single', {
        photo: single.photos?.[0],
        profileId: single.id,
        actionLabel: 'View Profile',
        onAction: () => {
          if (single.id) {
            const found = profiles.find((p) => p.id === single.id);
            if (found) setSelectedProfileModal(found);
          } else {
            setActiveTab('home');
          }
        }
      });
    }

    // 4. Also store in notifications list (deduplicated)
    const newNotif: NotificationItem = {
      id: single.id ? `notif_single_${single.id}` : `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: 'all',
      title: notifInfo.title,
      message: notifInfo.message,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      targetGender: notifInfo.targetGender,
      gender: singleGender as any,
      profileId: single.id,
      photo: single.photos?.[0]
    };
    seenNotifIdsRef.current.add(newNotif.id);
    setNotifications((prev) => dedupeNotificationsList([newNotif, ...prev]));
  };

  // Optimized Fetch Profiles with In-Memory Caching, Deduplication & Non-Blocking Background Sync
  const fetchProfiles = async (options?: { force?: boolean; silent?: boolean }) => {
    const queryKey = 'profiles_' + JSON.stringify({
      search: searchTerm.trim().toLowerCase(),
      province: selectedProvince,
      city: selectedCity,
      sub: selectedSubLocation,
      minAge,
      maxAge,
      gender: selectedGender,
      children: selectedChildren,
      intent: selectedIntent,
      hivStatus: selectedHivStatus,
      bouncer: selectedBouncerStatus
    });

    // Return cached results instantly if fresh and not forced
    if (!options?.force) {
      const cached = dataCache.get<SingleProfile[]>(queryKey);
      if (cached) {
        setProfiles(cached);
        updateLoading({ isProfilesLoading: false, isFilterUpdating: false });
        return;
      }
    }

    // Set non-blocking indicator if profiles already rendered, otherwise show initial load
    if (profiles.length === 0) {
      updateLoading({ isProfilesLoading: true, isFilterUpdating: false });
    } else {
      updateLoading({ isFilterUpdating: true });
    }

    try {
      const signal = dataCache.getProfileAbortSignal();
      const result = await dataCache.dedupe(queryKey, async () => {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (selectedProvince !== 'all') params.append('province', selectedProvince);
        if (selectedCity !== 'all') params.append('city', selectedCity);
        if (selectedSubLocation !== 'all') params.append('subLocation', selectedSubLocation);
        if (minAge > 18) params.append('minAge', minAge.toString());
        if (maxAge < 70) params.append('maxAge', maxAge.toString());
        if (selectedGender !== 'all') params.append('gender', selectedGender);
        if (selectedChildren !== 'all') params.append('childrenCount', selectedChildren);
        if (selectedIntent !== 'all') params.append('intent', selectedIntent);
        if (selectedHivStatus !== 'all') params.append('hivStatus', selectedHivStatus);
        if (selectedBouncerStatus !== 'all') params.append('bouncerStatus', selectedBouncerStatus);

        const res = await fetch(`/api/profiles?${params.toString()}`, { signal }).catch((e) => {
          if (e.name === 'AbortError') return null;
          return null;
        });

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (Array.isArray(data)) return data;
        }

        // Local fallback filtering if offline or temporary network issue
        let filtered = [...INITIAL_PROFILES];
        if (searchTerm) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (p.province && p.province.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        if (selectedProvince !== 'all') {
          filtered = filtered.filter(p => (p.province || '').toLowerCase() === selectedProvince.toLowerCase());
        }
        if (selectedCity !== 'all') filtered = filtered.filter(p => (p.city || '').toLowerCase() === selectedCity.toLowerCase());
        if (selectedGender !== 'all') filtered = filtered.filter(p => p.gender === selectedGender);
        if (selectedIntent !== 'all') filtered = filtered.filter(p => p.intent === selectedIntent);
        if (selectedHivStatus !== 'all') {
          const target = selectedHivStatus.toLowerCase();
          filtered = filtered.filter(p => {
            const val = (p.hivStatus || 'HIV-').toLowerCase();
            if (target.includes('+') || target.includes('pos')) {
              return val.includes('+') || val.includes('pos');
            }
            return val.includes('-') || val.includes('neg') || !val.includes('+');
          });
        }
        if (selectedBouncerStatus !== 'all') filtered = filtered.filter(p => p.bouncerStatus === selectedBouncerStatus);
        filtered = filtered.filter(p => p.age >= minAge && p.age <= maxAge);
        return filtered;
      });

      if (result && Array.isArray(result)) {
        setProfiles(result);
        dataCache.set(queryKey, result);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Profile fetch note:', err);
      }
    } finally {
      updateLoading({
        isProfilesLoading: false,
        isFilterUpdating: false,
        lastSyncedAt: new Date()
      });
    }
  };

  // Optimized Fetch Social & Chat Features with Promise.allSettled concurrency & caching
  const fetchSocialData = async (options?: { force?: boolean; silent?: boolean }) => {
    if (!options?.silent) {
      updateLoading({ isSocialLoading: true });
    }

    try {
      await dataCache.dedupe('social_batch_fetch', async () => {
        const notifPromise = currentUser?.id
          ? fetch(`/api/notifications?userId=${encodeURIComponent(currentUser.id)}`, {
              headers: { 'x-user-id': currentUser.id }
            }).then(r => (r.ok ? r.json() : null))
          : Promise.resolve([]);

        const results = await Promise.allSettled([
          fetch('/api/reels').then(r => r.ok ? r.json() : null),
          fetch('/api/stories').then(r => r.ok ? r.json() : null),
          fetch('/api/posts').then(r => r.ok ? r.json() : null),
          fetch('/api/conversations').then(r => r.ok ? r.json() : null),
          fetch('/api/who-liked-me').then(r => r.ok ? r.json() : null),
          notifPromise
        ]);

        const [reelsRes, storiesRes, postsRes, convsRes, likersRes, notifsRes] = results;

        if (reelsRes.status === 'fulfilled' && Array.isArray(reelsRes.value)) setReels(reelsRes.value);
        if (storiesRes.status === 'fulfilled' && Array.isArray(storiesRes.value)) setStories(storiesRes.value);
        if (postsRes.status === 'fulfilled' && Array.isArray(postsRes.value)) setPosts(postsRes.value);
        if (convsRes.status === 'fulfilled' && Array.isArray(convsRes.value)) {
          setConversations(convsRes.value);
          if (convsRes.value.length > 0 && !activeConvId) {
            setActiveConvId(convsRes.value[0].id);
          }
        }
        if (likersRes.status === 'fulfilled' && Array.isArray(likersRes.value)) setLikers(likersRes.value);
        if (!currentUser?.id) {
          setNotifications([]);
        } else if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value)) {
          const freshNotifs = dedupeNotificationsList(notifsRes.value);
          setNotifications(freshNotifs);
          freshNotifs.forEach((n: NotificationItem) => {
            if (n.id) seenNotifIdsRef.current.add(n.id);
            markNotificationReceived(getNotificationDedupeKeys(n));
          });
        }
      });
    } catch (err) {
      console.warn('Social fetch note:', err);
    } finally {
      updateLoading({ isSocialLoading: false });
    }
  };

  // Fetch Messages for Active Conversation
  const fetchActiveMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`).catch(() => null);
      if (res && res.ok) {
        const d = await res.json().catch(() => null);
        if (Array.isArray(d)) setMessages(d);
      }
    } catch {}
  };

  useEffect(() => {
    if (activeConvId) {
      fetchActiveMessages(activeConvId);
    }
  }, [activeConvId]);

  // Security: Ensure every visit starts signed out so users can Sign Up or Sign In fresh on every visit
  useEffect(() => {
    localStorage.removeItem('bouncer_logged_user');
    setCurrentUser(null);
    setNotifications([]);
    if (auth) {
      signOut(auth).catch(() => {});
    }
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  // Fast Single-Request Bootstrap for Instant Site Speed
  const fetchInitialData = async (options?: { force?: boolean; silent?: boolean; sessionUser?: User | null }) => {
    if (options?.silent) {
      updateLoading({ isBackgroundSyncing: true });
    } else {
      updateLoading({ isInitialLoading: true, isBackgroundSyncing: true });
    }

    try {
      await dataCache.dedupe('initial_data_fetch', async () => {
        const currentSessionUser: User | null = options?.sessionUser !== undefined ? options.sessionUser : currentUser;
        const isUserAdmin = currentSessionUser?.role === 'admin';
        const adminEmail = currentSessionUser?.email || '';
        const sessionUserId = currentSessionUser?.id || '';

        const reqHeaders: Record<string, string> = {};
        if (sessionUserId) reqHeaders['x-user-id'] = sessionUserId;
        if (isUserAdmin) {
          reqHeaders['x-user-role'] = 'admin';
          reqHeaders['x-user-email'] = adminEmail;
        }

        // Single fast bootstrap request instead of 6+ separate sequential calls
        const bootUrl = sessionUserId
          ? `/api/bootstrap?userId=${encodeURIComponent(sessionUserId)}`
          : '/api/bootstrap';
        const bootRes = await fetch(bootUrl, {
          headers: Object.keys(reqHeaders).length > 0 ? reqHeaders : undefined
        }).catch(() => null);

        if (bootRes && bootRes.ok) {
          const boot = await bootRes.json().catch(() => null);
          if (boot) {
            if (boot.siteSettings?.siteName) {
              setSiteSettings(boot.siteSettings);
              dataCache.set('settings', boot.siteSettings);
            }
            if (Array.isArray(boot.profiles)) {
              setProfiles(boot.profiles);
              updateLoading({ isProfilesLoading: false, isFilterUpdating: false });
            }
            if (Array.isArray(boot.plans)) {
              setSubscriptionPlans(boot.plans);
              dataCache.set('plans', boot.plans);
            }
            if (boot.adminPreview) {
              setAdminPreview(boot.adminPreview);
            }
            if (Array.isArray(boot.transactions)) {
              setTransactions(boot.transactions);
            }
            if (Array.isArray(boot.matchOrders)) {
              setMatchOrders(boot.matchOrders);
            }
            if (!sessionUserId) {
              setNotifications([]);
            } else if (Array.isArray(boot.notifications)) {
              const dedupedBootNotifs = dedupeNotificationsList(boot.notifications);
              setNotifications(dedupedBootNotifs);
              dedupedBootNotifs.forEach((n: NotificationItem) => {
                if (n.id) seenNotifIdsRef.current.add(n.id);
                markNotificationReceived(getNotificationDedupeKeys(n));
              });
            }
          }
        }

        // Admin Stats & Subscriptions (Only fetched in parallel if admin)
        if (isUserAdmin) {
          await Promise.allSettled([
            fetch('/api/admin/stats', {
              headers: { 'x-user-role': 'admin', 'x-user-email': adminEmail }
            })
              .then(r => (r.ok ? r.json() : null))
              .then(stats => {
                if (stats) setAdminStats(stats);
              })
              .catch(() => null),
            fetch('/api/admin/subscriptions', {
              headers: { 'x-user-role': 'admin', 'x-user-email': adminEmail }
            })
              .then(r => (r.ok ? r.json() : null))
              .then(subs => {
                if (subs && Array.isArray(subs.userSubscriptions)) {
                  setUserSubscriptions(subs.userSubscriptions);
                }
              })
              .catch(() => null)
          ]);
        }
      });
    } catch (err) {
      console.warn('Initial data sync note:', err);
    } finally {
      updateLoading({
        isInitialLoading: false,
        isProfilesLoading: false,
        isBackgroundSyncing: false,
        lastSyncedAt: new Date()
      });
    }
  };

  const handleApprovePayment = async (txId: string) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch(`/api/admin/payments/${txId}/approve`, {
        method: 'PUT',
        headers: { 'x-user-role': currentUser?.role || '' }
      });
      if (res.ok) {
        addToast('Payment Approved! 💳', 'User subscription plan activated successfully.', 'success');
        dataCache.invalidateAll();
        fetchInitialData({ force: true, silent: true });
        fetchProfiles({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  const handleRejectPayment = async (txId: string) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch(`/api/admin/payments/${txId}/reject`, {
        method: 'PUT',
        headers: { 'x-user-role': currentUser?.role || '' }
      });
      if (res.ok) {
        addToast('Payment Rejected ❌', 'Transaction rejected by admin.', 'info');
        dataCache.invalidateAll();
        fetchInitialData({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  // Initial fetch on mount (loads bootstrap data including profiles in 1 fast call)
  useEffect(() => {
    let refCodeFromUrl = '';
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      const pathMatch = window.location.pathname.match(/^\/(?:r|invite)\/([A-Za-z0-9_-]+)/);
      const rawRef = refParam || (pathMatch ? pathMatch[1] : '');
      if (rawRef) {
        refCodeFromUrl = rawRef.trim().toUpperCase();
        localStorage.setItem('bouncer_ref_code', refCodeFromUrl);
        sessionStorage.setItem('bouncer_ref_code', refCodeFromUrl);
      }
    } catch {
      // ignore
    }
    fetchInitialData().then(() => {
      if (refCodeFromUrl) {
        fetch(`/api/affiliate/resolve/${encodeURIComponent(refCodeFromUrl)}`)
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            if (data && data.valid) {
              if (data.referralCode) {
                localStorage.setItem('bouncer_ref_code', data.referralCode);
                sessionStorage.setItem('bouncer_ref_code', data.referralCode);
              }
              if (data.profile) {
                setSelectedProfileModal(data.profile);
              }
              setAuthModalInitialMode('user_register');
              setIsAuthModalOpen(true);
              addToast(
                '🎁 Invite Link Active!',
                'Sign up now to join Dating With Bouncer through your invite link!',
                'bouncer'
              );
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  // Lazy background sync when switching to social / chat tabs
  useEffect(() => {
    if (activeTab === 'feed' || activeTab === 'reels' || activeTab === 'wholikedme') {
      fetchSocialData({ silent: true });
    }
  }, [activeTab]);

  // Handle Tab Selection with Admin Auth Gate
  const handleSelectTab = (tab: MainTabType) => {
    if (tab === 'admin' && currentUser?.role !== 'admin') {
      setAuthModalInitialMode('user_login');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // Cart Handlers
  const handleAddToCart = (profile: SingleProfile) => {
    const exists = cartItems.some((item) => item.profileId === profile.id);
    if (exists) {
      setCartItems((prev) => prev.filter((item) => item.profileId !== profile.id));
    } else {
      // Encourage user to upload their profile picture so that they can choose other singles
      if (
        currentUser &&
        currentUser.role !== 'admin' &&
        !hasValidProfilePhoto(currentUser.avatar) &&
        getValidProfilePhotos(currentUser.photos).length === 0
      ) {
        addToast(
          '📸 Upload Your Picture First!',
          'Please upload your profile picture in Settings so that you can choose other singles and connect on WhatsApp.',
          'bouncer'
        );
        setIsUserModalOpen(true);
        return;
      }

      const newItem: CartItem = {
        profileId: profile.id,
        profile,
        dateType: 'vip_lounge',
        icebreakerMessage: `Hey ${profile.name.split(' ')[0]}! Would love to meet for drinks at a rooftop lounge.`,
        preferredTime: 'This Friday evening',
        addedAt: new Date().toISOString()
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const handleUpdateCartItem = (profileId: string, dateType: DateType, icebreakerMessage: string, preferredTime: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.profileId === profileId
          ? { ...item, dateType, icebreakerMessage, preferredTime }
          : item
      )
    );
  };

  const handleRemoveFromCart = (profileId: string) => {
    setCartItems((prev) => prev.filter((item) => item.profileId !== profileId));
  };

  const handleCartCheckoutSubmit = async () => {
    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, paymentMethod: 'VIP Bouncer Member Token' })
      });
      if (res.ok) {
        setCartItems([]);
        addToast('Match Requests Submitted! 🥂', 'Bouncer is verifying match schedules with your selected singles.', 'bouncer');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Swipe & Like Actions
  const handleLikeProfile = async (targetId: string, type: 'like' | 'pass' | 'superlike') => {
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetProfileId: targetId, type })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isMatch) {
          addToast('IT\'S A MATCH! ❤️', `You and ${data.targetProfile?.name || 'a single'} liked each other! Start chatting now.`, 'bouncer');
          fetchSocialData();
        } else if (type === 'like' || type === 'superlike') {
          addToast('Liked Profile ❤️', `Sent interest to ${data.targetProfile?.name || 'single'}.`, 'success');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Social Feed Handlers
  const handleCreatePost = async (content: string, mediaUrl?: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mediaUrl })
      });
      if (res.ok) {
        addToast('Published to Community Feed! 💬', 'Your post is now live for singles on Bouncer.', 'success');
        fetchSocialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) fetchSocialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentPost = async (postId: string, text: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) fetchSocialData();
    } catch (err) {
      console.error(err);
    }
  };

  // Chat Handlers
  const handleSendMessage = async (convId: string, text: string, mediaUrl?: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, text, mediaUrl })
      });
      if (res.ok) {
        fetchActiveMessages(convId);
        fetchSocialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Verification & Safety Handlers
  const handleSubmitVerification = async (selfieUrl: string, idDocumentUrl: string, phoneNumber: string) => {
    try {
      const res = await fetch('/api/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfieUrl, idDocumentUrl, phoneNumber })
      });
      if (res.ok) {
        addToast('Verification Request Submitted 🛡️', 'Staff Bouncers are reviewing your document.', 'bouncer');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (targetId: string, targetName: string, targetType: string, category: string, reason: string) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetName, targetType, category, reason })
      });
      if (res.ok) {
        addToast('Safety Report Filed', 'Staff moderators will inspect this report within 15 mins.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Profile Saved
  const handleSaveUserProfile = async (updatedData: Partial<User>) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        addToast('Profile Updated!', 'Your features and details have been saved for singles to view.', 'success');
        dataCache.invalidateProfiles();
        fetchProfiles({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  // Apply Bouncer Badge
  const handleApplyBouncerBadge = () => {
    setIsVerificationModalOpen(true);
  };

  // Admin Actions
  const handleAdminEditProfile = async (id: string, updatedData: Partial<SingleProfile>) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        addToast('Profile Updated ✍️', 'Single profile details and photo successfully saved!', 'success');
        dataCache.invalidateProfiles();
        fetchProfiles({ force: true, silent: true });
        fetchInitialData({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    dataCache.invalidateAll();
    localStorage.removeItem('bouncer_logged_user');
    setCurrentUser(null);
    setNotifications([]);
    setActiveTab('home');
    addToast('Logged Out', 'You have been logged out successfully.', 'info');
  };

  const handleAdminAddProfile = async (newProfData: Partial<SingleProfile>) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfData)
      });
      if (res.ok) {
        addToast('Single Profile Added', 'New single profile added to the directory.', 'success');
        handleResetFilters();
        dataCache.invalidateProfiles();
        fetchProfiles({ force: true, silent: true });
        fetchInitialData({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  const handleAdminDeleteProfile = async (id: string) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Profile Deleted', 'Single profile removed from directory.', 'info');
        dataCache.invalidateProfiles();
        fetchProfiles({ force: true, silent: true });
        fetchInitialData({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  const handleAdminUpdateBouncerStatus = async (id: string, status: any, notes?: string) => {
    try {
      updateLoading({ isActionLoading: true });
      const res = await fetch(`/api/admin/profiles/${id}/bouncer-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || ''
        },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        addToast('Bouncer Status Updated 🛡️', `Profile badge status set to ${status}.`, 'bouncer');
        dataCache.invalidateProfiles();
        fetchProfiles({ force: true, silent: true });
        fetchInitialData({ force: true, silent: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateLoading({ isActionLoading: false });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProvince('all');
    setSelectedCity('all');
    setSelectedSubLocation('all');
    setMinAge(18);
    setMaxAge(70);
    setSelectedGender('all');
    setSelectedChildren('all');
    setSelectedIntent('all');
    setSelectedHivStatus('all');
    setSelectedBouncerStatus('all');
  };

  // Active signed-in user's gender for strict opposite-gender matching (Men see Ladies, Ladies see Men)
  const activeViewerGender = (currentUser?.gender || '').toLowerCase();

  // Instant 0ms Client-Side Filter and Sort Profiles (Users without pictures do NOT appear)
  const displayedProfiles = profiles
    .filter((p) => {
      if (getValidProfilePhotos(p.photos).length === 0) return false;

      const profGender = (p.gender || 'female').toLowerCase();
      // Strict rule: Men only see Ladies, and Ladies only see Men
      if (activeViewerGender === 'male') {
        if (profGender !== 'female') return false;
      } else if (activeViewerGender === 'female') {
        if (profGender !== 'male') return false;
      } else if (selectedGender !== 'all') {
        if (profGender !== selectedGender.toLowerCase()) return false;
      }

      if (p.age < minAge || p.age > maxAge) return false;

      if (selectedProvince !== 'all') {
        if ((p.province || '').toLowerCase() !== selectedProvince.toLowerCase()) return false;
      }

      if (selectedCity !== 'all') {
        if ((p.city || '').toLowerCase() !== selectedCity.toLowerCase()) return false;
      }

      if (selectedSubLocation !== 'all') {
        if ((p.subLocation || '').toLowerCase() !== selectedSubLocation.toLowerCase()) return false;
      }

      if (selectedChildren !== 'all') {
        const count = p.childrenCount ?? 0;
        if (selectedChildren === '3+') {
          if (count < 3) return false;
        } else if (count !== Number(selectedChildren)) {
          return false;
        }
      }

      if (selectedIntent !== 'all' && p.intent !== selectedIntent) {
        return false;
      }

      if (selectedHivStatus !== 'all') {
        const target = selectedHivStatus.toLowerCase();
        const val = (p.hivStatus || 'HIV-').toLowerCase();
        if (target.includes('+')) {
          if (!val.includes('+')) return false;
        } else if (val.includes('+')) {
          return false;
        }
      }

      if (selectedBouncerStatus !== 'all' && p.bouncerStatus !== selectedBouncerStatus) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.province && p.province.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.subLocation && p.subLocation.toLowerCase().includes(q)) ||
          (p.bio && p.bio.toLowerCase().includes(q)) ||
          (p.intent && p.intent.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      if (sortByStars) {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0e040c] text-rose-50 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative">
      {/* Romantic Ambient Atmosphere Glows */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,29,72,0.14),rgba(14,4,12,0))] z-0" />
      <div className="fixed bottom-0 right-0 pointer-events-none w-96 h-96 bg-rose-600/5 rounded-full blur-3xl z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Toast Notification Container */}
        <ToastNotification toasts={toasts} onDismiss={removeToast} />

        {/* Header Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          cartCount={cartItems.length}
          currentUser={currentUser}
          siteSettings={siteSettings}
          isLoggedIn={!!currentUser}
          loadingState={loadingState}
          unreadNotifCount={currentUser ? notifications.filter((n) => !n.read && n.userId === currentUser.id).length : 0}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onLogout={handleLogout}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSafety={() => setIsSafetyModalOpen(true)}
          onOpenVerification={() => setIsVerificationModalOpen(true)}
          onOpenEditProfile={() => setIsUserModalOpen(true)}
          onOpenAuth={() => {
            setAuthModalInitialMode('user_login');
            setIsAuthModalOpen(true);
          }}
          onOpenLogin={() => {
            setAuthModalInitialMode('user_login');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthModalInitialMode('user_register');
            setIsAuthModalOpen(true);
          }}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
        />

      {/* Main Body View Switching */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8 space-y-4 sm:space-y-6">
        
        {/* ENCOURAGE USER TO UPLOAD PICTURE SO THEIR PROFILE APPEARS & THEY CAN CHOOSE OTHER SINGLES */}
        {currentUser && !hasValidProfilePhoto(currentUser.avatar) && getValidProfilePhotos(currentUser.photos).length === 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-slate-900 border border-amber-400/60 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-dashed border-amber-400/60 flex flex-col items-center justify-center shrink-0 text-amber-300">
                <ImageOff className="w-5 h-5" />
                <span className="text-[7px] font-black uppercase">Hidden</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wide">
                  Upload Your Picture to Appear in Singles Directory
                </h3>
                <p className="text-[11px] text-rose-100/90 mt-0.5">
                  Users without pictures do not appear in the directory. Upload your real photo in Settings so your profile appears and you can choose other singles!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUserModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Picture Now</span>
            </button>
          </div>
        )}

        {/* Visitor Sign Up / Sign In Prompt Banner */}
        {!currentUser && (
          <div className="bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-amber-950/80 border border-rose-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">
                  Welcome to DATING WITH BOUNCER
                </h3>
                <p className="text-[11px] text-rose-200/80">
                  Sign up &amp; upload your picture so you can choose other singles and connect on WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setAuthModalInitialMode('user_login');
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalInitialMode('user_register');
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-md transition-all cursor-pointer"
              >
                Sign Up Now
              </button>
            </div>
          </div>
        )}

        {/* DISCOVER & HOME TAB: DIRECT SINGLES DIRECTORY */}
        {(activeTab === 'discover' || activeTab === 'home') && (
          <div className="space-y-6">
            {/* FEATURED SINGLES SPOTLIGHT: Horizontal Scroll Section at the Top */}
            <FeaturedSingles
              profiles={profiles}
              onViewDetails={(prof) => setSelectedProfileModal(prof)}
              onViewPhotos={(prof, initialIdx) => {
                setPhotoGalleryProfile(prof);
                setPhotoGalleryInitialIdx(initialIdx || 0);
              }}
              onAddToCart={handleAddToCart}
              cartProfileIds={cartItems.map((item) => item.profileId)}
              currentUser={currentUser}
            />

            {/* Main Singles Directory Section Header */}
            <div className="border-b border-rose-900/30 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-rose-50 font-serif flex items-center gap-2.5">
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500 fill-rose-500/20 shrink-0" />
                  <span>Discover Vetted Singles</span>
                </h2>
                <p className="text-xs sm:text-sm text-rose-300/70 mt-1">
                  Browse verified singles in Zimbabwe vetted by Bouncer Security. Choose your match and connect on WhatsApp!
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              <SinglesFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedProvince={selectedProvince}
                setSelectedProvince={setSelectedProvince}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedSubLocation={selectedSubLocation}
                setSelectedSubLocation={setSelectedSubLocation}
                minAge={minAge}
                setMinAge={setMinAge}
                maxAge={maxAge}
                setMaxAge={setMaxAge}
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                selectedChildren={selectedChildren}
                setSelectedChildren={setSelectedChildren}
                selectedIntent={selectedIntent}
                setSelectedIntent={setSelectedIntent}
                selectedHivStatus={selectedHivStatus}
                setSelectedHivStatus={setSelectedHivStatus}
                selectedBouncerStatus={selectedBouncerStatus}
                setSelectedBouncerStatus={setSelectedBouncerStatus}
                sortByStars={sortByStars}
                setSortByStars={setSortByStars}
                onReset={handleResetFilters}
                totalResults={displayedProfiles.length}
                viewerGender={activeViewerGender}
              />

              <div className="flex-1 w-full space-y-4">
                {/* Non-blocking filter update indicator */}
                {loadingState.isFilterUpdating && (
                  <div className="w-full bg-slate-900/90 backdrop-blur rounded-2xl p-2.5 px-4 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-pulse shadow-sm">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Updating singles filter in real-time...</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Live Search</span>
                  </div>
                )}

                {loadingState.isProfilesLoading && profiles.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs text-slate-400">Loading Bouncer-vetted singles...</p>
                  </div>
                ) : displayedProfiles.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                    <Search className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">No Profiles Matching Filters</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                      Try adjusting or resetting your search criteria to discover more verified singles.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                    {displayedProfiles.map((profile) => (
                      <SingleCard
                        key={profile.id}
                        profile={profile}
                        currentUser={currentUser}
                        isInCart={cartItems.some((item) => item.profileId === profile.id)}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(p) => {
                          setSelectedProfileModal(p);
                        }}
                        onViewPhotos={(p, initialIdx) => {
                          setPhotoGalleryProfile(p);
                          setPhotoGalleryInitialIdx(initialIdx || 0);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOUNCER REELS */}
        {activeTab === 'reels' && (
          <div className="max-w-md mx-auto">
            <BouncerReels
              reels={reels}
              onLikeReel={(id) => {
                fetch(`/api/reels/${id}/like`, { method: 'POST' }).then(() => fetchSocialData());
              }}
              onCommentReel={(id) => {
                const text = prompt('Add your comment on this Reel:');
                if (text) {
                  addToast('Comment Posted!', 'Your comment was added to the Reel.', 'success');
                }
              }}
              onReportReel={(id, author) => setReportTarget({ id, name: author, type: 'post' })}
            />
          </div>
        )}

        {/* TAB 4: SOCIAL COMMUNITY FEED */}
        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <StoriesBar
              stories={stories}
              currentUser={currentUser}
              onAddStory={() => {
                const url = prompt('Enter story photo URL:');
                if (url) {
                  fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mediaUrl: url, caption: 'Story update!' })
                  }).then(() => fetchSocialData());
                }
              }}
            />

            <SocialFeed
              posts={posts}
              currentUser={currentUser}
              onCreatePost={handleCreatePost}
              onLikePost={handleLikePost}
              onCommentPost={handleCommentPost}
              onReportPost={(postId, name) => setReportTarget({ id: postId, name, type: 'post' })}
            />
          </div>
        )}

        {/* TAB 7: WHO LIKED ME */}
        {activeTab === 'wholikedme' && (
          <WhoLikedMe
            likers={likers.filter((p) => {
              const profGender = (p.gender || 'female').toLowerCase();
              if (activeViewerGender === 'male') return profGender === 'female';
              if (activeViewerGender === 'female') return profGender === 'male';
              return true;
            })}
            currentUser={currentUser}
            onOpenUpgrade={() => setIsPaymentModalOpen(true)}
            onSelectProfile={(p) => setSelectedProfileModal(p)}
          />
        )}

        {/* TAB 8: VIP MEMBERSHIP & PRICING */}
        {activeTab === 'pricing' && (
          <div className="max-w-4xl mx-auto py-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <Crown className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-white font-serif mb-2">
                  Dating With Bouncer VIP Membership
                </h2>
                <p className="text-xs text-slate-400">
                  Get full velvet rope privileges, unlimited Singles Cart checkouts, and priority Bouncer clearance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                      plan.popular
                        ? 'bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-extrabold text-white">{plan.name}</span>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {plan.badge}
                        </span>
                      </div>

                      <div className="text-3xl font-extrabold text-amber-400 font-serif mb-2">
                        ${plan.price}
                        <span className="text-xs text-slate-500 font-sans font-normal">/month</span>
                      </div>

                      <p className="text-xs text-slate-400 mb-4">{plan.tagline}</p>

                      <ul className="space-y-2 text-xs text-slate-300 mb-6">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all ${
                        currentUser?.subscriptionPlan === plan.id
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950'
                      }`}
                    >
                      {currentUser?.subscriptionPlan === plan.id ? 'Current Active Plan' : 'Select Plan & Pay'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: MY PROFILE */}
        {activeTab === 'profile' && currentUser && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  {hasValidProfilePhoto(currentUser.avatar) ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-500 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageOff className="w-6 h-6 text-amber-400" />
                      <span className="text-[8px] font-bold uppercase mt-0.5">No Picture</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
                      <span>{currentUser.name}, {currentUser.age}</span>
                      {(currentUser.bouncerVerified || currentUser.emailVerified) && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow-sm" title="Verified">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {currentUser.emailVerified && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shadow-sm" title="Email Verified">
                          <MailCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">📍 {currentUser.location} • {currentUser.email}</p>
                    <span className="inline-block mt-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full">
                      {(currentUser.subscriptionPlan || 'free').replace('_', ' ')} Member
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  <button
                    onClick={() => setIsUserModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Settings, Photos & Affiliate Link</span>
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="text-[11px] text-amber-400 hover:underline font-bold"
                    >
                      Admin Operations Panel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Gender</span>
                    <span className="font-semibold text-white capitalize">{currentUser.gender || 'female'}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Children</span>
                    <span className="font-semibold text-white">👶 {currentUser.childrenCount || 0} children</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">City & Suburb</span>
                    <span className="font-semibold text-white">{currentUser.city || 'Harare'} ({currentUser.subLocation || 'Borrowdale'})</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Dating Intent</span>
                    <span className="font-bold text-amber-300">{currentUser.intent === 'Marriage' ? '💍 Seeking Marriage' : '😂 Funny & Casual'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="font-bold text-slate-400 uppercase mb-1">My Bio & Vibe</div>
                  <p className="text-slate-200">{currentUser.bio || 'No bio entered yet.'}</p>
                </div>

                {/* Owner-Only Profile Views & Real Notification Log */}
                <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>
                        My Profile Views ({profiles.find(p => p.id === currentUser.id || (p.name && currentUser.name && p.name.toLowerCase() === currentUser.name.toLowerCase()))?.viewsCount || 0} Views)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      Real Views Only
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Recent Profile View Notifications:</p>
                    {notifications.filter(n => 
                      (n.userId === currentUser.id || n.userId === 'all' || (profiles.some(p => (p.id === currentUser.id || (p.name && currentUser.name && p.name.toLowerCase() === currentUser.name.toLowerCase())) && p.id === n.userId))) && 
                      (n.title.toLowerCase().includes('view') || n.message.toLowerCase().includes('viewed') || n.type === 'like' || n.type === 'match')
                    ).length === 0 ? (
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
                        No profile views recorded yet. Real notifications will appear here as members view your profile.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {notifications.filter(n => 
                          (n.userId === currentUser.id || n.userId === 'all' || (profiles.some(p => (p.id === currentUser.id || (p.name && currentUser.name && p.name.toLowerCase() === currentUser.name.toLowerCase())) && p.id === n.userId))) && 
                          (n.title.toLowerCase().includes('view') || n.message.toLowerCase().includes('viewed') || n.type === 'like' || n.type === 'match')
                        ).slice(0, 5).map((notif) => (
                          <div key={notif.id} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400">👁️</span>
                              <span className="text-slate-200">{notif.message}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <MailCheck className="w-4 h-4" />
                  <span>{currentUser.emailVerified ? 'Verified by Email ✓ (Manage Verification)' : 'Verify by Email or Selfie Shield'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: BOUNCER SAFETY CENTER */}
        {activeTab === 'safety' && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <div>
                  <h2 className="text-2xl font-black text-white font-serif">Bouncer Safety & Trust Center</h2>
                  <p className="text-xs text-slate-400">Our promise for genuine, secure dating in Zimbabwe</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                  <h3 className="font-bold text-emerald-300 text-sm mb-1">100% Identity Vetted Community</h3>
                  <p>Every profile is cross-checked using phone verification, selfie comparison, and Bouncer staff moderation.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">Key Safety Advice:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                    <li>Never send money or wire transfers to anyone met online.</li>
                    <li>Always meet in public locations (lounges, coffee shops) for your first dates.</li>
                    <li>Keep early chat communications inside Dating With Bouncer.</li>
                    <li>Report any suspicious activity immediately using our 1-click report button.</li>
                  </ul>
                </div>

                <button
                  onClick={() => setIsSafetyModalOpen(true)}
                  className="w-full py-3 bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700"
                >
                  Open Full Bouncer Safety Guidelines
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: BOUNCER ADMIN PANEL */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            profiles={profiles}
            stats={adminStats}
            transactions={transactions}
            userSubscriptions={userSubscriptions}
            matchOrders={matchOrders}
            siteSettings={siteSettings}
            onAddProfile={handleAdminAddProfile}
            onEditProfile={handleAdminEditProfile}
            onDeleteProfile={handleAdminDeleteProfile}
            onUpdateBouncerStatus={handleAdminUpdateBouncerStatus}
            onUpdateSiteSettings={handleUpdateSiteSettings}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            onRefreshData={fetchInitialData}
          />
        )}

      </main>

      {/* Floating Sticky Bottom Cart Checkout Bar when Singles are Chosen */}
      {cartItems.length > 0 && (
        <aside
          aria-label="Singles Cart Bar"
          className="fixed bottom-16 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 max-w-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-emerald-400 backdrop-blur-md flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div className="truncate">
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 truncate">
                <span>{cartItems.length} Single{cartItems.length > 1 ? 's' : ''} Chosen</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                  ${calculateSinglesFee(cartItems.length)}.00 Flat
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 truncate">
                Pay via Paynow & unlock WhatsApp numbers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shrink-0 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span>Singles Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Chosen Singles Cart Drawer Modal */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateCartItem={handleUpdateCartItem}
        onCheckout={handleCartCheckoutSubmit}
        currentUser={currentUser}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />

      {/* Quick View Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfileModal}
        isOpen={!!selectedProfileModal}
        currentUser={currentUser}
        isInCart={selectedProfileModal ? cartItems.some((item) => item.profileId === selectedProfileModal.id) : false}
        onAddToCart={handleAddToCart}
        onClose={() => setSelectedProfileModal(null)}
        onOpenAuth={() => {
          setAuthModalInitialMode('user_login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Photo Gallery Viewer Lightbox - Inspect full photos before choosing */}
      <PhotoGalleryModal
        profile={photoGalleryProfile}
        isOpen={!!photoGalleryProfile}
        initialPhotoIdx={photoGalleryInitialIdx}
        isInCart={photoGalleryProfile ? cartItems.some((item) => item.profileId === photoGalleryProfile.id) : false}
        onAddToCart={handleAddToCart}
        onClose={() => setPhotoGalleryProfile(null)}
        onViewFullProfile={(p) => setSelectedProfileModal(p)}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plans={subscriptionPlans}
        currentUser={currentUser}
        onPaymentSuccess={() => {
          fetchInitialData();
          addToast('Payment Submitted! 🥂', 'Your payment is recorded and awaiting Bouncer Admin verification.', 'bouncer');
        }}
      />

      {/* User Profile Editor Modal */}
      <UserProfileEditorModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveUserProfile}
        onApplyBouncerBadge={handleApplyBouncerBadge}
      />

      {/* Auth Modal for User / Admin Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          dataCache.invalidateAll();
          if (user?.role === 'admin') {
            setActiveTab('admin');
            addToast('Welcome Admin 🛡️', 'Authenticated to Bouncer Admin Backend.', 'bouncer');
          } else {
            addToast('Welcome! 👋', `Signed in as ${user.name}`, 'success');
          }
          fetchInitialData({ force: true, silent: true, sessionUser: user });
          fetchProfiles({ force: true, silent: true });
        }}
      />

      {/* Verification Shield Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmitVerification={handleSubmitVerification}
        currentUser={currentUser}
        onEmailVerified={(updatedUser) => {
          if (updatedUser) {
            setCurrentUser(updatedUser);
          } else if (currentUser) {
            setCurrentUser({ ...currentUser, bouncerVerified: true, emailVerified: true });
          }
          addToast('Email Verified! ✅', 'Your profile now displays the verified icon!', 'bouncer');
          dataCache.invalidateAll();
          fetchInitialData({ force: true, silent: true });
          fetchProfiles({ force: true, silent: true });
        }}
      />

      {/* Safety Center Modal */}
      <SafetyCenterModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      {/* Report User/Post Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
          targetType={reportTarget.type}
          onClose={() => setReportTarget(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* Match Compatibility Quiz Modal */}
      <MatchQuizModal
        isOpen={isMatchQuizModalOpen}
        onClose={() => setIsMatchQuizModalOpen(false)}
        onCompleteQuiz={(score, answers) => {
          addToast('Quiz Complete! ✨', `Your compatibility baseline is set to ${score}%!`, 'bouncer');
        }}
      />

      {/* Notification Center Modal (Strictly Personal Per User) */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        profiles={profiles}
        onMarkAsRead={async (id) => {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
          await fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
        }}
        onClearAll={async () => {
          setNotifications([]);
          if (currentUser?.id) {
            await fetch('/api/notifications/clear', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id
              },
              body: JSON.stringify({ userId: currentUser.id })
            }).catch(() => {});
          }
        }}
        onViewProfile={(profileId) => {
          const found = profiles.find((p) => p.id === profileId);
          if (found) {
            setSelectedProfileModal(found);
            setIsNotificationCenterOpen(false);
          }
        }}
      />

      {/* Compact Floating WhatsApp Support Button */}
      <a
        href={`https://wa.me/${(siteSettings.whatsappSupportNumber || '263715786859').replace(/[^0-9]/g, '') || '263715786859'}?text=Hi%20Admin%20I%20need%20Help`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Support"
        className="fixed bottom-20 md:bottom-5 left-3 sm:left-5 z-40 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-full shadow-lg border border-emerald-400/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 text-[11px] font-bold"
        title={`WhatsApp Support (${siteSettings.whatsappSupportNumber || '+263 71 578 6859'})`}
      >
        <MessageSquare className="w-3.5 h-3.5 text-white fill-white/20 shrink-0" />
        <span>Support</span>
      </a>

      {/* Global Footer */}
      <footer className="bg-[#0a0309] border-t border-rose-900/30 py-8 text-xs text-rose-300/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
            <span className="font-bold text-rose-100 font-serif">DATING WITH BOUNCER</span>
            <span className="text-rose-400/60">• Vetted Zimbabwe Singles Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <a
              href={`https://wa.me/${(siteSettings.whatsappSupportNumber || '263715786859').replace(/[^0-9]/g, '') || '263715786859'}?text=Hi%20Admin%20I%20need%20Help`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>Support ({siteSettings.whatsappSupportNumber || '+263 71 578 6859'})</span>
            </a>
            <span>•</span>
            <button onClick={() => setActiveTab('safety')} className="hover:text-white transition-colors">
              Safety Center
            </button>
            <span>•</span>
            <button onClick={() => setIsVerificationModalOpen(true)} className="hover:text-white transition-colors">
              Get Verified Shield
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('wholikedme')} className="hover:text-white transition-colors">
              Who Liked Me
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setActiveTab('admin');
                } else {
                  setAuthModalInitialMode('user_login');
                  setIsAuthModalOpen(true);
                }
              }}
              className="text-pink-400 font-bold hover:underline"
            >
              {currentUser?.role === 'admin' ? 'Open Admin Panel' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
}
