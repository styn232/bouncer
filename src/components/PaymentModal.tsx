import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, ShieldCheck, Check, Sparkles, X, AlertCircle, ArrowRight, ExternalLink, RefreshCw, Phone, Mail } from 'lucide-react';
import { SubscriptionPlan, SubscriptionPlanId, User } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  currentUser?: User | null;
  onPaymentSuccess: (planId: SubscriptionPlanId, transactionData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plans,
  currentUser,
  onPaymentSuccess
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('starter_3_or_4');
  const [paymentMethod, setPaymentMethod] = useState<'web' | 'ecocash' | 'onemoney'>('web');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.whatsappNumber || '0771490167');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [paynowRef, setPaynowRef] = useState<string | null>(null);
  const [paynowRedirectUrl, setPaynowRedirectUrl] = useState<string | null>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[1] || plans[0];

  if (!isOpen) return null;

  const handlePaynowInitiate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessInfo(null);

    try {
      const response = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          paymentMethod,
          mobileNumber: (mobileNumber || guestPhone || '0771490167').replace(/\s+/g, ''),
          guestPhone: currentUser ? undefined : (mobileNumber || guestPhone),
          guestEmail: currentUser ? undefined : (guestEmail || 'customer@datingwithbouncer.com')
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.reference) {
          setPaynowRef(data.reference);
        }

        if (data.redirectUrl) {
          setPaynowRedirectUrl(data.redirectUrl);
          // Paynow Screen to open and complete on SAME TAB
          if (paymentMethod === 'web') {
            setSuccessInfo('Redirecting to Paynow in same tab...');
            setTimeout(() => {
              window.location.href = data.redirectUrl;
            }, 400);
            return;
          }
        }

        if (data.instructions) {
          setSuccessInfo(data.instructions);
        } else {
          setSuccessInfo(`Payment initiated via Paynow [Ref: ${data.reference}]. Please complete the prompt on your mobile phone, then click "Verify & Unlock WhatsApp Number".`);
        }
      } else {
        setErrorMsg(data.error || 'Failed to initiate Paynow payment. Please try again.');
      }
    } catch (err: any) {
      console.error('Paynow error:', err);
      setErrorMsg('Communication error connecting to Paynow gateway.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paynowRef) {
      await handlePaynowInitiate();
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/payment/verify-and-get-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paynowRef,
          autoApproveTest: true
        })
      });

      const data = await response.json();

      if (data.paid) {
        onPaymentSuccess(selectedPlanId, data.transaction || { reference: paynowRef, amount: selectedPlan.price });
        onClose();
      } else {
        setErrorMsg(data.error || 'Payment not confirmed as Paid by Paynow yet. If using EcoCash/OneMoney, please approve the PIN prompt on your phone and try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMsg('Error verifying Paynow transaction status.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Paynow Subscription View */}
          <div className="p-5 sm:p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
                <Crown className="w-4 h-4" />
                <span>Paynow Payment Gateway</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Choose Monthly Membership Plan
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Unlock Singles Cart checkouts, direct DMs, and priority Bouncer profile approval.
              </p>
            </div>

            {/* Crucial Instruction Notice: WhatsApp Number Revelation */}
            <div className="bg-emerald-950/70 border-2 border-emerald-500/50 rounded-2xl p-4 mb-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-300 uppercase tracking-wide">
                    ⚠️ Instant WhatsApp Number Revelation
                  </h4>
                  <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                    Once your payment is completed on <strong>Paynow</strong>, the Single's private <strong>WhatsApp contact phone number</strong> and direct connection will be <strong>instantly unlocked and revealed to you!</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Choice Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
                    selectedPlanId === plan.id
                      ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-md">
                      {plan.badge || '$15 VIP UNLIMITED'}
                    </span>
                  )}

                  <div>
                    <div className="text-xs font-extrabold text-white mb-1">{plan.name}</div>
                    <div className="text-2xl font-black text-amber-400 font-serif mb-2">
                      ${plan.price}
                      <span className="text-xs text-slate-500 font-normal">/mo</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mb-3">
                      {plan.tagline}
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-[10px] text-slate-300 border-t border-slate-800/80 pt-2.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {/* Paynow Payment Method Selection */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6">
              <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-3">
                Select Paynow Payment Method:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {/* Option 1: Paynow Web / Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('web')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'web'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <span>💳</span>
                    <span>Paynow Web / Card</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Visa, Mastercard, Zimswitch (Opens on same tab)
                  </p>
                </button>

                {/* Option 2: EcoCash Push */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ecocash')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'ecocash'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <span>📱</span>
                    <span>EcoCash Express</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Instant USSD PIN prompt to Econet mobile
                  </p>
                </button>

                {/* Option 3: OneMoney Push */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('onemoney')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'onemoney'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <span>📲</span>
                    <span>OneMoney Express</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Instant USSD PIN prompt to NetOne mobile
                  </p>
                </button>
              </div>

              {/* Mobile Phone Input for EcoCash / OneMoney */}
              {(paymentMethod === 'ecocash' || paymentMethod === 'onemoney') && (
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {paymentMethod === 'ecocash' ? 'EcoCash Number (Econet)' : 'OneMoney Number (NetOne)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="0771490167"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {!currentUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Your Email (for receipt)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Your Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="0771490167"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success / Status Instruction Box */}
            {successInfo && (
              <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <Check className="w-4 h-4" />
                  <span>Paynow Transaction Status</span>
                </div>
                <p className="leading-relaxed text-slate-200">{successInfo}</p>
                {paynowRedirectUrl && (
                  <div className="pt-2">
                    <a
                      href={paynowRedirectUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Complete on Paynow Checkout Screen (Same Tab)</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All payments processed securely through <strong>Paynow Zimbabwe</strong></span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {paynowRef && (
                  <button
                    type="button"
                    onClick={handleVerifyPayment}
                    disabled={isVerifying || isProcessing}
                    className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify & Unlock WhatsApp</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handlePaynowInitiate()}
                  disabled={isProcessing || isVerifying}
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Connecting to Paynow...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      Pay ${selectedPlan.price} via Paynow & Reveal Number
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
