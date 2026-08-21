import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, ChevronLeft, ChevronRight, MapPin, Star, Eye, UserCheck, Check, Lock, ShieldCheck } from 'lucide-react';
import { SingleProfile, User } from '../types';
import { formatDisplayName, capitalizeName } from '../utils/format';

interface FeaturedSinglesProps {
  profiles: SingleProfile[];
  onViewDetails: (profile: SingleProfile) => void;
  onAddToCart?: (profile: SingleProfile) => void;
  cartProfileIds?: string[];
  currentUser?: User | null;
}

export const FeaturedSingles: React.FC<FeaturedSinglesProps> = ({
  profiles,
  onViewDetails,
  onAddToCart,
  cartProfileIds = [],
  currentUser
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter profiles that are explicitly marked as featured or VIP approved
  const featuredProfiles = profiles.filter(
    (p) => p.isFeatured || (p as any).featured || p.bouncerStatus === 'vip_approved'
  );

  // If no explicitly tagged featured profiles, take the highest rated/VIP profiles as spotlight
  const displayList = featuredProfiles.length > 0
    ? featuredProfiles
    : profiles.slice(0, 8);

  if (displayList.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isUserUnlocked = (profile: SingleProfile) => {
    return (
      currentUser?.role === 'admin' ||
      currentUser?.purchasedProfileIds?.includes(profile.id) ||
      (currentUser?.subscriptionStatus === 'active' && currentUser?.subscriptionPlan && currentUser?.subscriptionPlan !== 'free') ||
      currentUser?.subscriptionPlan === 'vip_30_singles' ||
      currentUser?.subscriptionPlan === 'starter_10_singles' ||
      currentUser?.subscriptionPlan === 'vip_15_singles' ||
      currentUser?.subscriptionPlan === 'starter_3_or_4' ||
      currentUser?.subscriptionPlan === 'test_1_single' ||
      currentUser?.subscriptionPlan === 'starter_1_single'
    );
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white font-serif flex items-center gap-2">
              <span>Featured Singles Spotlight</span>
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                <Sparkles className="w-3 h-3 fill-amber-300" />
                Top Vetted
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Exclusive spotlight profiles with verified background vetting & high compatibility scores
            </p>
          </div>
        </div>

        {/* Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3.5 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayList.map((profile) => {
          const formattedName = formatDisplayName(profile.name, 15);
          const isInCart = cartProfileIds.includes(profile.id);
          const unlocked = isUserUnlocked(profile);

          return (
            <motion.div
              key={profile.id}
              whileHover={{ y: -3 }}
              className="w-56 sm:w-64 shrink-0 bg-slate-950 border border-amber-500/30 hover:border-amber-400/70 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg group transition-all"
            >
              {/* Photo Area */}
              <div
                onClick={() => onViewDetails(profile)}
                className="relative aspect-[4/3] bg-slate-900 cursor-pointer overflow-hidden"
              >
                <img
                  src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={capitalizeName(profile.name)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                    <Crown className="w-2.5 h-2.5 fill-slate-950" />
                    FEATURED
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 font-bold text-[9px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {(profile.averageRating || 5.0).toFixed(1)}
                  </span>
                </div>

                {/* WhatsApp Status Pill */}
                <div className="absolute bottom-2 left-2">
                  {unlocked ? (
                    <span className="bg-emerald-600/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> Direct Chat
                    </span>
                  ) : (
                    <span className="bg-slate-950/90 border border-amber-500/40 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-amber-400" /> Private WhatsApp
                    </span>
                  )}
                </div>
              </div>

              {/* Info & Action area */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      onClick={() => onViewDetails(profile)}
                      className="text-sm font-extrabold text-white hover:text-amber-400 cursor-pointer truncate font-serif"
                    >
                      {formattedName}, <span className="text-amber-400 font-sans">{profile.age}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2 truncate">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{profile.city || profile.location}</span>
                  </div>
                </div>

                {/* Bottom Quick Buttons */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(profile)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm ${
                        isInCart
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isInCart ? <Check className="w-3 h-3 stroke-[3]" /> : <UserCheck className="w-3 h-3" />}
                      <span className="truncate">{isInCart ? 'Chosen' : 'Choose'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewDetails(profile)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
