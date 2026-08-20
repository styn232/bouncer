import React, { useState } from 'react';
import { ShieldCheck, X, Camera, FileText, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

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
  const [selfieData, setSelfieData] = useState('');
  const [idDocumentData, setIdDocumentData] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

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
      alert('Please upload a clear selfie photo from your device.');
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black text-white font-serif">Get Bouncer Verified</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
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
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Verification Submitted!</h3>
            <p className="text-xs text-slate-300">
              Staff Bouncer is reviewing your selfie & ID document. You will receive your verified shield checkmark badge shortly.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
