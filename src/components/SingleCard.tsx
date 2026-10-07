import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  ShieldCheck, 
  Eye, 
  Heart, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Star, 
  Crown, 
  Lock, 
  HeartPulse,
  Camera,
  ImageOff,
  MailCheck
} from 'lucide-react';
import { SingleProfile, User } from '../types';
import { formatDisplayName, capitalizeName, formatHivStatus, getValidProfilePhotos } from '../utils/format';

interface SingleCardProps {
  profile: SingleProfile;
  isInCart?: boolean;
  onAddToCart?: (profile: SingleProfile) => void;
  onViewDetails: (profile: SingleProfile) => void;
  onViewPhotos?: (profile: SingleProfile, initialIdx?: number) => void;
  currentUser?: User | null;
}

export const SingleCard: React.FC<SingleCardProps> = React.memo(({
  profile,
  isInCart,
  onAddToCart,
  onViewDetails,
  onViewPhotos,
  currentUser
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const isOwner = currentUser && (currentUser.id === profile.id || currentUser.email === (profile as any).email);
  const formattedDisplayName = formatDisplayName(profile.name, 15);
  const photos = getValidProfilePhotos(profile.photos);
  const totalPhotos = photos.length;
  const hasPhoto = totalPhotos > 0;

  const isUnlocked =
    currentUser?.role === 'admin' ||
    currentUser?.purchasedProfileIds?.includes(profile.id) ||
    (currentUser?.subscriptionStatus === 'active' && currentUser?.subscriptionPlan && currentUser?.subscriptionPlan !== 'free') ||
    currentUser?.subscriptionPlan === 'vip_30_singles' ||
    currentUser?.subscriptionPlan === 'starter_10_singles' ||
    currentUser?.subscriptionPlan === 'vip_15_singles' ||
    currentUser?.subscriptionPlan === 'starter_3_or_4' ||
    currentUser?.subscriptionPlan === 'test_1_single' ||
    currentUser?.subscriptionPlan === 'starter_1_single';

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handlePhotoClick = () => {
    if (onViewPhotos) {
      onViewPhotos(profile, currentPhotoIdx);
    } else {
      onViewDetails(profile);
    }
  };

  const starRating = profile.averageRating || 5.0;
  const isVipOrFeatured = Boolean(
    profile.bouncerStatus === 'vip_approved' ||
    profile.role === 'featured' ||
    profile.isFeatured ||
    (profile as any).featured ||
    profile.role === 'admin'
  );
  const isVerifiedBouncer = Boolean(
    profile.bouncerStatus === 'verified' ||
    profile.bouncerStatus === 'vip_approved' ||
    profile.bouncerVerified ||
    profile.emailVerified ||
    isVipOrFeatured
  );

  return (
    <div
      className={`bg-white hover:-translate-y-1 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden flex flex-col group transition-all duration-200 ${
        isVipOrFeatured
          ? 'border-2 border-amber-400/90 hover:border-amber-500 shadow-md shadow-amber-950/15 ring-1 ring-amber-300/50'
          : 'border border-rose-200/90 hover:border-rose-400 shadow-sm hover:shadow-lg hover:shadow-rose-950/10'
      }`}
    >
      {/* Top Image Container with Photo Navigation & Quick Preview */}
      <div 
        onClick={handlePhotoClick}
        className="relative aspect-[4/5] overflow-hidden bg-slate-900 cursor-pointer select-none"
        title="Tap to view full photos"
      >
        {hasPhoto ? (
          <img
            src={photos[currentPhotoIdx] || photos[0]}
            alt={capitalizeName(profile.name)}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950/60 p-4 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400 mb-2 shadow-inner">
              <ImageOff className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400/80" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider">
              No Picture
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
              Photo not uploaded yet
            </span>
          </div>
        )}

        {/* Subtle Bottom Gradient Only (gives way for the picture) */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />

        {/* Top Left Overlay Icons Only (No Words — Gives Way for Picture) */}
        <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 flex items-center gap-1 z-10 pointer-events-none">
          {isVipOrFeatured && (
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-lg flex items-center justify-center border border-amber-200"
              title="VIP / Featured"
              aria-label="VIP / Featured"
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-slate-950 shrink-0" />
            </div>
          )}

          {isVerifiedBouncer && (
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600/95 backdrop-blur-md text-white shadow-md flex items-center justify-center border border-emerald-300"
              title="Verified"
              aria-label="Verified"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            </div>
          )}

          {profile.emailVerified && (
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-600/95 backdrop-blur-md text-white shadow-md flex items-center justify-center border border-sky-300"
              title="Email Verified"
              aria-label="Email Verified"
            >
              <MailCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            </div>
          )}
        </div>

        {/* Top Right Quick Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isLiked
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-white/85 text-slate-700 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
          aria-label="Quick like"
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-white' : ''}`} />
        </button>

        {/* Photo Navigation Arrows - visible on mobile tap & desktop hover */}
        {totalPhotos > 1 && (
          <div className="absolute inset-x-1 sm:inset-x-1.5 top-1/2 -translate-y-1/2 flex justify-between items-center z-10 pointer-events-auto opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevPhoto}
              className="p-1 sm:p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm shadow-md active:scale-90"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="p-1 sm:p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm shadow-md active:scale-90"
              aria-label="Next photo"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Bottom Left: Photo Counter Badge (Click to open full photo viewer) */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex items-center gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePhotoClick();
            }}
            className="bg-slate-950/85 hover:bg-slate-900 border border-slate-700/70 text-slate-200 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-xs transition-all active:scale-95"
            title="Click to view all photos"
          >
            <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
            <span>{hasPhoto ? `${currentPhotoIdx + 1}/${totalPhotos}` : 'No Picture'}</span>
          </button>

          {isOwner && (
            <div className="hidden xs:flex bg-slate-950/85 border border-slate-700/60 text-slate-300 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs items-center gap-0.5">
              <Eye className="w-2.5 h-2.5 text-amber-400" />
              <span>{profile.viewsCount || 0}</span>
            </div>
          )}
        </div>

        {/* Bottom Right: Star Rating */}
        <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-white/95 backdrop-blur-xs border border-amber-200 text-slate-900 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-xs flex items-center gap-0.5 z-10">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-400" />
          <span>{starRating.toFixed(1)}</span>
        </div>

        {/* Pagination Dots at bottom of photo */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-1 pointer-events-none z-10">
            {photos.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentPhotoIdx
                    ? 'w-3 bg-rose-400'
                    : 'w-1 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body: Display Name, Age, Location, Badges, Action Buttons */}
      <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Name & Age Header */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1 font-serif truncate min-w-0">
              <span className="truncate">{formattedDisplayName}</span>
              <span className="text-rose-600 font-sans text-xs sm:text-sm font-black shrink-0">
                , {profile.age}
              </span>
              {profile.bouncerStatus === 'vip_approved' && (
                <span className="inline-flex items-center gap-0.5 bg-amber-400 text-slate-950 font-black text-[7px] sm:text-[9px] px-1 py-0.5 rounded-full shrink-0 shadow-xs" title="VIP Single">
                  <Sparkles className="w-2 h-2 fill-slate-950" />
                </span>
              )}
              {isVerifiedBouncer && (
                <span className="inline-flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5 bg-emerald-500 text-white rounded-full shrink-0 shadow-xs" title="Verified">
                  <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </span>
              )}
              {profile.emailVerified && (
                <span className="inline-flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5 bg-sky-500 text-white rounded-full shrink-0 shadow-xs" title="Email Verified">
                  <MailCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </span>
              )}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 font-medium truncate mb-1.5">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 shrink-0" />
            <span className="truncate">{profile.city || profile.location}</span>
          </div>

          {/* Badges: Intent, Children, HIV status */}
          <div className="flex flex-wrap items-center gap-1 mb-2">
            <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase text-[7px] sm:text-[9px] border ${
              profile.intent === 'Marriage'
                ? 'bg-rose-100/70 border-rose-300 text-rose-950 font-black'
                : 'bg-pink-100/60 border-pink-200 text-pink-950'
            }`}>
              {profile.intent === 'Marriage' ? '💍 Marriage' : '😂 Dating'}
            </span>

            <span className="bg-rose-50 border border-rose-100 text-slate-700 px-1.5 py-0.5 rounded text-[7px] sm:text-[9px] font-semibold">
              👶 {profile.childrenCount === 0 ? '0' : profile.childrenCount}
            </span>

            {profile.hivStatus && (
              <span className={`px-1.5 py-0.5 rounded font-black text-[7px] sm:text-[9px] border flex items-center gap-0.5 ${
                formatHivStatus(profile.hivStatus) === 'HIV-'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800'
                  : 'bg-purple-500/15 border-purple-500/40 text-purple-800'
              }`} title={`HIV Status: ${formatHivStatus(profile.hivStatus)}`}>
                <HeartPulse className="w-2 h-2 text-rose-600" />
                <span>{formatHivStatus(profile.hivStatus)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Photos / View & Choose Single */}
        <div className="pt-1.5 sm:pt-2 border-t border-rose-100 flex flex-col xs:flex-row gap-1 sm:gap-1.5">
          {/* View Photos Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePhotoClick();
            }}
            className="flex-1 py-1.5 sm:py-2 px-1.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[9px] sm:text-xs uppercase tracking-tight transition-all flex items-center justify-center gap-1 active:scale-95 border border-slate-200"
            title="View full gallery of photos"
          >
            <Camera className="w-3 h-3 text-rose-600" />
            <span className="truncate">Photos</span>
          </button>

          {/* Choose Single Button */}
          {onAddToCart && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(profile);
              }}
              className={`flex-1 py-1.5 sm:py-2 px-1.5 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-tight transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                isInCart
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 ring-1 sm:ring-2 ring-amber-400'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:brightness-110 text-white'
              }`}
              title={isInCart ? 'Single already selected' : 'Choose this single'}
            >
              {isInCart ? <Check className="w-3 h-3 stroke-[3]" /> : <Heart className="w-3 h-3 fill-white" />}
              <span className="truncate">{isInCart ? 'Chosen' : 'Choose'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
