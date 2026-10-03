import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'cart' | 'bouncer' | 'new_single' | 'love';
  photo?: string;
  profileId?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-4 right-2 sm:right-4 z-50 flex flex-col gap-2 max-w-[290px] sm:max-w-[320px] w-full pointer-events-none px-2 sm:px-0">
      <AnimatePresence>
        {toasts.map(toast => {
          const isLoveOrSingle = toast.type === 'new_single' || toast.type === 'love';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-xl flex flex-col gap-1.5 transition-all text-white border ${
                isLoveOrSingle
                  ? 'bg-gradient-to-br from-[#2a0c1e]/98 via-[#1d0715]/98 to-[#12040d]/98 border-rose-500/50 shadow-rose-950/70 ring-1 ring-rose-400/30'
                  : toast.type === 'cart'
                  ? 'bg-slate-900/98 border-emerald-500/40 shadow-emerald-950/40'
                  : 'bg-slate-900/98 border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar thumbnail or Icon (compact sizing) */}
                {toast.photo ? (
                  <div className="relative shrink-0">
                    <img
                      src={toast.photo}
                      alt="Single"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1.5 ring-rose-500 shadow-sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-rose-600 text-white rounded-full p-0.5 shadow-xs">
                      <Heart className="w-2.5 h-2.5 fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isLoveOrSingle
                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs'
                        : toast.type === 'cart'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : toast.type === 'bouncer'
                        ? 'bg-amber-500/20 text-amber-400'
                        : toast.type === 'info'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isLoveOrSingle ? (
                      <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
                    ) : toast.type === 'cart' ? (
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    ) : toast.type === 'bouncer' ? (
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    ) : toast.type === 'info' ? (
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-xs text-white tracking-tight truncate">
                      {toast.title}
                    </h4>
                    {isLoveOrSingle && (
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-rose-100/90 font-medium leading-tight line-clamp-2 mt-0.5">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 text-xs"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>

              {/* Action Button (e.g. View Profile) */}
              {toast.onAction && (
                <div className="pt-1.5 border-t border-rose-500/20 flex justify-end">
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      onDismiss(toast.id);
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Heart className="w-2.5 h-2.5 fill-white" />
                    <span>{toast.actionLabel || 'View Profile'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
