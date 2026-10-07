import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, Trash2, X, Sparkles } from 'lucide-react';
import { NotificationItem, SingleProfile, User } from '../types';
import { getNotificationDedupeKeys } from '../utils/pushNotification';

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
  profiles = [],
  currentUser
}) => {
  if (!isOpen) return null;

  // Strictly show ONLY notifications belonging to the currently logged-in user
  const seenModalKeys = new Set<string>();
  const myOwnedProfileIds = new Set<string>(
    currentUser
      ? profiles
          .filter(
            p =>
              p.id === currentUser.id ||
              p.id === `p_${currentUser.id}` ||
              (currentUser.name && p.name && p.name.toLowerCase() === currentUser.name.toLowerCase())
          )
          .map(p => p.id)
      : []
  );

  const visibleNotifs = currentUser
    ? notifications.filter(n => {
        if (!n || !n.userId || n.userId === 'all' || n.userId === 'usr_guest') return false;
        const isMine = n.userId === currentUser.id || myOwnedProfileIds.has(n.userId);
        if (!isMine) return false;

        const keys = getNotificationDedupeKeys(n);
        if (keys.some(k => seenModalKeys.has(k))) return false;
        keys.forEach(k => seenModalKeys.add(k));
        return true;
      })
    : [];

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
                  <span>My Notifications</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] sm:text-[11px] text-rose-200/70 font-medium">
                  {currentUser
                    ? `Personal account updates for ${currentUser.name}`
                    : 'Sign in to view your personal notifications'}
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

          {/* Personal Notifications List */}
          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {!currentUser ? (
              <div className="text-center py-8 px-4">
                <div className="w-10 h-10 rounded-full bg-rose-900/30 text-rose-400 flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Sign In Required</h4>
                <p className="text-[11px] text-rose-200/60 max-w-xs mx-auto">
                  Notifications are private and customized for each user. Please sign in to view your personal alerts.
                </p>
              </div>
            ) : visibleNotifs.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-10 h-10 rounded-full bg-rose-900/30 text-rose-400 flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">No New Notifications</h4>
                <p className="text-[11px] text-rose-200/60 max-w-xs mx-auto">
                  Your personal notifications (profile views, matches, payments, and affiliate updates) will appear here.
                </p>
              </div>
            ) : (
              visibleNotifs.map(notif => {
                const isMatch = notif.type === 'match' || notif.title.toLowerCase().includes('match');

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
                    {notif.photo ? (
                      <img
                        src={notif.photo}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-rose-500"
                      />
                    ) : (
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isMatch
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isMatch ? (
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-white truncate">
                          {notif.title}
                        </h5>
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
                {visibleNotifs.filter(n => !n.read).length} unread
              </span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-[10px] text-rose-300 hover:text-rose-100 flex items-center gap-1 font-bold transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear My Notifications</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
