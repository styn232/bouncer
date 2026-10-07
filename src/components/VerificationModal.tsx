import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Camera, FileText, CheckCircle2, Upload, Mail, MailCheck, Send, KeyRound, Sparkles } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { User } from '../types';
import { auth, sendEmailVerification } from '../lib/firebase';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onSubmitVerification: (selfieUrl: string, idDocumentUrl: string, phoneNumber: string) => void;
  onEmailVerified?: (updatedUser: User) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitVerification,
  onEmailVerified
}) => {
  const [verifyMethod, setVerifyMethod] = useState<'email' | 'document'>('email');

  // Email verification states
  const [emailInput, setEmailInput] = useState(currentUser?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Document / Selfie verification states
  const [selfieData, setSelfieData] = useState('');
  const [idDocumentData, setIdDocumentData] = useState('');
  const [phone, setPhone] = useState(currentUser?.whatsappNumber || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailInput(currentUser?.email || '');
      setPhone(currentUser?.whatsappNumber || '');
      setEmailStatusMsg(null);
      setSubmitted(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSendVerificationEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = emailInput.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setEmailStatusMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusMsg(null);

    try {
      // 1. Trigger Firebase Auth email verification link if Firebase user is active
      if (auth?.currentUser && typeof sendEmailVerification === 'function') {
        try {
          await sendEmailVerification(auth.currentUser);
        } catch {
          // Proceed with backend email verification code
        }
      }

      // 2. Request 6-digit email verification code & link from backend
      const res = await fetch('/api/verification/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          userId: currentUser?.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailCodeSent(true);
        if (data.verificationCode) {
          setDispatchedCode(String(data.verificationCode));
          setVerificationCode(String(data.verificationCode));
        }
        setEmailStatusMsg({
          type: 'info',
          text: `Verification email & 6-digit code sent to ${targetEmail}! Enter the code below to activate your verified icon.`
        });
      } else {
        setEmailStatusMsg({
          type: 'error',
          text: data.error || 'Could not send verification email. Please try again.'
        });
      }
    } catch {
      setEmailStatusMsg({
        type: 'error',
        text: 'Network error while sending verification email. Please try again.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleConfirmEmailCode = async (e?: React.FormEvent, useFirebaseReload: boolean = false) => {
    if (e) e.preventDefault();
    const targetEmail = emailInput.trim().toLowerCase();
    setIsConfirmingEmail(true);
    setEmailStatusMsg(null);

    try {
      let fbVerified = false;
      if (useFirebaseReload && auth?.currentUser) {
        try {
          await auth.currentUser.reload();
          fbVerified = Boolean(auth.currentUser.emailVerified);
        } catch {
          // ignore
        }
      }

      const res = await fetch('/api/verification/email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          userId: currentUser?.id,
          code: verificationCode.trim() || dispatchedCode || '',
          firebaseVerified: fbVerified
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatusMsg({
          type: 'success',
          text: 'Your email is verified! Your verified icon is now active on your profile.'
        });
        if (data.user && onEmailVerified) {
          onEmailVerified(data.user);
        }
        setSubmitted(true);
      } else {
        setEmailStatusMsg({
          type: 'error',
          text: data.error || 'Invalid verification code. Please check the code and try again.'
        });
      }
    } catch {
      setEmailStatusMsg({
        type: 'error',
        text: 'Could not confirm email verification. Please try again.'
      });
    } finally {
      setIsConfirmingEmail(false);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsProcessing(true);
        const compressed = await compressImageFile(file, 1000, 0.85);
        if (compressed) setSelfieData(compressed);
      } catch (err) {
        console.error('Selfie upload error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsProcessing(true);
        const compressed = await compressImageFile(file, 1200, 0.85);
        if (compressed) setIdDocumentData(compressed);
      } catch (err) {
        console.error('ID upload error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfieData) {
      setEmailStatusMsg({ type: 'error', text: 'Please upload a clear selfie photo from your device.' });
      return;
    }
    onSubmitVerification(
      selfieData,
      idDocumentData || selfieData,
      phone || '+263 77 123 4567'
    );
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-serif flex items-center gap-1.5">
                <span>Verify Your Account</span>
                <MailCheck className="w-4 h-4 text-sky-400" />
              </h2>
              <p className="text-[11px] text-slate-400">
                Adds a clean verified icon to your profile without covering your photo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Tabs: Verify by Email vs Selfie/ID */}
        {!submitted && (
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setVerifyMethod('email');
                setEmailStatusMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                verifyMethod === 'email'
                  ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Verify by Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVerifyMethod('document');
                setEmailStatusMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                verifyMethod === 'document'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Selfie & ID</span>
            </button>
          </div>
        )}

        {emailStatusMsg && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2 ${
              emailStatusMsg.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : emailStatusMsg.type === 'error'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                : 'bg-sky-500/20 border border-sky-500/40 text-sky-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{emailStatusMsg.text}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border border-emerald-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              {verifyMethod === 'email' && (
                <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg border border-sky-300">
                  <MailCheck className="w-7 h-7" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">
              {verifyMethod === 'email' ? 'Email Verified!' : 'Verification Submitted!'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {verifyMethod === 'email'
                ? 'Your account is now verified by email. Clean verified icons (with no text covering your picture) are now active on your profile.'
                : 'Your selfie & ID have been submitted. Your verified icon badge will appear once approved.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : verifyMethod === 'email' ? (
          /* EMAIL VERIFICATION FLOW */
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-slate-300 font-semibold">Verified Icon Preview:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border border-emerald-300 shadow-sm"
                  title="Verified Icon"
                >
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span
                  className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center border border-sky-300 shadow-sm"
                  title="Email Verified Icon"
                >
                  <MailCheck className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Your Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSendVerificationEmail()}
                  disabled={isSendingEmail}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Sending...' : emailCodeSent ? 'Resend Email' : 'Send Email'}</span>
                </button>
              </div>
            </div>

            {emailCodeSent && (
              <form onSubmit={(e) => handleConfirmEmailCode(e, false)} className="space-y-3 pt-2 border-t border-slate-800">
                {dispatchedCode && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-200 font-semibold">
                      📧 Instant Email Verification Code:
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-emerald-500/40 tracking-widest">
                      {dispatchedCode}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-200 mb-1.5">
                    Enter 6-Digit Email Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code..."
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-slate-950 border border-sky-500/50 rounded-xl pl-9 pr-3.5 py-2.5 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConfirmingEmail}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <MailCheck className="w-4 h-4" />
                  <span>{isConfirmingEmail ? 'Verifying Email...' : 'Verify Email & Activate Icon Badge'}</span>
                </button>
              </form>
            )}

            {!emailCodeSent && (
              <button
                type="button"
                onClick={() => handleSendVerificationEmail()}
                disabled={isSendingEmail}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <MailCheck className="w-4 h-4" />
                <span>{isSendingEmail ? 'Sending Verification Email...' : 'Send Verification Email Now'}</span>
              </button>
            )}
          </div>
        ) : (
          /* SELFIE & ID VERIFICATION FLOW */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-200 mb-1">Mobile / WhatsApp Number</label>
              <input
                type="tel"
                required
                placeholder="+263 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Live Selfie File Upload from Device */}
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                📸 Live Selfie Photo (Upload File from Device) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {selfieData ? (
                  <img
                    src={selfieData}
                    alt="Selfie Preview"
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="verification-selfie-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors w-full shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{selfieData ? 'Change Selfie Photo' : 'Upload Selfie File'}</span>
                  </label>
                  <input
                    id="verification-selfie-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelfieUpload}
                  />
                  <p className="text-[10px] text-slate-400">Select selfie image from gallery or camera</p>
                </div>
              </div>
            </div>

            {/* ID Document / Passport Upload */}
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                🪪 ID / Passport Document (Upload File from Device)
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {idDocumentData ? (
                  <img
                    src={idDocumentData}
                    alt="ID Document Preview"
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-500 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="verification-id-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors w-full border border-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{idDocumentData ? 'Change ID Document' : 'Upload ID Photo / Scan'}</span>
                  </label>
                  <input
                    id="verification-id-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIdUpload}
                  />
                  <p className="text-[10px] text-slate-400">Encrypted & reviewed strictly by Staff Bouncers only</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-xl mt-2 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? 'Processing Image...' : 'Submit Verification Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
