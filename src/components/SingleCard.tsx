import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ShieldCheck, ShoppingBag, Eye, Heart, Sparkles, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { SingleProfile } from '../types';

interface SingleCardProps {
  profile: SingleProfile;
  isInCart: boolean;
  onAddToCart: (profile: SingleProfile) => void;
  onViewDetails: (profile: SingleProfile) => void;
}

export const SingleCard: React.FC<SingleCardProps> = ({
  profile,
  isInCart,
  onAddToCart,
  onViewDetails
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col group transition-all"
    >
      {/* Top Image Container with Photo Navigation */}
      <div className="relative aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-slate-950">
        <img
          src={profile.photos[currentPhotoIdx] || profile.photos[0]}
          alt={profile.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Bouncer Verification Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {profile.bouncerStatus === 'vip_approved' && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-300">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              VIP Approved by Bouncer
            </span>
          )}
          {profile.bouncerStatus === 'verified' && (
            <span className="bg-slate-900/90 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Bouncer Verified
            </span>
          )}
          {profile.bouncerStatus === 'pending_check' && (
            <span className="bg-slate-900/90 text-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
              ⏳ Bouncer Review Pending
            </span>
          )}
        </div>

        {/* Top Right Quick Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${
            isLiked
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
        </button>

        {/* Photo Navigation Arrows */}
        {profile.photos.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={prevPhoto}
              className="p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Photo Indicators */}
        {profile.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {profile.photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentPhotoIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Compatibility Pill overlay */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
          {profile.compatibilityScore}% Match
        </div>
      </div>

      {/* Card Body - Display Name, Age, Location Prominently */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Prominent Name, Age Header */}
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-serif">
              <span>{profile.name}</span>
              <span className="text-amber-400 font-sans text-lg font-bold">
                , {profile.age}
              </span>
            </h3>
          </div>

          {/* Prominent Location & Attributes */}
          <div className="flex flex-col gap-1 text-xs text-slate-300 mb-3 font-medium">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{profile.location}</span>
            </div>

            {/* WhatsApp Contact Lock Indicator */}
            <div className="mt-1">
              {profile.whatsappNumber ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span>📱 WhatsApp Contact Available</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase">Locked</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <span>🔒 WhatsApp Number Unlocks After Checkout</span>
                </div>
              )}
            </div>

            {/* Children Count, Intent & Rating Row */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
              {/* Children Count */}
              <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                👶 {profile.childrenCount === 0 ? 'No children' : `${profile.childrenCount} child${profile.childrenCount > 1 ? 'ren' : ''}`}
              </span>

              {/* Dating Intent */}
              <span className={`px-2 py-0.5 rounded-md font-extrabold uppercase text-[10px] border ${
                profile.intent === 'Marriage'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}>
                {profile.intent === 'Marriage' ? '💍 Marriage' : '😂 Funny & Good Vibe'}
              </span>

              {/* Review Rating */}
              <span className="bg-slate-950 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                ★ {profile.averageRating ? profile.averageRating.toFixed(1) : '5.0'}
                {profile.reviews && profile.reviews.length > 0 && (
                  <span className="text-slate-500 font-normal">({profile.reviews.length})</span>
                )}
              </span>
            </div>
          </div>

          {/* Bio Snippet */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
            "{profile.bio}"
          </p>

          {/* Interests Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {profile.interests.slice(0, 3).map((interest, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/50"
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-[10px] text-slate-500 font-medium px-1 py-0.5">
                +{profile.interests.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart & View Bouncer Report */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => onViewDetails(profile)}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center"
            title="View Bouncer Profile Details"
          >
            <Eye className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => onAddToCart(profile)}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              isInCart
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-white shadow-rose-950/40 active:scale-[0.98]'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" />
                In Singles Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
