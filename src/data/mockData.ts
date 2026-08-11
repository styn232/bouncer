import { SingleProfile, SubscriptionPlan, User, PaymentTransaction, MatchOrder, SiteSettings } from '../types';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'DATING WITH BOUNCER',
  logoUrl: '',
  iconUrl: '',
  tagline: 'Real People. Real Connections. Real Possibilities.'
};

export const INITIAL_PROFILES: SingleProfile[] = [
  {
    id: 'p1',
    name: 'Chiedza Moyo',
    age: 27,
    city: 'Harare',
    subLocation: 'Borrowdale',
    location: 'Harare (Borrowdale), Zimbabwe',
    bio: 'Software engineer & tea enthusiast. Ready for a committed partner who values family, deep chats, and laughter.',
    whatsappNumber: '+263 77 123 4567',
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
    isNew: true,
    createdAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Tarisai Ndlovu',
    age: 30,
    city: 'Bulawayo',
    subLocation: 'Kumalo',
    location: 'Bulawayo (Kumalo), Zimbabwe',
    bio: 'Civil engineer and weekend stand-up comedy fan! Life is too short not to laugh every single day. Let us make jokes together!',
    whatsappNumber: '+263 78 987 6543',
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
    whatsappNumber: '+263 71 222 3333',
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
    whatsappNumber: '+263 77 444 5555',
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
    whatsappNumber: '+263 73 555 6666',
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
    whatsappNumber: '+263 77 666 7777',
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
    whatsappNumber: '+263 78 777 8888',
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

export const INITIAL_REELS = [
  {
    id: 'reel_1',
    profileId: 'p1',
    authorName: 'Chiedza Moyo',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    authorLocation: 'Harare (Borrowdale)',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-looking-at-the-camera-and-smiling-34440-large.mp4',
    caption: 'Sunday coffee vibes in Borrowdale! ☕ What is your favourite date spot in Harare? ❤️ #DatingWithBouncer #VerifiedSingle',
    likesCount: 142,
    commentsCount: 28,
    isLiked: false,
    createdAt: '2026-08-09T10:00:00Z'
  },
  {
    id: 'reel_2',
    profileId: 'p2',
    authorName: 'Tarisai Ndlovu',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    authorLocation: 'Bulawayo (Kumalo)',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-smiling-at-the-camera-42895-large.mp4',
    caption: 'Making joke about traditional braai sauce in Bulawayo! Laughs are 100% guaranteed on our first date. 😂🔥 #BouncerComedy',
    likesCount: 98,
    commentsCount: 19,
    isLiked: true,
    createdAt: '2026-08-08T15:30:00Z'
  },
  {
    id: 'reel_3',
    profileId: 'p3',
    authorName: 'Rudo Mpofu',
    authorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=200',
    authorLocation: 'Victoria Falls',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-a-sunny-afternoon-41151-large.mp4',
    caption: 'Sunset cruise over Zambezi river in Vic Falls. Looking for a partner to share these views with! 🌅 #VictoriaFalls #BouncerDating',
    likesCount: 210,
    commentsCount: 34,
    isLiked: false,
    createdAt: '2026-08-07T18:15:00Z'
  }
];

export const INITIAL_STORIES = [
  {
    id: 'story_1',
    authorId: 'p1',
    authorName: 'Chiedza',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    type: 'image' as const,
    caption: 'Morning tea session before starting coding! 🍵✨',
    viewsCount: 89,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'story_2',
    authorId: 'p3',
    authorName: 'Rudo',
    authorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=200',
    mediaUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    type: 'image' as const,
    caption: 'Wildlife safari tour in Victoria Falls 🦁 Safari date anyone?',
    viewsCount: 112,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'story_3',
    authorId: 'p5',
    authorName: 'Nyasha',
    authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
    type: 'image' as const,
    caption: 'New fashion design preview! 💃 #MutareSingle',
    viewsCount: 67,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_POSTS = [
  {
    id: 'post_1',
    authorId: 'p1',
    authorName: 'Chiedza Moyo',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    authorLocation: 'Harare (Borrowdale)',
    authorVerified: true,
    content: 'Question for all the gentlemen on Dating with Bouncer: What is your idea of a perfect first date in Harare? Dinner at a nice restaurant or a casual Sunday coffee & walk?',
    mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    likesCount: 34,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        authorName: 'Kudzai Mugo',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        text: 'A quiet coffee date at Avondale or Borrowdale Lane is always best for great conversations!',
        createdAt: '2026-08-09T11:20:00Z'
      }
    ],
    createdAt: '2026-08-09T09:30:00Z'
  },
  {
    id: 'post_2',
    authorId: 'p2',
    authorName: 'Tarisai Ndlovu',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    authorLocation: 'Bulawayo',
    authorVerified: true,
    content: 'A good sense of humor is the #1 green flag in a long-term partner. Agree or disagree? Comment below! 😂👇',
    likesCount: 48,
    isLiked: true,
    comments: [],
    createdAt: '2026-08-08T14:15:00Z'
  }
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv_p1',
    participant: INITIAL_PROFILES[0],
    lastMessage: 'I loved reading your profile! Are you free for a coffee in Borrowdale this weekend?',
    lastMessageTime: '10:42 AM',
    unreadCount: 1,
    isOnline: true
  },
  {
    id: 'conv_p3',
    participant: INITIAL_PROFILES[2],
    lastMessage: 'Victoria Falls sounds amazing! When are you hosting your next safari date?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'usr_demo',
    title: 'New Match Alert! ❤️',
    message: 'You and Chiedza Moyo matched! Start a conversation now.',
    type: 'match' as const,
    read: false,
    createdAt: '2026-08-10T08:00:00Z'
  },
  {
    id: 'notif_2',
    userId: 'usr_demo',
    title: 'Profile View Alert 👁️',
    message: 'Rudo Mpofu from Victoria Falls viewed your profile!',
    type: 'like' as const,
    read: true,
    createdAt: '2026-08-09T18:30:00Z'
  },
  {
    id: 'notif_3',
    userId: 'usr_demo',
    title: 'Bouncer Verification Approved ✅',
    message: 'Your Bouncer Identity Verification has been approved by Chief Admin.',
    type: 'verification' as const,
    read: true,
    createdAt: '2026-08-07T12:00:00Z'
  }
];

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

