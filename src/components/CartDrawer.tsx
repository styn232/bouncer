import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, MessageSquare, ShieldCheck, ArrowRight, Sparkles, Check, Clock, UserCheck, MessageCircle, Star, Phone, CreditCard, X, Mail } from 'lucide-react';
import { CartItem, DateType, User } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveFromCart: (profileId: string) => void;
  onUpdateCartItem: (profileId: string, dateType: DateType, icebreakerMessage: string, preferredTime: string) => void;
  onCheckout: () => void;
  currentUser?: User | null;
  onOpenPayment?: () => void;
}

const DATE_TYPES: { type: DateType; label: string; icon: string; desc: string }[] = [
  { type: 'vip_lounge', label: 'VIP Lounge Cocktails', icon: '🍸', desc: 'Rooftop drinks & velvet rope access' },
  { type: 'coffee', label: 'Coffee & Chill', icon: '☕', desc: 'Relaxed artisan coffee date' },
  { type: 'dinner', label: 'Fine Dining', icon: '🍷', desc: 'Multi-course dinner experience' },
  { type: 'speed_date', label: 'Speed Date Session', icon: '⚡', desc: 'Fast-track 20 min virtual connection' },
  { type: 'weekend_getaway', label: 'Weekend Getaway', icon: '✈️', desc: 'Bouncer concierged trip date' }
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
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
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [unlockedContacts, setUnlockedContacts] = useState<
    { profileId: string; name: string; age?: number; location?: string; city?: string; photos?: string[]; whatsappNumber: string }[]
  >([]);

  const [paymentMethod, setPaymentMethod] = useState<'web' | 'ecocash' | 'onemoney'>('web');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.whatsappNumber || '0771490167');
  const [mobileInstructions, setMobileInstructions] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(true);

  if (!isOpen) return null;

  // Dynamic Tiered Pricing Calculation
  // 1 single = $3 Starter Pack (1 single profile) | 2 to 3 singles = $6 | 4 to 10 singles = $10 | More than 10 or 30+ Singles VIP = $15
  const calculateSinglesFee = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 3;
    if (count <= 3) return 6;
    if (count <= 10) return 10;
    return 15;
  };

  const calculatedFee = calculateSinglesFee(cartItems.length);

  // Map cart count to subscription plan for Paynow backend
  const getPlanId = (count: number): string => {
    if (count === 1) return 'starter_1_single';
    if (count <= 3) return 'starter_3_or_4';
    if (count <= 10) return 'starter_10_singles';
    return 'vip_30_singles';
  };

  // Format exact user WhatsApp checkout message:
  const validCartItems = cartItems.filter(i => !!i && !!i.profile);
  const chosenSinglesNames = validCartItems.map(i => `${i.profile.name || 'Single'} (${i.profile.age || ''}, ${i.profile.city || i.profile.location || ''})`).join(', ');
  const whatsappTextMessage = `Hi Auntie I need these Singles: ${chosenSinglesNames || 'Selected Singles'}. My name is ${currentUser?.name || guestPhone || 'a Member'}.`;
  const whatsappDirectUrl = `https://wa.me/263715786859?text=${encodeURIComponent(whatsappTextMessage)}`;

  const verifyPaymentStatus = async (ref: string, autoApprove: boolean = false) => {
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const res = await fetch('/api/payment/verify-and-get-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reference: ref, 
          profileIds: cartItems.map(i => i.profileId),
          autoApproveTest: autoApprove || isTestMode
        })
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
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    setVerificationError(null);
    setMobileInstructions(null);
    try {
      const planId = getPlanId(cartItems.length);
      const profileIds = cartItems.map(i => i.profileId);
      const res = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          profileIds,
          paymentMethod,
          mobileNumber,
          guestPhone: currentUser ? undefined : (mobileNumber || guestPhone),
          guestEmail: currentUser ? undefined : guestEmail
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.testMode) {
          setIsTestMode(true);
        }
        if (data.instructions) {
          setMobileInstructions(data.instructions);
        }
        if (data.redirectUrl && paymentMethod === 'web') {
          setPaynowUrl(data.redirectUrl);
          window.open(data.redirectUrl, '_blank');
        }
        if (data.reference) {
          setPaynowRef(data.reference);
          setVerificationError(
            data.instructions || `Paynow reference [${data.reference}] created! Complete your payment, then click 'Verify Paynow Payment' below to reveal numbers.`
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white border border-emerald-200 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors z-10"
            title="Close cart"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-emerald-100 mb-5 pr-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 shrink-0">
                <UserCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif tracking-tight">
                  My Chosen Singles List
                </h2>
                <p className="text-xs text-slate-600">
                  Select singles, review your cart, and checkout instantly via Paynow to reveal direct WhatsApp numbers.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-extrabold shrink-0 hidden sm:block">
              {cartItems.length} {cartItems.length === 1 ? 'Single' : 'Singles'} Chosen
            </div>
          </div>

          {/* Pricing Notice & Suggestion Guide */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-5">
            <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                💡 Singles Flat Pricing Tiers (Pay via Paynow):
              </span>
              <span className="text-[11px] bg-emerald-600 text-white px-3 py-0.5 rounded-full font-bold shadow-sm">
                Total: ${calculatedFee}.00 Flat
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  cartItems.length === 1
                    ? 'bg-white border-emerald-500 text-slate-900 font-bold ring-2 ring-emerald-500/30 shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-emerald-900 font-extrabold text-[11px]">🧪 1 Single Test</span>
                  <span className="text-emerald-700 font-black text-xs">$3.00 Flat</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                  Test & verify 1 single's WhatsApp number.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  cartItems.length >= 2 && cartItems.length <= 3
                    ? 'bg-white border-emerald-500 text-slate-900 font-bold ring-2 ring-emerald-500/30 shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-emerald-900 font-extrabold text-[11px]">2 to 3 Singles</span>
                  <span className="text-emerald-700 font-black text-xs">$6.00 Flat</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                  Unlock 2 to 3 singles & WhatsApp dates.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  cartItems.length >= 4 && cartItems.length <= 10
                    ? 'bg-white border-emerald-500 text-slate-900 font-bold ring-2 ring-emerald-500/30 shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-emerald-900 font-extrabold text-[11px]">4 to 10 Singles</span>
                  <span className="text-emerald-700 font-black text-xs">$10.00 Bundle</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                  Pick 4 to 10 singles for $10 flat rate bundle.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  cartItems.length > 10
                    ? 'bg-amber-50 border-amber-500 text-slate-900 font-bold ring-2 ring-amber-500/30 shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-amber-900 font-extrabold text-[11px]">👑 VIP (11+ Singles)</span>
                  <span className="text-amber-700 font-black text-xs">$15.00 VIP</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                  Pay $15 for unlimited VIP single unlocks.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Success View with Revealed WhatsApp Numbers */}
          {checkoutSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 px-2 sm:px-4 space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-md">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                  🎉 WhatsApp Contact Numbers Revealed! 🥂
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Your Paynow payment has been confirmed. Direct WhatsApp contact details for your chosen singles are unlocked below!
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
                  <span>Unlocked WhatsApp Contact Numbers</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(unlockedContacts.length > 0 ? unlockedContacts : validCartItems.map(i => ({
                    profileId: i.profileId,
                    name: i.profile?.name || 'Single',
                    age: i.profile?.age,
                    location: i.profile?.location,
                    city: i.profile?.city,
                    photos: i.profile?.photos || [],
                    whatsappNumber: i.profile?.whatsappNumber || '+263 71 578 6859'
                  }))).map((contact) => {
                    const phoneNum = contact.whatsappNumber;
                    const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
                    const waUrl = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent((contact.name || 'there').split(' ')[0])},%20I%20found%20your%20profile%20on%20Dating%20With%20Bouncer!`;

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

              {/* Concierge Link */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs text-slate-700">
                  Need concierge date setup? Send your list to Auntie on WhatsApp at <strong>+263 71 578 6859</strong>
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
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Singles Chosen Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Browse our vetted singles catalog, click "Choose Single" on profiles you like, and pay via Paynow to unlock direct numbers!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-transform"
              >
                Explore Vetted Singles Now
              </button>
            </div>
          ) : (
            /* Chosen Items List */
            <div className="space-y-4">
              {validCartItems.map((item) => (
                <div
                  key={item.profileId}
                  className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row gap-4 items-start"
                >
                  {/* Single Summary Info: Name, Age, Location */}
                  <div className="flex items-center gap-3 shrink-0 w-full md:w-56">
                    <img
                      src={item.profile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={item.profile?.name || 'Single'}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 mb-1 w-fit">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{item.profile?.averageRating ? item.profile.averageRating.toFixed(1) : '5.0'} Rating</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 font-serif">
                        {item.profile?.name || 'Single'}, <span className="text-emerald-700 font-sans">{item.profile?.age}</span>
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        📍 {item.profile?.location}
                      </p>
                    </div>
                  </div>

                  {/* Date Settings Form */}
                  <div className="flex-1 w-full space-y-2.5 border-t md:border-t-0 md:border-l border-emerald-100 pt-3 md:pt-0 md:pl-4">
                    {/* Date Type */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Preferred Date Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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
                            className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center gap-1.5 ${
                              item.dateType === dt.type
                                ? 'bg-emerald-600 border-emerald-700 text-white font-bold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span className="text-sm">{dt.icon}</span>
                            <span className="truncate text-[11px]">{dt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Icebreaker Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        Custom Note / Icebreaker
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
                        placeholder={`Write a quick message about meeting ${(item.profile?.name || 'Single').split(' ')[0]}...`}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
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
                          placeholder="Preferred time (e.g. This Weekend)"
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 w-full focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button
                        onClick={() => onRemoveFromCart(item.profileId)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 font-bold text-xs flex items-center gap-1"
                        title="Remove single from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Guest Details Input if Not Logged In */}
              {!currentUser && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your Checkout Contact Info (No Login Required)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Your WhatsApp / Phone Number
                      </label>
                      <input
                        type="text"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+263 77 123 4567"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Your Email (for receipt)
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paynow Gateway Checkout Panel */}
              <div className="bg-white border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 mt-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-emerald-100">
                  <div>
                    <div className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Selected {cartItems.length} {cartItems.length === 1 ? 'Single' : 'Singles'} for Paynow Unlock</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Your chosen list: <span className="font-semibold text-slate-800 italic">{chosenSinglesNames}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-500 font-bold">Total ({cartItems.length} Singles):</div>
                    <div className="text-2xl font-extrabold text-emerald-700 font-serif">
                      ${calculatedFee}.00 Flat
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                      {cartItems.length <= 3 ? '3 Singles Rate ($6)' : cartItems.length <= 10 ? '4 to 10 Singles Rate ($10)' : 'VIP Rate ($15)'}
                    </div>
                  </div>
                </div>

                {/* Paynow Method Selector */}
                <div className="mb-4 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Select Paynow Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('web')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'web'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-400/50'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1">
                        <span>💳</span>
                        <span>Paynow Web</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-normal">Card / Zimswitch</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ecocash')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'ecocash'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-400/50'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1">
                        <span>📱</span>
                        <span>EcoCash Push</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-normal">Econet Number</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('onemoney')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'onemoney'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-400/50'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1">
                        <span>📲</span>
                        <span>OneMoney</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-normal">NetOne Number</div>
                    </button>
                  </div>

                  {(paymentMethod === 'ecocash' || paymentMethod === 'onemoney') && (
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        {paymentMethod === 'ecocash' ? 'EcoCash Number (Econet)' : 'OneMoney Number (NetOne)'}
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="0771490167"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  )}
                </div>

                {/* Paynow Payment Gateway Indicator */}
                <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-50 to-emerald-100/80 border border-emerald-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>Paynow [Test Mode Active]: EcoCash • OneMoney • Visa • Mastercard</span>
                    </div>
                    <span className="bg-amber-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      TEST MODE
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Test Mode is active. You can initiate real Paynow requests or test payments safely. After initiating, click <strong>"Verify Paynow Confirmation & Reveal Numbers"</strong> to unlock WhatsApp contacts immediately.
                  </p>
                </div>

                {/* Paynow Verification Status Notice */}
                {verificationError && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-slate-900 space-y-2">
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
                <div className="space-y-2.5">
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
                        Pay via Paynow (${calculatedFee}.00) & Unlock WhatsApp Numbers
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
                        Verify Paynow Confirmation & Reveal Numbers
                      </>
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>+ Add More Singles</span>
                    </button>

                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat with Auntie</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

