import React, { useState } from 'react';
import { AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  targetName: string;
  targetId: string;
  targetType: 'profile' | 'post' | 'message';
  onClose: () => void;
  onSubmitReport: (targetId: string, targetName: string, targetType: string, category: string, reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetName,
  targetId,
  targetType,
  onClose,
  onSubmitReport
}) => {
  const [category, setCategory] = useState('fake_profile');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(targetId, targetName, targetType, category, reason);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-black text-white font-serif">Report {targetType}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300">
              You are reporting <span className="font-bold text-white">{targetName}</span>. Reports are handled confidentially by Staff Bouncers.
            </p>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Reason for Report</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              >
                <option value="fake_profile">Fake Profile or Impersonation</option>
                <option value="scam_spam">Scam, Money Request or Spam</option>
                <option value="harassment">Inappropriate Behavior or Harassment</option>
                <option value="underage">Underage User</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                placeholder="Provide details to help Bouncer moderators..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg"
            >
              Submit Safety Report
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-slate-400">Thank you for helping keep Dating With Bouncer safe.</p>
            <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
