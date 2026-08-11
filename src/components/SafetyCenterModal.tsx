import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, PhoneCall, X, CheckCircle } from 'lucide-react';

interface SafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black text-white font-serif">Bouncer Safety Center</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Real People. Verified Connections.
            </h3>
            <p className="leading-relaxed text-slate-300">
              Dating With Bouncer is built on trust, respect and safety. Every member undergoes automated & staff verification checks.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white">Essential Online Dating Safety Rules:</h3>

            <div className="space-y-2">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">1. Never Send Money or Financial Info</span>
                <p className="text-slate-400 mt-1">Never wire money or share credit card details with anyone you met online, regardless of their story.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">2. Keep Initial Chats on Bouncer</span>
                <p className="text-slate-400 mt-1">Our platform uses encrypted messaging. Keep conversations here until you establish mutual trust.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">3. Meet in Public Places for First Dates</span>
                <p className="text-slate-400 mt-1">Always meet in populated public spots (restaurants, cafes, lounges) and inform a friend or family member of your location.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">4. Report Suspicious Activity Immediately</span>
                <p className="text-slate-400 mt-1">Use the 1-click report button on any profile, post or chat thread. Bouncer moderation acts within 15 minutes.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Bouncer Staff Safety Hotline</span>
            </h4>
            <p className="text-slate-400">Need urgent assistance or reporting an impersonator?</p>
            <div className="font-bold text-rose-400 text-sm">+263 77 123 4567 • safety@bouncer.date</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-slate-800 text-white font-extrabold text-xs"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};
