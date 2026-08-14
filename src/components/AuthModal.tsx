import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, User as UserIcon, Lock, Mail, Sparkles, Check, Baby, MapPin, Upload, Flame, Globe } from 'lucide-react';
import { ZIMBABWE_LOCATIONS } from '../data/zimbabweLocations';
import { DatingIntent } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { 
  auth, 
  db, 
  googleProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  doc, 
  setDoc, 
  getDoc 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  initialMode?: 'user' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'user'
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'user_login' | 'user_register' | 'admin_login' | 'admin_register'>(
    initialMode === 'admin' ? 'admin_login' : 'user_login'
  );

  // User form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('female');
  const [childrenCount, setChildrenCount] = useState(0);
  const [city, setCity] = useState('Harare');
  const [subLocation, setSubLocation] = useState('Borrowdale');
  const [intent, setIntent] = useState<DatingIntent>('Marriage');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800');

  // Admin form state
  const [adminKey, setAdminKey] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-locations for selected city
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === city.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : ['CBD'];

  // Handle Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdminMode = mode === 'admin_login' || mode === 'admin_register';

      // Check or create Firestore document
      let userRole: 'admin' | 'user' = isAdminMode ? 'admin' : 'user';
      if (fbUser.email && (fbUser.email.toLowerCase() === 'admin@bouncer.date' || fbUser.email.toLowerCase() === 'jobsatespace@gmail.com')) {
        userRole = 'admin';
      }

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role === 'admin') userRole = 'admin';
      } else {
        await setDoc(userDocRef, {
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || (userRole === 'admin' ? 'Bouncer Admin' : 'Member'),
          role: userRole,
          avatar: fbUser.photoURL || avatar,
          subscriptionPlan: userRole === 'admin' ? 'vip_15_singles' : 'free',
          bouncerVerified: userRole === 'admin',
          createdAt: new Date().toISOString()
        }, { merge: true });

        if (userRole === 'admin') {
          await setDoc(doc(db, 'admin_accounts', fbUser.uid), {
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || 'Bouncer Admin',
            role: 'admin',
            createdAt: new Date().toISOString()
          }, { merge: true });
        }
      }

      // Sync with Express backend to unlock backend access
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          role: userRole,
          avatar: fbUser.photoURL,
          adminKey: adminKey || 'admin123'
        })
      });

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        onLoginSuccess(syncData.user);
        onClose();
      } else {
        // Fallback local user object
        onLoginSuccess({
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || 'Google User',
          role: userRole,
          avatar: fbUser.photoURL || avatar,
          subscriptionPlan: userRole === 'admin' ? 'vip_15_singles' : 'free',
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
      if (mode === 'admin_register') {
        // 1. Create Admin in Firebase Auth
        let fbUid = `usr_admin_${Date.now()}`;
        const pwdToUse = password || adminKey || 'AdminSecure2025!';

        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, pwdToUse);
          fbUid = userCred.user.uid;
        } catch (authErr: any) {
          // If already exists or in preview offline mode, attempt login or proceed
          if (authErr.code === 'auth/email-already-in-use') {
            try {
              const userCred = await signInWithEmailAndPassword(auth, email, pwdToUse);
              fbUid = userCred.user.uid;
            } catch {
              // Proceed with backend sync
            }
          }
        }

        // 2. Write Admin Record into Firestore
        try {
          await setDoc(doc(db, 'users', fbUid), {
            id: fbUid,
            uid: fbUid,
            email,
            name,
            role: 'admin',
            subscriptionPlan: 'vip_15_singles',
            bouncerVerified: true,
            createdAt: new Date().toISOString()
          }, { merge: true });

          await setDoc(doc(db, 'admin_accounts', fbUid), {
            uid: fbUid,
            email,
            name,
            role: 'admin',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore write warning:', dbErr);
        }

        // 3. Sync with Express backend to unlock backend opening
        const res = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: fbUid,
            name,
            email,
            role: 'admin',
            adminKey: adminKey || 'admin123'
          })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.user);
          onClose();
        } else {
          // Fallback registration endpoint
          const fallbackRes = await fetch('/api/auth/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, adminKey: adminKey || 'admin123' })
          });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            onLoginSuccess(data.user);
            onClose();
          } else {
            const data = await fallbackRes.json();
            setErrorMsg(data.error || 'Failed to create Admin account. Check Security Passcode.');
          }
        }
      } else if (mode === 'admin_login') {
        // Admin authentication with Firebase Auth & Backend
        let fbUid = '';
        const pwdToUse = password || adminKey || 'AdminSecure2025!';

        try {
          const userCred = await signInWithEmailAndPassword(auth, email, pwdToUse);
          fbUid = userCred.user.uid;
        } catch (authErr) {
          // Fallback to server verification
        }

        // Sync with backend to open backend session
        const res = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: fbUid,
            email,
            role: 'admin',
            adminKey: adminKey || 'admin123'
          })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.user);
          onClose();
        } else {
          // Legacy admin login fallback
          const legRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              role: 'admin',
              adminKey
            })
          });

          if (legRes.ok) {
            const data = await legRes.json();
            onLoginSuccess(data.user);
            onClose();
          } else {
            const data = await legRes.json();
            setErrorMsg(data.error || 'Invalid Admin Credentials or Security Passcode.');
          }
        }
      } else if (mode === 'user_login') {
        // Standard User Login with Firebase Auth
        let fbUid = '';
        if (password) {
          try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            fbUid = userCred.user.uid;
          } catch {
            // Proceed to backend check
          }
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'user' })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.user);
          onClose();
        } else {
          const data = await res.json();
          setErrorMsg(data.error || 'Account not found. Please click "Create Account" to sign up first.');
        }
      } else {
        // User Register with Firebase Auth + Firestore
        let fbUid = `usr_${Date.now()}`;
        const pwdToUse = password || 'UserPass2025!';

        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, pwdToUse);
          fbUid = userCred.user.uid;
        } catch {
          // Fallback to server registration
        }

        const fullLocation = `${city} (${subLocation}), Zimbabwe`;

        // Save in Firestore
        try {
          await setDoc(doc(db, 'users', fbUid), {
            id: fbUid,
            uid: fbUid,
            email,
            name,
            age: Number(age),
            gender,
            childrenCount: Number(childrenCount),
            city,
            subLocation,
            location: fullLocation,
            intent,
            whatsappNumber,
            avatar,
            role: 'user',
            subscriptionPlan: 'free',
            bouncerVerified: false,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore user write warning:', dbErr);
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: fbUid,
            email,
            name,
            age: Number(age),
            gender,
            childrenCount: Number(childrenCount),
            city,
            subLocation,
            location: fullLocation,
            intent,
            whatsappNumber,
            avatar
          })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.user);
          onClose();
        } else {
          const data = await res.json();
          setErrorMsg(data.error || 'Registration failed. Email may already be in use.');
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

          {/* Tab Selection Bar */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              onClick={() => {
                setMode('user_login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'user_login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMode('user_register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'user_register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setMode('admin_login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                mode === 'admin_login' || mode === 'admin_register'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff / Admin
            </button>
          </div>

          {/* Title Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white font-serif">
              {mode === 'admin_login'
                ? 'Admin Portal Sign In'
                : mode === 'admin_register'
                ? 'Create Firebase Admin Account'
                : mode === 'user_login'
                ? 'Log In to Dating With Bouncer'
                : 'Sign Up to Dating With Bouncer'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'admin_login' || mode === 'admin_register'
                ? 'Firebase authenticated backend access for administration.'
                : 'Sign up or log in to browse vetted singles and unlock contacts.'}
            </p>

            {/* Sub-toggle for Admin mode */}
            {(mode === 'admin_login' || mode === 'admin_register') && (
              <div className="flex justify-center gap-4 mt-3 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('admin_login')}
                  className={`font-bold hover:underline ${mode === 'admin_login' ? 'text-rose-400 underline' : 'text-slate-400'}`}
                >
                  Admin Sign In
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setMode('admin_register')}
                  className={`font-bold hover:underline ${mode === 'admin_register' ? 'text-rose-400 underline' : 'text-slate-400'}`}
                >
                  Create Admin via Firebase
                </button>
              </div>
            )}
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
              <span>Continue with Firebase Google Sign In</span>
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
            {/* CREATE ADMIN ACCOUNT FIELDS */}
            {mode === 'admin_register' && (
              <>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chief Bouncer Admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@bouncer.date"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Firebase Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure admin password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="admin123 or bouncer2025"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Default development passcode: <code className="text-amber-400">admin123</code></p>
                </div>
              </>
            )}

            {/* ADMIN LOGIN FIELDS */}
            {mode === 'admin_login' && (
              <>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@bouncer.date"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Password / Admin Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={adminKey || password}
                      onChange={(e) => {
                        setAdminKey(e.target.value);
                        setPassword(e.target.value);
                      }}
                      placeholder="Enter password or passcode"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Default development passcode: <code className="text-amber-400">admin123</code></p>
                </div>
              </>
            )}

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
                                setAvatar(compressed);
                              } catch {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setAvatar(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      📍 Zimbabwe City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => {
                        const nextCity = e.target.value;
                        setCity(nextCity);
                        const nextData = ZIMBABWE_LOCATIONS.find((l) => l.city === nextCity);
                        if (nextData && nextData.subLocations.length > 0) {
                          setSubLocation(nextData.subLocations[0]);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {ZIMBABWE_LOCATIONS.map((loc) => (
                        <option key={loc.city} value={loc.city}>
                          {loc.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      🏘️ Sub-location
                    </label>
                    <select
                      value={subLocation}
                      onChange={(e) => setSubLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {availableSubLocations.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
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
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                mode === 'admin_login' || mode === 'admin_register'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950'
              }`}
            >
              {isSubmitting ? (
                <span>Processing with Firebase...</span>
              ) : mode === 'admin_register' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Create Admin via Firebase
                </>
              ) : mode === 'admin_login' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Admin Portal
                </>
              ) : mode === 'user_login' ? (
                <>
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Vetted Singles Account
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
