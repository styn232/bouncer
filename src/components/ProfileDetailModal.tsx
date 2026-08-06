import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ShieldCheck, ShoppingBag, X, Sparkles, Heart, CheckCircle2, UserCheck, Calendar, Briefcase, Award } from 'lucide-react';
import { SingleProfile } from '../types';

interface ProfileDetailModalProps {
  profile: SingleProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isInCart: boolean;
  onAddToCart: (profile: SingleProfile) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  isInCart,
  onAddToCart
}) => {
  if (!isOpen || !profile) return null;

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Photo Gallery */}
          <div className="w-full md:w-1/2 bg-slate-950 flex flex-col justify-between p-4 border-r border-slate-800">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900 mb-3 shadow-inner">
              <img
                src={profile.photos[selectedPhotoIdx] || profile.photos[0]}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Bouncer Verified
              </div>
            </div>

            {/* Thumbnail Row */}
            {profile.photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {profile.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === selectedPhotoIdx ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${profile.name} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Profile Info & Bouncer Clearance Report */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Header: Name, Age, Location */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {profile.bouncerStatus === 'vip_approved' ? '✨ VIP Single' : '🛡️ Verified Single'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {profile.compatibilityScore}% Compatibility
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                  {profile.name}, <span className="text-amber-400 font-sans">{profile.age}</span>
                </h2>

                <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">{profile.location}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Occupation</div>
                    <div className="font-semibold text-slate-200">{profile.occupation}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Height</div>
                    <div className="font-semibold text-slate-200">{profile.height}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs col-span-2">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Dating Goal</div>
                    <div className="font-semibold text-slate-200">{profile.relationshipGoal}</div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  {profile.bio}
                </p>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Interests & Vibes</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bouncer Verification Audit Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-950 border border-amber-500/30 mb-6">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Bouncer Security Audit Report
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Government ID & Live Facial Scan Matched
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Clean Background & Social Media Vetting
                  </li>
                  <li className="text-slate-400 italic text-[11px] pt-1">
                    "{profile.bouncerNotes}"
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Add To Cart CTA */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onAddToCart(profile)}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isInCart
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-white shadow-rose-950/50'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {isInCart ? 'Remove from Singles Cart' : 'Add Single to Cart'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
