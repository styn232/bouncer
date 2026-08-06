import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, Calendar, MessageSquare, ShieldCheck, ArrowRight, Sparkles, Check, Clock, Heart } from 'lucide-react';
import { CartItem, DateType, SingleProfile, User } from '../types';

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
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
  onUpdateCartItem,
  onCheckout,
  currentUser,
  onOpenPayment
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckoutSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setCheckoutSuccess(true);
    onCheckout();
  };

  const isVip = currentUser.subscriptionPlan === 'vip_monthly' || currentUser.subscriptionPlan === 'ultimate_access';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300">
              <ShoppingBag className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white font-serif tracking-tight">
                Singles Date Cart
              </h2>
              <p className="text-xs text-slate-400">
                Configure your dates & send Bouncer-vetted match requests
              </p>
            </div>
          </div>

          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs text-amber-400 font-bold">
            {cartItems.length} {cartItems.length === 1 ? 'Single' : 'Singles'} Selected
          </div>
        </div>

        {/* Checkout Success View */}
        {checkoutSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-4"
          >
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/40">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-serif">
              Date Match Requests Sent! 🥂
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
              Bouncer is verifying schedule availability with your selected singles. You will receive an instant alert as soon as they respond!
            </p>
            <button
              onClick={() => {
                setCheckoutSuccess(false);
                onClose();
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              Continue Browsing Singles
            </button>
          </motion.div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-950 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Your Singles Cart is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Browse singles profiles, view Name, Age, Location, and click "Add to Cart" to start setting up dates!
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
            >
              Explore Singles Now
            </button>
          </div>
        ) : (
          /* Cart Items List */
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.profileId}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row gap-5 items-start"
              >
                {/* Single Summary Info: Name, Age, Location */}
                <div className="flex items-center gap-4 shrink-0 w-full md:w-64">
                  <img
                    src={item.profile.photos[0]}
                    alt={item.profile.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-500/30"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 inline-block mb-1">
                      🛡️ Bouncer Verified
                    </span>
                    <h4 className="text-lg font-extrabold text-white font-serif">
                      {item.profile.name}, <span className="text-amber-400 font-sans">{item.profile.age}</span>
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      📍 {item.profile.location}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {item.profile.occupation}
                    </p>
                  </div>
                </div>

                {/* Date Settings Form */}
                <div className="flex-1 w-full space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5">
                  {/* Date Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Choose Date Type
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
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-amber-400" />
                      Custom Icebreaker Note
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
                      placeholder={`Write something personal to ${item.profile.name.split(' ')[0]}...`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  {/* Preferred Time & Remove */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
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
                        placeholder="Preferred time (e.g. This Friday 8 PM)"
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 w-full focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.profileId)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                      title="Remove single from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Cart Checkout Summary Panel */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Bouncer Velvet Rope Guarantee Included
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Every match in your cart is 100% ID-verified and cleared by Bouncer staff before date confirmation.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Date Requests Total:</div>
                  <div className="text-2xl font-extrabold text-amber-300 font-serif">
                    {isVip ? 'FREE (VIP Member)' : '$19.99 Match Fee'}
                  </div>
                  {!isVip && (
                    <button
                      onClick={onOpenPayment}
                      className="text-[10px] text-amber-400 hover:underline mt-1 font-semibold block"
                    >
                      ✨ Upgrade to VIP for Free Unlimited Matches
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCheckoutSubmit}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-2xl shadow-rose-950/50 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Bouncer Processing Match Requests...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-slate-950" />
                    Send Date Cart Match Requests ({cartItems.length})
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
