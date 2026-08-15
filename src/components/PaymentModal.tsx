import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Lock, ShieldCheck, CreditCard, Check, Sparkles, X, AlertCircle, FileText, Download } from 'lucide-react';
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
  if (!isOpen) return null;

  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('starter_3_or_4');
  const [cardHolderName, setCardHolderName] = useState(currentUser?.name || '');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expDate, setExpDate] = useState('08/28');
  const [cvc, setCvc] = useState('123');
  const [zipCode, setZipCode] = useState('10001');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[1] || plans[0];

  // Auto-format card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const parts = val.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleQuickSandboxFill = () => {
    setCardHolderName(currentUser?.name || 'Alex Mercer');
    setCardNumber('4242 4242 4242 4242');
    setExpDate('12/28');
    setCvc('888');
    setZipCode('90210');
    setErrorMsg('');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardHolderName || !cardNumber || !cvc) {
      setErrorMsg('Please fill in all card payment fields.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          cardHolderName,
          cardNumber,
          expDate,
          cvc,
          zipCode
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.testMode && data.reference) {
          try {
            await fetch('/api/payment/test-approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: data.reference })
            });
          } catch (e) {
            console.warn('Auto test approve note:', e);
          }
        }
        setReceiptData(data.transaction);
        onPaymentSuccess(selectedPlanId, data.transaction);
      } else {
        setErrorMsg(data.error || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Payment gateway communication error.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Card brand detection
  const cleanCard = cardNumber.replace(/\D/g, '');
  const cardBrand = cleanCard.startsWith('5') ? 'Mastercard' : cleanCard.startsWith('3') ? 'Amex' : 'Visa';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {receiptData ? (
            /* Printable Receipt View */
            <div className="p-8 text-center overflow-y-auto">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1 font-serif">
                Payment Submitted for Approval! 🥂
              </h3>
              <p className="text-xs text-amber-300 font-semibold max-w-md mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                Your payment of ${receiptData.amount} for {receiptData.planName} has been recorded and sent to Bouncer Admin for verification. Once approved by Admin, your VIP features will be activated!
              </p>

              {/* Receipt Box */}
              <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3 mb-6 shadow-inner">
                <div className="flex justify-between pb-3 border-b border-slate-800 font-bold">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-amber-400 font-mono">{receiptData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="text-white font-semibold">{receiptData.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Card Billed:</span>
                  <span className="text-slate-200">{receiptData.cardBrand} •••• {receiptData.cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">${receiptData.amount.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  <span>Date Processed:</span>
                  <span>{new Date(receiptData.date).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setReceiptData(null);
                  onClose();
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Start Browsing VIP Singles
              </button>
            </div>
          ) : (
            /* Main Subscription & Payment Gateway View */
            <div className="p-6 sm:p-8 overflow-y-auto">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
                  <Crown className="w-4 h-4" />
                  Secure Bouncer Payment Gateway
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                  Choose Monthly Membership Plan
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Unlock unlimited Singles Cart checkouts, direct DMs, and priority Bouncer profile approval.
                </p>
              </div>

              {/* Plan Choice Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
                      selectedPlanId === plan.id
                        ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md">
                        {plan.badge}
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

                    <ul className="space-y-1 text-[10px] text-slate-300 border-t border-slate-800/80 pt-2">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {/* Local EcoCash & InnBucks Direct Payment Guide Banner */}
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 mb-6 text-white shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    EcoCash & InnBucks Mobile Payment Option
                  </span>
                  <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full">
                    No Card Needed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-emerald-300 font-bold block text-[11px]">📱 EcoCash Direct USSD</span>
                    <span className="font-mono text-amber-300 text-xs font-black block my-1 bg-slate-950 p-2 rounded border border-amber-500/40 select-all">
                      *153*1*1*0771490167*{selectedPlan.price}#
                    </span>
                    <span className="text-[10px] text-slate-400 block">EcoCash Number: <strong>0771490167</strong></span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-amber-300 font-bold block text-[11px]">💵 InnBucks Direct Number</span>
                    <span className="font-mono text-emerald-300 text-xs font-black block my-1 bg-slate-950 p-2 rounded border border-emerald-500/40 select-all">
                      0771490167
                    </span>
                    <span className="text-[10px] text-slate-400 block">Send payment to InnBucks account <strong>0771490167</strong></span>
                  </div>
                </div>
              </div>

              {/* Payment Details Form */}
              <form onSubmit={handleSubmitPayment} className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    Credit or Debit Card Payment
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickSandboxFill}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono transition-colors"
                  >
                    ⚡ Test Card Quick-Fill
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolderName}
                      onChange={e => setCardHolderName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Card Number
                      </label>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">{cardBrand}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={expDate}
                      onChange={e => setExpDate(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* CVC & ZIP */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        CVC
                      </label>
                      <input
                        type="password"
                        required
                        value={cvc}
                        onChange={e => setCvc(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        ZIP / Postal
                      </label>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        placeholder="10001"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                </div>

                {/* Submit & Security Footprint */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    256-Bit SSL Encrypted • PCI DSS Compliant
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Authorizing Gateway...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-slate-950" />
                        Subscribe Now • ${selectedPlan.price}/mo
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
