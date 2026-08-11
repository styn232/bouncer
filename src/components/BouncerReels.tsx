import React, { useState } from 'react';
import { Heart, MessageSquare, Plus, Video, Volume2, VolumeX, ShieldCheck, Send, X, AlertTriangle } from 'lucide-react';
import { ReelItem, User } from '../types';

interface BouncerReelsProps {
  reels?: ReelItem[];
  currentUser?: User | null;
  onLikeReel?: (reelId: string) => void;
  onCreateReel?: (videoUrl: string, caption: string) => void;
  onCommentReel?: (reelId: string) => void;
  onReportReel?: (reelId: string, author: string) => void;
}

export const BouncerReels: React.FC<BouncerReelsProps> = ({
  reels = [],
  currentUser,
  onLikeReel,
  onCreateReel,
  onCommentReel,
  onReportReel
}) => {
  const safeReels = reels || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);

  const currentReel = safeReels[activeIndex] || null;

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput) return;
    if (onCreateReel) onCreateReel(videoUrlInput, captionInput);
    setVideoUrlInput('');
    setCaptionInput('');
    setShowUploadModal(false);
  };

  if (safeReels.length === 0) {
    return (
      <div className="h-[600px] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4 text-slate-400">
        <Video className="w-12 h-12 text-rose-500" />
        <h3 className="text-lg font-bold text-white">No Video Reels Available</h3>
        <p className="text-xs">Be the first single to post a video reel on Dating With Bouncer!</p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs rounded-2xl shadow-lg"
        >
          Post Reel
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[680px] w-full max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Background Video */}
      {currentReel && (
        <video
          src={currentReel.videoUrl}
          poster={currentReel.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Top Header Overlay */}
      <div className="relative z-10 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-black text-white font-serif uppercase tracking-wider">
            Bouncer Reels
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-slate-900/80 text-white border border-slate-700/80"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="p-2 rounded-full bg-rose-600 text-white shadow-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Sidebar Overlay (Likes, Comments, Report) */}
      {currentReel && (
        <div className="relative z-10 p-4 self-end flex flex-col items-center gap-5 text-white">
          <button
            onClick={() => onLikeReel && onLikeReel(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-950/80 border border-rose-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
            </div>
            <span className="text-[10px] font-bold">{currentReel.likesCount || 0}</span>
          </button>

          <button
            onClick={() => {
              if (onCommentReel) onCommentReel(currentReel.id);
              else setShowCommentsDrawer(true);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <MessageSquare className="w-5 h-5 text-slate-200" />
            </div>
            <span className="text-[10px] font-bold">{currentReel.commentsCount || 0}</span>
          </button>

          {onReportReel && (
            <button
              onClick={() => onReportReel(currentReel.id, currentReel.authorName)}
              className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100"
            >
              <div className="w-9 h-9 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Bottom Information Overlay */}
      {currentReel && (
        <div className="relative z-10 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={currentReel.authorAvatar}
              alt={currentReel.authorName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500"
            />
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1">
                <span>@{currentReel.authorName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <span className="text-[10px] text-slate-400">Verified Single • Harare</span>
            </div>
          </div>

          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {currentReel.caption}
          </p>

          {/* Up & Down Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
              className="text-xs font-bold text-slate-400 disabled:opacity-30 hover:text-white"
            >
              ↑ Previous Reel
            </button>

            <span className="text-[10px] text-slate-500">
              {activeIndex + 1} / {safeReels.length}
            </span>

            <button
              disabled={activeIndex === safeReels.length - 1}
              onClick={() => setActiveIndex(prev => Math.min(safeReels.length - 1, prev + 1))}
              className="text-xs font-bold text-rose-400 disabled:opacity-30 hover:underline"
            >
              Next Reel ↓
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Post Bouncer Reel</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Video MP4 URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://assets.mixkit.co/videos/..."
                  value={videoUrlInput}
                  onChange={e => setVideoUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Caption / Vibe</label>
                <textarea
                  rows={2}
                  placeholder="Tell singles what you're up to today..."
                  value={captionInput}
                  onChange={e => setCaptionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold"
              >
                Publish Video Reel 🎬
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
