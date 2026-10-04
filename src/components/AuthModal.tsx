import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, User as UserIcon, Lock, Mail, Sparkles, Check, Baby, MapPin, Upload, Flame, Globe, HeartPulse, Building2, Landmark } from 'lucide-react';
import { ZIMBABWE_PROVINCES, ZIMBABWE_LOCATIONS, getCitiesByProvince, getSubLocationsForCity, getProvinceForCity } from '../data/zimbabweLocations';
import { DatingIntent } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { capitalizeName } from '../utils/format';
import { 
  auth, 
  db, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  doc, 
  setDoc, 
  getDoc 
} from '../lib/firebase';

export type AuthModalMode = 'user' | 'admin' | 'user_login' | 'user_register' | 'admin_login';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  initialMode?: AuthModalMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'user_login'
}) => {
  const resolveMode = (m: AuthModalMode): 'user_login' | 'user_register' => {
    if (m === 'user_register') return 'user_register';
    return 'user_login';
  };

  const [mode, setMode] = useState<'user_login' | 'user_register'>(
    resolveMode(initialMode)
  );

  useEffect(() => {
    if (isOpen) {
      setMode(resolveMode(initialMode));
      setErrorMsg('');
    }
  }, [isOpen, initialMode]);

  // User form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('female');
  const [childrenCount, setChildrenCount] = useState(0);
  const [province, setProvince] = useState<string>('Harare Metropolitan');
  const [city, setCity] = useState('Harare');
  const [subLocation, setSubLocation] = useState('Borrowdale');
  const [intent, setIntent] = useState<DatingIntent>('Marriage');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hivStatus, setHivStatus] = useState<'HIV-' | 'HIV+'>('HIV-');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available cities in chosen province
  const availableCities = getCitiesByProvince(province);

  // Sub-locations for selected city
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === city.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : ['CBD'];

  // Handle Province Change
  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const citiesInProv = getCitiesByProvince(newProv);
    if (citiesInProv.length > 0) {
      const firstCity = citiesInProv[0];
      setCity(firstCity.city);
      setSubLocation(firstCity.subLocations.length > 0 ? firstCity.subLocations[0] : 'Central');
    }
  };

  // Handle City Change
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const autoProv = getProvinceForCity(newCity);
    if (autoProv) setProvince(autoProv);
    const cityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === newCity.toLowerCase());
    if (cityData && cityData.subLocations.length > 0) {
      setSubLocation(cityData.subLocations[0]);
    }
  };

  if (!isOpen) return null;

  // Helper to prevent Firebase/Firestore promises from hanging indefinitely
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), ms)
      )
    ]);
  };

  // Handle Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (!auth) {
        throw new Error('Authentication is currently initializing, please try again.');
      }
      if (typeof GoogleAuthProvider !== 'function') {
        throw new Error('Google Sign-In is unavailable in this environment.');
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const normalizedFbEmail = (fbUser.email || '').toLowerCase().trim();
      const isSuperAdminEmail = normalizedFbEmail === 'jobsatespace@gmail.com' || normalizedFbEmail === 'admin@bouncer.date';
      let userRole: 'admin' | 'featured' | 'user' = isSuperAdminEmail ? 'admin' : 'user';

      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await withTimeout(getDoc(userDocRef), 1500);

          if (userSnap.exists()) {
            const existingData = userSnap.data();
            if (existingData?.role === 'admin' || isSuperAdminEmail) {
              userRole = 'admin';
            } else if (existingData?.role === 'featured') {
              userRole = 'featured';
            }
          } else {
            // Non-blocking Firestore write so UI never hangs
            setDoc(userDocRef, {
              id: fbUser.uid,
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || (userRole === 'admin' ? 'Super Admin' : 'Member'),
              role: userRole,
              avatar: fbUser.photoURL || avatar,
              hivStatus: 'HIV-',
              subscriptionPlan: userRole === 'admin' ? 'vip_30_singles' : 'free',
              bouncerVerified: userRole === 'admin',
              createdAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          }
        } catch (dbErr) {
          console.warn('Firestore user profile sync warning:', dbErr);
        }
      }

      // Sync with Express backend
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          role: userRole,
          avatar: fbUser.photoURL
        })
      });

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        onLoginSuccess(syncData.user);
        onClose();
      } else {
        onLoginSuccess({
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || 'Google User',
          role: userRole,
          avatar: fbUser.photoURL || avatar,
          subscriptionPlan: userRole === 'admin' ? 'vip_30_singles' : 'free',
          bouncerVerified: userRole === 'admin'
        });
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Google sign-in error:', err);
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'user_login') {
        // 1. Check backend immediately for fast Sign In (works for Super Admin, Admins, Featured, and Registered Users)
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });

        if (res.ok) {
          const data = await res.json();
          if (password && auth) {
            signInWithEmailAndPassword(auth, email.trim(), password).catch(() => {});
          }
          onLoginSuccess(data.user);
          onClose();
          return;
        }

        // 2. Fallback: Check Firebase Auth with a short timeout in case user only exists in Firebase
        let fbUid = '';
        let fbDisplayName = '';
        if (password && auth) {
          try {
            const userCred = await withTimeout(
              signInWithEmailAndPassword(auth, email.trim(), password),
              2500
            );
            fbUid = userCred.user.uid;
            fbDisplayName = userCred.user.displayName || '';
          } catch {
            // Proceed to error message
          }
        }

        if (fbUid) {
          const syncRes = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: fbUid,
              email: email.trim(),
              name: fbDisplayName || email.trim().split('@')[0]
            })
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            onLoginSuccess(syncData.user);
            onClose();
            return;
          }
        }

        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'Account not found. Please click "Sign Up" to create an account first.');
      } else {
        // Instant User Registration via Backend + Non-blocking background Firebase/Firestore sync
        const cleanEmail = email.trim();
        const formattedName = capitalizeName(name.trim() || cleanEmail.split('@')[0]);
        const fullLocation = `${city} (${subLocation}), ${province}, Zimbabwe`;
        const generatedId = `usr_${Date.now()}`;

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: generatedId,
            email: cleanEmail,
            name: formattedName,
            age: Number(age),
            gender,
            childrenCount: Number(childrenCount),
            province,
            city,
            subLocation,
            location: fullLocation,
            intent,
            hivStatus,
            whatsappNumber: whatsappNumber.trim(),
            avatar
          })
        });

        if (res.ok) {
          const data = await res.json();
          const createdUser = data.user;

          // Non-blocking background sync with Firebase Auth & Firestore so Sign Up finishes immediately
          const pwdToUse = password && password.length >= 6 ? password : `${password || 'Pass'}2025!`;
          (async () => {
            try {
              let fbUid = createdUser?.id || generatedId;
              if (auth) {
                try {
                  const userCred = await withTimeout(
                    createUserWithEmailAndPassword(auth, cleanEmail, pwdToUse),
                    3000
                  );
                  fbUid = userCred.user.uid;
                } catch {
                  // Ignore if already exists or Firebase email auth is unavailable
                }
              }
              if (db) {
                await withTimeout(
                  setDoc(doc(db, 'users', fbUid), {
                    id: fbUid,
                    uid: fbUid,
                    email: cleanEmail,
                    name: formattedName,
                    age: Number(age),
                    gender,
                    childrenCount: Number(childrenCount),
                    province,
                    city,
                    subLocation,
                    location: fullLocation,
                    intent,
                    hivStatus,
                    whatsappNumber: whatsappNumber.trim(),
                    avatar,
                    role: createdUser?.role || 'user',
                    subscriptionPlan: createdUser?.subscriptionPlan || 'free',
                    bouncerVerified: Boolean(createdUser?.bouncerVerified),
                    createdAt: new Date().toISOString()
                  }, { merge: true }),
                  2500
                );
              }
            } catch {
              // Silent background sync catch
            }
          })();

          onLoginSuccess(createdUser);
          onClose();
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMsg(data.error || 'Registration failed. Please check your details and try again.');
        }
      }
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tab Selection Bar: Sign In & Sign Up Only */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              onClick={() => {
                setMode('user_login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'user_login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('user_register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'user_register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Title Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white font-serif">
              {mode === 'user_login' ? 'Welcome — Sign In' : 'Welcome — Sign Up'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'user_login'
                ? 'Sign in to your account or switch to Sign Up to register as a new member.'
                : 'Create your single profile to browse vetted singles and unlock contacts.'}
            </p>
          </div>

          {/* Quick Firebase Google Auth Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Sign In</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Or with Email</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* USER LOGIN FIELDS */}
            {mode === 'user_login' && (
              <>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* USER REGISTER FIELDS */}
            {mode === 'user_register' && (
              <>
                {/* Profile Photo File Upload */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <label className="block font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                    📸 Upload Profile Photo (File Upload from Device)
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/50 shrink-0"
                    />
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors w-full shadow-md">
                        <Upload className="w-3.5 h-3.5 text-slate-950" />
                        Choose Photo File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImageFile(file, 1000, 0.82);
                                if (compressed) setAvatar(compressed);
                              } catch (err) {
                                console.warn('Avatar upload note:', err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tendai Moyo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={99}
                      required
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tendai@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-amber-400 uppercase tracking-wider mb-1">
                    📱 WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      👶 Number of Children
                    </label>
                    <select
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>0 (No children)</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                      <option value={3}>3+ Children</option>
                    </select>
                  </div>
                </div>

                {/* 3-Tier Zimbabwe Location Selector */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      Zimbabwe Location
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {province}
                    </span>
                  </div>

                  {/* 1. Province */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      🏛️ 1. Province (10 Provinces)
                    </label>
                    <select
                      value={province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      {ZIMBABWE_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} ({p.citiesCount} urban centres)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. City & 3. Suburb in 2 Columns */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        📍 2. City / Town
                      </label>
                      <select
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
                      >
                        {availableCities.map((loc) => (
                          <option key={loc.city} value={loc.city}>
                            {loc.city} ({loc.type || 'Town'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        🏘️ 3. Suburb / Area
                      </label>
                      <select
                        value={subLocation}
                        onChange={(e) => setSubLocation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
                      >
                        {availableSubLocations.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    💍 Dating Intent
                  </label>
                  <select
                    value={intent}
                    onChange={(e) => setIntent(e.target.value as DatingIntent)}
                    className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Marriage">💍 Seeking Marriage</option>
                    <option value="Funny">😂 Funny & Good Vibe</option>
                  </select>
                </div>

                {/* HIV STATUS SELECTION ON SIGN UP */}
                <div className="bg-slate-950/90 border border-rose-900/40 rounded-2xl p-3.5 space-y-2">
                  <label className="block font-bold text-rose-200 uppercase tracking-wider text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-400" />
                      <span>HIV Status</span>
                      <span className="text-rose-500 font-black">*</span>
                    </span>
                    <span className="text-[10px] text-rose-300/70 font-normal">Choose HIV+ or HIV-</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setHivStatus('HIV-')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        hivStatus === 'HIV-'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                      <span>HIV-</span>
                      <span className="text-[10px] opacity-75 font-normal">(Negative)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHivStatus('HIV+')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        hivStatus === 'HIV+'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-2 ring-purple-500/40 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-400/30" />
                      <span>HIV+</span>
                      <span className="text-[10px] opacity-75 font-normal">(Positive)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Check className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Honest HIV disclosure fosters safe, genuine dating on Dating with Bouncer.</span>
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : mode === 'user_login' ? (
                <>
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Sign Up & Create Single Profile
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
