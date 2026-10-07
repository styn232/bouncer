import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Check, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  HeartPulse, 
  Eye,
  Camera,
  ImageOff
} from 'lucide-react';
import { SingleProfile } from '../types';
import { capitalizeName, formatDisplayName, formatHivStatus, getValidProfilePhotos } from '../utils/format';

interface PhotoGalleryModalProps {
  profile: SingleProfile | null;
  isOpen: boolean;
  onClose: () => void;
  initialPhotoIdx?: number;
  isInCart?: boolean;
  onAddToCart?: (profile: SingleProfile) => void;
  onViewFullProfile?: (profile: SingleProfile) => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  profile,
  isOpen,
  onClose,
  initialPhotoIdx = 0,
  isInCart = false,
  onAddToCart,
  onViewFullProfile
}) => {
  const [activeIdx, setActiveIdx] = useState(initialPhotoIdx);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIdx(initialPhotoIdx);
    }
  }, [isOpen, initialPhotoIdx, profile?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !profile) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, profile, activeIdx]);

  if (!isOpen || !profile) return null;

  const photos = getValidProfilePhotos(profile.photos);

  const nextPhoto = () => {
    if (photos.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (photos.length === 0) return;
    setActiveIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped left
      nextPhoto();
    } else if (diff < -45) {
      // Swiped right
      prevPhoto();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const displayName = formatDisplayName(profile.name, 22);

  return (
    <AnimatePresence>
      <div 
        id="photo-gallery-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          id="photo-gallery-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl h-[95vh] max-h-[850px] bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate font-serif">
                    {displayName}, <span className="text-rose-400 font-sans">{profile.age}</span>
                  </h3>
                  {profile.bouncerStatus === 'vip_approved' && (
                    <span className="w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center" title="VIP">
                      <Sparkles className="w-3 h-3 fill-current" />
                    </span>
                  )}
                  {(profile.bouncerStatus === 'verified' || profile.bouncerVerified || profile.emailVerified) && (
                    <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center" title="Verified">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </span>
                  )}
                  {profile.hivStatus && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${
                      formatHivStatus(profile.hivStatus) === 'HIV-'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      <HeartPulse className="w-2.5 h-2.5 text-rose-400" />
                      {formatHivStatus(profile.hivStatus)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    {profile.city || profile.location}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-300 font-bold">
                    Photo {activeIdx + 1} of {photos.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="close-gallery-btn"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close photo gallery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Viewport */}
          <div 
            className="relative flex-1 bg-black flex items-center justify-center overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {photos.length > 0 ? (
              <img
                src={photos[activeIdx] || photos[0]}
                alt={`${profile.name} photo ${activeIdx + 1}`}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain select-none transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mb-3">
                  <ImageOff className="w-12 h-12" />
                </div>
                <div className="text-lg font-extrabold text-white uppercase tracking-wider">No Picture Uploaded</div>
                <p className="text-xs text-slate-400 mt-1">This single has not uploaded a profile photo yet.</p>
              </div>
            )}

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  id="gallery-prev-btn"
                  onClick={prevPhoto}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 z-20 shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  id="gallery-next-btn"
                  onClick={nextPhoto}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 z-20 shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Mobile Swipe Tip Overlay */}
            {photos.length > 1 && (
              <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-[10px] text-slate-300 px-3 py-1 rounded-full border border-white/10 pointer-events-none">
                Swipe left / right to view photos
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {photos.length > 1 && (
            <div className="p-2 sm:p-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-center gap-2 overflow-x-auto shrink-0">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    i === activeIdx 
                      ? 'border-rose-500 scale-105 shadow-md shadow-rose-500/20' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {i === activeIdx && (
                    <div className="absolute inset-0 bg-rose-500/10 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Action Footer: Choose Single and View Full Bio */}
          <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <span>Intent: <strong className="text-white">{profile.intent}</strong></span>
              <span>•</span>
              <span>Children: <strong className="text-white">{profile.childrenCount === 0 ? 'None' : profile.childrenCount}</strong></span>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              {onViewFullProfile && (
                <button
                  id="gallery-view-bio-btn"
                  onClick={() => {
                    onClose();
                    onViewFullProfile(profile);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Full Profile & Bio</span>
                </button>
              )}

              {onAddToCart && (
                <button
                  id="gallery-choose-single-btn"
                  onClick={() => onAddToCart(profile)}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                    isInCart
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:brightness-110 text-white shadow-rose-900/30'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>✓ Single Chosen</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Choose Single</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
