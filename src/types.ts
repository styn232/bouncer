export type BouncerStatus = 'verified' | 'vip_approved' | 'pending_check' | 'bounced';

export interface SingleProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  occupation: string;
  photos: string[];
  interests: string[];
  gender: 'female' | 'male' | 'non-binary';
  seeking: 'female' | 'male' | 'everyone';
  bouncerStatus: BouncerStatus;
  bouncerNotes: string;
  compatibilityScore: number; // e.g. 98
  height: string;
  relationshipGoal: string; // e.g. "Long-term relationship", "VIP Lounge dates", etc.
  isFeatured?: boolean;
  createdAt: string;
}

export type SubscriptionPlanId = 'free' | 'bouncer_pass' | 'vip_monthly' | 'ultimate_access';

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  location: string;
  role: 'user' | 'admin';
  subscriptionPlan: SubscriptionPlanId;
  subscriptionStatus: 'active' | 'canceled' | 'none';
  subscriptionExpiresAt?: string;
  avatar: string;
  bio?: string;
  occupation?: string;
  gender?: 'female' | 'male' | 'non-binary';
  seeking?: 'female' | 'male' | 'everyone';
  interests?: string[];
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
