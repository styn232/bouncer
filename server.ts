import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PROFILES,
  SUBSCRIPTION_PLANS,
  MOCK_ADMIN_USER,
  MOCK_DEMO_USER,
  MOCK_TRANSACTIONS,
  MOCK_MATCH_ORDERS,
  INITIAL_REELS,
  INITIAL_STORIES,
  INITIAL_POSTS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADS,
  INITIAL_VERIFICATIONS
} from './src/data/mockData';
import { SingleProfile, User, PaymentTransaction, MatchOrder, BouncerStatus, SubscriptionPlanId, ReelItem, StoryItem, FeedPost, Conversation, DirectMessage, VerificationSubmission, ReportItem, AdCampaign, NotificationItem, SiteSettings } from './src/types';
import { Paynow } from 'paynow';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const paynow = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID || '25938',
    process.env.PAYNOW_INTEGRATION_KEY || 'd20d903a-d31a-47f1-8a65-5f9c9d3f0c07'
  );
  paynow.resultUrl = 'https://datingwithbouncer.com/api/paynow/result';
  paynow.returnUrl = process.env.PAYNOW_RETURN_URL || 'https://datingwithbouncer.com/payment-success';

  function activateUserSubscription(tx: PaymentTransaction) {
    tx.status = 'succeeded';
    const targetUser = users.find(u => u.id === tx.userId || (u.email && tx.userEmail && u.email.toLowerCase() === tx.userEmail.toLowerCase()));
    if (targetUser) {
      targetUser.subscriptionPlan = tx.planId as SubscriptionPlanId;
      targetUser.subscriptionStatus = 'active';
      targetUser.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      targetUser.bouncerVerified = true;

      if (currentUser && currentUser.id === targetUser.id) {
        currentUser = { ...targetUser };
      }
    }

    const existingNotif = notifications.find(n => n.userId === tx.userId && n.title.includes('Payment Approved'));
    if (!existingNotif) {
      notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: tx.userId,
        title: '🎉 Payment Approved!',
        message: `Your payment of $${tx.amount} for ${tx.planName} has been verified & approved! VIP features activated.`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  // In-memory persistent database states
  let siteSettings: SiteSettings = {
    siteName: 'DATING WITH BOUNCER',
    tagline: 'Real People. Real Connections. Real Possibilities.',
    logoUrl: '',
    iconUrl: ''
  };
  let profiles: SingleProfile[] = [];
  let users: User[] = [MOCK_ADMIN_USER, MOCK_DEMO_USER];
  let currentUser: User | null = MOCK_ADMIN_USER;
  let transactions: PaymentTransaction[] = [...MOCK_TRANSACTIONS];
  let matchOrders: MatchOrder[] = [...MOCK_MATCH_ORDERS];

  let reels: ReelItem[] = [...INITIAL_REELS];
  let stories: StoryItem[] = [...INITIAL_STORIES];
  let posts: FeedPost[] = [...INITIAL_POSTS];
  let conversations: Conversation[] = [...INITIAL_CONVERSATIONS];
  let messages: DirectMessage[] = [];
  let notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  let ads: AdCampaign[] = [...INITIAL_ADS];
  let verifications: VerificationSubmission[] = [...INITIAL_VERIFICATIONS];
  let reports: ReportItem[] = [];
  let userLikes: Record<string, string[]> = {
    'usr_demo': ['p_tendai']
  };
  let userMatches: Record<string, string[]> = {
    'usr_demo': ['p_tendai']
  };

  // API ROUTE 1: Health Check & Site Settings
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT });
  });

  app.get('/api/settings', (_req, res) => {
    res.json(siteSettings);
  });

  app.put('/api/settings', (req, res) => {
    const { siteName, logoUrl, iconUrl, tagline } = req.body;
    siteSettings = {
      ...siteSettings,
      ...(siteName && { siteName }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(iconUrl !== undefined && { iconUrl }),
      ...(tagline && { tagline })
    };
    res.json({ success: true, siteSettings });
  });

  // API ROUTE 2: Auth Endpoints
  app.get('/api/auth/me', (_req, res) => {
    res.json({ user: currentUser });
  });

  app.post('/api/auth/sync', (req, res) => {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: 'No user data provided' });
    }
    const existing = users.find(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
    if (existing) {
      currentUser = existing;
    } else {
      users.push(user);
      currentUser = user;
    }
    res.json({ success: true, user: currentUser });
  });

  // Admin Account Registration
  app.post('/api/auth/admin/register', (req, res) => {
    const { name, email, adminKey } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required for Admin account.' });
    }
    if (adminKey && !['admin123', 'bouncer2025', 'admin', 'pass'].includes(adminKey.toLowerCase())) {
      return res.status(401).json({ error: 'Invalid Security Passcode for Admin registration.' });
    }

    const newAdmin: User = {
      id: `usr_admin_${Date.now()}`,
      email,
      name,
      age: 30,
      role: 'admin',
      subscriptionPlan: 'vip_15_singles',
      subscriptionStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bouncerVerified: true,
      city: 'Harare',
      subLocation: 'HQ',
      location: 'Harare HQ, Zimbabwe',
      childrenCount: 0,
      intent: 'Marriage',
      createdAt: new Date().toISOString()
    };

    users.push(newAdmin);
    currentUser = newAdmin;
    res.json({ success: true, user: currentUser, token: 'admin_session_token' });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, role, adminKey } = req.body;
    
    // Admin login path
    if (role === 'admin' || (email && email.toLowerCase().includes('admin'))) {
      if (adminKey && !['admin123', 'bouncer2025', 'admin', 'pass'].includes(adminKey.toLowerCase())) {
        return res.status(401).json({ error: 'Invalid Admin Passcode.' });
      }
      const existingAdmin = users.find(u => u.role === 'admin' && u.email.toLowerCase() === (email || '').toLowerCase()) || MOCK_ADMIN_USER;
      currentUser = existingAdmin;
      return res.json({ success: true, user: currentUser, token: 'admin_session_token' });
    }

    // Standard User login path
    if (!email) {
      return res.status(400).json({ error: 'Email address is required to log in.' });
    }

    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      currentUser = found;
      return res.json({ success: true, user: currentUser, token: 'user_session_token' });
    }

    // Strict non-demo behavior when email is not found
    return res.status(404).json({
      error: 'No account found with this email. Please click "Create Account" to sign up first!'
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    currentUser = null;
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, name, age, city, subLocation, location, gender, childrenCount, intent, bio, whatsappNumber } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name,
      age: Number(age) || 25,
      city: city || 'Harare',
      subLocation: subLocation || 'Borrowdale',
      location: location || `${city || 'Harare'} (${subLocation || 'Borrowdale'}), Zimbabwe`,
      childrenCount: Number(childrenCount) || 0,
      intent: intent || 'Marriage',
      role: 'user',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: bio || 'New single on Dating with Bouncer!',
      whatsappNumber: whatsappNumber || '+263 77 123 4567',
      gender: gender || 'female',
      interests: ['Dating', 'Coffee', 'Music'],
      bouncerVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    currentUser = newUser;

    // Auto-create SingleProfile so user displays in directory
    const newProfile: SingleProfile = {
      id: `p_${Date.now()}`,
      name: newUser.name,
      age: newUser.age,
      city: newUser.city,
      subLocation: newUser.subLocation,
      location: newUser.location,
      childrenCount: newUser.childrenCount,
      intent: newUser.intent,
      seeking: newUser.gender === 'male' ? 'female' : 'male',
      bio: newUser.bio || 'Recently joined single seeking genuine connections.',
      whatsappNumber: newUser.whatsappNumber,
      photos: [newUser.avatar],
      interests: newUser.interests || ['Dating'],
      gender: newUser.gender || 'female',
      bouncerStatus: 'pending_check',
      bouncerNotes: 'Awaiting Bouncer identity and photo review.',
      compatibilityScore: 92,
      height: "5'7\"",
      relationshipGoal: 'Marriage / Long-term',
      reviews: [],
      averageRating: 5.0,
      isNew: true,
      createdAt: new Date().toISOString()
    };

    profiles.unshift(newProfile);

    // Broadcast notification to ALL users when new single registers
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'all',
      title: '🔥 New Single Joined!',
      message: `${newUser.name}, ${newUser.age} from ${newUser.location} just joined Dating With Bouncer! Check out their profile.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);

    res.json({ success: true, user: currentUser, profile: newProfile });
  });

  app.put('/api/auth/profile', (req, res) => {
    const { name, email, whatsappNumber, age, city, subLocation, childrenCount, intent, location, bio, gender, seeking, interests, avatar, bouncerVerified } = req.body;
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const fullLocation = location || (city && subLocation ? `${city} (${subLocation}), Zimbabwe` : currentUser.location);

    currentUser = {
      ...currentUser,
      ...(name && { name }),
      ...(email && { email }),
      ...(whatsappNumber && { whatsappNumber }),
      ...(age && { age: Number(age) }),
      ...(city && { city }),
      ...(subLocation && { subLocation }),
      ...(childrenCount !== undefined && { childrenCount: Number(childrenCount) }),
      ...(intent && { intent }),
      location: fullLocation,
      ...(bio && { bio }),
      ...(gender && { gender }),
      ...(seeking && { seeking }),
      ...(interests && { interests }),
      ...(avatar && { avatar }),
      ...(bouncerVerified !== undefined && { bouncerVerified: Boolean(bouncerVerified) })
    };

    // Update in users array
    const uIdx = users.findIndex(u => u.id === currentUser.id);
    if (uIdx !== -1) {
      users[uIdx] = currentUser;
    }

    // Sync user's associated SingleProfile if exists or create if missing
    let pIdx = profiles.findIndex(p => p.id === currentUser.id || p.name.toLowerCase() === currentUser.name.toLowerCase());
    if (pIdx !== -1) {
      profiles[pIdx] = {
        ...profiles[pIdx],
        name: currentUser.name,
        age: currentUser.age,
        city: currentUser.city || profiles[pIdx].city,
        subLocation: currentUser.subLocation || profiles[pIdx].subLocation,
        location: currentUser.location,
        childrenCount: currentUser.childrenCount ?? profiles[pIdx].childrenCount,
        intent: currentUser.intent || profiles[pIdx].intent,
        whatsappNumber: currentUser.whatsappNumber || profiles[pIdx].whatsappNumber,
        bio: currentUser.bio || profiles[pIdx].bio,
        gender: currentUser.gender || profiles[pIdx].gender,
        seeking: currentUser.seeking || profiles[pIdx].seeking,
        interests: currentUser.interests || profiles[pIdx].interests,
        photos: avatar ? [avatar, ...profiles[pIdx].photos.slice(1)] : profiles[pIdx].photos,
        bouncerStatus: currentUser.bouncerVerified ? 'verified' : profiles[pIdx].bouncerStatus
      };
    } else {
      const newProf: SingleProfile = {
        id: `p_${Date.now()}`,
        name: currentUser.name,
        age: currentUser.age,
        city: currentUser.city || 'Harare',
        subLocation: currentUser.subLocation || 'Borrowdale',
        location: currentUser.location,
        childrenCount: currentUser.childrenCount || 0,
        intent: currentUser.intent || 'Marriage',
        bio: currentUser.bio || 'Single looking for love.',
        photos: [currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'],
        interests: currentUser.interests || ['Coffee', 'Travel'],
        gender: currentUser.gender || 'female',
        seeking: currentUser.seeking || 'male',
        bouncerStatus: currentUser.bouncerVerified ? 'verified' : 'pending_check',
        bouncerNotes: currentUser.bouncerVerified ? 'Bouncer verified user.' : 'Pending Bouncer review.',
        compatibilityScore: 92,
        height: "5'8\"",
        relationshipGoal: 'Meaningful connections',
        reviews: [],
        averageRating: 5.0,
        createdAt: new Date().toISOString()
      };
      profiles.unshift(newProf);
    }

    res.json({ success: true, user: currentUser });
  });

  // API ROUTE 3: Profiles Endpoint (Name, Age, Location, Intent, Children, Bouncer Filters)
  app.get('/api/profiles', (req, res) => {
    let result = [...profiles];
    const { search, gender, bouncerStatus, location, city, subLocation, minAge, maxAge, childrenCount, intent } = req.query;

    if (search) {
      const q = (search as string).toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.location.toLowerCase().includes(q) ||
             (p.city && p.city.toLowerCase().includes(q)) ||
             (p.subLocation && p.subLocation.toLowerCase().includes(q)) ||
             p.bio.toLowerCase().includes(q) ||
             p.intent.toLowerCase().includes(q) ||
             (p.relationshipGoal && p.relationshipGoal.toLowerCase().includes(q)) ||
             (p.bouncerStatus && p.bouncerStatus.toLowerCase().includes(q)) ||
             (p.interests && p.interests.some(i => i.toLowerCase().includes(q)))
      );
    }

    if (gender && gender !== 'all') {
      result = result.filter(p => p.gender === gender);
    }

    if (bouncerStatus && bouncerStatus !== 'all') {
      result = result.filter(p => p.bouncerStatus === bouncerStatus);
    }

    if (city && city !== 'all') {
      result = result.filter(p => p.city?.toLowerCase() === (city as string).toLowerCase());
    }

    if (subLocation && subLocation !== 'all') {
      result = result.filter(p => p.subLocation?.toLowerCase() === (subLocation as string).toLowerCase());
    }

    if (location && location !== 'all') {
      const locQ = (location as string).toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(locQ));
    }

    if (minAge) {
      const min = Number(minAge);
      if (!isNaN(min)) result = result.filter(p => p.age >= min);
    }

    if (maxAge) {
      const max = Number(maxAge);
      if (!isNaN(max)) result = result.filter(p => p.age <= max);
    }

    if (childrenCount && childrenCount !== 'all') {
      if (childrenCount === '3+') {
        result = result.filter(p => (p.childrenCount ?? 0) >= 3);
      } else {
        const count = Number(childrenCount);
        if (!isNaN(count)) result = result.filter(p => (p.childrenCount ?? 0) === count);
      }
    }

    if (intent && intent !== 'all') {
      result = result.filter(p => p.intent === intent);
    }

    // Mask/hide WhatsApp contact numbers from public API response unless caller is Admin
    const sanitizedResult = result.map(p => {
      if (currentUser && currentUser.role === 'admin') {
        return p;
      }
      const { whatsappNumber, ...rest } = p;
      return {
        ...rest,
        whatsappNumber: undefined
      };
    });

    res.json(sanitizedResult);
  });

  app.get('/api/profiles/:id', (req, res) => {
    const profile = profiles.find(p => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (currentUser && currentUser.role === 'admin') {
      return res.json(profile);
    }
    const { whatsappNumber, ...rest } = profile;
    res.json({
      ...rest,
      whatsappNumber: undefined
    });
  });

  // Post a review on a single profile
  app.post('/api/profiles/:id/reviews', (req, res) => {
    const { reviewerName, rating, comment } = req.body;
    const idx = profiles.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const newRev = {
      id: `rev_${Date.now()}`,
      reviewerName: reviewerName || (currentUser ? currentUser.name : 'Single Member'),
      rating: Number(rating) || 5,
      comment: comment || 'Wonderful date experience with Bouncer clearance!',
      createdAt: new Date().toISOString()
    };

    const currentRevs = profiles[idx].reviews || [];
    const updatedRevs = [newRev, ...currentRevs];
    const avg = updatedRevs.reduce((acc, r) => acc + r.rating, 0) / updatedRevs.length;

    profiles[idx].reviews = updatedRevs;
    profiles[idx].averageRating = parseFloat(avg.toFixed(1));

    res.json({ success: true, profile: profiles[idx], review: newRev });
  });

  // Admin / User Add Profile
  app.post('/api/profiles', (req, res) => {
    const { name, age, location, city, subLocation, childrenCount, intent, bio, photos, interests, gender, seeking, height, relationshipGoal, bouncerStatus, bouncerNotes } = req.body;
    if (!name || !age || !location) {
      return res.status(400).json({ error: 'Name, Age, and Location are required.' });
    }

    const newProfile: SingleProfile = {
      id: `p_${Date.now()}`,
      name,
      age: Number(age),
      location,
      city: city || 'Harare',
      subLocation: subLocation || 'Avondale',
      childrenCount: childrenCount !== undefined ? Number(childrenCount) : 0,
      intent: intent || 'Marriage',
      reviews: [],
      averageRating: 5.0,
      bio: bio || 'Fresh profile on Dating with Bouncer.',
      photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'],
      interests: Array.isArray(interests) ? interests : ['Fine Dining', 'Travel', 'Art'],
      gender: gender || 'female',
      seeking: seeking || 'male',
      bouncerStatus: (bouncerStatus as BouncerStatus) || 'verified',
      bouncerNotes: bouncerNotes || 'Approved by Bouncer Admin.',
      compatibilityScore: Math.floor(Math.random() * 10) + 90,
      height: height || "5'8\"",
      relationshipGoal: relationshipGoal || 'Long-term relationship',
      isNew: true,
      viewsCount: 1,
      createdAt: new Date().toISOString()
    };

    profiles.unshift(newProfile);

    // Broadcast notification to ALL users
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'all',
      title: '🔥 New Single Joined!',
      message: `${newProfile.name}, ${newProfile.age} from ${newProfile.location} just joined Dating With Bouncer! Check out their profile.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);

    res.json({ success: true, profile: newProfile });
  });

  app.post('/api/profiles/:id/view', (req, res) => {
    const idx = profiles.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    profiles[idx].viewsCount = (profiles[idx].viewsCount || 0) + 1;

    const viewerName = req.body?.viewerName || (currentUser ? currentUser.name : 'A single member');
    const targetProfile = profiles[idx];

    // Create notification for target profile owner
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: targetProfile.id,
      title: '👀 New Profile View',
      message: `${viewerName} has viewed your profile!`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotif);

    res.json({
      success: true,
      viewsCount: profiles[idx].viewsCount,
      notification: newNotif
    });
  });

  app.put('/api/profiles/:id', (req, res) => {
    const idx = profiles.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    profiles[idx] = { ...profiles[idx], ...req.body };
    res.json({ success: true, profile: profiles[idx] });
  });

  app.delete('/api/profiles/:id', (req, res) => {
    profiles = profiles.filter(p => p.id !== req.params.id);
    res.json({ success: true, message: 'Profile deleted successfully' });
  });

  // Admin: Update Bouncer Status
  app.put('/api/admin/profiles/:id/bouncer-status', (req, res) => {
    const { status, notes } = req.body;
    const idx = profiles.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profiles[idx].bouncerStatus = status as BouncerStatus;
    if (notes) {
      profiles[idx].bouncerNotes = notes;
    }

    res.json({ success: true, profile: profiles[idx] });
  });

  // Admin: List all Users
  app.get('/api/admin/users', (_req, res) => {
    res.json(users);
  });

  // Admin: Upgrade User Subscription & Bouncer Status
  app.put('/api/admin/users/:id/upgrade', (req, res) => {
    const { planId, bouncerVerified } = req.body;
    const userId = req.params.id;
    
    const uIdx = users.findIndex(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (uIdx === -1) {
      return res.status(404).json({ error: 'User account not found' });
    }

    users[uIdx].subscriptionPlan = (planId as SubscriptionPlanId) || 'starter_3_or_4';
    users[uIdx].subscriptionStatus = 'active';
    users[uIdx].subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    if (bouncerVerified !== undefined) {
      users[uIdx].bouncerVerified = !!bouncerVerified;
    } else {
      users[uIdx].bouncerVerified = true;
    }

    // Also update current logged in user if it's the same user
    if (currentUser && currentUser.id === users[uIdx].id) {
      currentUser = users[uIdx];
    }

    res.json({ success: true, user: users[uIdx], message: `Successfully upgraded user ${users[uIdx].name} to ${users[uIdx].subscriptionPlan}` });
  });

  // Admin: Delete/Remove User Account & Profile
  app.delete('/api/admin/users/:id', (req, res) => {
    const targetId = req.params.id;
    
    // Find user to get name/email
    const userTarget = users.find(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
    const targetName = userTarget?.name || '';

    // Filter out user from users array
    users = users.filter(u => u.id !== targetId && u.email.toLowerCase() !== targetId.toLowerCase());
    
    // Filter out profile by profile id or matching name
    profiles = profiles.filter(p => p.id !== targetId && p.name.toLowerCase() !== targetName.toLowerCase());

    res.json({ success: true, message: 'User and single profile deleted successfully from Bouncer system.' });
  });

  // API ROUTE 4: Subscriptions & Paynow Payment Gateway Processing
  app.get('/api/subscriptions/plans', (_req, res) => {
    res.json(SUBSCRIPTION_PLANS);
  });

  // POST /api/payment/subscribe - Paynow Initiation Endpoint
  app.post('/api/payment/subscribe', async (req, res) => {
    try {
      const { planId, profileIds } = req.body;

      if (!planId) {
        return res.status(400).json({ error: 'Subscription plan is required' });
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return res.status(400).json({ error: 'Invalid subscription plan selected' });
      }

      const userEmail = currentUser ? currentUser.email : 'guest@bouncer.date';
      const userName = currentUser ? currentUser.name : 'Valued Single';
      const userId = currentUser ? currentUser.id : 'usr_guest';

      const reference = `BOUNCER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const payment = paynow.createPayment(reference, userEmail);
      payment.add(plan.name, plan.price);

      const response = await paynow.send(payment);

      if (!response || !response.success) {
        const errorMsg = response?.error || 'Failed to initiate Paynow transaction';
        console.error('Paynow initiation failed:', errorMsg);
        return res.status(500).json({ success: false, error: errorMsg });
      }

      const transaction: PaymentTransaction = {
        id: `tx_${Date.now()}`,
        reference,
        paynowReference: '',
        userId,
        userName,
        userEmail,
        amount: plan.price,
        planId: plan.id,
        planName: plan.name,
        profileIds: Array.isArray(profileIds) ? profileIds : [],
        cardLast4: '',
        cardBrand: 'Paynow',
        status: 'pending',
        pollUrl: response.pollUrl || '',
        date: new Date().toISOString()
      };

      transactions.unshift(transaction);

      notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: 'usr_admin',
        title: '💳 Paynow Payment Initiated',
        message: `New Paynow transaction of $${plan.price} initiated by ${userName} (${userEmail}) for ${plan.name} [Ref: ${reference}].`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        reference,
        transaction,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl
      });
    } catch (err: any) {
      console.error('Error initiating Paynow payment:', err?.message || err);
      return res.status(500).json({ success: false, error: 'Internal server error processing payment initiation' });
    }
  });

  // POST /api/payment/verify-and-get-numbers - Returns WhatsApp contact numbers ONLY after Paynow confirms Paid
  app.post('/api/payment/verify-and-get-numbers', async (req, res) => {
    try {
      const { reference, profileIds } = req.body;

      if (!reference) {
        return res.status(400).json({ success: false, paid: false, error: 'Reference parameter is required' });
      }

      const tx = transactions.find(t => t.reference === reference || t.id === reference);
      if (!tx) {
        return res.status(404).json({ success: false, paid: false, error: 'Transaction reference not found' });
      }

      // If transaction is not marked succeeded yet, poll Paynow directly
      if (tx.status !== 'succeeded' && tx.pollUrl) {
        try {
          const pollResult = await paynow.pollTransaction(tx.pollUrl);
          if (pollResult) {
            if (pollResult.paynowReference) {
              tx.paynowReference = pollResult.paynowReference;
            }
            const statusStr = (pollResult.status || '').toString().toLowerCase();
            if (statusStr === 'paid' || statusStr === 'awaiting delivery' || statusStr === 'delivered') {
              activateUserSubscription(tx);
            } else if (statusStr === 'cancelled' || statusStr === 'failed') {
              tx.status = 'failed';
            }
          }
        } catch (pollErr: any) {
          console.error(`Paynow live poll error for ref ${reference}:`, pollErr?.message || pollErr);
        }
      }

      // STRICT GATE: Check if status is Paid / succeeded
      if (tx.status !== 'succeeded') {
        return res.status(200).json({
          success: false,
          paid: false,
          status: tx.status,
          error: `Payment has not been confirmed as Paid by Paynow yet. Current Paynow status: ${tx.status}`,
          unlockedContacts: []
        });
      }

      // Payment confirmed Paid by Paynow! Retrieve requested profile WhatsApp numbers
      const targetIds: string[] = (tx.profileIds && tx.profileIds.length > 0)
        ? tx.profileIds
        : (Array.isArray(profileIds) ? profileIds : []);

      const unlockedContacts = targetIds.map(pid => {
        const prof = profiles.find(p => p.id === pid);
        if (!prof) return null;
        return {
          profileId: prof.id,
          name: prof.name,
          age: prof.age,
          location: prof.location,
          city: prof.city,
          photos: prof.photos,
          whatsappNumber: prof.whatsappNumber || '+263 71 578 6859'
        };
      }).filter(Boolean);

      return res.json({
        success: true,
        paid: true,
        status: 'succeeded',
        reference: tx.reference,
        paynowReference: tx.paynowReference,
        unlockedContacts
      });
    } catch (err: any) {
      console.error('Error verifying Paynow payment:', err?.message || err);
      return res.status(500).json({ success: false, paid: false, error: 'Server error verifying Paynow transaction' });
    }
  });

  // POST /api/paynow/result - Paynow Async Result/Callback Endpoint
  app.post('/api/paynow/result', async (req, res) => {
    try {
      const data = req.body || {};
      const ref = data.reference || data.merchantreference || req.query.reference;

      if (!ref) {
        return res.status(400).json({ error: 'Missing reference in callback' });
      }

      const tx = transactions.find(t => t.reference === ref || t.id === ref);
      if (!tx) {
        console.warn(`Paynow callback received for unknown transaction reference: ${ref}`);
        return res.status(200).json({ status: 'ok', message: 'Transaction reference not found' });
      }

      if (tx.status === 'succeeded') {
        return res.status(200).json({ status: 'ok', message: 'Transaction already succeeded' });
      }

      let isPaid = false;

      if (tx.pollUrl) {
        try {
          const pollResult = await paynow.pollTransaction(tx.pollUrl);
          if (pollResult) {
            if (pollResult.paynowReference) {
              tx.paynowReference = pollResult.paynowReference;
            }
            const statusStr = (pollResult.status || '').toString().toLowerCase();
            if (statusStr === 'paid' || statusStr === 'awaiting delivery' || statusStr === 'delivered') {
              isPaid = true;
            } else if (statusStr === 'cancelled' || statusStr === 'failed') {
              tx.status = 'failed';
            }
          }
        } catch (pollErr: any) {
          console.error(`Paynow poll error for ref ${ref}:`, pollErr?.message || pollErr);
        }
      }

      if (!isPaid && data.status) {
        const rawStatus = data.status.toString().toLowerCase();
        if (rawStatus === 'paid' || rawStatus === 'awaiting delivery' || rawStatus === 'delivered') {
          isPaid = true;
        }
      }

      if (isPaid) {
        activateUserSubscription(tx);
        return res.status(200).json({ status: 'ok', message: 'Payment confirmed & subscription activated' });
      }

      return res.status(200).json({ status: 'ok', message: 'Callback received, payment pending' });
    } catch (err: any) {
      console.error('Error handling Paynow result callback:', err?.message || err);
      return res.status(500).json({ error: 'Server error processing callback' });
    }
  });

  // GET /api/payment/status/:reference - Payment Status Verification Endpoint
  app.get('/api/payment/status/:reference', async (req, res) => {
    try {
      const ref = req.params.reference;
      const tx = transactions.find(t => t.reference === ref || t.id === ref);

      if (!tx) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (tx.status === 'succeeded') {
        return res.json({ success: true, status: tx.status, transaction: tx });
      }

      if (tx.pollUrl) {
        try {
          const pollResult = await paynow.pollTransaction(tx.pollUrl);
          if (pollResult) {
            if (pollResult.paynowReference) {
              tx.paynowReference = pollResult.paynowReference;
            }
            const statusStr = (pollResult.status || '').toString().toLowerCase();
            if (statusStr === 'paid' || statusStr === 'awaiting delivery' || statusStr === 'delivered') {
              activateUserSubscription(tx);
            } else if (statusStr === 'cancelled' || statusStr === 'failed') {
              tx.status = 'failed';
            }
          }
        } catch (pollErr: any) {
          console.error(`Status polling error for ref ${ref}:`, pollErr?.message || pollErr);
        }
      }

      return res.json({
        success: true,
        status: tx.status,
        transaction: tx
      });
    } catch (err: any) {
      console.error('Error fetching payment status:', err?.message || err);
      return res.status(500).json({ error: 'Failed to retrieve payment status' });
    }
  });

  // Admin Payment Approval & Rejection Routes
  app.put('/api/admin/payments/:id/approve', (req, res) => {
    const { id } = req.params;
    const tx = transactions.find(t => t.id === id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    tx.status = 'succeeded';

    // Activate subscription for the user
    const targetUser = users.find(u => u.id === tx.userId || (u.email && tx.userEmail && u.email.toLowerCase() === tx.userEmail.toLowerCase()));
    if (targetUser) {
      targetUser.subscriptionPlan = tx.planId as SubscriptionPlanId;
      targetUser.subscriptionStatus = 'active';
      targetUser.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      targetUser.bouncerVerified = true;

      if (currentUser && currentUser.id === targetUser.id) {
        currentUser = { ...targetUser };
      }
    }

    // Send user notification
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: tx.userId,
      title: '🎉 Payment Approved!',
      message: `Your payment of $${tx.amount} for ${tx.planName} has been verified & approved by Admin! VIP features activated.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Payment approved successfully!', transaction: tx });
  });

  app.put('/api/admin/payments/:id/reject', (req, res) => {
    const { id } = req.params;
    const tx = transactions.find(t => t.id === id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    tx.status = 'rejected';

    // Send user notification
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: tx.userId,
      title: '❌ Payment Rejected',
      message: `Your payment of $${tx.amount} for ${tx.planName} could not be verified by Admin. Please contact Bouncer Support.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Payment rejected.', transaction: tx });
  });

  app.get('/api/payment/transactions', (_req, res) => {
    res.json(transactions);
  });

  app.get('/api/admin/subscriptions', (_req, res) => {
    const userSubs = users.map(u => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      plan: u.subscriptionPlan,
      status: u.subscriptionStatus,
      expiresAt: u.subscriptionExpiresAt || 'N/A',
      bouncerVerified: u.bouncerVerified
    }));
    res.json({ userSubscriptions: userSubs, transactions });
  });

  // API ROUTE 5: Cart Checkout & Match Submissions
  app.post('/api/cart/checkout', (req, res) => {
    const { items, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const order: MatchOrder = {
      id: `ord_${Date.now()}`,
      userId: currentUser ? currentUser.id : 'usr_guest',
      userName: currentUser ? currentUser.name : 'Valued Single',
      items,
      totalAmount: currentUser?.subscriptionPlan === 'vip_monthly' || currentUser?.subscriptionPlan === 'ultimate_access' ? 0 : 19.99,
      paymentMethod: paymentMethod || 'VIP Bouncer Member Pass',
      status: 'pending_bouncer_approval',
      createdAt: new Date().toISOString()
    };

    matchOrders.unshift(order);

    res.json({
      success: true,
      message: 'Date Cart match requests submitted! Bouncer is verifying match schedules.',
      order
    });
  });

  app.get('/api/matches', (_req, res) => {
    if (currentUser.role === 'admin') {
      return res.json(matchOrders);
    }
    const userOrders = matchOrders.filter(o => o.userId === currentUser.id);
    res.json(userOrders);
  });

  // API ROUTE 6: Admin Overview Metrics
  app.get('/api/admin/stats', (_req, res) => {
    const totalProfiles = profiles.length;
    const verifiedProfiles = profiles.filter(p => p.bouncerStatus === 'verified' || p.bouncerStatus === 'vip_approved').length;
    const pendingBouncerQueue = profiles.filter(p => p.bouncerStatus === 'pending_check').length;
    const activeSubscriptions = users.filter(u => u.subscriptionStatus === 'active' && u.subscriptionPlan !== 'free').length;
    const monthlyRevenue = transactions.reduce((acc, tx) => acc + (tx.status === 'succeeded' ? tx.amount : 0), 0);
    const totalCartOrders = matchOrders.length;

    res.json({
      totalProfiles,
      verifiedProfiles,
      pendingBouncerQueue,
      activeSubscriptions,
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      totalCartOrders,
      totalReels: reels.length,
      totalStories: stories.length,
      totalPosts: posts.length,
      totalReports: reports.length
    });
  });

  // ==========================================
  // DISCOVER LIKES & SWIPE MATCHING ENDPOINTS
  // ==========================================
  app.post('/api/likes', (req, res) => {
    const { targetProfileId, type } = req.body; // type: 'like' | 'pass' | 'superlike'
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    if (!targetProfileId) return res.status(400).json({ error: 'Target profile ID required' });

    const uId = currentUser.id;
    if (!userLikes[uId]) userLikes[uId] = [];
    if (!userMatches[uId]) userMatches[uId] = [];

    let isMatch = false;
    if (type === 'like' || type === 'superlike') {
      if (!userLikes[uId].includes(targetProfileId)) {
        userLikes[uId].push(targetProfileId);
      }

      // Check for mutual match or auto-match logic for high compatibility profiles
      const targetProf = profiles.find(p => p.id === targetProfileId);
      const otherUserLikes = userLikes[targetProfileId] || [];
      const hasMutual = otherUserLikes.includes(uId) || (targetProf && targetProf.compatibilityScore >= 90);

      if (hasMutual) {
        isMatch = true;
        if (!userMatches[uId].includes(targetProfileId)) userMatches[uId].push(targetProfileId);
        if (!userMatches[targetProfileId]) userMatches[targetProfileId] = [];
        if (!userMatches[targetProfileId].includes(uId)) userMatches[targetProfileId].push(uId);

        // Auto-create notification for both
        notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: uId,
          title: 'IT\'S A MATCH! ❤️',
          message: `You and ${targetProf?.name || 'a single'} liked each other! Start chatting now.`,
          type: 'match',
          read: false,
          createdAt: new Date().toISOString()
        });

        // Ensure conversation exists
        let existingConv = conversations.find(c => c.participant.id === targetProfileId);
        if (!existingConv && targetProf) {
          conversations.unshift({
            id: `conv_${targetProfileId}`,
            participant: targetProf,
            lastMessage: 'You matched! Say hello to start your story ❤️',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            isOnline: true
          });
        }
      }
    }

    res.json({
      success: true,
      isMatch,
      targetProfile: profiles.find(p => p.id === targetProfileId)
    });
  });

  app.get('/api/who-liked-me', (_req, res) => {
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    const myId = currentUser.id;

    // Profiles that liked myId
    const likerIds = Object.keys(userLikes).filter(uId => userLikes[uId]?.includes(myId) || userLikes[uId]?.includes('p1'));
    const likers = profiles.filter(p => likerIds.includes(p.id) || p.isFeatured);

    res.json(likers);
  });

  // ==========================================
  // BOUNCER REELS ENDPOINTS
  // ==========================================
  app.get('/api/reels', (_req, res) => {
    res.json(reels);
  });

  app.post('/api/reels', (req, res) => {
    const { videoUrl, caption } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    if (!videoUrl) return res.status(400).json({ error: 'Video URL required' });

    const newReel: ReelItem = {
      id: `reel_${Date.now()}`,
      profileId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorLocation: currentUser.location,
      videoUrl,
      caption: caption || 'Check out my new Bouncer Reel! ❤️',
      likesCount: 1,
      commentsCount: 0,
      isLiked: true,
      createdAt: new Date().toISOString()
    };

    reels.unshift(newReel);
    res.json({ success: true, reel: newReel });
  });

  app.post('/api/reels/:id/like', (req, res) => {
    const reel = reels.find(r => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    reel.isLiked = !reel.isLiked;
    reel.likesCount += reel.isLiked ? 1 : -1;
    res.json({ success: true, likesCount: reel.likesCount, isLiked: reel.isLiked });
  });

  // ==========================================
  // STORIES ENDPOINTS
  // ==========================================
  app.get('/api/stories', (_req, res) => {
    res.json(stories);
  });

  app.post('/api/stories', (req, res) => {
    const { mediaUrl, caption, type } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    if (!mediaUrl) return res.status(400).json({ error: 'Media URL required' });

    const newStory: StoryItem = {
      id: `story_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      mediaUrl,
      caption: caption || '',
      type: type || 'image',
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    stories.unshift(newStory);
    res.json({ success: true, story: newStory });
  });

  // ==========================================
  // SOCIAL FEED POSTS ENDPOINTS
  // ==========================================
  app.get('/api/posts', (_req, res) => {
    res.json(posts);
  });

  app.post('/api/posts', (req, res) => {
    const { content, mediaUrl } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    if (!content) return res.status(400).json({ error: 'Post content required' });

    const newPost: FeedPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorLocation: currentUser.location,
      authorVerified: currentUser.bouncerVerified,
      content,
      mediaUrl,
      likesCount: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    res.json({ success: true, post: newPost });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.isLiked = !post.isLiked;
    post.likesCount += post.isLiked ? 1 : -1;
    res.json({ success: true, likesCount: post.likesCount, isLiked: post.isLiked });
  });

  app.post('/api/posts/:id/comments', (req, res) => {
    const { text } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = {
      id: `c_${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString()
    };

    post.comments.push(comment);
    res.json({ success: true, comment });
  });

  // ==========================================
  // DIRECT MESSAGING & CHAT ENDPOINTS
  // ==========================================
  app.get('/api/conversations', (_req, res) => {
    res.json(conversations);
  });

  app.get('/api/conversations/:id/messages', (req, res) => {
    const convMsgs = messages.filter(m => m.conversationId === req.params.id);
    res.json(convMsgs);
  });

  app.post('/api/messages', (req, res) => {
    const { conversationId, text, mediaUrl } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    if (!text && !mediaUrl) return res.status(400).json({ error: 'Message text or media required' });

    const newMsg: DirectMessage = {
      id: `m_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text || '',
      mediaUrl,
      read: true,
      createdAt: new Date().toISOString()
    };

    messages.push(newMsg);

    // Update last message in conversation
    const convIdx = conversations.findIndex(c => c.id === conversationId);
    if (convIdx !== -1) {
      conversations[convIdx].lastMessage = text || 'Sent an attachment';
      conversations[convIdx].lastMessageTime = 'Just now';
    }

    res.json({ success: true, message: newMsg });
  });

  // ==========================================
  // NOTIFICATIONS ENDPOINTS
  // ==========================================
  app.get('/api/notifications', (_req, res) => {
    res.json(notifications);
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const notif = notifications.find(n => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  // ==========================================
  // VERIFICATIONS & REPORTS ENDPOINTS
  // ==========================================
  app.post('/api/verification/request', (req, res) => {
    const { selfieUrl, idDocumentUrl, phoneNumber } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });

    const newVerif: VerificationSubmission = {
      id: `verif_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      selfieUrl: selfieUrl || currentUser.avatar,
      idDocumentUrl: idDocumentUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400',
      phoneNumber: phoneNumber || currentUser.whatsappNumber || '+263 77 123 4567',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    verifications.unshift(newVerif);
    res.json({ success: true, verification: newVerif });
  });

  app.get('/api/verifications', (_req, res) => {
    res.json(verifications);
  });

  app.put('/api/verifications/:id/status', (req, res) => {
    const { status, notes } = req.body;
    const verif = verifications.find(v => v.id === req.params.id);
    if (!verif) return res.status(404).json({ error: 'Verification request not found' });

    verif.status = status;
    if (notes) verif.notes = notes;

    if (status === 'approved') {
      const u = users.find(usr => usr.id === verif.userId);
      if (u) u.bouncerVerified = true;
      const p = profiles.find(prof => prof.id === verif.userId || prof.name === verif.userName);
      if (p) p.bouncerStatus = 'verified';
    }

    res.json({ success: true, verification: verif });
  });

  app.post('/api/reports', (req, res) => {
    const { targetId, targetName, targetType, category, reason } = req.body;
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });

    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      targetId,
      targetName,
      targetType: targetType || 'profile',
      category: category || 'other',
      reason: reason || 'Violation of Bouncer Safety guidelines.',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reports.unshift(newReport);
    res.json({ success: true, report: newReport });
  });

  app.get('/api/reports', (_req, res) => {
    res.json(reports);
  });

  // ==========================================
  // ADS & BOOST ENDPOINTS
  // ==========================================
  app.get('/api/ads', (_req, res) => {
    res.json(ads.filter(a => a.active));
  });

  app.post('/api/admin/ads', (req, res) => {
    const { title, sponsorName, imageUrl, linkUrl, placement } = req.body;
    const newAd: AdCampaign = {
      id: `ad_${Date.now()}`,
      title,
      sponsorName,
      imageUrl,
      linkUrl,
      placement: placement || 'homepage',
      impressions: 1,
      clicks: 0,
      active: true
    };
    ads.unshift(newAd);
    res.json({ success: true, ad: newAd });
  });

  app.post('/api/boost', (req, res) => {
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    const pIdx = profiles.findIndex(p => p.id === currentUser.id || p.name === currentUser.name);
    if (pIdx !== -1) {
      profiles[pIdx].isBoosted = true;
      profiles[pIdx].boostExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }
    res.json({ success: true, message: 'Your profile is now Boosted for 30 minutes! 🔥' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bouncer Dating Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
