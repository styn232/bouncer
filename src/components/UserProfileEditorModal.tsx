import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, ShieldCheck, Camera, Sparkles, X, Check, Heart, MapPin, Briefcase, Baby, Upload, Mail, Phone, Wallet, PlusCircle, ArrowUpRight, DollarSign, CreditCard, Smartphone, Building2, Landmark, ImageOff, Gift, Copy, Share2, Users, AlertCircle, Clock } from 'lucide-react';
import { User, DatingIntent, AffiliateWithdrawalRequest } from '../types';
import { ZIMBABWE_PROVINCES, ZIMBABWE_LOCATIONS, getCitiesByProvince, getSubLocationsForCity, getProvinceForCity } from '../data/zimbabweLocations';
import { compressImageFile } from '../utils/imageCompressor';
import { capitalizeName, hasValidProfilePhoto, resolveBirthYear, formatRegistrationDate } from '../utils/format';

interface UserProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onSaveProfile: (updatedData: Partial<User>) => void;
  onApplyBouncerBadge: () => void;
}

export const UserProfileEditorModal: React.FC<UserProfileEditorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  onApplyBouncerBadge
}) => {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [birthYear, setBirthYear] = useState<number>(resolveBirthYear(currentUser));
  const age = Math.max(18, currentYear - Number(birthYear));
  const initialCity = currentUser?.city || 'Harare';
  const initialProv = currentUser?.province || getProvinceForCity(initialCity) || 'Harare Metropolitan';

  const [province, setProvince] = useState<string>(initialProv);
  const [city, setCity] = useState(initialCity);
  const [subLocation, setSubLocation] = useState(currentUser?.subLocation || 'Borrowdale');
  const [childrenCount, setChildrenCount] = useState<number>(currentUser?.childrenCount ?? 0);
  const [intent, setIntent] = useState<DatingIntent>(currentUser?.intent || 'Marriage');
  const [hivStatus, setHivStatus] = useState<string>(currentUser?.hivStatus ? (currentUser.hivStatus.includes('+') ? 'HIV+' : 'HIV-') : 'HIV-');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.whatsappNumber || '+263 77 123 4567');
  const [gender, setGender] = useState<'female' | 'male' | 'non-binary'>(currentUser?.gender || 'female');
  const [seeking, setSeeking] = useState<'female' | 'male' | 'everyone'>(currentUser?.seeking || 'male');
  const [photo1, setPhoto1] = useState(hasValidProfilePhoto(currentUser?.avatar) ? (currentUser?.avatar || '') : '');
  const [photo2, setPhoto2] = useState('');
  const [photo3, setPhoto3] = useState('');
  const [interestsText, setInterestsText] = useState((currentUser?.interests || []).join(', '));
  const [bouncerVerified, setBouncerVerified] = useState(currentUser?.bouncerVerified || false);

  // Wallet & Add Funds state
  const [userWalletBalance, setUserWalletBalance] = useState<number>(currentUser?.walletBalance ?? 0);
  const [isAddingFunds, setIsAddingFunds] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<string>('10');
  const [topupMethod, setTopupMethod] = useState<'ecocash' | 'onemoney' | 'paynow'>('ecocash');
  const [topupMobile, setTopupMobile] = useState<string>(currentUser?.whatsappNumber || '+263 77 123 4567');
  const [isTopupLoading, setIsTopupLoading] = useState<boolean>(false);
  const [topupSuccessMsg, setTopupSuccessMsg] = useState<string | null>(null);

  // Affiliate & Withdrawal state
  const [referralCode, setReferralCode] = useState<string>(currentUser?.referralCode || '');
  const [affiliateBalance, setAffiliateBalance] = useState<number>(currentUser?.affiliateBalance ?? 0);
  const [affiliateTotalEarned, setAffiliateTotalEarned] = useState<number>(currentUser?.affiliateTotalEarned ?? 0);
  const [invitedMenCount, setInvitedMenCount] = useState<number>(currentUser?.invitedMenCount ?? 0);
  const [invitedLadiesCount, setInvitedLadiesCount] = useState<number>(currentUser?.invitedLadiesCount ?? 0);
  const [rewardPerInvite, setRewardPerInvite] = useState<number>(0.25);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(5);
  const [withdrawalActivated, setWithdrawalActivated] = useState<boolean>(false);
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawalRequest[]>([]);
  const [creditedReferrals, setCreditedReferrals] = useState<Array<{ id: string; name: string; gender: string; joinedAt?: string }>>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5');
  const [withdrawMethod, setWithdrawMethod] = useState<'ecocash' | 'onemoney' | 'innbucks' | 'whatsapp_cash'>('ecocash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>(currentUser?.whatsappNumber || '');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [affiliateMsg, setAffiliateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedAffiliate, setCopiedAffiliate] = useState<boolean>(false);

  const [isSaved, setIsSaved] = useState(false);

  const fetchAffiliateStats = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/affiliate/me?userId=${encodeURIComponent(currentUser.id)}`, {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.referralCode || '');
        setAffiliateBalance(Number(data.affiliateBalance || 0));
        setAffiliateTotalEarned(Number(data.affiliateTotalEarned || 0));
        setInvitedMenCount(Number(data.invitedMenCount || 0));
        setInvitedLadiesCount(Number(data.invitedLadiesCount || 0));
        setRewardPerInvite(Number(data.rewardPerInvite || 0.25));
        setMinWithdrawal(Number(data.minWithdrawal || 5));
        setWithdrawalActivated(Boolean(data.withdrawalActivated));
        setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
        setCreditedReferrals(Array.isArray(data.referrals) ? data.referrals : []);
        if (Number(data.affiliateBalance || 0) >= Number(data.minWithdrawal || 5)) {
          setWithdrawAmount(Number(data.affiliateBalance || 5).toFixed(2));
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setBirthYear(resolveBirthYear(currentUser));
      const curCity = currentUser.city || 'Harare';
      const curProv = currentUser.province || getProvinceForCity(curCity) || 'Harare Metropolitan';
      setProvince(curProv);
      setCity(curCity);
      setSubLocation(currentUser.subLocation || 'Borrowdale');
      setChildrenCount(currentUser.childrenCount ?? 0);
      setIntent(currentUser.intent || 'Marriage');
      setHivStatus(currentUser.hivStatus ? (currentUser.hivStatus.includes('+') ? 'HIV+' : 'HIV-') : 'HIV-');
      setBio(currentUser.bio || '');
      setWhatsappNumber(currentUser.whatsappNumber || '+263 77 123 4567');
      setGender(currentUser.gender || 'female');
      setSeeking(currentUser.seeking || 'male');
      const validPhotos = (currentUser.photos || []).filter(p => hasValidProfilePhoto(p));
      setPhoto1(hasValidProfilePhoto(currentUser.avatar) ? (currentUser.avatar || '') : (validPhotos[0] || ''));
      setPhoto2(validPhotos[1] || '');
      setPhoto3(validPhotos[2] || '');
      setInterestsText((currentUser.interests || []).join(', '));
      setBouncerVerified(currentUser.bouncerVerified || false);
      setUserWalletBalance(currentUser.walletBalance ?? 0);
      setWithdrawAccount(currentUser.whatsappNumber || '');
      if (isOpen) {
        fetchAffiliateStats();
      }
    }
  }, [currentUser, isOpen]);

  // Available cities for chosen province
  const availableCities = getCitiesByProvince(province);

  // Available sub-locations for chosen city
  const activeCityData = ZIMBABWE_LOCATIONS.find(l => l.city.toLowerCase() === city.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : ['CBD'];

  // Handle Province change
  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const citiesInProv = getCitiesByProvince(newProv);
    if (citiesInProv.length > 0) {
      const firstCity = citiesInProv[0];
      setCity(firstCity.city);
      setSubLocation(firstCity.subLocations.length > 0 ? firstCity.subLocations[0] : 'Central');
    }
  };

  // Handle City change
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const autoProv = getProvinceForCity(newCity);
    if (autoProv) setProvince(autoProv);
    const cityData = ZIMBABWE_LOCATIONS.find(l => l.city.toLowerCase() === newCity.toLowerCase());
    if (cityData && cityData.subLocations.length > 0) {
      setSubLocation(cityData.subLocations[0]);
    }
  };

  if (!isOpen || !currentUser) return null;

  const handlePhotoUpload = async (index: 1 | 2 | 3, file: File) => {
    try {
      const compressed = await compressImageFile(file, 1000, 0.82);
      if (compressed) {
        if (index === 1) setPhoto1(compressed);
        if (index === 2) setPhoto2(compressed);
        if (index === 3) setPhoto3(compressed);
      }
    } catch (err) {
      console.warn('Photo processing note:', err);
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(topupAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid deposit amount greater than $0.');
      return;
    }

    try {
      setIsTopupLoading(true);
      setTopupSuccessMsg(null);

      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: topupMethod,
          mobileNumber: topupMobile
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserWalletBalance(data.newBalance);
        setTopupSuccessMsg(`🎉 Successfully added $${amountNum.toFixed(2)} to your wallet! New balance: $${data.newBalance.toFixed(2)}`);
        setTimeout(() => {
          setIsAddingFunds(false);
          setTopupSuccessMsg(null);
        }, 2500);
      } else {
        alert(data.error || 'Failed to deposit funds. Please try again.');
      }
    } catch (err) {
      alert('Error connecting to deposit gateway.');
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateMsg(null);
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < minWithdrawal) {
      setAffiliateMsg({ type: 'error', text: `Minimum withdrawal is $${minWithdrawal.toFixed(2)}.` });
      return;
    }
    if (!withdrawAccount.trim()) {
      setAffiliateMsg({ type: 'error', text: 'Please enter your EcoCash / OneMoney / WhatsApp payout number.' });
      return;
    }
    try {
      setIsWithdrawing(true);
      const res = await fetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email || ''
        },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: amt,
          payoutMethod: withdrawMethod,
          payoutAccount: withdrawAccount.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAffiliateBalance(Number(data.affiliateBalance || 0));
        setAffiliateMsg({
          type: 'success',
          text: `✅ Withdrawal request of $${amt.toFixed(2)} submitted! Pending Admin approval.`
        });
        fetchAffiliateStats();
      } else {
        setAffiliateMsg({
          type: 'error',
          text: data.error || 'Could not submit withdrawal request.'
        });
      }
    } catch {
      setAffiliateMsg({ type: 'error', text: 'Network error while submitting withdrawal.' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interests = interestsText.split(',').map(i => i.trim()).filter(Boolean);
    const fullLocation = `${city} (${subLocation}), ${province}, Zimbabwe`;
    const photos = [photo1, photo2, photo3].filter(p => hasValidProfilePhoto(p));
    const formattedName = capitalizeName(name);
    const validMainPhoto = hasValidProfilePhoto(photo1) ? photo1 : (photos[0] || '');
    onSaveProfile({
      name: formattedName,
      email,
      birthYear: Number(birthYear),
      age: Number(age),
      province,
      city,
      subLocation,
      location: fullLocation,
      childrenCount: Number(childrenCount),
      intent,
      hivStatus,
      bio,
      whatsappNumber,
      gender,
      seeking,
      avatar: validMainPhoto,
      photos,
      interests,
      bouncerVerified,
      walletBalance: userWalletBalance
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const affiliateShareUrl = `${window.location.origin}/?ref=${encodeURIComponent(referralCode || currentUser.referralCode || '')}`;
  const hasMinBalance = affiliateBalance >= minWithdrawal;
  const totalInvited = invitedMenCount + invitedLadiesCount;
  const hasGenderRatio = totalInvited > 0 && invitedMenCount >= invitedLadiesCount;
  const isWithdrawalUnlocked = hasMinBalance && hasGenderRatio;
  const hasAnyUploadedPhoto = hasValidProfilePhoto(photo1) || hasValidProfilePhoto(photo2) || hasValidProfilePhoto(photo3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            {hasValidProfilePhoto(photo1) ? (
              <img
                src={photo1}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                <ImageOff className="w-6 h-6 text-slate-500" />
                <span className="text-[8px] font-bold uppercase mt-0.5">No Picture</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white font-serif">
                Settings & Profile
              </h2>
              <p className="text-xs text-slate-400">
                Manage your Profile Picture, Affiliate Link & Withdrawals, Dating Intent, and Account Wallet.
              </p>
            </div>
          </div>

          {/* Encourage User to Upload Picture if Missing */}
          {!hasAnyUploadedPhoto && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                <ImageOff className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  No Profile Picture Uploaded Yet
                </div>
                <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed">
                  Please upload your real profile picture below so that you can choose other singles and unlock their WhatsApp contacts!
                </p>
              </div>
            </div>
          )}

          {/* AFFILIATE LINK & WITHDRAWAL PROGRAM SECTION IN SETTINGS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-950 to-rose-950/40 border border-amber-500/40 shadow-lg mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
                    <span>Affiliate Program & Invite Link</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px]">
                      Earn ${rewardPerInvite.toFixed(2)} / Invite
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Invite Singles & Earn Cash Withdrawals
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Affiliate Balance</div>
                <div className="text-xl font-black font-mono text-emerald-400">
                  ${affiliateBalance.toFixed(2)} <span className="text-[10px] text-slate-400">USD</span>
                </div>
              </div>
            </div>

            {/* Affiliate Link Copy & Share */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">Your Personal Affiliate Link (Letters Only • Private):</span>
                <span className="font-mono text-amber-400 font-bold">Code: {referralCode || 'LOADING'}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={affiliateShareUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(affiliateShareUrl);
                      setCopiedAffiliate(true);
                      setTimeout(() => setCopiedAffiliate(false), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedAffiliate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAffiliate ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Join DATING WITH BOUNCER to choose singles and connect on WhatsApp! Sign up using my invite link: ${affiliateShareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                🔒 Your link uses a unique letter code (does not show your name), directs visitors to your profile, and automatically credits you when anyone signs up!
              </p>
            </div>

            {creditedReferrals.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Credited Sign-Ups From Your Link ({creditedReferrals.length})
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {creditedReferrals.slice(0, 10).map((refUser) => (
                    <div key={refUser.id} className="flex items-center justify-between text-[11px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                      <span className="font-semibold text-slate-200">{refUser.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        +${rewardPerInvite.toFixed(2)} ({refUser.gender === 'male' ? '👨 Man' : '👩 Lady'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats & Withdrawal Activation Rules */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Invited</div>
                <div className="text-base font-black text-white mt-0.5">{totalInvited}</div>
                <div className="text-[10px] text-emerald-400 font-mono">Earned ${affiliateTotalEarned.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-amber-300 font-bold uppercase">👨 Men Invited</div>
                <div className="text-base font-black text-amber-400 mt-0.5">{invitedMenCount}</div>
                <div className="text-[10px] text-slate-400">Must be ≥ Ladies</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-rose-300 font-bold uppercase">👩 Ladies Invited</div>
                <div className="text-base font-black text-rose-400 mt-0.5">{invitedLadiesCount}</div>
                <div className="text-[10px] text-slate-400">Ratio Check</div>
              </div>
            </div>

            {/* Withdrawal Activation Checklist */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Withdrawal Activation Requirements</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isWithdrawalUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isWithdrawalUnlocked ? '✅ Withdrawal Activated' : '🔒 Locked Until Requirements Met'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    {hasMinBalance ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>1. Reach minimum withdrawal of <strong>${minWithdrawal.toFixed(2)} USD</strong></span>
                  </span>
                  <span className={`font-mono font-bold ${hasMinBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ${affiliateBalance.toFixed(2)} / ${minWithdrawal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    {hasGenderRatio ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>2. Number of invited Men is equal to or more than Ladies (<strong>Men ≥ Ladies</strong>)</span>
                  </span>
                  <span className={`font-mono font-bold ${hasGenderRatio ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {invitedMenCount}M : {invitedLadiesCount}L
                  </span>
                </div>
              </div>
            </div>

            {affiliateMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                affiliateMsg.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{affiliateMsg.text}</span>
              </div>
            )}

            {/* Withdrawal Request Form (Active when requirements met) */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Amount ($ USD, min ${minWithdrawal})
                  </label>
                  <input
                    type="number"
                    min={minWithdrawal}
                    step="0.25"
                    disabled={!isWithdrawalUnlocked || isWithdrawing}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Payout Method
                  </label>
                  <select
                    disabled={!isWithdrawalUnlocked || isWithdrawing}
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold disabled:opacity-50"
                  >
                    <option value="ecocash">EcoCash</option>
                    <option value="onemoney">OneMoney</option>
                    <option value="innbucks">InnBucks</option>
                    <option value="whatsapp_cash">WhatsApp Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Payout Mobile Number
                  </label>
                  <input
                    type="text"
                    disabled={!isWithdrawalUnlocked || isWithdrawing}
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleWithdrawalSubmit}
                disabled={!isWithdrawalUnlocked || isWithdrawing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {isWithdrawing
                  ? 'Submitting Withdrawal Request...'
                  : isWithdrawalUnlocked
                  ? `Request Withdrawal ($${parseFloat(withdrawAmount || '5').toFixed(2)}) — Approved by Admin`
                  : `Withdrawal Locked (Need $${minWithdrawal.toFixed(2)}+ & Men ≥ Ladies)`}
              </button>
            </div>

            {/* User's Withdrawal Requests History */}
            {withdrawals.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Recent Withdrawal Requests</div>
                {withdrawals.slice(0, 4).map((w) => (
                  <div key={w.id} className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px]">
                    <div>
                      <span className="font-mono font-bold text-white">${w.amount.toFixed(2)}</span>
                      <span className="text-slate-400 ml-2 uppercase">{w.payoutMethod} ({w.payoutAccount})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      w.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : w.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {w.status === 'pending' ? '⏳ Pending Admin Approval' : w.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* USER WALLET FUNDS & ADD FUNDS CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/40 shadow-lg mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                    Account Funds Balance
                  </div>
                  <div className="text-2xl font-black font-mono text-white flex items-center gap-1">
                    <span>${Number(userWalletBalance).toFixed(2)}</span>
                    <span className="text-xs font-bold text-emerald-300">USD</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingFunds(!isAddingFunds)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAddingFunds ? 'Close Add Funds' : 'Add Funds'}</span>
              </button>
            </div>

            {/* EXPANDABLE ADD FUNDS / TOP-UP WIDGET */}
            {isAddingFunds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-emerald-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Top Up Wallet with EcoCash, OneMoney, or Card
                  </span>
                  <span className="text-[10px] text-slate-400">Instant Deposit Credit</span>
                </div>

                {topupSuccessMsg && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{topupSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleTopupSubmit} className="space-y-3">
                  {/* Preset Amount Badges */}
                  <div>
                    <label className="block text-[11px] text-slate-300 font-bold mb-1.5">
                      Select Deposit Amount:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['5', '10', '20', '50'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTopupAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-black font-mono transition-all border ${
                            topupAmount === amt
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                          }`}
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount + Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                        Custom Amount ($ USD)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-400 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                        Payment Method
                      </label>
                      <select
                        value={topupMethod}
                        onChange={(e) => setTopupMethod(e.target.value as any)}
                        className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400 text-xs"
                      >
                        <option value="ecocash">📱 EcoCash Zimbabwe</option>
                        <option value="onemoney">📶 OneMoney Zimbabwe</option>
                        <option value="paynow">💳 Paynow Local Card</option>
                        <option value="paypal_visa">💳 Use Visa Card Here (PayPal Gateway)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-slate-400">
                      Funds can be used anytime to unlock singles' contact numbers.
                    </p>
                    <button
                      type="submit"
                      disabled={isTopupLoading || !topupAmount || parseFloat(topupAmount) <= 0}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                    >
                      {isTopupLoading ? (
                        <span>Processing Deposit...</span>
                      ) : (
                        <>
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Deposit +${parseFloat(topupAmount || '0').toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Bouncer & Email Verification Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Profile Verification</span>
                  {(bouncerVerified || currentUser?.emailVerified) && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow-xs" title="Verified">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  )}
                  {currentUser?.emailVerified && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shadow-xs" title="Email Verified">
                      <Mail className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentUser?.emailVerified
                    ? '✅ Verified by Email! Clean verified icons are active on your profile.'
                    : bouncerVerified
                    ? '✅ Your profile is Verified! Clean verified icon is active.'
                    : '📧 Verify your account by email to add the Verified Icon to your profile.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApplyBouncerBadge();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/50 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser?.emailVerified ? 'Email Verified ✓' : 'Verify by Email'}</span>
              </button>
              <button
                type="button"
                onClick={() => setBouncerVerified(!bouncerVerified)}
                title={bouncerVerified ? 'Verified Icon Active' : 'Enable Verified Icon'}
                className={`p-2 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  bouncerVerified
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Upload Up to 3 Photos */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="block font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                📸 Upload Your Profile Photos (Up to 3 Photos)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Photo 1 (Main) */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-amber-500/50 shadow-md bg-slate-950 flex items-center justify-center">
                    {hasValidProfilePhoto(photo1) ? (
                      <img
                        src={photo1}
                        alt="Main Photo"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <ImageOff className="w-6 h-6 text-slate-500" />
                        <span className="text-[8px] font-bold uppercase mt-0.5">No Picture</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                      Main
                    </span>
                  </div>
                  <label
                    htmlFor="user-photo1-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-colors w-full"
                  >
                    <Upload className="w-3 h-3 text-slate-950" />
                    {hasValidProfilePhoto(photo1) ? 'Change Photo 1' : 'Upload Photo 1'}
                  </label>
                  <input
                    id="user-photo1-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(1, file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Photo 2 */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-slate-700 bg-slate-950 flex items-center justify-center">
                    {photo2 ? (
                      <img
                        src={photo2}
                        alt="Photo 2"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <label
                    htmlFor="user-photo2-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] border border-slate-700 transition-colors w-full"
                  >
                    <Upload className="w-3 h-3 text-amber-400" />
                    Photo 2
                  </label>
                  <input
                    id="user-photo2-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(2, file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Photo 3 */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-slate-700 bg-slate-950 flex items-center justify-center">
                    {photo3 ? (
                      <img
                        src={photo3}
                        alt="Photo 3"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <label
                    htmlFor="user-photo3-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] border border-slate-700 transition-colors w-full"
                  >
                    <Upload className="w-3 h-3 text-amber-400" />
                    Photo 3
                  </label>
                  <input
                    id="user-photo3-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(3, file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                Singles can upload up to 3 photos directly from device or gallery (JPG, PNG, WEBP).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* WhatsApp / Phone Contact Number */}
              <div>
                <label className="block font-bold text-amber-400 uppercase tracking-wider mb-1">
                  📱 WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                  Shared with matches after payment confirmation.
                </span>
              </div>

              {/* Year of Birth (Dynamic Age) */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Year of Birth</span>
                  <span className="text-[10px] font-extrabold text-amber-400">
                    Age: {age} yrs • {formatRegistrationDate(currentUser?.createdAt)}
                  </span>
                </label>
                <select
                  required
                  value={birthYear}
                  onChange={e => setBirthYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  {Array.from({ length: 82 }, (_, idx) => currentYear - 18 - idx).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} ({currentYear - yr} years old)
                    </option>
                  ))}
                </select>
              </div>

              {/* Choose Gender */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Choose Gender
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              {/* Number of Children */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  👶 Number of Children
                </label>
                <select
                  value={childrenCount}
                  onChange={e => setChildrenCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={0}>0 (No children)</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                  <option value={3}>3+ Children</option>
                </select>
              </div>

              {/* 3-Tier Zimbabwe Location Selector */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    Zimbabwe Location (Province → City → Suburb)
                  </span>
                  <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {province}
                  </span>
                </div>

                {/* 1. Zimbabwe Province */}
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                    🏛️ 1. Province (10 Provinces)
                  </label>
                  <select
                    value={province}
                    onChange={e => handleProvinceChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {ZIMBABWE_PROVINCES.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.citiesCount} urban centres)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. City & 3. Suburb */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                      📍 2. City / Town / Centre
                    </label>
                    <select
                      value={city}
                      onChange={e => handleCityChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {availableCities.map(loc => (
                        <option key={loc.city} value={loc.city}>
                          {loc.city} ({loc.type || 'Town'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                      🏘️ 3. Sub-location / Suburb
                    </label>
                    <select
                      value={subLocation}
                      onChange={e => setSubLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {availableSubLocations.map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dating Intent: Marriage or Funny */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  💍 Dating Intent
                </label>
                <select
                  value={intent}
                  onChange={e => setIntent(e.target.value as DatingIntent)}
                  className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="Marriage">💍 Seeking Marriage</option>
                  <option value="Funny">😂 Funny & Good Vibe</option>
                </select>
              </div>

              {/* HIV Status */}
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  🩺 HIV Status
                </label>
                <select
                  value={hivStatus}
                  onChange={e => setHivStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="HIV-">🛡️ HIV- (Negative)</option>
                  <option value="HIV+">💜 HIV+ (Positive)</option>
                </select>
              </div>

            </div>

            {/* Bio */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bio & Dating Vibe
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share your hobbies, what you appreciate in a partner..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Interests (Comma Separated)
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                placeholder="Coffee, Safari, Music, Cooking"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {isSaved ? 'Profile Saved!' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
