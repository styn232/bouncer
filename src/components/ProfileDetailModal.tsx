import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ShieldCheck, ShoppingBag, X, Sparkles, Heart, CheckCircle2, Lock, Award, MessageCircle, UserCheck, Eye } from 'lucide-react';
import { SingleProfile, User } from '../types';

interface ProfileDetailModalProps {
  profile: SingleProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isInCart?: boolean;
  onAddToCart?: (profile: SingleProfile) => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  isInCart,
  onAddToCart,
  currentUser,
  onOpenAuth
}) => {
  if (!isOpen || !profile) return null;

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // Unlocked check
  const isUnlocked =
    currentUser?.role === 'admin' ||
    currentUser?.purchasedProfileIds?.includes(profile.id) ||
    (currentUser?.subscriptionStatus === 'active' && currentUser?.subscriptionPlan && currentUser?.subscriptionPlan !== 'free') ||
    currentUser?.subscriptionPlan === 'vip_30_singles' ||
    currentUser?.subscriptionPlan === 'starter_10_singles' ||
    currentUser?.subscriptionPlan === 'vip_15_singles' ||
    currentUser?.subscriptionPlan === 'starter_3_or_4';

  // Reviews state
  const [localReviews, setLocalReviews] = useState<any[]>(profile?.reviews || []);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [currentViewsCount, setCurrentViewsCount] = useState<number>(profile?.viewsCount || 0);

  const isOwner = currentUser && (currentUser.id === profile.id || currentUser.email === profile.email);

  React.useEffect(() => {
    if (profile) {
      setLocalReviews(profile.reviews || []);
      setCurrentViewsCount(profile.viewsCount || 0);

      // Increment view count on backend with viewer name notification
      fetch(`/api/profiles/${profile.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerName: currentUser?.name || 'A single member', viewerId: currentUser?.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.viewsCount) {
            setCurrentViewsCount(data.viewsCount);
          }
        })
        .catch(() => {});
    }
  }, [profile?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newRating,
          reviewerName: newReviewerName || 'Single Member',
          comment: newComment
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalReviews(updated.reviews);
        setNewComment('');
        setShowAddReview(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
              <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                {(profile.isNew || (profile.createdAt && (new Date().getTime() - new Date(profile.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000)) && (
                  <div className="bg-gradient-to-r from-rose-600 to-pink-600 border border-rose-300 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>🔥 NEW SINGLE</span>
                  </div>
                )}
                <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Bouncer Verified
                </div>
                {isOwner && (
                  <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>{currentViewsCount} Profile Views</span>
                  </div>
                )}
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

                <h2 className="text-3xl font-extrabold text-white font-serif tracking-tight flex items-center gap-2 flex-wrap">
                  <span>{profile.name}, <span className="text-amber-400 font-sans">{profile.age}</span></span>
                  {profile.bouncerStatus === 'vip_approved' && (
                    <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>VIP</span>
                    </span>
                  )}
                  {profile.bouncerStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md border border-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>Vetted</span>
                    </span>
                  )}
                </h2>

                <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">{profile.location}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Gender</div>
                    <div className="font-semibold text-slate-200 capitalize">{profile.gender}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Children</div>
                    <div className="font-semibold text-slate-200">
                      👶 {profile.childrenCount === 0 ? 'No children' : `${profile.childrenCount} child${profile.childrenCount > 1 ? 'ren' : ''}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Dating Intent</div>
                    <div className="font-semibold text-amber-300">
                      {profile.intent === 'Marriage' ? '💍 Marriage' : '😂 Funny'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Contact Box */}
              {currentUser ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl mb-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Direct WhatsApp Access
                    </span>
                    <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">VETTED SINGLE</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Direct Contact Number:{' '}
                    <strong className="text-emerald-900 font-mono text-sm tracking-wider">
                      {profile.whatsappNumber || '+263 77 123 4567'}
                    </strong>
                  </p>
                  <a
                    href={`https://wa.me/${(profile.whatsappNumber || '263771234567').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(profile.name.split(' ')[0])},%20I%20found%20your%20profile%20on%20Dating%20With%20Bouncer!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Click to Chat on WhatsApp with {profile.name.split(' ')[0]}
                  </a>
                </div>
              ) : (
                <div className="p-5 bg-slate-950 border border-amber-500/40 rounded-2xl mb-6 flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                    <Lock className="w-4 h-4" />
                    <span>Sign Up Required to Select Singles</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You need to sign up or log in to view WhatsApp contact numbers and select singles.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                  >
                    <UserCheck className="w-4 h-4 text-slate-950" />
                    Sign Up to Select Singles & Chat
                  </button>
                </div>
              )}

              {/* Bio Section */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  {profile.bio}
                </p>
              </div>

              {/* Reviews & Star Rating Section */}
              <div className="mb-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>★ Member Reviews & Vibe Check</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    ★ {profile.averageRating ? profile.averageRating.toFixed(1) : '5.0'} / 5.0 ({localReviews.length} reviews)
                  </span>
                </div>

                {/* Existing Reviews List */}
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                  {localReviews.length > 0 ? (
                    localReviews.map((rev) => (
                      <div key={rev.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-200">{rev.reviewerName}</span>
                          <span className="text-amber-400 font-bold">{'★'.repeat(rev.rating)}</span>
                        </div>
                        <p className="text-slate-300 italic">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No reviews written yet. Be the first to leave a vibe check!</p>
                  )}
                </div>

                {/* Write a Review Toggle Form */}
                <div className="pt-2 border-t border-slate-800">
                  {!showAddReview ? (
                    <button
                      onClick={() => setShowAddReview(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      + Write a Review & Vibe Check for {profile.name.split(' ')[0]}
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-2 text-xs mt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Rating:</label>
                        <select
                          value={newRating}
                          onChange={(e) => setNewRating(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value={5}>★★★★★ (5 - Excellent Vibe)</option>
                          <option value={4}>★★★★☆ (4 - Great Date)</option>
                          <option value={3}>★★★☆☆ (3 - Good)</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Your Name (e.g. Tendai M.)"
                        required
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                      />

                      <textarea
                        placeholder="Write a quick comment about meeting or dating this profile..."
                        required
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddReview(false)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
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

            {/* Bottom Direct Contact & Choose Single CTA Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => onAddToCart(profile)}
                  className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                    isInCart
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isInCart ? '✓ Single Chosen' : 'Choose Single'}</span>
                </button>
              )}

              {profile.whatsappNumber ? (
                <a
                  href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(profile.name.split(' ')[0])},%20I%20found%20your%20profile%20on%20Dating%20With%20Bouncer!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Chat on WhatsApp</span>
                </a>
              ) : currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onAddToCart) onAddToCart(profile);
                  }}
                  className="flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Unlock Number via Paynow</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Sign Up to Select</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
