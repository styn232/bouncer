import React from 'react';
import { ShieldCheck, User as UserIcon, Shield, Sparkles, UserCheck, LogOut } from 'lucide-react';
import { User, SiteSettings } from '../types';

interface NavbarProps {
  activeTab: 'browse' | 'cart' | 'vip' | 'profile' | 'admin';
  setActiveTab: (tab: 'browse' | 'cart' | 'vip' | 'profile' | 'admin') => void;
  cartCount: number;
  currentUser: User | null;
  siteSettings?: SiteSettings;
  isLoggedIn?: boolean;
  onOpenAuth: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenPayment: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  currentUser,
  siteSettings,
  isLoggedIn = true,
  onOpenAuth,
  onOpenLogin,
  onOpenRegister,
  onLogout
}) => {
  const displaySiteName = siteSettings?.siteName || 'DATING WITH BOUNCER';
  const logoUrl = siteSettings?.logoUrl;
  const iconUrl = siteSettings?.iconUrl;

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@bouncer.com');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('browse')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={displaySiteName} 
              referrerPolicy="no-referrer"
              className="h-9 sm:h-11 max-w-[120px] sm:max-w-[160px] object-contain rounded-xl ring-1 ring-emerald-300"
            />
          ) : (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 p-0.5 shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                {iconUrl ? (
                  <img src={iconUrl} alt="Icon" referrerPolicy="no-referrer" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                ) : (
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 fill-emerald-100" />
                )}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-xl tracking-tight text-emerald-950 font-serif uppercase">
                DATING WITH BOUNCER
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
              VIP Matchmaking • Verified Ladies & Gentlemen
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-emerald-50/80 p-1.5 rounded-2xl border border-emerald-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Browse Singles
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 relative ${
              activeTab === 'cart'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Chosen Singles
            {cartCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </button>

          {/* Show Admin Panel Button ONLY to Admin User */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-900" />
              Staff Control Panel
            </button>
          )}
        </nav>

        {/* User Right Action Panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn ? (
            <>
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all"
              >
                Log In
              </button>

              <button
                onClick={onOpenRegister}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              {/* Logged in User Status / Profile Button */}
              {currentUser && (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors shadow-sm"
                  title="Manage Profile / Switch User Account"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-400"
                  />
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold flex items-center gap-1 text-slate-900">
                      {currentUser.name}
                      {currentUser.bouncerVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-700 capitalize font-bold">
                      {isAdmin ? 'Staff / Admin' : 'Member'}
                    </div>
                  </div>
                </button>
              )}

              {/* Prominent Log Out Button */}
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-emerald-50 border-t border-emerald-200 py-2.5 px-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'browse' ? 'text-emerald-700 font-black' : 'text-slate-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Browse Singles
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'cart' ? 'text-emerald-700 font-black' : 'text-slate-600'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Chosen ({cartCount})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'profile' ? 'text-emerald-700 font-black' : 'text-slate-600'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          My Profile
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
              activeTab === 'admin' ? 'text-amber-800' : 'text-amber-700/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Staff Panel
          </button>
        )}
      </div>
    </header>
  );
};

