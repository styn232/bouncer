import React, { useState } from 'react';
import { Heart, X, Star, ShieldCheck, Sparkles, Sliders, RefreshCw, MessageSquare, MapPin, CheckCircle, Flame, ShoppingBag } from 'lucide-react';
import { SingleProfile } from '../types';

interface DiscoverDeckProps {
  profiles?: SingleProfile[];
  onSwipe?: (targetProfileId: string, type: 'like' | 'pass' | 'superlike') => Promise<{ success: boolean; isMatch?: boolean }>;
  onLike?: (profile: SingleProfile) => void;
  onPass?: (profile: SingleProfile) => void;
  onSuperLike?: (profile: SingleProfile) => void;
  onAddToCart?: (profile: SingleProfile) => void;
  isInCart?: (profileId: string) => boolean;
  onOpenDetail?: (profile: SingleProfile) => void;
  onSelectProfile?: (profile: SingleProfile) => void;
  onOpenChatWithMatch?: (profile: SingleProfile) => void;
}

export const DiscoverDeck: React.FC<DiscoverDeckProps> = ({
  profiles = [],
  onSwipe,
  onLike,
  onPass,
  onSuperLike,
  onAddToCart,
  isInCart,
  onOpenDetail,
  onSelectProfile,
  onOpenChatWithMatch
}) => {
  const safeProfiles = profiles || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [swipingDirection, setSwipingDirection] = useState<'like' | 'pass' | 'superlike' | null>(null);

  // Filters state
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(50);
  const [selectedGender, setSelectedGender] = useState<'all' | 'female' | 'male'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProfiles = safeProfiles.filter(p => {
    if (p.age < minAge || p.age > maxAge) return false;
    if (selectedGender !== 'all' && p.gender !== selectedGender) return false;
    return true;
  });

  const currentProfile = filteredProfiles[currentIndex] || null;

  const handleAction = async (type: 'like' | 'pass' | 'superlike') => {
    if (!currentProfile) return;
    setSwipingDirection(type);

    if (onSwipe) {
      await onSwipe(currentProfile.id, type);
    }
    if (type === 'like' && onLike) onLike(currentProfile);
    if (type === 'pass' && onPass) onPass(currentProfile);
    if (type === 'superlike' && onSuperLike) onSuperLike(currentProfile);

    setTimeout(() => {
      setSwipingDirection(null);
      setActivePhotoIndex(0);
      setCurrentIndex(prev => prev + 1);
    }, 250);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProfile) return;
    if (activePhotoIndex < currentProfile.photos.length - 1) {
      setActivePhotoIndex(prev => prev + 1);
    } else {
      setActivePhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex > 0) {
      setActivePhotoIndex(prev => prev - 1);
    }
  };

  const handleDetail = (profile: SingleProfile) => {
    if (onOpenDetail) onOpenDetail(profile);
    else if (onSelectProfile) onSelectProfile(profile);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Deck Controls Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-white">
            Deck: {currentIndex + 1} / {filteredProfiles.length}
          </span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
        >
          <Sliders className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Expandable Quick Filters */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-300">Age Range: {minAge} - {maxAge} yrs</span>
            <button
              onClick={() => { setMinAge(18); setMaxAge(50); setSelectedGender('all'); }}
              className="text-slate-500 hover:text-slate-300"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="range"
              min="18"
              max="60"
              value={minAge}
              onChange={e => setMinAge(Number(e.target.value))}
              className="w-1/2 accent-rose-500"
            />
            <input
              type="range"
              min="20"
              max="70"
              value={maxAge}
              onChange={e => setMaxAge(Number(e.target.value))}
              className="w-1/2 accent-rose-500"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'female', 'male'] as const).map(g => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`flex-1 py-1.5 rounded-xl font-bold uppercase ${
                  selectedGender === g ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Swipeable Profile Card */}
      {currentProfile ? (
        <div
          className={`relative h-[560px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transition-transform duration-300 ${
            swipingDirection === 'like' ? 'translate-x-12 rotate-6 opacity-80' : ''
          } ${
            swipingDirection === 'pass' ? '-translate-x-12 -rotate-6 opacity-80' : ''
          } ${
            swipingDirection === 'superlike' ? '-translate-y-12 scale-105 opacity-80' : ''
          }`}
        >
          {/* Photo Carousel */}
          <img
            src={currentProfile.photos[activePhotoIndex] || currentProfile.photos[0]}
            alt={currentProfile.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Photo Navigation Touch Areas */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full cursor-pointer" onClick={handlePrevPhoto} />
            <div className="w-1/2 h-full cursor-pointer" onClick={handleNextPhoto} />
          </div>

          {/* Photo Index Indicators */}
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
            {currentProfile.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i === activePhotoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Top Badges */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 text-[10px] font-extrabold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentProfile.compatibilityScore}% Match</span>
            </div>

            {currentProfile.bouncerVerified && (
              <div className="bg-emerald-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/50 text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bouncer Vetted</span>
              </div>
            )}
          </div>

          {/* Bottom Gradient & Info Container */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3 z-20">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2
                  onClick={() => handleDetail(currentProfile)}
                  className="text-2xl font-black text-white font-serif flex items-center gap-2 cursor-pointer hover:underline"
                >
                  <span>{currentProfile.name}, {currentProfile.age}</span>
                </h2>

                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(currentProfile)}
                    className={`p-2.5 rounded-full border shadow-lg ${
                      isInCart && isInCart(currentProfile.id)
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900/80 text-amber-400 border-amber-400/40 hover:bg-slate-800'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{currentProfile.location}</span>
                <span>•</span>
                <span>💍 Seeking {currentProfile.intent}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              "{currentProfile.bio}"
            </p>

            {/* Interests Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentProfile.interests.slice(0, 3).map((interest, i) => (
                <span
                  key={i}
                  className="bg-slate-900/90 text-slate-300 border border-slate-700/60 text-[10px] px-2.5 py-0.5 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>

            {/* Action Buttons Bar */}
            <div className="flex items-center justify-around pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleAction('pass')}
                className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={() => handleAction('superlike')}
                className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 transition-all font-bold"
              >
                <Star className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={() => handleAction('like')}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all"
              >
                <Heart className="w-7 h-7 fill-current" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[520px] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-amber-400 animate-bounce" />
          <h3 className="text-xl font-extrabold text-white font-serif">You've Swiped All Singles Deck!</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Check back shortly for newly vetted members or reset your age and city filters.
          </p>
          <button
            onClick={() => { setCurrentIndex(0); setMinAge(18); setMaxAge(70); }}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart Deck</span>
          </button>
        </div>
      )}
    </div>
  );
};
