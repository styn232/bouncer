export type BouncerStatus = 'verified' | 'vip_approved' | 'pending_check' | 'bounced';

export type DatingIntent = 'Marriage' | 'Funny' | 'Casual';

export interface ProfileReview {
  id: string;
  reviewerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface SingleProfile {
  id: string;
  name: string;
  age: number;
  location: string; // full display location string e.g. "Harare (Borrowdale), Zimbabwe"
  city?: string; // e.g. "Harare"
  subLocation?: string; // e.g. "Borrowdale"
  bio: string;
  whatsappNumber?: string; // e.g. "+263 77 123 4567"
  photos: string[];
  interests: string[];
  gender: 'female' | 'male' | 'non-binary';
  seeking: 'female' | 'male' | 'everyone';
  childrenCount: number; // 0 for none, 1, 2, 3+
  intent: DatingIntent; // "Marriage" or "Funny"
  reviews: ProfileReview[];
  averageRating: number; // calculated rating e.g. 4.8
  bouncerStatus: BouncerStatus;
  bouncerNotes: string;
  compatibilityScore: number; // e.g. 98
  height: string;
  relationshipGoal: string; // e.g. "Marriage", "VIP Lounge dates", etc.
  isFeatured?: boolean;
  isNew?: boolean;
  viewsCount?: number;
  isOnline?: boolean;
  lastActive?: string;
  isBoosted?: boolean;
  boostExpiresAt?: string;
  createdAt: string;
}

export type SubscriptionPlanId =
  | 'free'
  | 'test_1_single'
  | 'starter_3_or_4'
  | 'starter_10_singles'
  | 'bundle_5_to_10'
  | 'vip_15_singles'
  | 'vip_30_singles'
  | 'vip_monthly'
  | 'ultimate_access'
  | 'bouncer_pass'
  | string;

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  iconUrl: string;
  tagline?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  location: string;
  city?: string;
  subLocation?: string;
  role: 'user' | 'admin';
  subscriptionPlan: SubscriptionPlanId;
  subscriptionStatus: 'active' | 'canceled' | 'none';
  subscriptionExpiresAt?: string;
  avatar: string;
  bio?: string;
  whatsappNumber?: string;
  gender?: 'female' | 'male' | 'non-binary';
  seeking?: 'female' | 'male' | 'everyone';
  childrenCount?: number;
  intent?: DatingIntent;
  interests?: string[];
  purchasedProfileIds?: string[]; // IDs of profile WhatsApp numbers unlocked after payment
  bouncerVerified: boolean;
  walletBalance?: number; // Account funds balance in USD
  isOnline?: boolean;
  superLikesCount?: number;
  boostsCount?: number;
  blockedUserIds?: string[];
  privacySettings?: {
    whoCanMessage: 'everyone' | 'matches_only' | 'verified_only';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
  createdAt: string;
}

export type DateType = 'coffee' | 'dinner' | 'vip_lounge' | 'weekend_getaway' | 'speed_date';

export interface CartItem {
  profileId: string;
  profile: SingleProfile;
  dateType: DateType;
  icebreakerMessage: string;
  preferredTime: string;
  addedAt: string;
}

export interface MatchOrder {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'pending_bouncer_approval' | 'accepted' | 'scheduled' | 'completed';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  tagline: string;
  features: string[];
  badge: string;
  popular?: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  planId: SubscriptionPlanId;
  planName: string;
  cardLast4: string;
  cardBrand: string;
  status: 'pending_approval' | 'succeeded' | 'processing' | 'failed' | 'rejected' | 'pending';
  date: string;
  reference?: string;
  pollUrl?: string;
  paynowReference?: string;
  profileIds?: string[];
}

export interface AdminStats {
  totalProfiles: number;
  verifiedProfiles: number;
  pendingBouncerQueue: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalCartOrders: number;
  totalReels?: number;
  totalStories?: number;
  totalPosts?: number;
  totalReports?: number;
}

// Reel item for short-form vertical videos
export interface ReelItem {
  id: string;
  profileId: string;
  authorName: string;
  authorAvatar: string;
  authorLocation: string;
  videoUrl: string;
  posterUrl?: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

// 24-hour Status Story item
export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  type: 'image' | 'video' | 'text';
  caption?: string;
  viewsCount: number;
  createdAt: string;
  expiresAt: string;
}

// Social Feed Post item
export interface FeedPostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLocation: string;
  authorVerified?: boolean;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  isLiked?: boolean;
  comments: FeedPostComment[];
  createdAt: string;
}

// Direct Message & Conversation items
export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: SingleProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

// Verification Request item
export interface VerificationSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  selfieUrl: string;
  idDocumentUrl: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

// User Report item
export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  targetType: 'profile' | 'post' | 'reel' | 'message';
  category: 'fake_account' | 'scam' | 'harassment' | 'spam' | 'nudity' | 'other';
  reason: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: string;
}

// Ad Campaign item
export interface AdCampaign {
  id: string;
  title: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl: string;
  placement: 'homepage' | 'feed' | 'reels' | 'sidebar';
  impressions: number;
  clicks: number;
  active: boolean;
}

// Notification item
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'like' | 'match' | 'message' | 'verification' | 'system';
  read: boolean;
  createdAt: string;
}

