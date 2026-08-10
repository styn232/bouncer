import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PROFILES,
  SUBSCRIPTION_PLANS,
  MOCK_ADMIN_USER,
  MOCK_DEMO_USER,
  MOCK_TRANSACTIONS,
  MOCK_MATCH_ORDERS
} from './src/data/mockData';
import { SingleProfile, User, PaymentTransaction, MatchOrder, BouncerStatus, SubscriptionPlanId } from './src/types';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // In-memory persistent database states
  let profiles: SingleProfile[] = INITIAL_PROFILES.map((p, i) => ({
    ...p,
    viewsCount: p.viewsCount || Math.floor((i + 1) * 27 + 14)
  }));
  let users: User[] = [MOCK_ADMIN_USER, MOCK_DEMO_USER];
  let currentUser: User | null = MOCK_DEMO_USER;
  let transactions: PaymentTransaction[] = [...MOCK_TRANSACTIONS];
  let matchOrders: MatchOrder[] = [...MOCK_MATCH_ORDERS];

  // API ROUTE 1: Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT });
  });

  // API ROUTE 2: Auth Endpoints
  app.get('/api/auth/me', (_req, res) => {
    res.json({ user: currentUser });
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
      occupation: 'Professional',
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
    res.json({ success: true, user: currentUser, profile: newProfile });
  });

  app.put('/api/auth/profile', (req, res) => {
    const { name, email, whatsappNumber, age, city, subLocation, childrenCount, intent, location, bio, occupation, gender, seeking, interests, avatar, bouncerVerified } = req.body;
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
      ...(occupation && { occupation }),
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
        occupation: currentUser.occupation || profiles[pIdx].occupation,
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
        occupation: currentUser.occupation || 'Professional',
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
      const q = (search as string).toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.location.toLowerCase().includes(q) ||
             (p.city && p.city.toLowerCase().includes(q)) ||
             (p.subLocation && p.subLocation.toLowerCase().includes(q)) ||
             p.occupation.toLowerCase().includes(q) ||
             p.bio.toLowerCase().includes(q)
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

    res.json(result);
  });

  app.get('/api/profiles/:id', (req, res) => {
    const profile = profiles.find(p => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
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
    const { name, age, location, city, subLocation, childrenCount, intent, bio, occupation, photos, interests, gender, seeking, height, relationshipGoal, bouncerStatus, bouncerNotes } = req.body;
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
      occupation: occupation || 'Creative Professional',
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
    res.json({ success: true, profile: newProfile });
  });

  app.post('/api/profiles/:id/view', (req, res) => {
    const idx = profiles.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    profiles[idx].viewsCount = (profiles[idx].viewsCount || 0) + 1;
    res.json({ success: true, viewsCount: profiles[idx].viewsCount });
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

  // API ROUTE 4: Subscriptions & Payment Gateway Processing
  app.get('/api/subscriptions/plans', (_req, res) => {
    res.json(SUBSCRIPTION_PLANS);
  });

  app.post('/api/payment/subscribe', (req, res) => {
    const { planId, cardHolderName, cardNumber, expDate, cvc, zipCode } = req.body;

    if (!planId || !cardNumber || !cvc) {
      return res.status(400).json({ error: 'Payment details incomplete' });
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid subscription plan selected' });
    }

    // Mask card digits
    const cleanCard = cardNumber.replace(/\D/g, '');
    const last4 = cleanCard.slice(-4) || '4242';
    const cardBrand = cleanCard.startsWith('5') ? 'Mastercard' : cleanCard.startsWith('3') ? 'Amex' : 'Visa';

    // Record Payment Transaction
    const transaction: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser ? currentUser.id : 'usr_guest',
      userName: cardHolderName || (currentUser ? currentUser.name : 'Valued Single'),
      userEmail: currentUser ? currentUser.email : 'guest@bouncer.date',
      amount: plan.price,
      planId: plan.id,
      planName: plan.name,
      cardLast4: last4,
      cardBrand,
      status: 'succeeded',
      date: new Date().toISOString()
    };

    transactions.unshift(transaction);

    // Update current user membership status
    if (currentUser) {
      currentUser = {
        ...currentUser,
        subscriptionPlan: plan.id as SubscriptionPlanId,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        bouncerVerified: true
      };

      const uIdx = users.findIndex(u => u.id === currentUser.id);
      if (uIdx !== -1) {
        users[uIdx] = currentUser;
      }
    }

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
      transaction,
      user: currentUser
    });
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
      totalCartOrders
    });
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
