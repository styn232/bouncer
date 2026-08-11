import React from 'react';
import { Heart, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { SingleProfile, User } from '../types';

interface WhoLikedMeProps {
  likers?: SingleProfile[];
  currentUser?: User | null;
  onOpenUpgrade?: () => void;
  onSelectProfile?: (profile: SingleProfile) => void;
}

export const WhoLikedMe: React.FC<WhoLikedMeProps> = ({
  likers = [],
  currentUser,
  onOpenUpgrade,
  onSelectProfile
}) => {
  const safeLikers = likers || [];
  const isVip = currentUser?.subscriptionPlan && currentUser?.subscriptionPlan !== 'free';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-500/40 p-6 sm:p-8 rounded-3xl text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase shadow-md">
          <Sparkles className="w-4 h-4" />
          <span>People Who Liked Your Profile</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
          {safeLikers.length} Singles Secretly Liked You ❤️
        </h2>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Skip the guessing game. See who already swiped right on you and connect directly.
        </p>
      </div>

      {!isVip && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-4">
          <Lock className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Unlock Who Liked You</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            VIP Members can unblur all profile photos, view full bios and match directly without waiting.
          </p>
          <button
            onClick={onOpenUpgrade}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-xs shadow-xl hover:scale-105 transition-all"
          >
            Upgrade to VIP Member →
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {safeLikers.map(liker => (
          <div
            key={liker.id}
            onClick={() => {
              if (isVip && onSelectProfile) onSelectProfile(liker);
              else if (onOpenUpgrade) onOpenUpgrade();
            }}
            className="relative h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group shadow-xl"
          >
            <img
              src={liker.photos[0]}
              alt={liker.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                !isVip ? 'blur-md opacity-60' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {!isVip && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-white space-y-2 z-10">
                <div className="w-10 h-10 rounded-full bg-slate-950/80 border border-amber-400/60 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-xs font-bold">{liker.age} yrs • {liker.location.split(',')[0]}</div>
                <span className="text-[10px] text-amber-300 font-extrabold bg-slate-950/90 px-2.5 py-1 rounded-full border border-amber-400/40">
                  Tap to Unlock
                </span>
              </div>
            )}

            {isVip && (
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-sm font-bold font-serif flex items-center gap-1">
                  <span>{liker.name}, {liker.age}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-300">📍 {liker.location}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
