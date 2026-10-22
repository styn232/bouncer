import { SingleProfile, SubscriptionPlan, User, PaymentTransaction, MatchOrder, SiteSettings, ReelItem, StoryItem, FeedPost, Conversation, NotificationItem } from '../types';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'DATING WITH BOUNCER',
  logoUrl: '',
  iconUrl: '',
  tagline: 'Real People. Real Connections. Real Possibilities.'
};

export const INITIAL_PROFILES: SingleProfile[] = [];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter_3_or_4',
    name: '3–4 Singles Pass',
    price: 6,
    billingPeriod: 'monthly',
    tagline: 'USD $6 — Unlock direct WhatsApp contacts for 3 to 4 verified singles',
    badge: 'USD $6 — 3–4 SINGLES',
    popular: false,
    features: [
      'Unlock 3 to 4 Singles for $6',
      'Direct WhatsApp Contact Numbers',
      'Verified Zimbabwean Singles Only',
      'Fast Identity Clearance & Safety Check'
    ]
  },
  {
    id: 'starter_10_singles',
    name: 'More Than 10 Singles Bundle',
    price: 10,
    billingPeriod: 'monthly',
    tagline: 'USD $10 — Unlock direct WhatsApp numbers for more than 10 singles',
    badge: 'USD $10 — BEST VALUE',
    popular: true,
    features: [
      'Unlock more than 10 Singles for $10',
      'Direct WhatsApp Contact Numbers',
      'Priority Bouncer Clearance',
      'Direct WhatsApp Match Delivery',
      'Ideal for active dating in Zimbabwe & Diaspora'
    ]
  },
  {
    id: 'vip_30_singles',
    name: 'Unlimited Access Pass',
    price: 30,
    billingPeriod: 'monthly',
    tagline: 'USD $30 — Unlimited Access to unlock singles across all provinces',
    badge: 'USD $30 — UNLIMITED',
    popular: false,
    features: [
      'Unlimited Singles Contact Unlocks',
      'Direct WhatsApp Contact Numbers',
      'VIP Gold Access Badge',
      'Priority Concierge Matchmaker Support',
      'Full Bouncer Verification Guarantee',
      'Exclusive Access to Newly Joined Singles'
    ]
  },
  {
    id: 'test_1_single',
    name: 'Single Profile Unlock',
    price: 3,
    billingPeriod: 'monthly',
    tagline: 'Unlock exactly 1 Single Profile & private WhatsApp contact number',
    badge: 'USD $3 — 1 SINGLE',
    popular: false,
    features: [
      'Unlock 1 Single Profile',
      'Unlock Direct WhatsApp Phone Number',
      'Instant Direct WhatsApp Connection',
      'Bouncer Security Vetting & ID Verification'
    ]
  }
];

export const MOCK_ADMIN_USER: User = {
  id: 'usr_admin',
  email: 'jobsatespace@gmail.com',
  name: 'Bouncer Admin',
  age: 35,
  location: 'Harare HQ, Zimbabwe',
  city: 'Harare',
  role: 'admin',
  subscriptionPlan: 'vip_30_singles',
  subscriptionStatus: 'active',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  bio: 'Bouncer Admin and Dating Platform Administrator.',
  bouncerVerified: true,
  createdAt: '2026-01-01T00:00:00Z'
};

export const MOCK_DEMO_USER: User = {
  id: 'usr_demo',
  email: 'single@bouncer.date',
  name: 'Kudzai Mugo',
  age: 28,
  location: 'Harare (Borrowdale), Zimbabwe',
  city: 'Harare',
  subLocation: 'Borrowdale',
  role: 'user',
  childrenCount: 0,
  intent: 'Marriage',
  subscriptionPlan: 'free',
  subscriptionStatus: 'none',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  bio: 'Lover of art, espresso, and good conversation. Genuine single looking for a meaningful connection.',
  gender: 'male',
  seeking: 'female',
  interests: ['Coffee', 'Art', 'Fitness', 'Travel'],
  bouncerVerified: true,
  createdAt: '2026-07-15T10:00:00Z'
};

export const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx_101',
    userId: 'usr_demo',
    userName: 'Kudzai Mugo',
    userEmail: 'single@bouncer.date',
    amount: 29.99,
    planId: 'vip_monthly',
    planName: 'VIP Lounge Monthly',
    cardLast4: '4242',
    cardBrand: 'Visa',
    status: 'succeeded',
    date: '2026-08-01T14:30:00Z'
  },
  {
    id: 'tx_102',
    userId: 'usr_882',
    userName: 'Samantha Ray',
    userEmail: 'samantha.r@gmail.com',
    amount: 14.99,
    planId: 'bouncer_pass',
    planName: 'Bouncer Fast-Pass',
    cardLast4: '8888',
    cardBrand: 'Mastercard',
    status: 'succeeded',
    date: '2026-08-03T09:12:00Z'
  }
];

export const MOCK_MATCH_ORDERS: MatchOrder[] = [
  {
    id: 'ord_501',
    userId: 'usr_demo',
    userName: 'Kudzai Mugo',
    items: [
      {
        profileId: 'p1',
        profile: INITIAL_PROFILES[0],
        dateType: 'vip_lounge',
        icebreakerMessage: 'Hey Chiedza! Would love to meet for drinks in Borrowdale.',
        preferredTime: 'This Friday at 7:30 PM',
        addedAt: '2026-08-05T20:00:00Z'
      }
    ],
    totalAmount: 0,
    paymentMethod: 'VIP Membership Token',
    status: 'pending_bouncer_approval',
    createdAt: '2026-08-05T20:05:00Z'
  }
];

export const INITIAL_REELS: ReelItem[] = [];

export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_POSTS: FeedPost[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ADS = [
  {
    id: 'ad_1',
    title: 'Borrowdale VIP Lounge & Restaurant',
    sponsorName: 'Borrowdale VIP Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    linkUrl: 'https://datingwithbouncer.com/vip-lounge',
    placement: 'homepage' as const,
    impressions: 1420,
    clicks: 184,
    active: true
  },
  {
    id: 'ad_2',
    title: 'Victoria Falls Luxury Sunset Cruises',
    sponsorName: 'Vic Falls Safaris',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    linkUrl: 'https://datingwithbouncer.com/vic-falls',
    placement: 'feed' as const,
    impressions: 890,
    clicks: 92,
    active: true
  }
];

export const INITIAL_VERIFICATIONS = [
  {
    id: 'verif_101',
    userId: 'usr_demo',
    userName: 'Kudzai Mugo',
    userEmail: 'single@bouncer.date',
    selfieUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400',
    phoneNumber: '+263 77 123 4567',
    status: 'approved' as const,
    submittedAt: '2026-08-07T10:00:00Z',
    notes: 'National ID & selfie matched verified user.'
  }
];

