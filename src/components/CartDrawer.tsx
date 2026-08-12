import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, MessageSquare, ShieldCheck, ArrowRight, Sparkles, Check, Clock, UserCheck, MessageCircle, Star, Phone, CreditCard } from 'lucide-react';
import { CartItem, DateType, User } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveFromCart: (profileId: string) => void;
  onUpdateCartItem: (profileId: string, dateType: DateType, icebreakerMessage: string, preferredTime: string) => void;
  onCheckout: () => void;
  currentUser?: User | null;
  onOpenPayment: () => void;
}

const DATE_TYPES: { type: DateType; label: string; icon: string; desc: string }[] = [
  { type: 'vip_lounge', label: 'VIP Lounge Cocktails', icon: '🍸', desc: 'Rooftop drinks & velvet rope access' },
  { type: 'coffee', label: 'Coffee & Chill', icon: '☕', desc: 'Relaxed artisan coffee date' },
  { type: 'dinner', label: 'Fine Dining', icon: '🍷', desc: 'Multi-course dinner experience' },
  { type: 'speed_date', label: 'Speed Date Session', icon: '⚡', desc: 'Fast-track 20 min virtual connection' },
  { type: 'weekend_getaway', label: 'Weekend Getaway', icon: '✈️', desc: 'Bouncer concierged trip date' }
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onClose,
  cartItems,
  onRemoveFromCart,
  onUpdateCartItem,
  onCheckout,
  currentUser
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paynowUrl, setPaynowUrl] = useState<string | null>(null);
  const [paynowRef, setPaynowRef] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [unlockedContacts, setUnlockedContacts] = useState<
    { profileId: string; name: string; age?: number; location?: string; city?: string; photos?: string[]; whatsappNumber: string }[]
  >([]);

  // Dynamic Tiered Pricing Calculation
  // 1 to 3 singles = $6 | 4 to 10 singles = $10 | More than 10 or 30+ Singles VIP = $15
  const calculateSinglesFee = (count: number) => {
    if (count === 0) return 0;
    if (count <= 3) return 6;
    if (count <= 10) return 10;
    return 15;
  };

  const calculatedFee = calculateSinglesFee(cartItems.length);

  // Map cart count to subscription plan for Paynow backend
  const getPlanId = (count: number): string => {
    if (count <= 4) return 'starter_3_or_4';
    if (count <= 10) return 'bundle_5_to_10';
    return 'vip_15_singles';
  };

  // Format exact user WhatsApp checkout message:
  // "Hi Auntie I need these Singles: Name 1, Name 2. My name is [User Name]"
  const chosenSinglesNames = cartItems.map(i => `${i.profile.name} (${i.profile.age}, ${i.profile.city || i.profile.location})`).join(', ');
  const whatsappTextMessage = `Hi Auntie I need these Singles: ${chosenSinglesNames || 'Selected Singles'}. My name is ${currentUser?.name || 'a Member'}.`;
  const whatsappDirectUrl = `https://wa.me/263715786859?text=${encodeURIComponent(whatsappTextMessage)}`;

  const verifyPaymentStatus = async (ref: string) => {
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const res = await fetch('/api/payment/verify-and-get-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, profileIds: cartItems.map(i => i.profileId) })
      });
      const data = await res.json();
      if (data.paid && data.unlockedContacts && data.unlockedContacts.length > 0) {
        setUnlockedContacts(data.unlockedContacts);
        setCheckoutSuccess(true);
        setVerificationError(null);
        onCheckout();
        return true;
      } else {
        setVerificationError(
          data.error || `Paynow payment is not confirmed Paid yet (Status: ${data.status || 'pending'}). Please complete payment on Paynow then verify again.`
        );
        return false;
      }
    } catch (err) {
      console.error('Failed to verify Paynow payment:', err);
      setVerificationError('Could not verify payment status with Paynow server. Please try again.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePaynowCheckout = async () => {
    setIsSubmitting(true);
    setVerificationError(null);
    try {
      const planId = getPlanId(cartItems.length);
      const profileIds = cartItems.map(i => i.profileId);
      const res = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, profileIds })
      });

      const data = await res.json();
      if (data.success) {
        if (data.redirectUrl) {
          setPaynowUrl(data.redirectUrl);
          window.open(data.redirectUrl, '_blank');
        }
        if (data.reference) {
          setPaynowRef(data.reference);
          setVerificationError(
            `Paynow reference [${data.reference}] created! Complete payment on Paynow, then click 'Verify Paynow Payment Status & Unlock Numbers' below.`
          );
        }
      } else {
        alert(data.error || 'Could not initiate Paynow payment');
      }
    } catch (err) {
      console.error('Paynow checkout error:', err);
      alert('Paynow payment gateway error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (paynowRef) {
      await verifyPaymentStatus(paynowRef);
    } else {
      await handlePaynowCheckout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-emerald-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800">
              <UserCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-serif tracking-tight">
                My Chosen Singles List
              </h2>
              <p className="text-xs text-slate-600">
                Pick your singles & send your list to Auntie on WhatsApp (+263 71 578 6859) for payment & direct numbers
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-extrabold">
            {cartItems.length} {cartItems.length === 1 ? 'Single' : 'Singles'} Chosen
          </div>
        </div>

        {/* Pricing Notice & Suggestion Guide */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-6">
          <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              💡 Singles Selection Flat Pricing Rates:
            </span>
            <span className="text-[11px] bg-emerald-600 text-white px-3 py-0.5 rounded-full font-bold shadow-sm">
              Current Rate: ${calculatedFee}.00
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div
              className={`p-3 rounded-xl border transition-all ${
                cartItems.length >= 1 && cartItems.length <= 3
                  ? 'bg-white border-emerald-500 text-slate-900 font-bold ring-2 ring-emerald-500/30 shadow-md'
                  : 'bg-white/80 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 font-extrabold text-[11px]">1 to 3 Singles</span>
                <span className="text-emerald-700 font-black text-xs">$6.00 Flat</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Select 1 to 3 singles to unlock direct WhatsApp numbers & dates.
              </p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                cartItems.length >= 4 && cartItems.length <= 10
                  ? 'bg-white border-emerald-500 text-slate-900 font-bold ring-2 ring-emerald-500/30 shadow-md'
                  : 'bg-white/80 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 font-extrabold text-[11px]">4 to 10 Singles</span>
                <span className="text-emerald-700 font-black text-xs">$10.00 Bundle</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Pick 4 to 10 singles for $10 flat rate bundle!
              </p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                cartItems.length > 10
                  ? 'bg-amber-50 border-amber-500 text-slate-900 font-bold ring-2 ring-amber-500/30 shadow-md'
                  : 'bg-white/80 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-amber-900 font-extrabold text-[11px]">VIP (30+ Singles)</span>
                <span className="text-amber-700 font-black text-xs">$15.00 VIP</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Pay $15 for VIP access to unlock 30+ singles!
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Success View with Revealed WhatsApp Numbers */}
        {checkoutSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 px-2 sm:px-4 space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                🎉 WhatsApp Contact Numbers Revealed! 🥂
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Your checkout for {cartItems.length} selected {cartItems.length === 1 ? 'single' : 'singles'} has been processed. Direct contact details are unlocked below!
              </p>
              {paynowRef && (
                <div className="mt-2 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-3 rounded-lg border border-emerald-200 inline-block">
                  Paynow Reference: {paynowRef}
                </div>
              )}
            </div>

            {/* Revealed Singles WhatsApp Contact Cards */}
            <div className="space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 pb-2 border-b border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Unlocked WhatsApp Contact Numbers (Paynow Confirmed Paid)</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(unlockedContacts.length > 0 ? unlockedContacts : cartItems.map(i => ({
                  profileId: i.profileId,
                  name: i.profile.name,
                  age: i.profile.age,
                  location: i.profile.location,
                  city: i.profile.city,
                  photos: i.profile.photos,
                  whatsappNumber: i.profile.whatsappNumber || '+263 71 578 6859'
                }))).map((contact) => {
                  const phoneNum = contact.whatsappNumber;
                  const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(contact.name.split(' ')[0])},%20I%20found%20your%20profile%20on%20Dating%20With%20Bouncer!`;

                  return (
                    <div
                      key={contact.profileId}
                      className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <img
                          src={contact.photos && contact.photos.length > 0 ? contact.photos[0] : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={contact.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-sm shrink-0"
                        />
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 font-serif">
                            {contact.name}, <span className="text-emerald-700 font-sans">{contact.age}</span>
                          </h4>
                          <p className="text-xs text-slate-600">
                            📍 {contact.city || contact.location}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                              📱 {phoneNum}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Also Send List to Auntie */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
              <p className="text-xs text-slate-700">
                Need concierge date assistance? Send your list to Auntie on WhatsApp at <strong>+263 71 578 6859</strong>
              </p>
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Send List to Auntie on WhatsApp (+263 71 578 6859)
              </a>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setCheckoutSuccess(false);
                  onClose();
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
              >
                Continue Browsing More Singles
              </button>
            </div>
          </motion.div>
        ) : cartItems.length === 0 ? (
          /* Empty Chosen List State */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Singles Chosen Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Browse profiles, view photos and star rankings, then click "Choose Single" to build your list for Auntie!
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md"
            >
              Explore Vetted Singles Now
            </button>
          </div>
        ) : (
          /* Chosen Items List */
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.profileId}
                className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start"
              >
                {/* Single Summary Info: Name, Age, Location */}
                <div className="flex items-center gap-4 shrink-0 w-full md:w-64">
                  <img
                    src={item.profile.photos[0]}
                    alt={item.profile.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 mb-1 w-fit">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{item.profile.averageRating ? item.profile.averageRating.toFixed(1) : '5.0'} Rating</span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-900 font-serif">
                      {item.profile.name}, <span className="text-emerald-700 font-sans">{item.profile.age}</span>
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      📍 {item.profile.location}
                    </p>
                  </div>
                </div>

                {/* Date Settings Form */}
                <div className="flex-1 w-full space-y-3 border-t md:border-t-0 md:border-l border-emerald-100 pt-3 md:pt-0 md:pl-5">
                  {/* Date Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Choose Preferred Date Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DATE_TYPES.map((dt) => (
                        <button
                          key={dt.type}
                          type="button"
                          onClick={() =>
                            onUpdateCartItem(
                              item.profileId,
                              dt.type,
                              item.icebreakerMessage,
                              item.preferredTime
                            )
                          }
                          className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center gap-2 ${
                            item.dateType === dt.type
                              ? 'bg-emerald-600 border-emerald-700 text-white font-bold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-base">{dt.icon}</span>
                          <span className="truncate">{dt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icebreaker Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      Custom Icebreaker Note for Auntie
                    </label>
                    <input
                      type="text"
                      value={item.icebreakerMessage}
                      onChange={(e) =>
                        onUpdateCartItem(
                          item.profileId,
                          item.dateType,
                          e.target.value,
                          item.preferredTime
                        )
                      }
                      placeholder={`Write a quick message about meeting ${item.profile.name.split(' ')[0]}...`}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Preferred Time & Remove */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={item.preferredTime}
                        onChange={(e) =>
                          onUpdateCartItem(
                            item.profileId,
                            item.dateType,
                            item.icebreakerMessage,
                            e.target.value
                          )
                        }
                        placeholder="Preferred date time (e.g. This Weekend)"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 w-full focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.profileId)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 font-bold text-xs flex items-center gap-1"
                      title="Remove single from list"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Chosen List Summary & Paynow Gateway Checkout Panel */}
            <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 mt-8 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-emerald-100">
                <div>
                  <div className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Selected {cartItems.length} {cartItems.length === 1 ? 'Single' : 'Singles'} for WhatsApp Reveal</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Your chosen list: <span className="font-semibold text-slate-800 italic">{chosenSinglesNames}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 font-bold">Total Fee ({cartItems.length} Singles):</div>
                  <div className="text-2xl font-extrabold text-emerald-700 font-serif">
                    ${calculatedFee}.00 Flat
                  </div>
                  <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                    {cartItems.length <= 3 ? '3 Singles Tier ($6)' : cartItems.length <= 10 ? '4 to 10 Singles Tier ($10)' : 'VIP Tier ($15)'}
                  </div>
                </div>
              </div>

              {/* Paynow Payment Gateway Indicator (for 3 or >3 singles) */}
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-50 to-emerald-100/80 border-2 border-emerald-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Payment Gateway: PAYNOW (EcoCash • OneMoney • Visa • Mastercard • InnBucks)</span>
                  </div>
                  <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {cartItems.length >= 3 ? 'PAYNOW MANDATORY GATEWAY' : 'PAYNOW ENABLED'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {cartItems.length >= 3 
                    ? `You selected ${cartItems.length} singles (${cartItems.length >= 3 ? (cartItems.length === 3 ? '3 singles tier' : 'more than 3 singles tier') : 'standard'}). All available payment methods (EcoCash, OneMoney, Visa/Mastercard, InnBucks) are processed via Paynow payment gateway.`
                    : 'All Zimbabwe & international payment methods (EcoCash, OneMoney, Visa, Mastercard, InnBucks) are supported via Paynow.'
                  }
                </p>
              </div>

              {/* Paynow Verification Status Notice */}
              {verificationError && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-slate-900 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Paynow Verification Status</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {verificationError}
                  </p>
                  {paynowRef && (
                    <button
                      type="button"
                      onClick={() => verifyPaymentStatus(paynowRef)}
                      disabled={isVerifying}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Checking Paynow Status with Backend...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Verify Paynow Payment Status & Unlock Numbers</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Payment Action Buttons */}
              <div className="space-y-3">
                {/* Paynow Direct Gateway Checkout Button */}
                <button
                  type="button"
                  onClick={handlePaynowCheckout}
                  disabled={isSubmitting || isVerifying}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ring-2 ring-amber-300 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Connecting to Paynow Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 text-slate-950" />
                      Pay via Paynow Gateway (${calculatedFee}.00) & Unlock WhatsApp Numbers
                      <ArrowRight className="w-5 h-5 text-slate-950" />
                    </>
                  )}
                </button>

                {/* Verification & Reveal Trigger Button */}
                <button
                  type="button"
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmitting || isVerifying}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Paynow Payment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      Verify Paynow Confirmation & Reveal WhatsApp Numbers
                    </>
                  )}
                </button>

                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-300 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Direct WhatsApp Link to Auntie (+263 71 578 6859)
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
