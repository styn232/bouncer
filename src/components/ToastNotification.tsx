import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'cart' | 'bouncer';
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto bg-slate-900 border border-amber-500/30 text-white rounded-xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              {toast.type === 'cart' ? (
                <ShoppingBag className="w-5 h-5 text-rose-400" />
              ) : toast.type === 'bouncer' ? (
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              ) : toast.type === 'info' ? (
                <AlertCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="font-semibold text-sm text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
