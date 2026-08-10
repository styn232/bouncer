import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Heart, Crown, ShoppingBag, ArrowRight, Shield, Flame, UserCheck, Search, Filter } from 'lucide-react';
import { SingleProfile, User, CartItem, DateType, SubscriptionPlan, PaymentTransaction, AdminStats } from './types';
import { Navbar } from './components/Navbar';
import { SinglesFilterBar } from './components/SinglesFilterBar';
import { SingleCard } from './components/SingleCard';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PaymentModal } from './components/PaymentModal';
import { UserProfileEditorModal } from './components/UserProfileEditorModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ToastNotification, Toast } from './components/ToastNotification';

export default function App() {
  // Navigation & Tabs state
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'vip' | 'profile' | 'admin'>('browse');

  // Check URL pathname for /admin
  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.search.includes('admin=true')) {
      setActiveTab('admin');
    }
  }, []);

  // Site Settings state (Admin can upload logo and site icon)
  const [siteSettings, setSiteSettings] = useState<{ siteName: string; logoUrl: string; iconUrl: string }>({
    siteName: 'DATING WITH BOUNCER',
    logoUrl: '',
    iconUrl: ''
  });

  const handleUpdateSiteSettings = (updated: Partial<{ siteName: string; logoUrl: string; iconUrl: string }>) => {
    setSiteSettings(prev => ({ ...prev, ...updated }));
    if (updated.siteName) {
      document.title = updated.siteName;
    }
    addToast('Brand Settings Updated 🎨', 'Logo and site details updated successfully!', 'success');
  };

  // Data states
  const [profiles, setProfiles] = useState<SingleProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_demo',
    email: 'single@bouncer.date',
    name: 'Tendai Moyo',
    age: 27,
    city: 'Harare',
    subLocation: 'Borrowdale',
    location: 'Harare (Borrowdale), Zimbabwe',
    childrenCount: 0,
    intent: 'Marriage',
    role: 'user',
    subscriptionPlan: 'vip_monthly',
    subscriptionStatus: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Verified VIP Single on Dating with Bouncer seeking genuine connection.',
    bouncerVerified: true,
    createdAt: new Date().toISOString()
  });

  // Comprehensive Filter States
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

  // Modals
  const [selectedProfileModal, setSelectedProfileModal] = useState<SingleProfile | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'user' | 'admin'>('user');

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

  // Fetch Profiles from Backend with rich filter parameters
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

      const res = await fetch(`/api/profiles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Fetch Auth & Admin Data
  const fetchInitialData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const data = await meRes.json();
        if (data.user) setCurrentUser(data.user);
      }

      const plansRes = await fetch('/api/subscriptions/plans');
      if (plansRes.ok) {
        const plans = await plansRes.json();
        setSubscriptionPlans(plans);
      }

      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setAdminStats(stats);
      }

      const txRes = await fetch('/api/payment/transactions');
      if (txRes.ok) {
        const txs = await txRes.json();
        setTransactions(txs);
      }

      const subRes = await fetch('/api/admin/subscriptions');
      if (subRes.ok) {
        const subs = await subRes.json();
        setUserSubscriptions(subs.userSubscriptions || []);
      }

      const matchRes = await fetch('/api/matches');
      if (matchRes.ok) {
        const matches = await matchRes.json();
        setMatchOrders(matches);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

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
  const handleSelectTab = (tab: 'browse' | 'cart' | 'vip' | 'profile' | 'admin') => {
    if (tab === 'admin' && currentUser.role !== 'admin') {
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
      addToast('Removed from Cart', `${profile.name} removed from your Singles Cart.`, 'info');
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
      addToast('Added to Singles Cart! 🛒', `${profile.name}, ${profile.age} (${profile.location}) added to your Date Cart!`, 'cart');
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
    handleSaveUserProfile({ bouncerVerified: true });
    addToast('Bouncer Verification Granted! 🛡️', 'Your profile is now Gold Badge Bouncer Verified!', 'bouncer');
  };

  // Admin Actions
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

  // Switch Role helper for instant admin testing
  const handleToggleAdminRole = async () => {
    const nextRole = currentUser.role === 'admin' ? 'user' : 'admin';
    const email = nextRole === 'admin' ? 'admin@bouncer.date' : 'single@bouncer.date';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: nextRole })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        addToast(
          `Switched to ${nextRole === 'admin' ? 'Bouncer Admin' : 'Single User'}`,
          `You are now viewing as ${data.user.name}`,
          'bouncer'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Locations list derived from profiles
  const locationsList = Array.from(new Set(profiles.map((p) => p.location))).sort();

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

  // Gender-based matching rule + Star Ranking sort rule
  const displayedProfiles = profiles
    .filter((p) => {
      if (selectedGender !== 'all') {
        return p.gender === selectedGender;
      }
      if (currentUser.gender === 'female') {
        return p.gender === 'male';
      }
      if (currentUser.gender === 'male') {
        return p.gender === 'female';
      }
      return true;
    })
    .sort((a, b) => {
      if (sortByStars) {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        cartCount={cartItems.length}
        currentUser={currentUser}
        siteSettings={siteSettings}
        onOpenAuth={() => {
          setAuthModalInitialMode('user');
          setIsAuthModalOpen(true);
        }}
        onOpenLogin={() => {
          setAuthModalInitialMode('user');
          setIsAuthModalOpen(true);
        }}
        onOpenRegister={() => {
          setAuthModalInitialMode('user');
          setIsAuthModalOpen(true);
        }}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />

      {/* Main Body View Switching */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Admin Session Security Status Link (Only visible to Admin) */}
        {currentUser.role === 'admin' && (
          <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-300 rounded-2xl px-4 py-2.5 mb-6 text-xs text-emerald-950 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Active Staff Session: <strong className="text-emerald-900">{currentUser.name}</strong></span>
            </div>

            <button
              onClick={() => setActiveTab('admin')}
              className="text-emerald-800 hover:text-emerald-950 font-extrabold flex items-center gap-1 hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Open Staff Control Panel
            </button>
          </div>
        )}

        {/* VIEW 1: BROWSE SINGLES */}
        {activeTab === 'browse' && (
          <div>
            {/* Singles Selection Pricing Alert Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-2xl p-3.5 sm:p-4 mb-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border border-emerald-600">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-emerald-950/40 text-emerald-200 rounded-xl border border-emerald-500/40 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider">
                    💡 Choose Singles Pricing Guide
                  </h4>
                  <p className="text-[11px] sm:text-xs text-emerald-50 mt-0.5 leading-snug">
                    Select <strong className="text-amber-300 font-extrabold">$6 (1-3 Singles)</strong>, <strong className="text-amber-300 font-extrabold">$10 (4-10 Singles)</strong>, or <strong className="text-amber-300 font-extrabold">$15 VIP Access (30+ Singles)</strong> for direct WhatsApp numbers!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('cart')}
                className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md shrink-0 transition-transform active:scale-95 text-center"
              >
                Chosen Singles ({cartItems.length})
              </button>
            </div>
            
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 border border-emerald-700 p-5 sm:p-10 mb-8 shadow-xl text-white">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full filter blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full filter blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-950/60 border border-emerald-400/40 px-3 py-1 rounded-full text-emerald-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Verified Platform • 100% Zimbabwe Singles</span>
                </div>

                <h1 className="text-2xl sm:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight mb-2 sm:mb-3 uppercase">
                  DATING WITH BOUNCER
                </h1>

                <p className="text-[11px] sm:text-sm text-emerald-100 leading-relaxed mb-5 font-normal">
                  Browse singles ranked by star ratings displaying <strong className="text-amber-300">Name, Age, Location, Gender, Children & Intent (Marriage or Funny)</strong>. Found someone? Click Choose Single to send your pick list for WhatsApp checkout!
                </p>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950" />
                    Get $15 VIP Access (30+ Singles)
                  </button>

                  <button
                    onClick={() => setIsUserModalOpen(true)}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900 text-white border border-emerald-500/50 text-[11px] sm:text-xs font-bold transition-colors shadow-sm"
                  >
                    Update My Profile & Photos
                  </button>
                </div>
              </div>
            </div>

            {/* RESPONSIVE LAYOUT: Side Bar Filter on PC (Desktop) & Top Filter Bar on Mobile */}
            <div className="flex flex-col lg:flex-row items-start gap-8">
              
              {/* Filter Sidebar / Top Bar Component */}
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

              {/* Main Content Singles Grid */}
              <div className="flex-1 w-full">
                {isLoadingProfiles ? (
                  <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs text-slate-400">Loading Bouncer-vetted singles...</p>
                  </div>
                ) : displayedProfiles.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                    <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">No Singles Match Selected Criteria</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                      Try resetting city, age range, children count, gender, or intent filters to view more singles.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6">
                    {displayedProfiles.map((profile) => (
                      <SingleCard
                        key={profile.id}
                        profile={profile}
                        isInCart={cartItems.some((item) => item.profileId === profile.id)}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(p) => setSelectedProfileModal(p)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: SINGLES CART */}
        {activeTab === 'cart' && (
          <CartDrawer
            isOpen={true}
            onClose={() => setActiveTab('browse')}
            cartItems={cartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartItem={handleUpdateCartItem}
            onCheckout={handleCartCheckoutSubmit}
            currentUser={currentUser}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
          />
        )}

        {/* VIEW 3: VIP MEMBERSHIP & PAYMENTS */}
        {activeTab === 'vip' && (
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
                        currentUser.subscriptionPlan === plan.id
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950'
                      }`}
                    >
                      {currentUser.subscriptionPlan === plan.id ? 'Current Active Plan' : 'Select Plan & Pay'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: MY ACCOUNT & PROFILE EDIT */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white font-serif">{currentUser.name}, {currentUser.age}</h2>
                    <p className="text-xs text-slate-400">📍 {currentUser.location} • {currentUser.email}</p>
                    <span className="inline-block mt-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full">
                      {currentUser.subscriptionPlan.replace('_', ' ')} Member
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Edit My Profile
                </button>
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
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: BOUNCER ADMIN DASHBOARD (Protected - Only shown after admin login) */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminPanel
            profiles={profiles}
            stats={adminStats}
            transactions={transactions}
            userSubscriptions={userSubscriptions}
            matchOrders={matchOrders}
            siteSettings={siteSettings}
            onAddProfile={handleAdminAddProfile}
            onEditProfile={(id, data) => fetchProfiles()}
            onDeleteProfile={handleAdminDeleteProfile}
            onUpdateBouncerStatus={handleAdminUpdateBouncerStatus}
            onUpdateSiteSettings={handleUpdateSiteSettings}
            onRefreshData={fetchInitialData}
          />
        )}

      </main>

      {/* Profile Detail Quick View Modal */}
      <ProfileDetailModal
        profile={selectedProfileModal}
        isOpen={!!selectedProfileModal}
        currentUser={currentUser}
        onClose={() => setSelectedProfileModal(null)}
        isInCart={selectedProfileModal ? cartItems.some((item) => item.profileId === selectedProfileModal.id) : false}
        onAddToCart={handleAddToCart}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plans={subscriptionPlans}
        currentUser={currentUser}
        onPaymentSuccess={(planId) => {
          fetchInitialData();
          addToast('Payment Successful! 🥂', 'Your VIP subscription plan has been upgraded.', 'success');
        }}
      />

      {/* User Profile Features Editor Modal */}
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
          if (user.role === 'admin') {
            setActiveTab('admin');
            addToast('Welcome Admin 🛡️', 'Authenticated to Bouncer Admin Backend.', 'bouncer');
          } else {
            addToast('Welcome Back! 👋', `Logged in as ${user.name}`, 'success');
          }
          fetchInitialData();
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

          <div className="flex items-center gap-4 text-[11px]">
            <span>Name, Age & Location Display</span>
            <span>•</span>
            <span>Add to Cart Checkout</span>
            <span>•</span>
            <button
              onClick={() => {
                setAuthModalInitialMode('admin');
                setIsAuthModalOpen(true);
              }}
              className="text-amber-400 font-bold hover:underline"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
