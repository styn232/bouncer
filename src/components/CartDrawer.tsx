import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, MessageSquare, ShieldCheck, ArrowRight, Sparkles, Check, Clock, UserCheck, MessageCircle, Star, Phone } from 'lucide-react';
import { CartItem, DateType, User } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveFromCart: (profileId: string) => void;
  onUpdateCartItem: (profileId: string, dateType: DateType, icebreakerMessage: string, preferredTime: string) => void;
  onCheckout: () => void;
  currentUser: User;
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
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Dynamic Tiered Pricing Calculation
  // 1 to 3 singles = $6 | 4 to 10 singles = $10 | More than 10 or 30+ Singles VIP = $15
  const calculateSinglesFee = (count: number) => {
    if (count === 0) return 0;
    if (count <= 3) return 6;
    if (count <= 10) return 10;
    return 15;
  };

  const calculatedFee = calculateSinglesFee(cartItems.length);

  // Format exact user WhatsApp checkout message:
  // "Hi Auntie I need these Singles: Name 1, Name 2. My name is [User Name]"
  const chosenSinglesNames = cartItems.map(i => `${i.profile.name} (${i.profile.age}, ${i.profile.city || i.profile.location})`).join(', ');
  const whatsappTextMessage = `Hi Auntie I need these Singles: ${chosenSinglesNames || 'Selected Singles'}. My name is ${currentUser.name || 'a Member'}.`;
  const whatsappDirectUrl = `https://wa.me/263715786859?text=${encodeURIComponent(whatsappTextMessage)}`;

  const handleCheckoutSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setCheckoutSuccess(true);
    onCheckout();

    // Open WhatsApp directly with Auntie
    window.open(whatsappDirectUrl, '_blank');
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

        {/* Checkout Success View */}
        {checkoutSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-4"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-300 shadow-md">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">
              Singles List Sent to Auntie on WhatsApp! 🥂
            </h3>
            <p className="text-sm text-slate-700 max-w-md mx-auto mb-6 leading-relaxed">
              Your message was prepared for Auntie at <strong>+263 71 578 6859</strong>. Complete payment to get direct numbers instantly!
            </p>
            
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              Open WhatsApp Chat with Auntie
            </a>

            <div>
              <button
                onClick={() => {
                  setCheckoutSuccess(false);
                  onClose();
                }}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 font-bold underline"
              >
                Continue Browsing Singles
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

            {/* Chosen List Summary & WhatsApp Checkout Panel */}
            <div className="bg-white border border-emerald-300 rounded-2xl p-6 mt-8 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-emerald-100">
                <div>
                  <div className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Send Chosen Singles List to Auntie on WhatsApp
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Your chosen list will be formatted as: <span className="font-semibold text-slate-800 italic">"Hi Auntie I need these Singles: {chosenSinglesNames}. My name is {currentUser.name}."</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 font-bold">Total Selection Rate ({cartItems.length} Singles):</div>
                  <div className="text-2xl font-extrabold text-emerald-700 font-serif">
                    ${calculatedFee}.00 Flat
                  </div>
                  <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                    {cartItems.length <= 3 ? '1 to 3 Singles Tier ($6)' : cartItems.length <= 10 ? '4 to 10 Singles Tier ($10)' : 'VIP Tier ($15)'}
                  </div>
                </div>
              </div>

              {/* Payment Accounts Guide */}
              <div className="mb-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>💳 Payment Details (EcoCash & InnBucks):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-emerald-800 font-bold block text-[11px]">📱 EcoCash (Merchant/Direct)</span>
                    <span className="font-mono text-emerald-900 text-xs select-all font-black block my-1 bg-emerald-50 p-1.5 rounded border border-emerald-300">
                      *153*1*1*0771490167*{calculatedFee}#
                    </span>
                    <span className="text-[10px] text-slate-600 block">Number: <strong>0771490167</strong></span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-emerald-800 font-bold block text-[11px]">💵 InnBucks Account</span>
                    <span className="font-mono text-slate-900 text-xs select-all font-black block my-1 bg-amber-50 p-1.5 rounded border border-amber-300">
                      0771490167
                    </span>
                    <span className="text-[10px] text-slate-600 block">InnBucks No: <strong>0771490167</strong></span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Checkout Button */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Preparing WhatsApp Message for Auntie...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 fill-white" />
                      Check Out & Send List to WhatsApp (+263 71 578 6859)
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Direct WhatsApp Link: Send "Hi Auntie I need these Singles"
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
