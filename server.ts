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
  const PORT = 3000;

  app.use(express.json());

  // In-memory persistent database states
  let profiles: SingleProfile[] = [...INITIAL_PROFILES];
  let users: User[] = [MOCK_ADMIN_USER, MOCK_DEMO_USER];
  let currentUser: User = MOCK_DEMO_USER;
  let transactions: PaymentTransaction[] = [...MOCK_TRANSACTIONS];
  let matchOrders: MatchOrder[] = [...MOCK_MATCH_ORDERS];

  // API ROUTE 1: Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API ROUTE 2: Auth Endpoints
  app.get('/api/auth/me', (_req, res) => {
    res.json({ user: currentUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    if (role === 'admin' || email === 'admin@bouncer.date') {
      currentUser = MOCK_ADMIN_USER;
      return res.json({ success: true, user: currentUser, token: 'admin_session_token' });
    }
    const found = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (found) {
      currentUser = found;
      return res.json({ success: true, user: currentUser, token: 'user_session_token' });
    }
    // Default to demo user if not found or guest login
    currentUser = MOCK_DEMO_USER;
    res.json({ success: true, user: currentUser, token: 'user_demo_token' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, name, age, location, gender, seeking, bio, occupation } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name,
      age: Number(age) || 25,
      location: location || 'New York, NY',
      role: 'user',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: bio || 'New single on Dating with Bouncer!',
      occupation: occupation || 'Professional',
      gender: gender || 'female',
      seeking: seeking || 'male',
      interests: ['Dating', 'Coffee', 'Music'],
      bouncerVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    currentUser = newUser;

    // Also auto-create a SingleProfile so the user displays in the Singles directory!
    const newProfile: SingleProfile = {
      id: `p_${Date.now()}`,
      name: newUser.name,
      age: newUser.age,
      location: newUser.location,
      bio: newUser.bio || 'Recently joined single seeking genuine connections.',
      occupation: newUser.occupation || 'Professional',
      photos: [newUser.avatar],
      interests: newUser.interests || ['Dating'],
      gender: newUser.gender || 'female',
      seeking: newUser.seeking || 'male',
      bouncerStatus: 'pending_check',
      bouncerNotes: 'Awaiting Bouncer identity and photo review.',
      compatibilityScore: 90,
      height: "5'7\"",
      relationshipGoal: 'Long-term relationship',
      createdAt: new Date().toISOString()
    };

    profiles.unshift(newProfile);

    res.json({ success: true, user: newUser, profile: newProfile });
  });

  app.put('/api/auth/profile', (req, res) => {
    const { name, age, location, bio, occupation, gender, seeking, interests, avatar } = req.body;
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    currentUser = {
      ...currentUser,
      ...(name && { name }),
      ...(age && { age: Number(age) }),
      ...(location && { location }),
      ...(bio && { bio }),
      ...(occupation && { occupation }),
      ...(gender && { gender }),
      ...(seeking && { seeking }),
      ...(interests && { interests }),
      ...(avatar && { avatar })
    };

    // Update in users array
    const uIdx = users.findIndex(u => u.id === currentUser.id);
    if (uIdx !== -1) {
      users[uIdx] = currentUser;
    }

    // Sync user's associated SingleProfile if exists or create if missing
    let pIdx = profiles.findIndex(p => p.name.toLowerCase() === currentUser.name.toLowerCase());
    if (pIdx !== -1) {
      profiles[pIdx] = {
        ...profiles[pIdx],
        name: currentUser.name,
        age: currentUser.age,
        location: currentUser.location,
        bio: currentUser.bio || profiles[pIdx].bio,
        occupation: currentUser.occupation || profiles[pIdx].occupation,
        gender: currentUser.gender || profiles[pIdx].gender,
        seeking: currentUser.seeking || profiles[pIdx].seeking,
        interests: currentUser.interests || profiles[pIdx].interests,
        photos: avatar ? [avatar, ...profiles[pIdx].photos.slice(1)] : profiles[pIdx].photos
      };
    } else {
      const newProf: SingleProfile = {
        id: `p_${Date.now()}`,
        name: currentUser.name,
        age: currentUser.age,
        location: currentUser.location,
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
        createdAt: new Date().toISOString()
      };
      profiles.unshift(newProf);
    }

    res.json({ success: true, user: currentUser });
  });

  // API ROUTE 3: Profiles Endpoint (Name, Age, Location, Bouncer Filters)
  app.get('/api/profiles', (req, res) => {
    let result = [...profiles];
    const { search, gender, bouncerStatus, location } = req.query;

    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.location.toLowerCase().includes(q) ||
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

    if (location && location !== 'all') {
      const locQ = (location as string).toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(locQ));
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

  // Admin / User Add Profile
  app.post('/api/profiles', (req, res) => {
    const { name, age, location, bio, occupation, photos, interests, gender, seeking, height, relationshipGoal, bouncerStatus, bouncerNotes } = req.body;
    if (!name || !age || !location) {
      return res.status(400).json({ error: 'Name, Age, and Location are required.' });
    }

    const newProfile: SingleProfile = {
      id: `p_${Date.now()}`,
      name,
      age: Number(age),
      location,
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
      createdAt: new Date().toISOString()
    };

    profiles.unshift(newProfile);
    res.json({ success: true, profile: newProfile });
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
