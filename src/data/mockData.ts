import { SingleProfile, SubscriptionPlan, User, PaymentTransaction, MatchOrder } from '../types';

export const INITIAL_PROFILES: SingleProfile[] = [
  {
    id: 'p1',
    name: 'Sophia Vance',
    age: 26,
    location: 'New York, NY',
    bio: 'Art director by day, cocktail connoisseur by night. Looking for someone who enjoys gallery openings and spontaneous weekend trips.',
    occupation: 'Senior Art Director',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Contemporary Art', 'Mixology', 'Indie Cinema', 'Pilates', 'Architecture'],
    gender: 'female',
    seeking: 'male',
    bouncerStatus: 'vip_approved',
    bouncerNotes: 'Bouncer Verified 100%. Identity & employment confirmed by Bouncer Max. Zero red flags.',
    compatibilityScore: 98,
    height: "5'8\"",
    relationshipGoal: 'VIP Lounge dates & Long-term',
    isFeatured: true,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Marcus Sterling',
    age: 29,
    location: 'Los Angeles, CA',
    bio: 'Tech entrepreneur & marathon runner. I bake sourdough on Sundays and love rooftop Jazz bars. Bouncer cleared.',
    occupation: 'AI Startup Founder',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Startups', 'Marathon', 'Rooftop Lounges', 'Sourdough', 'Jazz'],
    gender: 'male',
    seeking: 'female',
    bouncerStatus: 'verified',
    bouncerNotes: 'Passport & social profile verified. Clean background check on record.',
    compatibilityScore: 95,
    height: "6'2\"",
    relationshipGoal: 'Long-term relationship',
    isFeatured: true,
    createdAt: '2026-08-02T11:30:00Z'
  },
  {
    id: 'p3',
    name: 'Elena Rostova',
    age: 27,
    location: 'Miami, FL',
    bio: 'Architect with a passion for tropical modernism, ocean sailing, and espresso martinis. Let us meet in the VIP section.',
    occupation: 'Architectural Designer',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Sailing', 'Interior Design', 'Deep House', 'Latin Dancing', 'Fine Dining'],
    gender: 'female',
    seeking: 'everyone',
    bouncerStatus: 'vip_approved',
    bouncerNotes: 'VIP Bouncer Pass verified. High response rate & VIP Lounge clearance.',
    compatibilityScore: 96,
    height: "5'9\"",
    relationshipGoal: 'VIP Lounge dates',
    isFeatured: true,
    createdAt: '2026-08-03T14:15:00Z'
  },
  {
    id: 'p4',
    name: 'Julian Thorne',
    age: 31,
    location: 'Chicago, IL',
    bio: 'Architectural engineer & vinyl record collector. Looking for a witty partner who loves speakeasies and live blues.',
    occupation: 'Structural Engineer',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Blues & Jazz', 'Vinyl Records', 'Speakeasies', 'Bouldering', 'Coffee Roasting'],
    gender: 'male',
    seeking: 'female',
    bouncerStatus: 'verified',
    bouncerNotes: 'Bouncer ID Check Passed. Verified genuine singleton.',
    compatibilityScore: 92,
    height: "6'0\"",
    relationshipGoal: 'Serious relationship',
    isFeatured: false,
    createdAt: '2026-08-04T09:00:00Z'
  },
  {
    id: 'p5',
    name: 'Chloe Bennett',
    age: 25,
    location: 'Austin, TX',
    bio: 'Product designer and indie music fan. Big fan of food trucks, dog parks, and deep late-night conversations.',
    occupation: 'UX Designer',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Live Music', 'UX Design', 'Food Trucks', 'Golden Retrievers', 'Paddleboarding'],
    gender: 'female',
    seeking: 'male',
    bouncerStatus: 'verified',
    bouncerNotes: 'Verified via LinkedIn & Live Selfie Match. Bouncer approved.',
    compatibilityScore: 94,
    height: "5'6\"",
    relationshipGoal: 'Casual to serious dating',
    isFeatured: false,
    createdAt: '2026-08-04T16:20:00Z'
  },
  {
    id: 'p6',
    name: 'David Chen',
    age: 28,
    location: 'San Francisco, CA',
    bio: 'Venture analyst, culinary enthusiast, and amateur photographer. Let us discover the best hidden ramen spots.',
    occupation: 'Venture Capital Analyst',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Ramen', 'Photography', 'Skiing', 'Venture Capital', 'Wine Tasting'],
    gender: 'male',
    seeking: 'female',
    bouncerStatus: 'pending_check',
    bouncerNotes: 'Profile submitted, awaiting final facial recognition review by Bouncer.',
    compatibilityScore: 89,
    height: "5'11\"",
    relationshipGoal: 'Long-term partner',
    isFeatured: false,
    createdAt: '2026-08-05T08:45:00Z'
  },
  {
    id: 'p7',
    name: 'Aaliyah Washington',
    age: 28,
    location: 'New York, NY',
    bio: 'Fashion buyer & former ballerina. Always down for rooftop cocktail hours and Broadway shows.',
    occupation: 'Fashion Luxury Buyer',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['High Fashion', 'Ballet', 'Broadway', 'Cocktails', 'Travel'],
    gender: 'female',
    seeking: 'male',
    bouncerStatus: 'vip_approved',
    bouncerNotes: 'Bouncer Gold Status Granted. Background checked & verified active account.',
    compatibilityScore: 97,
    height: "5'10\"",
    relationshipGoal: 'VIP Dating & Romance',
    isFeatured: true,
    createdAt: '2026-08-05T12:00:00Z'
  },
  {
    id: 'p8',
    name: 'Mateo Morales',
    age: 30,
    location: 'Los Angeles, CA',
    bio: 'Film producer with a passion for vintage cars, espresso, and surfing Malibu at sunrise.',
    occupation: 'Film Producer',
    photos: [
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Surfing', 'Filmmaking', 'Vintage Cars', 'Espresso', 'Vinyl'],
    gender: 'male',
    seeking: 'female',
    bouncerStatus: 'verified',
    bouncerNotes: 'Identified & Verified by Bouncer Staff.',
    compatibilityScore: 91,
    height: "6'1\"",
    relationshipGoal: 'Meaningful connection',
    isFeatured: false,
    createdAt: '2026-08-05T18:10:00Z'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Basic Bouncer Pass',
    price: 0,
    billingPeriod: 'monthly',
    tagline: 'Standard entry with limited cart matches',
    badge: 'FREE',
    features: [
      'Browse all Singles Profiles',
      'Name, Age, and Location visibility',
      '1 Add to Cart match request / week',
      'Basic Bouncer Badge Verification'
    ]
  },
  {
    id: 'bouncer_pass',
    name: 'Bouncer Fast-Pass',
    price: 14.99,
    billingPeriod: 'monthly',
    tagline: 'Skip the line with priority profile clearance',
    badge: 'FAST-PASS',
    features: [
      'Fast-track Bouncer Profile Clearance (Under 1 hour)',
      '10 Singles Add-to-Cart matches / month',
      'See who viewed your profile',
      'Filter singles by precise compatibility score',
      'Priority Bouncer Support'
    ]
  },
  {
    id: 'vip_monthly',
    name: 'VIP Lounge Monthly',
    price: 29.99,
    billingPeriod: 'monthly',
    tagline: 'Full velvet-rope privileges & unlimited date cart',
    badge: 'MOST POPULAR',
    popular: true,
    features: [
      'UNLIMITED Add-to-Cart Singles Checkout',
      'VIP Approved Profile Gold Badge',
      'Direct Icebreaker Messaging & Custom Date Types',
      'Exclusive Access to Top-Rated Singles Profiles',
      'Bouncer Guarantee: Zero fake profiles or bots',
      'Monthly Singles Cart Token Roll-over'
    ]
  },
  {
    id: 'ultimate_access',
    name: 'Ultimate Bouncer Club',
    price: 49.99,
    billingPeriod: 'monthly',
    tagline: 'Red-carpet matchmaking & personal Bouncer concierge',
    badge: 'VIP EXECUTIVE',
    features: [
      'All VIP Lounge Features included',
      'Personal Matchmaking Concierge (Bouncer Assisted)',
      'Guaranteed weekly 1-on-1 VIP Date setups',
      'Background-checked match reports for every single in cart',
      'Unlimited Cart items & instant date lock-in',
      '24/7 Dedicated Bouncer VIP Helpline'
    ]
  }
];

export const MOCK_ADMIN_USER: User = {
  id: 'usr_admin',
  email: 'admin@bouncer.date',
  name: 'Bouncer Chief Admin',
  age: 35,
  location: 'Global HQ',
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
  name: 'Alex Mercer',
  age: 28,
  location: 'New York, NY',
  role: 'user',
  subscriptionPlan: 'vip_monthly',
  subscriptionStatus: 'active',
  subscriptionExpiresAt: '2026-09-06T12:00:00Z',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  bio: 'Lover of art, espresso, and good conversation. Verified VIP Single!',
  occupation: 'Digital Marketer',
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
    userName: 'Alex Mercer',
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
  },
  {
    id: 'tx_103',
    userId: 'usr_904',
    userName: 'Michael Jordan',
    userEmail: 'mjordan@techcorp.io',
    amount: 49.99,
    planId: 'ultimate_access',
    planName: 'Ultimate Bouncer Club',
    cardLast4: '1234',
    cardBrand: 'Amex',
    status: 'succeeded',
    date: '2026-08-05T16:45:00Z'
  }
];

export const MOCK_MATCH_ORDERS: MatchOrder[] = [
  {
    id: 'ord_501',
    userId: 'usr_demo',
    userName: 'Alex Mercer',
    items: [
      {
        profileId: 'p1',
        profile: INITIAL_PROFILES[0],
        dateType: 'vip_lounge',
        icebreakerMessage: 'Hey Sophia, I saw you love art galleries and mixology! Would love to get a drink at the Nines rooftop.',
        preferredTime: 'This Friday at 8:00 PM',
        addedAt: '2026-08-05T20:00:00Z'
      }
    ],
    totalAmount: 0, // Included in VIP plan
    paymentMethod: 'VIP Membership Token',
    status: 'pending_bouncer_approval',
    createdAt: '2026-08-05T20:05:00Z'
  }
];
