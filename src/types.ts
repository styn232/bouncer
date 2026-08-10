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
  occupation?: string; // Optional field, omitted from card displays
  whatsappNumber?: string; // e.g. "+263 77 123 4567" - ONLY displayed after payment!
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
  createdAt: string;
}

export type SubscriptionPlanId = 'free' | 'starter_3_or_4' | 'vip_15_singles' | 'vip_monthly' | 'ultimate_access' | 'bouncer_pass' | string;

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  iconUrl: string;
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
  occupation?: string;
  gender?: 'female' | 'male' | 'non-binary';
  seeking?: 'female' | 'male' | 'everyone';
  childrenCount?: number;
  intent?: DatingIntent;
  interests?: string[];
  purchasedProfileIds?: string[]; // IDs of profile WhatsApp numbers unlocked after payment
  bouncerVerified: boolean;
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
  status: 'succeeded' | 'processing' | 'failed';
  date: string;
}

export interface AdminStats {
  totalProfiles: number;
  verifiedProfiles: number;
  pendingBouncerQueue: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalCartOrders: number;
}
