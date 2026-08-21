import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Heart, Crown, ShoppingBag, ArrowRight, Shield, Flame, UserCheck, Search, Filter, MessageSquare, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { SingleProfile, User, CartItem, DateType, SubscriptionPlan, PaymentTransaction, AdminStats, ReelItem, StoryItem, FeedPost, Conversation, DirectMessage } from './types';
import { Navbar, MainTabType } from './components/Navbar';
import { SinglesFilterBar } from './components/SinglesFilterBar';
import { SingleCard } from './components/SingleCard';
import { CartDrawer } from './components/CartDrawer';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { UserProfileEditorModal } from './components/UserProfileEditorModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ToastNotification, Toast } from './components/ToastNotification';

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
  const [siteSettings, setSiteSettings] = useState<{ siteName: string; tagline: string; logoUrl: string; iconUrl: string }>({
    siteName: 'DATING WITH BOUNCER',
    tagline: 'Real People. Real Connections. Real Possibilities.',
    logoUrl: '',
    iconUrl: ''
  });

  const handleUpdateSiteSettings = async (updated: Partial<{ siteName: string; tagline: string; logoUrl: string; iconUrl: string }>) => {
    setSiteSettings(prev => ({ ...prev, ...updated }));
    if (updated.siteName) {
      document.title = updated.siteName;
    }
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      addToast('Branding Saved! 🎨', 'Logo, favicon, and brand settings updated.', 'success');
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

  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSubLocation, setSelectedSubLocation] = useState('all');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedChildren, setSelectedChildren] = useState('all');
  const [selectedIntent, setSelectedIntent] = useState('all');
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'user' | 'admin'>('user');

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

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'cart' | 'bouncer' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Profiles from Backend with graceful fallback
  const fetchProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedSubLocation !== 'all') params.append('subLocation', selectedSubLocation);
      if (minAge > 18) params.append('minAge', minAge.toString());
      if (maxAge < 70) params.append('maxAge', maxAge.toString());
      if (selectedGender !== 'all') params.append('gender', selectedGender);
      if (selectedChildren !== 'all') params.append('childrenCount', selectedChildren);
      if (selectedIntent !== 'all') params.append('intent', selectedIntent);
      if (selectedBouncerStatus !== 'all') params.append('bouncerStatus', selectedBouncerStatus);

      const res = await fetch(`/api/profiles?${params.toString()}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data)) {
          setProfiles(data);
          return;
        }
      }

      // Local fallback filtering if offline or network hiccup
      let filtered = [...INITIAL_PROFILES];
      if (searchTerm) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.bio.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCity !== 'all') filtered = filtered.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
      if (selectedGender !== 'all') filtered = filtered.filter(p => p.gender === selectedGender);
      if (selectedIntent !== 'all') filtered = filtered.filter(p => p.intent === selectedIntent);
      if (selectedBouncerStatus !== 'all') filtered = filtered.filter(p => p.bouncerStatus === selectedBouncerStatus);
      filtered = filtered.filter(p => p.age >= minAge && p.age <= maxAge);
      setProfiles(filtered);
    } catch (err) {
      // Graceful fallback
      setProfiles(INITIAL_PROFILES);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Fetch Social & Chat Features Data
  const fetchSocialData = async () => {
    try {
      const reelsRes = await fetch('/api/reels').catch(() => null);
      if (reelsRes && reelsRes.ok) {
        const d = await reelsRes.json().catch(() => null);
        if (Array.isArray(d)) setReels(d);
      }

      const storiesRes = await fetch('/api/stories').catch(() => null);
      if (storiesRes && storiesRes.ok) {
        const d = await storiesRes.json().catch(() => null);
        if (Array.isArray(d)) setStories(d);
      }

      const postsRes = await fetch('/api/posts').catch(() => null);
      if (postsRes && postsRes.ok) {
        const d = await postsRes.json().catch(() => null);
        if (Array.isArray(d)) setPosts(d);
      }

      const convsRes = await fetch('/api/conversations').catch(() => null);
      if (convsRes && convsRes.ok) {
        const convs = await convsRes.json().catch(() => null);
        if (Array.isArray(convs)) {
          setConversations(convs);
          if (convs.length > 0 && !activeConvId) {
            setActiveConvId(convs[0].id);
          }
        }
      }

      const likersRes = await fetch('/api/who-liked-me').catch(() => null);
      if (likersRes && likersRes.ok) {
        const d = await likersRes.json().catch(() => null);
        if (Array.isArray(d)) setLikers(d);
      }
    } catch {}
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

  // Firebase Auth & Session Synchronization
  useEffect(() => {
    if (!auth) return;
    let unsubscribe: any = null;
    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            let userRole: 'user' | 'admin' = 
              (fbUser.email && (fbUser.email.toLowerCase() === 'admin@bouncer.date' || fbUser.email.toLowerCase() === 'jobsatespace@gmail.com')) 
                ? 'admin' 
                : 'user';

            let userData: any = {
              id: fbUser.uid,
              uid: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || (userRole === 'admin' ? 'Bouncer Admin' : 'Member'),
              avatar: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`,
              role: userRole,
              subscriptionPlan: userRole === 'admin' ? 'vip_15_singles' : 'free',
              bouncerVerified: userRole === 'admin'
            };

            if (db) {
              try {
                const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
                if (userSnap && typeof userSnap.exists === 'function' && userSnap.exists()) {
                  const docData = userSnap.data();
                  userData = { ...userData, ...docData };
                }
              } catch (e) {
                console.warn('Could not read user doc from Firestore:', e);
              }
            }

            setCurrentUser(userData);
            localStorage.setItem('bouncer_logged_user', JSON.stringify(userData));

            // Sync with backend
            fetch('/api/auth/firebase-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: fbUser.uid,
                email: fbUser.email,
                name: userData.name,
                role: userData.role,
                avatar: userData.avatar
              })
            }).catch(() => {});
          } catch (err) {
            console.error('Firebase onAuthStateChanged sync error:', err);
          }
        }
      });
    } catch (err) {
      console.warn('Firebase auth state subscription error:', err);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch {}
      }
    };
  }, []);

  // Fetch Auth & Admin Data with per-call error guards
  const fetchInitialData = async () => {
    try {
      // 1. Session Persistence Check
      const savedUserStr = localStorage.getItem('bouncer_logged_user');
      let currentSessionUser: User | null = null;

      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.id || savedUser.email)) {
            currentSessionUser = savedUser;
            setCurrentUser(savedUser);
            // Sync with server
            fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: savedUser })
            }).catch(() => {});
          }
        } catch (e) {
          localStorage.removeItem('bouncer_logged_user');
        }
      } else {
        const meRes = await fetch('/api/auth/me').catch(() => null);
        if (meRes && meRes.ok) {
          const data = await meRes.json().catch(() => null);
          if (data && data.user && (data.user.id || data.user.email)) {
            currentSessionUser = data.user;
            setCurrentUser(data.user);
            localStorage.setItem('bouncer_logged_user', JSON.stringify(data.user));
          }
        }
      }

      // 2. Fetch Site Settings
      const settingsRes = await fetch('/api/settings').catch(() => null);
      if (settingsRes && settingsRes.ok) {
        const st = await settingsRes.json().catch(() => null);
        if (st && st.siteName) {
          setSiteSettings(st);
          if (st.siteName) document.title = st.siteName;
        }
      }

      const plansRes = await fetch('/api/subscriptions/plans').catch(() => null);
      if (plansRes && plansRes.ok) {
        const plans = await plansRes.json().catch(() => null);
        if (Array.isArray(plans)) setSubscriptionPlans(plans);
      }

      // Fetch admin data if current user is admin
      const isUserAdmin = currentSessionUser?.role === 'admin' || (currentUser?.role === 'admin');
      if (isUserAdmin) {
        const statsRes = await fetch('/api/admin/stats', {
          headers: {
            'x-user-role': 'admin',
            'x-user-email': currentSessionUser?.email || currentUser?.email || 'jobsatespace@gmail.com'
          }
        }).catch(() => null);
        if (statsRes && statsRes.ok) {
          const stats = await statsRes.json().catch(() => null);
          if (stats) setAdminStats(stats);
        }

        const subRes = await fetch('/api/admin/subscriptions', {
          headers: {
            'x-user-role': 'admin',
            'x-user-email': currentSessionUser?.email || currentUser?.email || 'jobsatespace@gmail.com'
          }
        }).catch(() => null);
        if (subRes && subRes.ok) {
          const subs = await subRes.json().catch(() => null);
          if (subs && Array.isArray(subs.userSubscriptions)) {
            setUserSubscriptions(subs.userSubscriptions);
          }
        }
      }

      const txRes = await fetch('/api/payment/transactions').catch(() => null);
      if (txRes && txRes.ok) {
        const txs = await txRes.json().catch(() => null);
        if (Array.isArray(txs)) setTransactions(txs);
      }

      const matchRes = await fetch('/api/matches').catch(() => null);
      if (matchRes && matchRes.ok) {
        const matches = await matchRes.json().catch(() => null);
        if (Array.isArray(matches)) setMatchOrders(matches);
      }

      fetchSocialData();
    } catch {}
  };

  const handleApprovePayment = async (txId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${txId}/approve`, { method: 'PUT' });
      if (res.ok) {
        addToast('Payment Approved! 💳', 'User subscription plan activated successfully.', 'success');
        fetchInitialData();
        fetchProfiles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectPayment = async (txId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${txId}/reject`, { method: 'PUT' });
      if (res.ok) {
        addToast('Payment Rejected ❌', 'Transaction rejected by admin.', 'info');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initial fetch on mount without auto-refreshing polling
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [
    searchTerm,
    selectedCity,
    selectedSubLocation,
    minAge,
    maxAge,
    selectedGender,
    selectedChildren,
    selectedIntent,
    selectedBouncerStatus
  ]);

  // Handle Tab Selection with Admin Auth Gate
  const handleSelectTab = (tab: MainTabType) => {
    if (tab === 'admin' && currentUser?.role !== 'admin') {
      setAuthModalInitialMode('admin');
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
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        addToast('Profile Updated!', 'Your features and details have been saved for singles to view.', 'success');
        fetchProfiles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Apply Bouncer Badge
  const handleApplyBouncerBadge = () => {
    setIsVerificationModalOpen(true);
  };

  // Admin Actions
  const handleAdminEditProfile = async (id: string, updatedData: Partial<SingleProfile>) => {
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        addToast('Profile Updated ✍️', 'Single profile details and photo successfully saved!', 'success');
        fetchProfiles();
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
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
    localStorage.removeItem('bouncer_logged_user');
    setCurrentUser(null);
    setActiveTab('home');
    addToast('Logged Out', 'You have been logged out successfully.', 'info');
  };

  const handleAdminAddProfile = async (newProfData: Partial<SingleProfile>) => {
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfData)
      });
      if (res.ok) {
        const addedData = await res.json();
        const profName = addedData.profile?.name || newProfData.name || 'A new single';
        const profCity = addedData.profile?.city || newProfData.city || 'Zimbabwe';
        addToast(
          '🎉 New Single Added Notification!',
          `📢 ${profName} from ${profCity} (${newProfData.age || 25} yrs) just joined Dating With Bouncer!`,
          'bouncer'
        );
        handleResetFilters();
        fetchProfiles();
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Profile Deleted', 'Single profile removed from directory.', 'info');
        fetchProfiles();
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUpdateBouncerStatus = async (id: string, status: any, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/profiles/${id}/bouncer-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        addToast('Bouncer Status Updated 🛡️', `Profile badge status set to ${status}.`, 'bouncer');
        fetchProfiles();
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedSubLocation('all');
    setMinAge(18);
    setMaxAge(70);
    setSelectedGender('all');
    setSelectedChildren('all');
    setSelectedIntent('all');
    setSelectedBouncerStatus('all');
  };

  // Filter and Sort Profiles
  const displayedProfiles = profiles
    .filter((p) => {
      if (selectedGender !== 'all') {
        return p.gender === selectedGender;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
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
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSafety={() => setIsSafetyModalOpen(true)}
        onOpenVerification={() => setIsVerificationModalOpen(true)}
        onOpenEditProfile={() => setIsUserModalOpen(true)}
        onOpenAuth={() => {
          if (!currentUser) {
            setAuthModalInitialMode('user');
            setIsAuthModalOpen(true);
          }
        }}
        onOpenLogin={() => {
          if (!currentUser) {
            setAuthModalInitialMode('user');
            setIsAuthModalOpen(true);
          }
        }}
        onOpenRegister={() => {
          if (!currentUser) {
            setAuthModalInitialMode('user');
            setIsAuthModalOpen(true);
          }
        }}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />

      {/* Main Body View Switching */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* DISCOVER & HOME TAB: DIRECT SINGLES DIRECTORY */}
        {(activeTab === 'discover' || activeTab === 'home') && (
          <div className="space-y-6">
            {/* FEATURED SINGLES SPOTLIGHT: Horizontal Scroll Section at the Top */}
            <FeaturedSingles
              profiles={profiles}
              onViewDetails={(prof) => setSelectedProfileModal(prof)}
              onAddToCart={handleAddToCart}
              cartProfileIds={cartItems.map((item) => item.profileId)}
              currentUser={currentUser}
            />

            {/* Main Singles Directory Section Header */}
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-serif flex items-center gap-2">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
                <span>Discover Vetted Singles</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Browse verified singles in your area vetted by Bouncer Security.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              <SinglesFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
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
                selectedBouncerStatus={selectedBouncerStatus}
                setSelectedBouncerStatus={setSelectedBouncerStatus}
                sortByStars={sortByStars}
                setSortByStars={setSortByStars}
                onReset={handleResetFilters}
                totalResults={displayedProfiles.length}
              />

              <div className="flex-1 w-full space-y-6">
                {isLoadingProfiles ? (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
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
            likers={likers}
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
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-500"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
                      <span>{currentUser.name}, {currentUser.age}</span>
                      {currentUser.bouncerVerified && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                    </h2>
                    <p className="text-xs text-slate-400">📍 {currentUser.location} • {currentUser.email}</p>
                    <span className="inline-block mt-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full">
                      {(currentUser.subscriptionPlan || 'free').replace('_', ' ')} Member
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setIsUserModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Edit Profile & Photos</span>
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

                {/* Owner-Only Profile Views & Notification Log */}
                <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>My Profile Views ({profiles.find(p => p.id === currentUser.id || p.name.toLowerCase() === currentUser.name.toLowerCase())?.viewsCount || 24} Views)</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      Seen by Owner Only
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Recent Profile View Notifications:</p>
                    <div className="space-y-1.5">
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">👁️</span>
                          <span className="text-white font-bold">Chiedza Moyo</span>
                          <span className="text-slate-300">has viewed your profile!</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Just now</span>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">👁️</span>
                          <span className="text-white font-bold">Rudo Mpofu</span>
                          <span className="text-slate-300">has viewed your profile!</span>
                        </div>
                        <span className="text-[10px] text-slate-400">15 mins ago</span>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">👁️</span>
                          <span className="text-white font-bold">Tarisai Ndlovu</span>
                          <span className="text-slate-300">has viewed your profile!</span>
                        </div>
                        <span className="text-[10px] text-slate-400">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Request Verification Badge Shield</span>
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
          if (!currentUser) {
            setAuthModalInitialMode('user');
            setIsAuthModalOpen(true);
          }
        }}
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
          localStorage.setItem('bouncer_logged_user', JSON.stringify(user));
          if (user?.role === 'admin') {
            setActiveTab('admin');
            addToast('Welcome Admin 🛡️', 'Authenticated to Bouncer Admin Backend.', 'bouncer');
          } else {
            addToast('Welcome Back! 👋', `Logged in as ${user.name}`, 'success');
          }
          fetchInitialData();
        }}
      />

      {/* Verification Shield Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmitVerification={handleSubmitVerification}
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

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-300 font-serif">DATING WITH BOUNCER</span>
            <span>• Vetted Zimbabwe Singles Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
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
                  setAuthModalInitialMode('admin');
                  setIsAuthModalOpen(true);
                }
              }}
              className="text-rose-400 font-bold hover:underline"
            >
              {currentUser?.role === 'admin' ? 'Open Admin Panel' : 'Staff Admin Portal'}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
