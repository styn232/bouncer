import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, Check, Trash2, X, Sparkles, AlertCircle, ShieldCheck, ShoppingBag, UserCheck, Users } from 'lucide-react';
import { NotificationItem, SingleProfile, User } from '../types';
import { isPushNotificationSupported, requestPushPermission, getPushPermission, isPushAlertsEnabled, setPushAlertsEnabled, playRomanticChime, triggerBrowserPushNotification, formatGenderTargetedNotification } from '../utils/pushNotification';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onViewProfile?: (profileId: string) => void;
  onSimulateTestPush?: (gender?: 'male' | 'female') => void;
  profiles?: SingleProfile[];
  currentUser?: User | null;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
  onViewProfile,
  onSimulateTestPush,
  profiles = [],
  currentUser
}) => {
  const [pushState, setPushState] = useState(getPushPermission());
  const [alertsEnabled, setAlertsEnabled] = useState(isPushAlertsEnabled());
  const [testSentGender, setTestSentGender] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (pushState !== 'granted') {
      const result = await requestPushPermission();
      setPushState(result);
      if (result === 'granted') {
        setAlertsEnabled(true);
        playRomanticChime();
        triggerBrowserPushNotification(
          '❤️ Dating With Bouncer Alerts Active',
          'Browser alerts enabled! You will receive instant notifications when new singles join in Zimbabwe.'
        );
      }
    } else {
      const next = !alertsEnabled;
      setPushAlertsEnabled(next);
      setAlertsEnabled(next);
      if (next) {
        playRomanticChime();
      }
    }
  };

  const handleTestNotification = async (gender: 'male' | 'female') => {
    setTestSentGender(gender);
    playRomanticChime();

    const isMale = gender === 'male';
    const sample = profiles.find(p => p.gender === gender) || {
      age: isMale ? 28 : 24,
      city: 'Harare',
      location: 'Harare, Zimbabwe',
      photos: [isMale ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400']
    };

    const notifInfo = formatGenderTargetedNotification({
      age: sample.age || 25,
      city: sample.city || 'Harare',
      location: sample.location || 'Harare',
      gender
    });

    await triggerBrowserPushNotification(notifInfo.title, notifInfo.message, {
      icon: (sample as any).photos?.[0]
    });

    if (onSimulateTestPush) {
      onSimulateTestPush(gender);
    }

    setTimeout(() => setTestSentGender(null), 2500);
  };

  // Filter based on user's gender if not admin
  const userGender = currentUser?.gender?.toLowerCase();
  const isAdmin = currentUser?.role === 'admin';

  const visibleNotifs = notifications.filter(n => {
    if (isAdmin) return true;
    if (n.userId && n.userId !== 'all' && currentUser?.id) {
      return n.userId === currentUser.id;
    }
    if (userGender === 'male') {
      if (n.gender && n.gender.toLowerCase() === 'male') return false;
      if (n.targetGender && n.targetGender !== 'all' && n.targetGender !== 'male') return false;
    } else if (userGender === 'female') {
      if (n.gender && n.gender.toLowerCase() === 'female') return false;
      if (n.targetGender && n.targetGender !== 'all' && n.targetGender !== 'female') return false;
    }
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-gradient-to-b from-[#1c0816] via-[#140510] to-[#0c0309] border border-rose-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-rose-900/40 bg-gradient-to-r from-rose-950/40 via-pink-950/20 to-purple-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-950/50">
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-serif tracking-tight flex items-center gap-1.5">
                  <span>Match & Singles Alerts</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] sm:text-[11px] text-rose-200/70 font-medium">
                  {currentUser ? (
                    userGender === 'female'
                      ? 'Gentleman signups delivered to you'
                      : userGender === 'male'
                      ? 'Lady signups delivered to you'
                      : 'Instant push updates when singles register'
                  ) : (
                    'Instant push updates when singles register in Zimbabwe'
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-rose-950/60 hover:bg-rose-900 text-rose-200 flex items-center justify-center transition-colors text-xs"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Browser Notification Controls & Rule Banner */}
          <div className="p-3 bg-gradient-to-r from-rose-900/20 via-pink-900/10 to-rose-950/30 border-b border-rose-900/30 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-black/40 border border-rose-500/20 rounded-xl p-2.5 sm:p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Browser Notification</span>
                    {pushState === 'granted' && alertsEnabled ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                        Active on Browser
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-500/30">
                        Browser Permission Needed
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-rose-200/60 leading-tight">
                    Pop-up notifications appear directly on your browser & device
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleTogglePush}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all shadow-xs flex items-center gap-1 ${
                    pushState === 'granted' && alertsEnabled
                      ? 'bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40'
                      : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white'
                  }`}
                >
                  {pushState === 'granted' && alertsEnabled ? 'Disable' : 'Enable on Browser'}
                </button>
              </div>
            </div>

            {/* Gender Dispatch Rules Info & Instant Testing */}
            <div className="bg-rose-950/30 border border-rose-500/15 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-rose-200">
                <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong className="text-white">Smart Match Routing: </strong>
                  Males registered → sent to females • Females registered → sent to males
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTestNotification('male')}
                  disabled={testSentGender === 'male'}
                  className="px-2 py-1 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 text-sky-200 rounded-md font-bold text-[10px] transition-all flex items-center gap-1"
                >
                  <span>{testSentGender === 'male' ? '✓ Sent!' : '⚡ Test Male → Females'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestNotification('female')}
                  disabled={testSentGender === 'female'}
                  className="px-2 py-1 bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/40 text-pink-200 rounded-md font-bold text-[10px] transition-all flex items-center gap-1"
                >
                  <span>{testSentGender === 'female' ? '✓ Sent!' : '⚡ Test Female → Males'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List - Compact Size */}
          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {visibleNotifs.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-10 h-10 rounded-full bg-rose-900/30 text-rose-400 flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">No New Notifications</h4>
                <p className="text-[11px] text-rose-200/60 max-w-xs mx-auto mb-3">
                  Whenever a new verified single signs up in Zimbabwe, you will receive a browser pop-up and alert here.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestNotification('male')}
                    className="px-3 py-1.5 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400/40 text-sky-200 font-bold text-[11px] rounded-lg transition-all"
                  >
                    Simulate Male Signup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestNotification('female')}
                    className="px-3 py-1.5 bg-pink-600/30 hover:bg-pink-600/50 border border-pink-400/40 text-pink-200 font-bold text-[11px] rounded-lg transition-all"
                  >
                    Simulate Female Signup
                  </button>
                </div>
              </div>
            ) : (
              visibleNotifs.map(notif => {
                const isNewSingle = notif.title.toLowerCase().includes('single') ||
                                    notif.title.toLowerCase().includes('gentleman') ||
                                    notif.title.toLowerCase().includes('lady');

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      if (notif.profileId && onViewProfile) {
                        onViewProfile(notif.profileId);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      !notif.read
                        ? 'bg-gradient-to-r from-rose-950/60 via-[#220919]/60 to-pink-950/40 border-rose-500/40 shadow-sm'
                        : 'bg-black/30 border-rose-900/20 text-slate-300'
                    }`}
                  >
                    {/* Compact Avatar or Icon */}
                    {notif.photo ? (
                      <img
                        src={notif.photo}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-rose-500"
                      />
                    ) : (
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isNewSingle
                            ? 'bg-rose-500/20 text-rose-400'
                            : notif.type === 'match'
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isNewSingle ? (
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        ) : notif.type === 'match' ? (
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <h5 className="font-bold text-xs text-white truncate">
                            {notif.title}
                          </h5>
                          {notif.targetGender && notif.targetGender !== 'all' && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm shrink-0 ${
                              notif.targetGender === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-sky-500/20 text-sky-300'
                            }`}>
                              To: {notif.targetGender === 'female' ? 'Females' : 'Males'}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-rose-200/50 font-mono shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-100/80 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-sm" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {visibleNotifs.length > 0 && (
            <div className="p-2.5 sm:p-3 border-t border-rose-900/30 bg-black/40 flex items-center justify-between">
              <span className="text-[10px] text-rose-200/60 font-medium">
                {visibleNotifs.filter(n => !n.read).length} unread alerts
              </span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-[10px] text-rose-300 hover:text-rose-100 flex items-center gap-1 font-bold transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
