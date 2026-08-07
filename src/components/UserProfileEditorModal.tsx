import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, ShieldCheck, Camera, Sparkles, X, Check, Heart, MapPin, Briefcase, Baby } from 'lucide-react';
import { User, DatingIntent } from '../types';
import { ZIMBABWE_LOCATIONS } from '../data/zimbabweLocations';

interface UserProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveProfile: (updatedData: Partial<User>) => void;
  onApplyBouncerBadge: () => void;
}

export const UserProfileEditorModal: React.FC<UserProfileEditorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  onApplyBouncerBadge
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name || '');
  const [age, setAge] = useState(currentUser.age || 25);
  const [city, setCity] = useState(currentUser.city || 'Harare');
  const [subLocation, setSubLocation] = useState(currentUser.subLocation || 'Borrowdale');
  const [childrenCount, setChildrenCount] = useState<number>(currentUser.childrenCount ?? 0);
  const [intent, setIntent] = useState<DatingIntent>(currentUser.intent || 'Marriage');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber || '+263 77 123 4567');
  const [gender, setGender] = useState(currentUser.gender || 'female');
  const [seeking, setSeeking] = useState(currentUser.seeking || 'male');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [interestsText, setInterestsText] = useState((currentUser.interests || []).join(', '));

  const [isSaved, setIsSaved] = useState(false);

  // Available sub-locations for chosen city
  const activeCityData = ZIMBABWE_LOCATIONS.find(l => l.city.toLowerCase() === city.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : ['CBD'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interests = interestsText.split(',').map(i => i.trim()).filter(Boolean);
    const fullLocation = `${city} (${subLocation}), Zimbabwe`;
    onSaveProfile({
      name,
      age: Number(age),
      city,
      subLocation,
      location: fullLocation,
      childrenCount: Number(childrenCount),
      intent,
      bio,
      whatsappNumber,
      gender: gender as any,
      seeking: seeking as any,
      avatar,
      interests
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
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

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <img
              src={avatar || currentUser.avatar}
              alt={name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
            />
            <div>
              <h2 className="text-2xl font-bold text-white font-serif">
                Manage My Dating Profile
              </h2>
              <p className="text-xs text-slate-400">
                Update your Age, Gender, Number of Children, Zimbabwe Location & Intent.
              </p>
            </div>
          </div>

          {/* Bouncer Verification Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Bouncer Verification Status
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentUser.bouncerVerified
                    ? '✅ Your profile is Bouncer Verified! Gold Badge active.'
                    : '⏳ Unverified single. Request Bouncer clearance for Gold Badge status.'}
                </div>
              </div>
            </div>

            {!currentUser.bouncerVerified && (
              <button
                onClick={onApplyBouncerBadge}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
              >
                Apply for Badge
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={99}
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Gender Choice */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Choose Gender
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              {/* Number of Children */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  👶 Number of Children
                </label>
                <select
                  value={childrenCount}
                  onChange={e => setChildrenCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={0}>0 (No children)</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                  <option value={3}>3+ Children</option>
                </select>
              </div>

              {/* Zimbabwe City */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  📍 Zimbabwe City
                </label>
                <select
                  value={city}
                  onChange={e => {
                    const nextCity = e.target.value;
                    setCity(nextCity);
                    const nextData = ZIMBABWE_LOCATIONS.find(l => l.city === nextCity);
                    if (nextData && nextData.subLocations.length > 0) {
                      setSubLocation(nextData.subLocations[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  {ZIMBABWE_LOCATIONS.map(loc => (
                    <option key={loc.city} value={loc.city}>
                      {loc.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-location / Suburb */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  🏘️ Sub-location / Suburb
                </label>
                <select
                  value={subLocation}
                  onChange={e => setSubLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  {availableSubLocations.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dating Intent: Marriage or Funny */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  💍 Dating Intent
                </label>
                <select
                  value={intent}
                  onChange={e => setIntent(e.target.value as DatingIntent)}
                  className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="Marriage">💍 Seeking Marriage</option>
                  <option value="Funny">😂 Funny & Good Vibe</option>
                </select>
              </div>

              {/* WhatsApp Contact Number */}
              <div>
                <label className="block font-bold text-amber-400 uppercase tracking-wider mb-1">
                  📱 WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="+263 77 123 4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                  Displayed to matches ONLY after they complete payment.
                </span>
              </div>

            </div>

            {/* Avatar URL */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bio & Dating Vibe
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share your hobbies, what you appreciate in a partner..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Interests (Comma Separated)
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                placeholder="Coffee, Safari, Music, Cooking"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {isSaved ? 'Profile Saved!' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
