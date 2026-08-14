import React from 'react';
import { ShieldCheck, User as UserIcon, Flame, Heart, MessageSquare, Video, Newspaper, Shield, Bell, Sparkles, Home, LogOut, ShoppingBag } from 'lucide-react';
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
  onLogout
}) => {
  const displaySiteName = siteSettings?.siteName || 'DATING WITH BOUNCER';
  const tagline = siteSettings?.tagline || 'Real People. Real Connections. Real Possibilities.';
  const logoUrl = siteSettings?.logoUrl;
  const iconUrl = siteSettings?.iconUrl;

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@bouncer.date');

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-rose-900/40 text-slate-100 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
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
              onClick={() => setActiveTab('home')}
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
                onClick={() => setActiveTab('profile')}
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
                onClick={() => setActiveTab('admin')}
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
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors shadow-inner"
                  title="View My Profile"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-rose-500/60"
                  />
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold flex items-center gap-1 text-white">
                      {currentUser.name}
                      {currentUser.bouncerVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold capitalize">
                      {currentUser?.role === 'admin' ? 'Admin' : `${(currentUser?.subscriptionPlan || 'free').replace('_', ' ')} Member`}
                    </div>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 transition-all flex items-center gap-1"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 py-2.5 px-4 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
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
            onClick={() => setActiveTab('profile')}
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
            onClick={() => setActiveTab('admin')}
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



