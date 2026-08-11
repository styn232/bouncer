import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ShieldCheck, Eye, Heart, Sparkles, ChevronLeft, ChevronRight, Check, Star, UserCheck } from 'lucide-react';
import { SingleProfile, User } from '../types';

interface SingleCardProps {
  profile: SingleProfile;
  isInCart?: boolean;
  onAddToCart?: (profile: SingleProfile) => void;
  onViewDetails: (profile: SingleProfile) => void;
  currentUser?: User | null;
}

export const SingleCard: React.FC<SingleCardProps> = ({
  profile,
  onViewDetails,
  currentUser
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const isOwner = currentUser && (currentUser.id === profile.id || currentUser.email === profile.email);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  };

  const starRating = profile.averageRating || 5.0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-emerald-200/80 hover:border-emerald-500/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-emerald-900/10 flex flex-col group transition-all"
    >
      {/* Top Image Container with Photo Navigation */}
      <div className="relative aspect-[4/5] sm:aspect-[1/1] overflow-hidden bg-slate-100">
        <img
          src={profile.photos[currentPhotoIdx] || profile.photos[0]}
          alt={profile.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Subtle Gradient Overlay for badge visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Top Right Quick Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${
            isLiked
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-white/80 text-slate-700 hover:text-rose-600 hover:bg-white shadow-sm'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-white' : ''}`} />
        </button>

        {/* Photo Navigation Arrows */}
        {profile.photos.length > 1 && (
          <div className="absolute inset-x-1.5 sm:inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={prevPhoto}
              className="p-1 sm:p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="p-1 sm:p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Views Count Overlay Pill (Owner Only) */}
        {isOwner && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md flex items-center gap-1">
            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
            <span>{profile.viewsCount || 0} views</span>
          </div>
        )}

        {/* Star Rating Overlay Pill */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-white/95 backdrop-blur-md border border-amber-200 text-slate-900 text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md flex items-center gap-0.5 sm:gap-1">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-400" />
          <span>{starRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Card Body - Display Name, Age, Location Prominently */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Prominent Name, Age & Verified Badges Header */}
          <div className="flex items-center justify-between mb-1 gap-1">
            <h3 className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1 sm:gap-1.5 font-serif truncate min-w-0">
              <span className="truncate">{profile.name}</span>
              <span className="text-emerald-700 font-sans text-xs sm:text-lg font-extrabold shrink-0">
                , {profile.age}
              </span>
              {profile.bouncerStatus === 'vip_approved' && (
                <span className="inline-flex items-center gap-0.5 bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shrink-0 shadow-xs" title="VIP Single">
                  <Sparkles className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                  <span>VIP</span>
                </span>
              )}
              {profile.bouncerStatus === 'verified' && (
                <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-300 shrink-0" title="Bouncer Vetted">
                  <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                  <span>Vetted</span>
                </span>
              )}
            </h3>
          </div>

          {/* Prominent Location & Attributes */}
          <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-slate-600 mb-2 sm:mb-3 font-medium">
            <div className="flex items-center gap-1 text-slate-700 font-semibold truncate">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{profile.city || profile.location}</span>
            </div>

            {/* Star Ranking Badge */}
            <div className="flex items-center gap-1 my-0.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
                      i < Math.floor(starRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-700">
                {starRating.toFixed(1)} ★
              </span>
            </div>

            {/* Children Count & Dating Intent Row */}
            <div className="flex flex-wrap items-center gap-1 mt-1 text-[9px] sm:text-[11px]">
              <span className="bg-emerald-50/80 border border-emerald-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded font-semibold">
                👶 {profile.childrenCount === 0 ? '0 Kids' : `${profile.childrenCount} Kid${profile.childrenCount > 1 ? 's' : ''}`}
              </span>

              <span className={`px-1.5 sm:px-2 py-0.5 rounded font-extrabold uppercase text-[8px] sm:text-[10px] border ${
                profile.intent === 'Marriage'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-100/60 border-emerald-200 text-emerald-900'
              }`}>
                {profile.intent === 'Marriage' ? '💍 Marriage' : '😂 Funny'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: View Profile */}
        <div className="pt-2 sm:pt-3 border-t border-emerald-100">
          <button
            onClick={() => onViewDetails(profile)}
            className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>View Profile</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
};

