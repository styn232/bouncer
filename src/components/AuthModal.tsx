import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, User as UserIcon, Lock, Mail, Sparkles, Check, Baby, MapPin } from 'lucide-react';
import { ZIMBABWE_LOCATIONS } from '../data/zimbabweLocations';
import { DatingIntent } from '../types';

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

  const [mode, setMode] = useState<'user_login' | 'user_register' | 'admin_login'>(
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

  // Admin form state
  const [adminKey, setAdminKey] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-locations for selected city
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === city.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : ['CBD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'admin_login') {
        // Admin authentication
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email || 'admin@bouncer.date',
            role: 'admin',
            adminKey
          })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.user);
          onClose();
        } else {
          setErrorMsg('Invalid Admin Credentials or Security Key.');
        }
      } else if (mode === 'user_login') {
        // Standard User Login
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
          setErrorMsg('Failed to log in. Please check your email.');
        }
      } else {
        // User Register
        const fullLocation = `${city} (${subLocation}), Zimbabwe`;
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            age: Number(age),
            gender,
            childrenCount: Number(childrenCount),
            city,
            subLocation,
            location: fullLocation,
            intent
          })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.user);
          onClose();
        } else {
          setErrorMsg('Registration failed. Email may already be in use.');
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
              User Login
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
              Create Account
            </button>
            <button
              onClick={() => {
                setMode('admin_login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                mode === 'admin_login'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-400 hover:bg-rose-950/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>

          {/* Title Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white font-serif">
              {mode === 'admin_login'
                ? '🛡️ Bouncer Admin Security Login'
                : mode === 'user_login'
                ? 'Welcome Back to Dating With Bouncer'
                : 'Join Dating With Bouncer'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'admin_login'
                ? 'Restricted access for managing singles profiles & subscriptions.'
                : 'Sign in or register to configure your profile and add singles to cart.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                      value={email || 'admin@bouncer.date'}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@bouncer.date"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Admin Password / Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Enter admin password (e.g. bouncer2025)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Default demo password: <code className="text-amber-300 font-mono">admin123</code> or <code className="text-amber-300 font-mono">bouncer2025</code>
                  </span>
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
                mode === 'admin_login'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950'
              }`}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : mode === 'admin_login' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Access Admin Backend
                </>
              ) : mode === 'user_login' ? (
                <>
                  <UserIcon className="w-4 h-4" />
                  Sign In to Dating With Bouncer
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
