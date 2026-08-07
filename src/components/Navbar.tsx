import React from 'react';
import { ShieldCheck, ShoppingBag, Crown, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { User, SiteSettings } from '../types';

interface NavbarProps {
  activeTab: 'browse' | 'cart' | 'vip' | 'profile' | 'admin';
  setActiveTab: (tab: 'browse' | 'cart' | 'vip' | 'profile' | 'admin') => void;
  cartCount: number;
  currentUser: User;
  siteSettings?: SiteSettings;
  onOpenAuth: () => void;
  onOpenPayment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  currentUser,
  siteSettings,
  onOpenAuth,
  onOpenPayment
}) => {
  const displaySiteName = siteSettings?.siteName || 'DATING WITH BOUNCER';
  const logoUrl = siteSettings?.logoUrl;
  const iconUrl = siteSettings?.iconUrl;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('browse')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={displaySiteName} 
              referrerPolicy="no-referrer"
              className="h-11 max-w-[160px] object-contain rounded-xl ring-1 ring-amber-500/30"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {iconUrl ? (
                  <img src={iconUrl} alt="Icon" referrerPolicy="no-referrer" className="w-6 h-6 object-contain" />
                ) : (
                  <Shield className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                )}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 font-serif">
                {displaySiteName}
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full">
                Vetted Singles
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Velvet Rope Access • Add Singles to Cart
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Browse Singles
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 relative ${
              activeTab === 'cart'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-rose-300" />
            Singles Cart
            {cartCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border border-slate-900">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vip')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'vip'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            VIP & Payment
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Account
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Bouncer Admin
            </button>
          )}
        </nav>

        {/* User Right Action Panel */}
        <div className="flex items-center gap-3">
          {/* Cart Icon Quick Action for Mobile */}
          <button
            onClick={() => setActiveTab('cart')}
            className="md:hidden relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
          >
            <ShoppingBag className="w-5 h-5 text-rose-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Status / Account Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-amber-500/40"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold flex items-center gap-1 text-slate-100">
                  {currentUser.name}
                  {currentUser.bouncerVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                  )}
                </div>
                <div className="text-[10px] text-amber-400 capitalize font-medium">
                  {currentUser.subscriptionPlan.replace('_', ' ')}
                </div>
              </div>
            </button>

            {/* Quick Membership Upgrade CTA */}
            <button
              onClick={onOpenPayment}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all"
            >
              <Crown className="w-3.5 h-3.5" />
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 py-2.5 px-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activeTab === 'browse' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Singles
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium relative ${
            activeTab === 'cart' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Cart {cartCount > 0 && `(${cartCount})`}
        </button>
        <button
          onClick={() => setActiveTab('vip')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activeTab === 'vip' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Crown className="w-4 h-4" />
          VIP
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activeTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Account
        </button>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
              activeTab === 'admin' ? 'text-amber-400' : 'text-amber-500/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
