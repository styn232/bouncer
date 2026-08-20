import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Flame, 
  Heart, 
  MessageSquare, 
  Newspaper, 
  Shield, 
  Bell, 
  Sparkles, 
  Home, 
  LogOut, 
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Camera,
  Crown,
  Settings,
  HelpCircle,
  CreditCard,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { User, SiteSettings } from '../types';

export type MainTabType = 'home' | 'discover' | 'reels' | 'feed' | 'wholikedme' | 'profile' | 'admin' | 'safety' | 'pricing';

interface NavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  cartCount?: number;
  unreadChatCount?: number;
  unreadNotifCount?: number;
  currentUser: User | null;
  siteSettings?: SiteSettings;
  isLoggedIn?: boolean;
  onOpenAuth: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenSafety?: () => void;
  onOpenCart?: () => void;
  onLogout?: () => void;
  onOpenPayment?: () => void;
  onOpenEditProfile?: () => void;
  onOpenVerification?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount = 0,
  currentUser,
  siteSettings,
  isLoggedIn = false,
  onOpenAuth,
  onOpenLogin,
  onOpenRegister,
  onOpenSafety,
  onOpenCart,
  onLogout,
  onOpenPayment,
  onOpenEditProfile,
  onOpenVerification
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displaySiteName = siteSettings?.siteName || 'DATING WITH BOUNCER';
  const tagline = siteSettings?.tagline || 'Real People. Real Connections. Real Possibilities.';
  const logoUrl = siteSettings?.logoUrl;
  const iconUrl = siteSettings?.iconUrl;

  const isAdmin = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.email?.toLowerCase() === 'jobsatespace@gmail.com' || 
    currentUser.email?.toLowerCase() === 'admin@bouncer.date'
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleProfileClick = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleNavigate = (tab: MainTabType) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-rose-900/40 text-slate-100 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={displaySiteName} 
                referrerPolicy="no-referrer"
                className="h-9 sm:h-11 max-w-[120px] sm:max-w-[160px] object-contain rounded-xl ring-1 ring-rose-500/50"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Icon" referrerPolicy="no-referrer" className="w-6 h-6 object-contain" />
                  ) : (
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500/20" />
                  )}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-white via-rose-200 to-amber-200 bg-clip-text text-transparent font-serif uppercase">
                  DATING WITH BOUNCER
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                {tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => handleNavigate('home')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'home' || activeTab === 'discover'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Singles</span>
            </button>

            {currentUser && (
              <button
                onClick={() => handleNavigate('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserIcon className="w-4 h-4 text-slate-300" />
                <span>My Profile</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-slate-950 shadow-lg ring-1 ring-amber-300'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* User Right Action Panel */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart / Chosen Singles Button */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  cartCount > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
                title="View Chosen Singles & Pay via Paynow"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Singles Cart</span>
                {cartCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm shrink-0">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Safety Button */}
            <button
              onClick={onOpenSafety}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
              title="Bouncer Dating Safety Guidelines"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safety</span>
            </button>

            {!isLoggedIn || !currentUser ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
                >
                  Log In
                </button>

                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg transition-all"
                >
                  Create Account
                </button>
              </>
            ) : (
              /* Facebook-Style Profile Dropdown Trigger Container */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl transition-all shadow-inner border ${
                    isDropdownOpen
                      ? 'bg-slate-800 border-rose-500/60 ring-2 ring-rose-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                  title="Account Menu & Profile"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-rose-500/60"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-slate-950" />
                    </div>
                  </div>

                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold flex items-center gap-1 text-white">
                      <span>{currentUser.name}</span>
                      {currentUser.bouncerVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold capitalize">
                      {currentUser?.role === 'admin' ? 'Admin' : `${(currentUser?.subscriptionPlan || 'free').replace('_', ' ')} Member`}
                    </div>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-rose-400' : ''}`} />
                </button>

                {/* Facebook-Style Floating Profile Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2.5 w-[310px] sm:w-[360px] rounded-3xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl overflow-hidden p-3 text-slate-100 ring-1 ring-white/10 z-50 divide-y divide-slate-800/80"
                    >
                      {/* Top Profile Card - Facebook Style */}
                      <div 
                        onClick={() => handleNavigate('profile')}
                        className="p-3 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-all flex items-center gap-3.5 group mb-2 border border-slate-800/60 bg-slate-950/60 shadow-sm"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                            alt={currentUser.name}
                            referrerPolicy="no-referrer"
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-rose-500 shadow-md group-hover:scale-105 transition-transform"
                          />
                          {currentUser.bouncerVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900 shadow-xs">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-extrabold text-white flex items-center gap-1.5 truncate group-hover:text-rose-300 transition-colors">
                            <span className="truncate">{currentUser.name}</span>
                            {currentUser.bouncerVerified && (
                              <span className="shrink-0 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{currentUser.email || 'Bouncer Dating Account'}</p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                            <span>See your profile</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Action Items */}
                      <div className="py-2 space-y-1">
                        {/* Edit Profile & Photos Option */}
                        {onOpenEditProfile && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenEditProfile();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                <Camera className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-100 group-hover:text-white">Edit Profile & Photos</div>
                                <div className="text-[10px] text-slate-400">Update bio, WhatsApp, location & pictures</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}

                        {/* Singles Cart & Paynow */}
                        {onOpenCart && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenCart();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-100 group-hover:text-white flex items-center gap-1.5">
                                  <span>My Singles Cart</span>
                                  {cartCount > 0 && (
                                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                                      {cartCount}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">View selected singles & Paynow checkout</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}

                        {/* Bouncer ID & Verification */}
                        {onOpenVerification && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenVerification();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-100 group-hover:text-white">Bouncer Verification</div>
                                <div className="text-[10px] text-slate-400">
                                  {currentUser.bouncerVerified ? 'Gold Badge Active & Verified' : 'Apply for Bouncer Badge clearance'}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}

                        {/* VIP Membership & Plans */}
                        {onOpenPayment && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenPayment();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Crown className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-100 group-hover:text-white">VIP Membership & Pricing</div>
                                <div className="text-[10px] text-slate-400">Pay via Paynow EcoCash, OneMoney & Cards</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}

                        {/* Safety Center */}
                        {onOpenSafety && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenSafety();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                                <Shield className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-100 group-hover:text-white">Safety Center & Guidelines</div>
                                <div className="text-[10px] text-slate-400">Safe dating rules, verification & report tools</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}

                        {/* Admin Panel Quick Link */}
                        {isAdmin && (
                          <button
                            onClick={() => handleNavigate('admin')}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-amber-300">Admin Control Panel</div>
                                <div className="text-[10px] text-slate-400">Manage singles, Paynow payments & approvals</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}
                      </div>

                      {/* Log Out Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-transparent hover:border-rose-800/40 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">Log Out</div>
                              <div className="text-[10px] text-slate-400">Sign out of Dating with Bouncer</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 py-2.5 px-4 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === 'home' || activeTab === 'discover' ? 'text-rose-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>Singles</span>
        </button>

        {onOpenCart && (
          <button
            onClick={onOpenCart}
            className="relative flex flex-col items-center gap-1 text-[10px] font-bold text-emerald-400 transition-all active:scale-105"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart ({cartCount})</span>
          </button>
        )}

        {currentUser && (
          <button
            onClick={() => handleNavigate('profile')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === 'profile' ? 'text-white font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Profile</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => handleNavigate('admin')}
            className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-all ${
              activeTab === 'admin' ? 'text-amber-400 font-extrabold scale-105' : 'text-amber-300/70 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Admin</span>
          </button>
        )}
      </nav>
    </>
  );
};



