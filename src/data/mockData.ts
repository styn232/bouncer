import { SingleProfile, SubscriptionPlan, User, PaymentTransaction, MatchOrder } from '../types';

export const INITIAL_PROFILES: SingleProfile[] = [
  {
    id: 'p1',
    name: 'Chiedza Moyo',
    age: 27,
    city: 'Harare',
    subLocation: 'Borrowdale',
    location: 'Harare (Borrowdale), Zimbabwe',
    bio: 'Software engineer & tea enthusiast. Ready for a committed partner who values family, deep chats, and laughter.',
    occupation: 'Senior Software Engineer',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Technology', 'Traditional Cooking', 'Hiking In Nyanga', 'Gospel & Jazz'],
    gender: 'female',
    seeking: 'male',
    childrenCount: 0,
    intent: 'Marriage',
    reviews: [
      {
        id: 'rev_1',
        reviewerName: 'Tinashe M.',
        rating: 5,
        comment: 'Super polite, cheerful, and genuinely looking for something meaningful!',
        createdAt: '2026-08-01T10:00:00Z'
      },
      {
        id: 'rev_2',
        reviewerName: 'Kudzai C.',
        rating: 5,
        comment: 'Chiedza is as bright and smart as her name suggests. Great conversation.',
        createdAt: '2026-08-03T12:00:00Z'
      }
    ],
    averageRating: 5.0,
    bouncerStatus: 'vip_approved',
    bouncerNotes: 'Bouncer Verified 100%. Passport & National ID matched.',
    compatibilityScore: 98,
    height: "5'7\"",
    relationshipGoal: 'Marriage & Family',
    isFeatured: true,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Tarisai Ndlovu',
    age: 30,
    city: 'Bulawayo',
    subLocation: 'Kumalo',
    location: 'Bulawayo (Kumalo), Zimbabwe',
    bio: 'Civil engineer and weekend stand-up comedy fan! Life is too short not to laugh every single day. Let us make jokes together!',
    occupation: 'Civil Engineer',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Stand-up Comedy', 'Barbecue / Braai', 'Live Bands', 'Biking'],
    gender: 'male',
    seeking: 'female',
    childrenCount: 1,
    intent: 'Funny',
    reviews: [
      {
        id: 'rev_3',
        reviewerName: 'Sipho N.',
        rating: 5,
        comment: 'Funniest guy in Kumalo hands down! Made me laugh throughout our coffee chat.',
        createdAt: '2026-08-02T15:00:00Z'
      }
    ],
    averageRating: 5.0,
    bouncerStatus: 'verified',
    bouncerNotes: 'Passport & employment verified by Bouncer.',
    compatibilityScore: 95,
    height: "6'1\"",
    relationshipGoal: 'Fun dates & good times',
    isFeatured: true,
    createdAt: '2026-08-02T11:30:00Z'
  },
  {
    id: 'p3',
    name: 'Rudo Mpofu',
    age: 28,
    city: 'Victoria Falls',
    subLocation: 'Elephant Hills Suburbs',
    location: 'Victoria Falls, Zimbabwe',
    bio: 'Safari lodge manager & wildlife lover. Seeking a genuine life partner ready to settle down and start a family.',
    occupation: 'Lodge Manager',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Wildlife Safaris', 'Sunset Cruises', 'Photography', 'Organic Gardening'],
    gender: 'female',
    seeking: 'male',
    childrenCount: 0,
    intent: 'Marriage',
    reviews: [
      {
        id: 'rev_4',
        reviewerName: 'Farai K.',
        rating: 5,
        comment: 'Warm-hearted, respectful, and very passionate about nature.',
        createdAt: '2026-08-04T09:00:00Z'
      }
    ],
    averageRating: 5.0,
    bouncerStatus: 'vip_approved',
    bouncerNotes: 'VIP Bouncer Verified. Clean background check.',
    compatibilityScore: 96,
    height: "5'8\"",
    relationshipGoal: 'Marriage',
    isFeatured: true,
    createdAt: '2026-08-03T14:15:00Z'
  },
  {
    id: 'p4',
    name: 'Farai Chiweshe',
    age: 32,
    city: 'Harare',
    subLocation: 'Avondale',
    location: 'Harare (Avondale), Zimbabwe',
    bio: 'Chartered accountant, proud father of 2, and amateur chef. Looking for a serious partner to build a happy home with.',
    occupation: 'Chartered Accountant',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Cooking', 'Chess', 'Financial Planning', 'Road Trips'],
    gender: 'male',
    seeking: 'female',
    childrenCount: 2,
    intent: 'Marriage',
    reviews: [
      {
        id: 'rev_5',
        reviewerName: 'Nyasha Z.',
        rating: 5,
        comment: 'Very mature, responsible dad, and an absolute gentleman.',
        createdAt: '2026-08-05T11:00:00Z'
      }
    ],
    averageRating: 5.0,
    bouncerStatus: 'verified',
    bouncerNotes: 'Bouncer ID Check Passed. Verified genuine singleton father.',
    compatibilityScore: 93,
    height: "6'0\"",
    relationshipGoal: 'Marriage & Family',
    isFeatured: false,
    createdAt: '2026-08-04T09:00:00Z'
  },
  {
    id: 'p5',
    name: 'Nyasha Sibanda',
    age: 25,
    city: 'Mutare',
    subLocation: 'Murambi',
    location: 'Mutare (Murambi), Zimbabwe',
    bio: 'Fashion entrepreneur & meme queen! I love funny banters, rooftop dinners, and spontaneous dance offs!',
    occupation: 'Fashion Boutique Owner',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Fashion', 'Memes & Humor', 'Afrobeats', 'Coffee Shops'],
    gender: 'female',
    seeking: 'male',
    childrenCount: 0,
    intent: 'Funny',
    reviews: [
      {
        id: 'rev_6',
        reviewerName: 'Blessing T.',
        rating: 4.8,
        comment: 'High energy, hilarious, and super stylish!',
        createdAt: '2026-08-05T14:00:00Z'
      }
    ],
    averageRating: 4.8,
    bouncerStatus: 'verified',
    bouncerNotes: 'Selfie matched & National ID approved.',
    compatibilityScore: 94,
    height: "5'6\"",
    relationshipGoal: 'Fun dates & good energy',
    isFeatured: false,
    createdAt: '2026-08-04T16:20:00Z'
  },
  {
    id: 'p6',
    name: 'Tinashe Dube',
    age: 29,
    city: 'Gweru',
    subLocation: 'Lundi Park',
    location: 'Gweru (Lundi Park), Zimbabwe',
    bio: 'Lecturer at Midlands State University. Passionate about literature, history, and funny pub quizzes!',
    occupation: 'University Lecturer',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Books', 'Pub Quizzes', 'History', 'Acoustic Guitar'],
    gender: 'male',
    seeking: 'female',
    childrenCount: 0,
    intent: 'Marriage',
    reviews: [
      {
        id: 'rev_7',
        reviewerName: 'Melody M.',
        rating: 5,
        comment: 'Incredibly cultured and hilarious conversation partner.',
        createdAt: '2026-08-05T16:00:00Z'
      }
    ],
    averageRating: 5.0,
    bouncerStatus: 'verified',
    bouncerNotes: 'Bouncer Staff Approved.',
    compatibilityScore: 91,
    height: "5'11\"",
    relationshipGoal: 'Long-term / Marriage',
    isFeatured: false,
    createdAt: '2026-08-05T08:45:00Z'
  },
  {
    id: 'p7',
    name: 'Tarisiro Bvumbe',
    age: 26,
    city: 'Chitungwiza',
    subLocation: 'Seke',
    location: 'Chitungwiza (Seke), Zimbabwe',
    bio: 'Graphic designer & podcaster. Mother to 1 adorable girl. Looking for a funny, loving partner who appreciates humor and hard work.',
    occupation: 'Digital Designer',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    ],
    interests: ['Podcasting', 'Graphic Art', 'Family Outings', 'Amapiano'],
    gender: 'female',
    seeking: 'male',
    childrenCount: 1,
    intent: 'Marriage',
    reviews: [
      {
        id: 'rev_8',
        reviewerName: 'Simba K.',
        rating: 4.9,
        comment: 'Super kind mother with a great sense of humor!',
        createdAt: '2026-08-06T09:00:00Z'
      }
    ],
    averageRating: 4.9,
    bouncerStatus: 'verified',
    bouncerNotes: 'Verified Single Mom on Bouncer platform.',
    compatibilityScore: 92,
    height: "5'5\"",
    relationshipGoal: 'Marriage',
    isFeatured: false,
    createdAt: '2026-08-05T12:00:00Z'
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
      'Name, Age, Children & Location visibility',
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
      'Filter singles by Zimbabwe Sub-location & Marriage Intent',
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
      'Access to Verified Reviews & Ratings',
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
  occupation: 'Financial Analyst',
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
