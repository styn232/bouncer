import React from 'react';
import { Heart, ShieldCheck, Flame, Users, Sparkles, MessageSquare, Video, ArrowRight, UserPlus, Lock } from 'lucide-react';
import { SingleProfile, ReelItem } from '../types';

interface HeroSectionProps {
  profiles?: SingleProfile[];
  reels?: ReelItem[];
  onFindMatch?: () => void;
  onCreateProfile?: () => void;
  onSelectProfile?: (profile: SingleProfile) => void;
  onLikeProfile?: (profile: SingleProfile) => void;
  onOpenReels?: () => void;
  onExploreClick?: () => void;
  onQuizClick?: () => void;
  onVerifyClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profiles = [],
  reels = [],
  onFindMatch,
  onCreateProfile,
  onSelectProfile,
  onLikeProfile,
  onOpenReels,
  onExploreClick,
  onQuizClick,
  onVerifyClick
}) => {
  const safeProfiles = profiles || [];
  const onlineNow = safeProfiles.filter(p => p.isOnline || p.isFeatured).slice(0, 8);
  const trendingSingles = [...safeProfiles].sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0)).slice(0, 4);
  const newMembers = safeProfiles.filter(p => p.isNew || p.viewsCount).slice(0, 4);
  const singlesNearYou = safeProfiles.slice(0, 6);

  const handleExplore = onExploreClick || onFindMatch || (() => {});
  const handleQuiz = onQuizClick || (() => {});
  const handleVerify = onVerifyClick || (() => {});

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-rose-900/40 p-6 sm:p-12 lg:p-16 text-center shadow-2xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>The #1 Verified Modern Dating Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-serif leading-tight">
            Real People. Real Connections. <br />
            <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              Verified Possibilities.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Dating With Bouncer combines high-compatibility AI matching, identity vetting shields, video reels, and VIP lounge access for serious relationships and vibrant dating.
          </p>

          {/* Call To Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleExplore}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span>Explore Singles Deck</span>
            </button>

            <button
              onClick={handleQuiz}
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Take Match Quiz</span>
            </button>

            <button
              onClick={handleVerify}
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-bold text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Get Verified Badge</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto border-t border-slate-800/80">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-white font-serif">100%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Identity Vetted</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-serif">94%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-rose-400 font-serif">15 Min</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Bouncer Clearances</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">VIP</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Private Lounge</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ONLINE NOW LIVE AVATARS */}
      {onlineNow.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Singles Active Right Now ({onlineNow.length})</span>
            </h2>
            <button onClick={handleExplore} className="text-xs text-rose-400 hover:underline font-bold">
              View All Online →
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {onlineNow.map(single => (
              <div
                key={single.id}
                onClick={() => onSelectProfile && onSelectProfile(single)}
                className="flex-shrink-0 group cursor-pointer text-center space-y-1.5"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  <img
                    src={single.photos[0]}
                    alt={single.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl ring-2 ring-rose-500/50 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <div className="text-[11px] font-bold text-slate-200 truncate max-w-[70px]">
                  {single.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. TRENDING POPULAR SINGLES GRID */}
      {trendingSingles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white font-serif flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Trending Singles This Week</span>
              </h2>
              <p className="text-xs text-slate-400">High compatibility matches in Harare and Bulawayo</p>
            </div>
            <button onClick={handleExplore} className="text-xs text-amber-400 hover:underline font-bold">
              See All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trendingSingles.map(single => (
              <div
                key={single.id}
                onClick={() => onSelectProfile && onSelectProfile(single)}
                className="relative h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group cursor-pointer shadow-xl"
              >
                <img
                  src={single.photos[0]}
                  alt={single.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-extrabold text-amber-400 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{single.compatibilityScore}%</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-extrabold text-sm font-serif flex items-center gap-1">
                    <span>{single.name}, {single.age}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">📍 {single.location}</div>
                  <div className="text-[10px] text-rose-300 mt-0.5 font-semibold">💍 Seeking {single.intent}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. REELS PREVIEW CAROUSEL */}
      {reels.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-black text-white font-serif">Bouncer Video Reels</h2>
            </div>
            <button onClick={onOpenReels} className="text-xs text-rose-400 font-bold hover:underline">
              Watch Fullscreen Reels →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {reels.slice(0, 4).map(reel => (
              <div
                key={reel.id}
                onClick={onOpenReels}
                className="relative h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group shadow-md"
              >
                <video
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  muted
                  loop
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="text-xs font-bold truncate">@{reel.authorName}</div>
                  <div className="text-[9px] text-slate-300 truncate">{reel.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
