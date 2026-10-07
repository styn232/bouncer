import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, ChevronLeft, ChevronRight, MapPin, Star, Eye, UserCheck, Check, Lock, ShieldCheck, Camera, ImageOff, MailCheck } from 'lucide-react';
import { SingleProfile, User } from '../types';
import { formatDisplayName, capitalizeName, getValidProfilePhotos } from '../utils/format';

interface FeaturedSinglesProps {
  profiles: SingleProfile[];
  onViewDetails: (profile: SingleProfile) => void;
  onViewPhotos?: (profile: SingleProfile, initialIdx?: number) => void;
  onAddToCart?: (profile: SingleProfile) => void;
  cartProfileIds?: string[];
  currentUser?: User | null;
}

export const FeaturedSingles: React.FC<FeaturedSinglesProps> = ({
  profiles,
  onViewDetails,
  onViewPhotos,
  onAddToCart,
  cartProfileIds = [],
  currentUser
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Strictly enforce opposite-gender visibility: Men only see Ladies, Ladies only see Men
  const viewerGender = (currentUser?.gender || '').toLowerCase();
  const oppositeGenderProfiles = profiles.filter((p) => {
    const profGender = (p.gender || 'female').toLowerCase();
    if (viewerGender === 'male') return profGender === 'female';
    if (viewerGender === 'female') return profGender === 'male';
    return true;
  });

  // Filter profiles that are explicitly marked as featured role, isFeatured, or VIP approved
  const featuredProfiles = oppositeGenderProfiles
    .filter((p) => p.role === 'featured' || p.isFeatured || (p as any).featured || p.bouncerStatus === 'vip_approved')
    .sort((a, b) => {
      const aExplicit = Boolean(a.role === 'featured' || a.isFeatured);
      const bExplicit = Boolean(b.role === 'featured' || b.isFeatured);
      if (aExplicit && !bExplicit) return -1;
      if (!aExplicit && bExplicit) return 1;
      return 0;
    });

  // If no explicitly tagged featured profiles, take the highest rated/VIP profiles as spotlight
  const displayList = featuredProfiles.length > 0
    ? featuredProfiles
    : oppositeGenderProfiles.slice(0, 8);

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
                onClick={() => {
                  if (onViewPhotos) onViewPhotos(profile);
                  else onViewDetails(profile);
                }}
                className="relative aspect-[4/3] bg-slate-900 cursor-pointer overflow-hidden"
                title="Tap to view photos"
              >
                {getValidProfilePhotos(profile.photos).length > 0 ? (
                  <img
                    src={getValidProfilePhotos(profile.photos)[0]}
                    alt={capitalizeName(profile.name)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950/60 p-3 text-center">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-rose-400 mb-1.5">
                      <ImageOff className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wider">No Picture</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                {/* Icons Only on Picture (No Words — Gives Way for Picture) */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span
                    className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md border border-amber-200"
                    title="Featured"
                  >
                    <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  </span>
                  {(profile.bouncerStatus === 'verified' || profile.bouncerStatus === 'vip_approved' || profile.bouncerVerified || profile.emailVerified) && (
                    <span
                      className="w-6 h-6 rounded-full bg-emerald-600/95 text-white flex items-center justify-center shadow-md border border-emerald-300"
                      title="Verified"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                  {profile.emailVerified && (
                    <span
                      className="w-6 h-6 rounded-full bg-sky-600/95 text-white flex items-center justify-center shadow-md border border-sky-300"
                      title="Email Verified"
                    >
                      <MailCheck className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {(profile.photos?.length || 0) > 1 && (
                    <span className="bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700 font-bold text-[9px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                      <Camera className="w-2.5 h-2.5 text-rose-400" />
                      {profile.photos?.length}
                    </span>
                  )}
                  <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 font-bold text-[9px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {(profile.averageRating || 5.0).toFixed(1)}
                  </span>
                </div>

                {/* WhatsApp Status Icon Only */}
                <div className="absolute bottom-2 left-2">
                  {unlocked ? (
                    <span
                      className="w-6 h-6 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-md border border-emerald-300"
                      title="Direct WhatsApp Unlocked"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full bg-slate-950/90 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-md"
                      title="Private WhatsApp"
                    >
                      <Lock className="w-3 h-3 text-amber-400" />
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
                      className="text-sm font-extrabold text-white hover:text-amber-400 cursor-pointer truncate font-serif flex items-center gap-1"
                    >
                      <span className="truncate">{formattedName}, <span className="text-amber-400 font-sans">{profile.age}</span></span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verified" />
                      {profile.emailVerified && (
                        <MailCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" title="Email Verified" />
                      )}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2 truncate">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{profile.city || profile.location}</span>
                  </div>
                </div>

                {/* Bottom Quick Buttons */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  {onViewPhotos && (
                    <button
                      type="button"
                      onClick={() => onViewPhotos(profile)}
                      className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 transition-colors"
                      title="View photos before choosing"
                    >
                      <Camera className="w-3 h-3 text-rose-400" />
                      <span>Photos</span>
                    </button>
                  )}
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
