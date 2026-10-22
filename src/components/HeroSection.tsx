import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Flame, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  CreditCard, 
  MessageSquare, 
  Star, 
  Smile, 
  ShieldAlert, 
  UserPlus, 
  Zap,
  Award
} from 'lucide-react';
import { SingleProfile, ReelItem, SubscriptionPlan } from '../types';

interface HeroSectionProps {
  profiles?: SingleProfile[];
  reels?: ReelItem[];
  plans?: SubscriptionPlan[];
  onFindMatch?: () => void;
  onCreateProfile?: () => void;
  onSelectProfile?: (profile: SingleProfile) => void;
  onLikeProfile?: (profile: SingleProfile) => void;
  onOpenReels?: () => void;
  onExploreClick?: () => void;
  onQuizClick?: () => void;
  onVerifyClick?: () => void;
  onOpenPayment?: (planId?: string) => void;
  onOpenSafety?: () => void;
  onOpenRegister?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profiles = [],
  reels = [],
  plans = [],
  onFindMatch,
  onCreateProfile,
  onSelectProfile,
  onLikeProfile,
  onOpenReels,
  onExploreClick,
  onQuizClick,
  onVerifyClick,
  onOpenPayment,
  onOpenSafety,
  onOpenRegister
}) => {
  const safeProfiles = profiles || [];
  const featuredSingles = safeProfiles.slice(0, 6);
  const onlineNow = safeProfiles.filter(p => p.isOnline || p.isFeatured).slice(0, 8);

  const handleBrowseSingles = onExploreClick || onFindMatch || (() => {});
  const handleJoinNow = onOpenRegister || onCreateProfile || (() => {});
  const handlePayment = onOpenPayment || (() => {});
  const handleSafety = onOpenSafety || onVerifyClick || (() => {});

  // FAQ accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does DATING WITH BOUNCER work in Zimbabwe?',
      a: 'Browse verified singles across Harare, Bulawayo, Mutare, Gweru and all 10 provinces. View real photos, relationship intentions, and compatibility. When you find someone special, select their profile to unlock their direct, consented WhatsApp contact number through our secure Paynow gateway.'
    },
    {
      q: 'How are singles verified on the platform?',
      a: 'Our Bouncer moderation team verifies profiles for genuine identity, age (18+ only), clear and honest relationship goals, and consensual contact sharing. Look for the green Bouncer Shield Check badge on verified profiles.'
    },
    {
      q: 'What payment methods does Paynow support?',
      a: 'We accept EcoCash, OneMoney, Visa, MasterCard, and Zimswitch cards securely processed through our official Zimbabwe Paynow merchant account. You receive instant access to your unlocked contacts right after payment.'
    },
    {
      q: 'Can Zimbabweans in the diaspora join and connect?',
      a: 'Yes! DATING WITH BOUNCER actively serves Zimbabweans living in the UK, South Africa, USA, Canada, Australia, and worldwide looking to connect with genuine singles back home or in their region.'
    },
    {
      q: 'How is my privacy and contact number protected?',
      a: 'Your WhatsApp number is strictly hidden from public view. It is only unlocked to serious, verified members who have unlocked your contact after you have voluntarily consented to profile visibility. You can update your location privacy or delete your account at any time.'
    }
  ];

  const successStories = [
    {
      names: 'Tinashe & Ruvimbo',
      location: 'Harare & Johannesburg',
      quote: 'We connected through DATING WITH BOUNCER when Ruvimbo was visiting family in Borrowdale. Six months later, we got engaged in Victoria Falls! Truly grateful for the verified process.',
      badge: 'Married 2025',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    {
      names: 'Farai & Chipo',
      location: 'Bulawayo (Khumalo)',
      quote: 'Finding someone with serious marriage intentions was so difficult until Bouncer verified profiles gave us peace of mind. Both of us knew exactly what we were looking for from day one.',
      badge: 'Together 1 Year',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
    },
    {
      names: 'Kudakwashe & Nomsa',
      location: 'Mutare & London (Diaspora)',
      quote: 'Being in the diaspora makes it hard to meet genuine Zimbabwean singles. DATING WITH BOUNCER made it effortless, honest, and safe. We talk on WhatsApp every single evening.',
      badge: 'Engaged',
      image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=400'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* ========================================================= */}
      {/* 1. HERO SECTION: DEEP PURPLE, ROMANTIC PINK & GOLD PALETTE */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-950 to-purple-900 border border-pink-500/20 p-6 sm:p-12 lg:p-16 text-center shadow-2xl">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/60 border border-pink-500/30 text-pink-200 text-xs font-black uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Zimbabwe & Diaspora's Premier Matchmaking Platform</span>
          </div>

          {/* Exact Required Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-serif leading-tight">
            FIND YOUR PERFECT MATCH IN <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">ZIMBABWE</span>
          </h1>

          {/* Exact Required Subheading */}
          <p className="text-purple-100/90 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Browse singles, explore photos, discover meaningful connections, and connect with someone special through <span className="font-bold text-white tracking-wide">DATING WITH BOUNCER</span>.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={handleBrowseSingles}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 ring-2 ring-pink-400/40"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span>BROWSE SINGLES</span>
            </button>

            <button
              onClick={handleJoinNow}
              className="px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-400/70 text-amber-300 hover:text-white font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>JOIN NOW</span>
            </button>
          </div>

          {/* Key Platform Proof Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-3xl mx-auto border-t border-purple-800/40">
            <div className="text-center p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
              <div className="text-xl sm:text-2xl font-black text-white font-serif">100%</div>
              <div className="text-[10px] text-pink-200 uppercase tracking-wider font-bold">Adults 18+ Only</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-serif">10 Provinces</div>
              <div className="text-[10px] text-pink-200 uppercase tracking-wider font-bold">Harare, Bulawayo & Beyond</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">Paynow</div>
              <div className="text-[10px] text-pink-200 uppercase tracking-wider font-bold">EcoCash & Visa Verified</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
              <div className="text-xl sm:text-2xl font-black text-pink-300 font-serif">WhatsApp</div>
              <div className="text-[10px] text-pink-200 uppercase tracking-wider font-bold">Direct Consented Chats</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FEATURED SINGLES DISCOVERY PREVIEW */}
      {/* ========================================================= */}
      {featuredSingles.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-pink-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Verified Zimbabwean Profiles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
                Featured Singles Ready to Connect
              </h2>
            </div>
            <button
              onClick={handleBrowseSingles}
              className="inline-flex items-center gap-1.5 text-sm font-black text-rose-600 dark:text-pink-400 hover:text-rose-500 hover:underline"
            >
              <span>Explore All Singles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {featuredSingles.map(single => (
              <div
                key={single.id}
                onClick={() => onSelectProfile && onSelectProfile(single)}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={single.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={single.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {single.bouncerVerified && (
                    <span className="absolute top-2 left-2 bg-emerald-500/95 text-white p-1 rounded-full shadow-sm" title="Bouncer Verified">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <div className="text-xs font-black truncate">{single.name}, {single.age}</div>
                    <div className="text-[10px] text-slate-300 truncate">📍 {single.city || single.location}</div>
                  </div>
                </div>

                <div className="p-2.5 flex items-center justify-between text-xs bg-purple-50/50 dark:bg-purple-950/30">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-pink-400 uppercase">
                    {single.intent === 'Marriage' ? '💍 Marriage' : '😂 Dating'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    👶 {single.childrenCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. HOW IT WORKS: 4 SIMPLE STEPS */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-gradient-to-b from-purple-900/10 via-pink-500/5 to-transparent p-6 sm:p-10 border border-purple-200/50 dark:border-purple-900/40 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-rose-600 dark:text-pink-400 uppercase tracking-widest">
            SIMPLE & SECURE MATCHMAKING
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
            How DATING WITH BOUNCER Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Four easy steps designed for Zimbabwean mobile users to connect directly and safely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-purple-950 text-rose-600 dark:text-pink-400 flex items-center justify-center font-black text-lg">
              01
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white font-serif">Browse Verified Singles</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore genuine profiles with real photographs across Harare, Bulawayo, Mutare, and the diaspora.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-purple-950 text-rose-600 dark:text-pink-400 flex items-center justify-center font-black text-lg">
              02
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white font-serif">Select & Choose Matches</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Filter by location, intention (Marriage or Dating), children, and save your favorites to your match cart.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-purple-950 text-rose-600 dark:text-pink-400 flex items-center justify-center font-black text-lg">
              03
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white font-serif">Secure Paynow Checkout</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Pay via EcoCash, OneMoney, or Visa/MasterCard. Clean pricing packages starting at only USD $6.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-purple-950 text-rose-600 dark:text-pink-400 flex items-center justify-center font-black text-lg">
              04
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white font-serif">Instant WhatsApp Connect</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlock verified, consented WhatsApp contact numbers directly and start chatting right away.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHY CHOOSE DATING WITH BOUNCER */}
      {/* ========================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-rose-600 dark:text-pink-400 uppercase tracking-widest">
            AUTHENTIC & TRUSTED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
            Why Choose DATING WITH BOUNCER
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Engineered specifically to solve fake profiles, scams, and endless ghosting in modern dating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-serif">Strict Identity Vetting</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every single profile is reviewed before publication. We verify authentic Zimbabwean identity, genuine adult photos, and active phone numbers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-serif">Consented WhatsApp Unlocks</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No bots, no fake chat timers, and no hidden subscriptions. Singles willingly consent to share their contact for genuine communication.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-serif">Official Paynow Protection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Transactions are securely verified server-side with Zimbabwe's trusted payment gateway. No contact is ever revealed without verified payment.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. MEMBERSHIP PACKAGES ($6, $10, $30) */}
      {/* ========================================================= */}
      <section className="space-y-8 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-950 to-purple-900 p-6 sm:p-12 text-white border border-pink-500/20 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>TRANSPARENT BUSINESS PRICING</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-serif text-white">
            Membership Packages
          </h2>
          <p className="text-xs sm:text-sm text-purple-200">
            Pay securely with EcoCash, OneMoney, or Visa/MasterCard. No hidden renewals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Package 1: USD $6 */}
          <div className="rounded-3xl bg-purple-900/40 border border-purple-700/50 p-6 flex flex-col justify-between space-y-6 hover:border-pink-400/60 transition-all">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-800 text-pink-200 text-[10px] font-extrabold uppercase">
                Starter Choice
              </div>
              <h3 className="text-xl font-black font-serif text-white">3–4 Singles Pass</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-serif text-white">USD $6</span>
                <span className="text-xs text-purple-300">/ one-time</span>
              </div>
              <p className="text-xs text-purple-200">
                Unlock direct WhatsApp contacts for 3 to 4 verified singles of your choice.
              </p>
              <ul className="space-y-2.5 text-xs text-purple-100 pt-2 border-t border-purple-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Choose 3 to 4 Singles in Cart</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp Contact Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bouncer Verification Shield</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePayment('starter_3_or_4')}
              className="w-full py-3 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider transition-all"
            >
              Get $6 Pass
            </button>
          </div>

          {/* Package 2: USD $10 (POPULAR BUNDLE) */}
          <div className="relative rounded-3xl bg-gradient-to-b from-purple-900/90 to-purple-950 border-2 border-amber-400 p-6 flex flex-col justify-between space-y-6 shadow-2xl scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              Most Popular Bundle
            </div>
            <div className="space-y-4 pt-2">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold uppercase">
                Best Match Value
              </div>
              <h3 className="text-xl font-black font-serif text-white">More Than 10 Singles</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-serif text-amber-300">USD $10</span>
                <span className="text-xs text-purple-200">/ bundle</span>
              </div>
              <p className="text-xs text-purple-200">
                Unlock direct WhatsApp contacts for more than 10 singles across all provinces.
              </p>
              <ul className="space-y-2.5 text-xs text-purple-100 pt-2 border-t border-purple-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Unlock More Than 10 Singles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Direct WhatsApp Contacts & Delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Priority Bouncer Clearance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Zimbabwe & Diaspora Access</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePayment('starter_10_singles')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Get $10 Bundle
            </button>
          </div>

          {/* Package 3: USD $30 (UNLIMITED ACCESS) */}
          <div className="rounded-3xl bg-purple-900/40 border border-purple-700/50 p-6 flex flex-col justify-between space-y-6 hover:border-pink-400/60 transition-all">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-800 text-pink-200 text-[10px] font-extrabold uppercase">
                VIP Access
              </div>
              <h3 className="text-xl font-black font-serif text-white">Unlimited Access</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-serif text-white">USD $30</span>
                <span className="text-xs text-purple-300">/ full pass</span>
              </div>
              <p className="text-xs text-purple-200">
                Full VIP matchmaking with unlimited contact unlocks and concierge assistance.
              </p>
              <ul className="space-y-2.5 text-xs text-purple-100 pt-2 border-t border-purple-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Singles Contact Unlocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>VIP Gold Profile Status Badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Matchmaker Concierge</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePayment('vip_30_singles')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all"
            >
              Get $30 Unlimited
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. VERIFICATION AND SAFETY INFORMATION */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 p-6 sm:p-10 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-950 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>SAFETY & INTEGRITY STANDARDS</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif">
              Verification & Safety on DATING WITH BOUNCER
            </h2>
          </div>
          <button
            onClick={handleSafety}
            className="px-5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-pink-300 font-extrabold text-xs hover:bg-purple-100 transition-all border border-purple-200 dark:border-purple-800"
          >
            Read Safety Guidelines
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Adults 18+ Mandatory</span>
            </h4>
            <p className="leading-relaxed">
              We strictly enforce an age restriction. Any profile suspected of being under 18 is immediately removed and blocked permanently.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Tolerance for Fraud</span>
            </h4>
            <p className="leading-relaxed">
              Automated scanners and human bouncers screen for impersonation, duplicate photos, and suspicious solicitations 24 hours a day.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Privacy Control & Consent</span>
            </h4>
            <p className="leading-relaxed">
              Every member controls their suburb visibility and can update or remove their profile anytime with immediate effect.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. REAL, CONSENTED SUCCESS STORIES */}
      {/* ========================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-rose-600 dark:text-pink-400 uppercase tracking-widest">
            REAL TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
            Real, Consented Success Stories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Inspiring couples who found lasting love through DATING WITH BOUNCER.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={story.image}
                    alt={story.names}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/40"
                  />
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white font-serif">{story.names}</h3>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{story.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{story.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-purple-50 dark:border-purple-950 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                  {story.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Consented Story
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 p-6 sm:p-10 shadow-lg space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-rose-600 dark:text-pink-400 uppercase tracking-widest">
            GOT QUESTIONS?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-purple-100 dark:border-purple-900/60 overflow-hidden bg-purple-50/30 dark:bg-purple-950/20"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                className="w-full p-4 text-left font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-rose-500 transition-transform ${
                    openFaqIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaqIdx === idx && (
                <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-purple-100/50 dark:border-purple-900/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. CONTACT AND SUPPORT INFORMATION */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-purple-950 border border-pink-500/20 p-6 sm:p-10 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-pink-300 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>OFFICIAL SUPPORT DESK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white">
              Need Assistance? Contact Bouncer Support
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Our Harare HQ customer care team is available on WhatsApp and email to assist you with profile verification, payment confirmation, or match inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://wa.me/263715786859?text=Hi%20Bouncer%20Support,%20I%20need%20assistance%20with%20DATING%20WITH%20BOUNCER"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp: +263 71 578 6859</span>
            </a>

            <a
              href="mailto:jobsatespace@gmail.com?subject=Dating%20With%20Bouncer%20Inquiry"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-200 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-pink-400" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-purple-300/80">
          <div>📍 Headquarters: Harare HQ, Zimbabwe • Registered Dating Platform</div>
          <div>Strictly 18+ • Consented Matchmaking • Paynow Official Integration</div>
        </div>
      </section>
    </div>
  );
};
