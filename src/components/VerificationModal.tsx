import React, { useState } from 'react';
import { ShieldCheck, X, Camera, FileText, CheckCircle2 } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVerification: (selfieUrl: string, idDocumentUrl: string, phoneNumber: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onSubmitVerification
}) => {
  const [selfieUrl, setSelfieUrl] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitVerification(
      selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      idDocumentUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300',
      phone || '+263 77 123 4567'
    );
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black text-white font-serif">Get Bouncer Verified</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Verified members get up to <span className="text-amber-400 font-bold">4x more matches</span> and instant trust clearance across the platform.
            </p>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Mobile / WhatsApp Number</label>
              <input
                type="tel"
                required
                placeholder="+263 77 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Real Live Selfie Photo URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={selfieUrl}
                onChange={e => setSelfieUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
              <span className="text-[10px] text-slate-500">Provide a clear selfie photo for facial verification.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">ID Document / Passport Photo URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={idDocumentUrl}
                onChange={e => setIdDocumentUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
              <span className="text-[10px] text-slate-500">Encrypted & reviewed strictly by Staff Bouncers only.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-xl mt-2"
            >
              Submit Verification Request Shield
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Verification Submitted!</h3>
            <p className="text-xs text-slate-300">
              Staff Bouncer is reviewing your selfie & ID document. You will receive your verified shield checkmark badge shortly.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
