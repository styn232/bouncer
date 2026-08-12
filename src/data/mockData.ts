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
    name: '1 to 3 Singles Pass',
    price: 6,
    billingPeriod: 'monthly',
    tagline: 'Unlock direct WhatsApp contact numbers & dates for 1 to 3 Singles',
    badge: '$6 STARTER',
    popular: false,
    features: [
      'Select 1 to 3 Singles for $6',
      'Unlock Direct WhatsApp Phone Numbers',
      'Fast Identity Verification',
      'Send Direct Date Requests'
    ]
  },
  {
    id: 'starter_10_singles',
    name: '4 to 10 Singles Bundle',
    price: 10,
    billingPeriod: 'monthly',
    tagline: 'Unlock direct WhatsApp numbers for 4 to 10 Singles — Bundle Deal!',
    badge: '$10 BUNDLE',
    popular: false,
    features: [
      'Select 4 to 10 Singles for $10',
      'Unlock Direct WhatsApp Phone Numbers',
      'Priority Bouncer Clearance',
      'Direct WhatsApp Order List'
    ]
  },
  {
    id: 'vip_30_singles',
    name: 'VIP Access (30+ Singles)',
    price: 15,
    billingPeriod: 'monthly',
    tagline: 'Request and pay $15 for VIP Access to unlock MORE THAN 30 Singles!',
    badge: '$15 VIP UNLIMITED',
    popular: true,
    features: [
      'Unlock MORE THAN 30 Singles for $15',
      'Direct WhatsApp Contact Numbers',
      'VIP Gold Access Badge',
      'Priority Concierge Service',
      'Full Bouncer Verification Guarantee'
    ]
  }
];

export const MOCK_ADMIN_USER: User = {
  id: 'usr_admin',
  email: 'admin@bouncer.date',
  name: 'Bouncer Chief Admin',
  age: 35,
  location: 'Harare HQ, Zimbabwe',
  city: 'Harare',
  role: 'admin',
  subscriptionPlan: 'ultimate_access',
  subscriptionStatus: 'active',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  bio: 'Head Bouncer and Dating Platform Administrator.',
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
  subscriptionPlan: 'vip_monthly',
  subscriptionStatus: 'active',
  subscriptionExpiresAt: '2026-09-06T12:00:00Z',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  bio: 'Lover of art, espresso, and good conversation. Verified VIP Single seeking marriage!',
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

