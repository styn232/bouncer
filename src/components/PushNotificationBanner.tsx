import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, Sparkles, X } from 'lucide-react';
import { isPushNotificationSupported, getPushPermission, requestPushPermission, playRomanticChime, triggerBrowserPushNotification } from '../utils/pushNotification';

interface PushNotificationBannerProps {
  onEnabled?: () => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({ onEnabled }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if push is supported and not already granted or dismissed recently
    if (isPushNotificationSupported()) {
      const perm = getPushPermission();
      const dismissed = localStorage.getItem('bouncer_push_banner_dismissed');
      if (perm === 'default' && !dismissed) {
        // Show after a gentle 3-second delay for smooth page entrance
        const timer = setTimeout(() => setIsVisible(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestPushPermission();
    setIsVisible(false);
    if (result === 'granted') {
      playRomanticChime();
      triggerBrowserPushNotification(
        '❤️ Dating With Bouncer Alerts Active',
        'You will receive instant push notifications whenever new singles sign up in Zimbabwe!'
      );
      onEnabled?.();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('bouncer_push_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full bg-gradient-to-r from-rose-950 via-[#220718] to-pink-950 border-b border-rose-500/30 text-white shadow-md relative z-40 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-rose-100 truncate">
              <span className="font-bold text-white">Browser Push Alerts: </span>
              <span className="text-rose-200/90 hidden xs:inline">Get instant alerts when new singles register in Zimbabwe</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleEnable}
              className="px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-all active:scale-95"
            >
              <Bell className="w-3 h-3" />
              <span>Enable Alerts</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
