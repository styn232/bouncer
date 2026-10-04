import express from 'express';
import path from 'path';
import fs from 'fs';
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
import { ZIMBABWE_PROVINCES, ZIMBABWE_LOCATIONS, getProvinceForCity, ZIMBABWE_LOCATIONS_CSV } from './src/data/zimbabweLocations';
import { Paynow } from 'paynow';

function capitalizeName(str?: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    })
    .join(' ');
}

const DEFAULT_STARTER_PROFILES: SingleProfile[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Strict Security Middleware: Block scans/exploits targeting sensitive files (.env, .git, proc, source files)
  app.use((req, res, next) => {
    const p = (req.path || '').toLowerCase();
    if (
      p.includes('/.env') ||
      p.includes('/.git') ||
      p.includes('/proc/') ||
      p.includes('data_storage.json') ||
      p.includes('server.ts') ||
      p.includes('server.cjs') ||
      p.endsWith('.env') ||
      p.endsWith('.env.example') ||
      p.endsWith('.backup') ||
      p.endsWith('.sample') ||
      p.endsWith('.bak') ||
      p.endsWith('.conf') ||
      p.endsWith('.ini') ||
      p.endsWith('.sh') ||
      p.startsWith('/var/') ||
      p.startsWith('/etc/')
    ) {
      return res.status(404).send('Not Found');
    }
    next();
  });

  const STORAGE_FILE = path.join(process.cwd(), 'data_storage.json');
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create uploads directory:', e);
    }
  }

  app.use('/uploads', express.static(uploadsDir));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const PAYNOW_ID = process.env.PAYNOW_INTEGRATION_ID || '25938';
  const PAYNOW_KEY = process.env.PAYNOW_INTEGRATION_KEY || 'd20d903a-d31a-47f1-8a65-5f9c9d3f0c07';
  const PAYNOW_MERCHANT_EMAIL = process.env.PAYNOW_MERCHANT_EMAIL || 'francismugebe@gmail.com';
  const IS_PAYNOW_TEST_MODE = process.env.PAYNOW_TEST_MODE === 'true';

  const paynow = new Paynow(PAYNOW_ID, PAYNOW_KEY);
  paynow.resultUrl = process.env.PAYNOW_RESULT_URL || 'https://datingwithbouncer.com/api/paynow/result';
  paynow.returnUrl = process.env.PAYNOW_RETURN_URL || 'https://datingwithbouncer.com/payment-success';

  function getPaynowAuthEmail(customerEmail?: string): string {
    const isTestMode = process.env.PAYNOW_TEST_MODE === 'true' || IS_PAYNOW_TEST_MODE;

    // In Paynow Test Mode, Paynow strictly requires that authemail MUST NOT be the customer's email.
    // It must either be omitted or explicitly set to the registered merchant email address.
    if (isTestMode) {
      return PAYNOW_MERCHANT_EMAIL;
    }

    // In Live/Production Mode, use customer email if valid, otherwise fallback to merchant email
    if (
      customerEmail &&
      typeof customerEmail === 'string' &&
      customerEmail.includes('@') &&
      !customerEmail.includes('example.com') &&
      !customerEmail.includes('datingwithbouncer.com') &&
      !customerEmail.includes('test')
    ) {
      return customerEmail.trim();
    }

    return PAYNOW_MERCHANT_EMAIL;
  }

  // In-memory persistent database states
  let siteSettings: SiteSettings = {
    siteName: 'DATING WITH BOUNCER',
    tagline: 'Real People. Real Connections. Real Possibilities.',
    logoUrl: '',
    iconUrl: ''
  };
  let profiles: SingleProfile[] = [...DEFAULT_STARTER_PROFILES];
  let users: User[] = [MOCK_ADMIN_USER, MOCK_DEMO_USER];
  let currentUser: User | null = null;
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
  let userLikes: Record<string, string[]> = {};
  let userMatches: Record<string, string[]> = {};

  function loadPersistentData() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          profiles = data.profiles;
        }
        if (data.siteSettings && data.siteSettings.siteName) {
          siteSettings = { ...siteSettings, ...data.siteSettings };
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          users = data.users;
        }
        // Ensure the pre-registered Admin account is always present on startup
        const hasStartupAdmin = users.some(
          u => u.role === 'admin' || (u.email && u.email.toLowerCase() === MOCK_ADMIN_USER.email.toLowerCase())
        );
        if (!hasStartupAdmin) {
          users.unshift({ ...MOCK_ADMIN_USER, role: 'admin' });
        } else {
          users = users.map(u =>
            u.email && u.email.toLowerCase() === MOCK_ADMIN_USER.email.toLowerCase()
              ? { ...u, role: 'admin', bouncerVerified: true }
              : u
          );
        }
        if (Array.isArray(data.transactions)) transactions = data.transactions;
        if (Array.isArray(data.matchOrders)) matchOrders = data.matchOrders;
        if (Array.isArray(data.reels)) reels = data.reels;
        if (Array.isArray(data.stories)) stories = data.stories;
        if (Array.isArray(data.posts)) posts = data.posts;
        if (Array.isArray(data.conversations)) conversations = data.conversations;
        if (Array.isArray(data.messages)) messages = data.messages;
        if (Array.isArray(data.notifications)) notifications = data.notifications;
        if (Array.isArray(data.verifications)) verifications = data.verifications;
        if (Array.isArray(data.ads)) ads = data.ads;
        if (Array.isArray(data.reports)) reports = data.reports;
        if (data.userLikes) userLikes = data.userLikes;
        if (data.userMatches) userMatches = data.userMatches;
        console.log(`[Storage] Loaded persistent state from disk. ${profiles.length} profiles, ${users.length} users.`);
      } else {
        saveAppData();
      }
    } catch (err) {
      console.error('[Storage] Error loading persistent storage:', err);
    }
  }

  function saveAppData() {
    try {
      const payload = {
        siteSettings,
        profiles,
        users,
        transactions,
        matchOrders,
        reels,
        stories,
        posts,
        conversations,
        messages,
        notifications,
        verifications,
        ads,
        reports,
        userLikes,
        userMatches,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error saving persistent storage:', err);
    }
  }

  function findTransaction(refQuery: string | undefined): PaymentTransaction | undefined {
    if (!refQuery) return undefined;
    const cleaned = String(refQuery).trim().toLowerCase();
    return transactions.find(t => 
      (t.reference && t.reference.trim().toLowerCase() === cleaned) ||
      (t.id && t.id.trim().toLowerCase() === cleaned) ||
      (t.paynowReference && t.paynowReference.trim().toLowerCase() === cleaned) ||
      (t.pollUrl && t.pollUrl.toLowerCase().includes(cleaned))
    );
  }

  // Load persistent storage on boot
  loadPersistentData();

  function activateUserSubscription(tx: PaymentTransaction) {
    tx.status = 'succeeded';
    const targetUser = users.find(u => u.id === tx.userId || (u.email && tx.userEmail && u.email.toLowerCase() === tx.userEmail.toLowerCase()));
    if (targetUser) {
      targetUser.subscriptionPlan = tx.planId as SubscriptionPlanId;
      targetUser.subscriptionStatus = 'active';
      targetUser.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      targetUser.bouncerVerified = true;

      // Update purchased profile IDs
      if (!targetUser.purchasedProfileIds) {
        targetUser.purchasedProfileIds = [];
      }
      if (Array.isArray(tx.profileIds) && tx.profileIds.length > 0) {
        for (const pid of tx.profileIds) {
          if (!targetUser.purchasedProfileIds.includes(pid)) {
            targetUser.purchasedProfileIds.push(pid);
          }
        }
      }

      // Update unlocked singles count
      const unlockedCount = targetUser.purchasedProfileIds.length;
      if (tx.planId === 'test_1_single' || tx.planId === 'starter_1_single' || tx.amount === 3) {
        targetUser.unlockedSinglesCount = Math.max(targetUser.unlockedSinglesCount || 0, Math.max(1, unlockedCount));
      } else if (tx.planId === 'starter_3_or_4' || tx.amount === 6) {
        targetUser.unlockedSinglesCount = Math.max(targetUser.unlockedSinglesCount || 0, Math.max(3, unlockedCount));
      } else if (tx.planId === 'starter_10_singles' || tx.amount === 10) {
        targetUser.unlockedSinglesCount = Math.max(targetUser.unlockedSinglesCount || 0, Math.max(10, unlockedCount));
      } else if (tx.planId === 'vip_30_singles' || tx.amount >= 15) {
        targetUser.unlockedSinglesCount = Math.max(targetUser.unlockedSinglesCount || 0, Math.max(30, unlockedCount));
      } else {
        targetUser.unlockedSinglesCount = Math.max(targetUser.unlockedSinglesCount || 0, unlockedCount);
      }

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
        message: `Your payment of $${tx.amount} for ${tx.planName} has been verified & approved! VIP features and unlocked singles activated.`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
    saveAppData();
  }

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
    saveAppData();
    res.json({ success: true, siteSettings });
  });

  // Media / Photo Upload Endpoint
  app.post('/api/upload', (req, res) => {
    try {
      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      if (typeof image === 'string' && image.startsWith('data:image/')) {
        const matches = image.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
        if (matches) {
          const rawExt = matches[1].toLowerCase();
          const ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'svg+xml' ? 'svg' : rawExt;
          const cleanName = (name || 'upload').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20);
          const filename = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
          const filePath = path.join(uploadsDir, filename);
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(filePath, buffer);
          const fileUrl = `/uploads/${filename}`;
          return res.json({ success: true, url: fileUrl, dataUrl: image });
        }
      }

      return res.json({ success: true, url: image, dataUrl: image });
    } catch (err) {
      console.error('Error handling upload:', err);
      return res.status(500).json({ error: 'Failed to process file upload' });
    }
  });

  // API ROUTE 2: Auth Endpoints
  app.get('/api/auth/me', (_req, res) => {
    // Security: Do not auto-login visitors with a shared global server user.
    // Visitors must explicitly sign in or sign up on every visit.
    res.json({ user: null });
  });

  app.post('/api/auth/sync', (req, res) => {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: 'No user data provided' });
    }
    const existing = users.find(u => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
    if (existing) {
      currentUser = existing;
    } else {
      users.push(user);
      currentUser = user;
    }
    saveAppData();
    res.json({ success: true, user: currentUser });
  });

  const isAuthorizedAdmin = (req: express.Request): boolean => {
    const roleHeader = (req.headers['x-user-role'] as string || '').toLowerCase().trim();
    return roleHeader === 'admin';
  };

  // Firebase Auth Sync & Backend Opening Endpoint
  app.post('/api/auth/firebase-sync', (req, res) => {
    const { uid, email, name, role, adminKey, avatar, photoURL, gender } = req.body;
    if (!email && !uid) {
      return res.status(400).json({ error: 'Firebase UID or email is required.' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const hasValidAdminKey = Boolean(adminKey && ['admin123', 'bouncer2025', 'admin', 'pass'].includes(String(adminKey).toLowerCase().trim()));
    const existingByEmailOrUid = users.find(u => (uid && u.id === uid) || (u.email && u.email.toLowerCase() === normalizedEmail));
    const isPreExistingAdmin = Boolean(
      (existingByEmailOrUid && existingByEmailOrUid.role === 'admin') ||
      normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() ||
      normalizedEmail === 'admin@bouncer.date'
    );

    if (role === 'admin' && !hasValidAdminKey && !isPreExistingAdmin) {
      return res.status(401).json({ error: 'Invalid Admin credentials or account is not authorized as Admin.' });
    }

    const isAdminAccount = isPreExistingAdmin || (role === 'admin' && hasValidAdminKey);
    const effectiveRole: 'user' | 'featured' | 'admin' = isAdminAccount
      ? 'admin'
      : (existingByEmailOrUid?.role || 'user');

    let existing = existingByEmailOrUid;

    if (existing) {
      if (isAdminAccount) {
        existing.role = 'admin';
        existing.bouncerVerified = true;
        if (existing.subscriptionPlan === 'free') {
          existing.subscriptionPlan = 'vip_30_singles';
        }
      }
      if (name && !existing.name) existing.name = name;
      if (avatar || photoURL) existing.avatar = avatar || photoURL || existing.avatar;
      currentUser = existing;
    } else {
      const newUser: User = {
        id: uid || `usr_${Date.now()}`,
        email: normalizedEmail,
        name: name || (isAdminAccount ? 'Super Admin' : normalizedEmail.split('@')[0] || 'Member'),
        age: 28,
        role: effectiveRole,
        isFeatured: effectiveRole === 'featured',
        subscriptionPlan: isAdminAccount ? 'vip_30_singles' : 'free',
        subscriptionStatus: 'active',
        avatar: avatar || photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        city: 'Harare',
        subLocation: 'Borrowdale',
        location: 'Harare, Zimbabwe',
        childrenCount: 0,
        intent: 'Marriage',
        gender: isAdminAccount ? undefined : (gender || 'female'),
        bouncerVerified: isAdminAccount,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      currentUser = newUser;
    }

    saveAppData();

    res.json({ 
      success: true, 
      user: currentUser, 
      isAdmin: currentUser ? currentUser.role === 'admin' : false,
      backendAccess: (currentUser && currentUser.role === 'admin') ? 'unlocked' : 'standard'
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Standard Sign In path (supports regular users, featured users, and Super Admin / upgraded admins signing in)
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email address is required to sign in.' });
    }

    const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (found) {
      if (found.role === 'admin' || normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() || normalizedEmail === 'admin@bouncer.date') {
        found.role = 'admin';
        found.bouncerVerified = true;
        currentUser = found;
        return res.json({ success: true, user: currentUser, token: 'admin_session_token' });
      }
      currentUser = found;
      return res.json({ success: true, user: currentUser, token: 'user_session_token' });
    }

    // Check if signing in with the pre-registered Super Admin email
    if (normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() || normalizedEmail === 'admin@bouncer.date') {
      if (!password) {
        return res.status(401).json({ error: 'Password is required to sign in.' });
      }
      currentUser = { ...MOCK_ADMIN_USER, role: 'admin' };
      return res.json({ success: true, user: currentUser, token: 'admin_session_token' });
    }

    // Strict non-demo behavior when email is not found
    return res.status(404).json({
      error: 'No account found with this email. Please click "Sign Up" to create an account first!'
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    currentUser = null;
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { id, email, name, age, province, city, subLocation, location, gender, childrenCount, intent, bio, whatsappNumber, hivStatus, avatar } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const formattedName = capitalizeName(name);
    const normalizedHiv = hivStatus && (hivStatus.includes('+') || hivStatus.toLowerCase().includes('pos')) ? 'HIV+' : 'HIV-';
    const selectedCity = city || 'Harare';
    const selectedSubLocation = subLocation || 'Borrowdale';
    const selectedProvince = province || getProvinceForCity(selectedCity);
    const userAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    const isSuperAdmin = normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() || normalizedEmail === 'admin@bouncer.date';

    // Check if user with this email already exists
    const existingIdx = users.findIndex(u => u.email && u.email.toLowerCase() === normalizedEmail);
    let registeredUser: User;

    if (existingIdx !== -1) {
      const existingUser = users[existingIdx];
      registeredUser = {
        ...existingUser,
        name: formattedName || existingUser.name,
        age: Number(age) || existingUser.age || 25,
        province: selectedProvince,
        city: selectedCity,
        subLocation: selectedSubLocation,
        location: location || `${selectedCity} (${selectedSubLocation}), Zimbabwe`,
        childrenCount: childrenCount !== undefined ? Number(childrenCount) : (existingUser.childrenCount || 0),
        intent: intent || existingUser.intent || 'Marriage',
        hivStatus: normalizedHiv,
        role: isSuperAdmin ? 'admin' : (existingUser.role || 'user'),
        avatar: avatar || existingUser.avatar || userAvatar,
        whatsappNumber: whatsappNumber || existingUser.whatsappNumber || '+263 77 123 4567',
        gender: gender || existingUser.gender || 'female'
      };
      users[existingIdx] = registeredUser;
    } else {
      registeredUser = {
        id: id || `usr_${Date.now()}`,
        email: String(email).trim(),
        name: formattedName,
        age: Number(age) || 25,
        province: selectedProvince,
        city: selectedCity,
        subLocation: selectedSubLocation,
        location: location || `${selectedCity} (${selectedSubLocation}), Zimbabwe`,
        childrenCount: Number(childrenCount) || 0,
        intent: intent || 'Marriage',
        hivStatus: normalizedHiv,
        role: isSuperAdmin ? 'admin' : 'user',
        subscriptionPlan: isSuperAdmin ? 'vip_30_singles' : 'free',
        subscriptionStatus: 'active',
        avatar: userAvatar,
        bio: bio || 'New single on Dating with Bouncer!',
        whatsappNumber: whatsappNumber || '+263 77 123 4567',
        gender: gender || 'female',
        interests: ['Dating', 'Coffee', 'Music'],
        bouncerVerified: isSuperAdmin,
        walletBalance: 0,
        createdAt: new Date().toISOString()
      };
      users.push(registeredUser);
    }

    currentUser = registeredUser;

    // Auto-create or update SingleProfile so user displays in directory immediately
    const existingProfIdx = profiles.findIndex(
      p => p.id === `p_${registeredUser.id}` || (p.name.toLowerCase() === registeredUser.name.toLowerCase() && p.whatsappNumber === registeredUser.whatsappNumber)
    );

    const newProfile: SingleProfile = {
      id: existingProfIdx !== -1 ? profiles[existingProfIdx].id : `p_${Date.now()}`,
      name: registeredUser.name,
      age: registeredUser.age,
      province: registeredUser.province,
      city: registeredUser.city,
      subLocation: registeredUser.subLocation,
      location: registeredUser.location,
      childrenCount: registeredUser.childrenCount,
      intent: registeredUser.intent,
      hivStatus: registeredUser.hivStatus,
      role: registeredUser.role,
      isFeatured: registeredUser.role === 'featured' || Boolean(registeredUser.isFeatured),
      seeking: registeredUser.gender === 'male' ? 'female' : 'male',
      bio: registeredUser.bio || 'Recently joined single seeking genuine connections.',
      whatsappNumber: registeredUser.whatsappNumber || '+263 77 123 4567',
      photos: [registeredUser.avatar],
      interests: registeredUser.interests || ['Dating'],
      gender: registeredUser.gender || 'female',
      bouncerStatus: registeredUser.bouncerVerified ? 'verified' : 'pending_check',
      bouncerNotes: 'Awaiting Bouncer identity and photo review.',
      compatibilityScore: 92,
      height: "5'7\"",
      relationshipGoal: 'Marriage / Long-term',
      reviews: [],
      averageRating: 5.0,
      isNew: true,
      createdAt: new Date().toISOString()
    };

    if (existingProfIdx !== -1) {
      profiles[existingProfIdx] = newProfile;
    } else {
      profiles.unshift(newProfile);
    }

    // Broadcast gender-targeted notification:
    // If male registered -> send to females!
    // If female registered -> send to males!
    const regGender = (registeredUser.gender || 'female').toLowerCase();
    const isMale = regGender === 'male';
    const isFemale = regGender === 'female';
    const targetGender: 'male' | 'female' | 'all' = isMale ? 'female' : (isFemale ? 'male' : 'all');

    const regCity = registeredUser.city || registeredUser.subLocation || 'Harare';
    const regAge = registeredUser.age || 25;

    const notifTitle = isMale
      ? '❤️ New Gentleman Alert!'
      : (isFemale ? '❤️ New Lady Alert!' : '❤️ New Single Alert!');

    const notifMessage = isMale
      ? `A new gentleman (${regAge}, ${regCity}) has just registered! Check out his profile.`
      : (isFemale 
          ? `A new lady (${regAge}, ${regCity}) has just registered! Check out her profile.`
          : `New Single, ${regAge} and ${regCity} has signed up`);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'all',
      title: notifTitle,
      message: notifMessage,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      targetGender,
      gender: regGender as any,
      profileId: newProfile.id,
      photo: newProfile.photos?.[0] || currentUser.avatar
    };
    notifications.unshift(newNotif);

    res.json({ success: true, user: currentUser, profile: newProfile });
    setImmediate(() => saveAppData());
  });

  app.put('/api/auth/profile', (req, res) => {
    const { name, email, whatsappNumber, age, province, city, subLocation, childrenCount, intent, location, bio, gender, seeking, interests, avatar, photos, bouncerVerified, hivStatus } = req.body;
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const selectedCity = city || currentUser.city || 'Harare';
    const selectedSubLocation = subLocation || currentUser.subLocation || 'Borrowdale';
    const selectedProvince = province || (city ? getProvinceForCity(city) : (currentUser.province || getProvinceForCity(selectedCity)));
    const fullLocation = location || (city && subLocation ? `${city} (${subLocation}), Zimbabwe` : currentUser.location);
    const validPhotos = Array.isArray(photos) && photos.length > 0 ? photos : (avatar ? [avatar] : undefined);
    const formattedName = name ? capitalizeName(name) : undefined;
    const normalizedHiv = hivStatus ? (hivStatus.includes('+') || hivStatus.toLowerCase().includes('pos') ? 'HIV+' : 'HIV-') : undefined;

    currentUser = {
      ...currentUser,
      ...(formattedName && { name: formattedName }),
      ...(email && { email }),
      ...(whatsappNumber && { whatsappNumber }),
      ...(age && { age: Number(age) }),
      province: selectedProvince,
      ...(city && { city }),
      ...(subLocation && { subLocation }),
      ...(childrenCount !== undefined && { childrenCount: Number(childrenCount) }),
      ...(intent && { intent }),
      ...(normalizedHiv && { hivStatus: normalizedHiv }),
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
      const existingPhotos = profiles[pIdx].photos || [];
      const updatedPhotos = validPhotos && validPhotos.length > 0
        ? validPhotos 
        : (avatar ? [avatar, ...existingPhotos.slice(1)] : existingPhotos);

      profiles[pIdx] = {
        ...profiles[pIdx],
        name: currentUser.name,
        age: currentUser.age,
        province: selectedProvince,
        city: currentUser.city || profiles[pIdx].city,
        subLocation: currentUser.subLocation || profiles[pIdx].subLocation,
        location: currentUser.location,
        childrenCount: currentUser.childrenCount ?? profiles[pIdx].childrenCount,
        intent: currentUser.intent || profiles[pIdx].intent,
        hivStatus: currentUser.hivStatus || profiles[pIdx].hivStatus || 'HIV-',
        whatsappNumber: currentUser.whatsappNumber || profiles[pIdx].whatsappNumber,
        bio: currentUser.bio || profiles[pIdx].bio,
        gender: currentUser.gender || profiles[pIdx].gender,
        seeking: currentUser.seeking || profiles[pIdx].seeking,
        interests: currentUser.interests || profiles[pIdx].interests,
        photos: updatedPhotos.length > 0 ? updatedPhotos : [currentUser.avatar],
        bouncerStatus: currentUser.bouncerVerified ? 'verified' : profiles[pIdx].bouncerStatus
      };
    } else {
      const newProf: SingleProfile = {
        id: `p_${Date.now()}`,
        name: currentUser.name,
        age: currentUser.age,
        province: selectedProvince,
        city: currentUser.city || 'Harare',
        subLocation: currentUser.subLocation || 'Borrowdale',
        location: currentUser.location,
        childrenCount: currentUser.childrenCount || 0,
        intent: currentUser.intent || 'Marriage',
        hivStatus: currentUser.hivStatus || 'HIV-',
        bio: currentUser.bio || 'Single looking for love.',
        photos: validPhotos && validPhotos.length > 0 ? validPhotos : [currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'],
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

    saveAppData();
    res.json({ success: true, user: currentUser });
  });

  // API ROUTE 3: Profiles Endpoint (Name, Age, Location, Intent, Children, Bouncer Filters)
  app.get('/api/profiles', (req, res) => {
    let result = [...profiles];
    const { search, gender, bouncerStatus, location, province, city, subLocation, minAge, maxAge, childrenCount, intent, hivStatus } = req.query;

    if (search) {
      const q = (search as string).toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.location.toLowerCase().includes(q) ||
             (p.province && p.province.toLowerCase().includes(q)) ||
             (p.city && p.city.toLowerCase().includes(q)) ||
             (p.subLocation && p.subLocation.toLowerCase().includes(q)) ||
             p.bio.toLowerCase().includes(q) ||
             p.intent.toLowerCase().includes(q) ||
             (p.hivStatus && p.hivStatus.toLowerCase().includes(q)) ||
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

    if (province && province !== 'all') {
      const targetProv = (province as string).toLowerCase().trim();
      result = result.filter(p => {
        const prov = (p.province || getProvinceForCity(p.city)).toLowerCase().trim();
        return prov === targetProv;
      });
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

    if (hivStatus && hivStatus !== 'all') {
      const target = (hivStatus as string).toLowerCase().trim();
      if (target.includes('+') || target.includes('pos')) {
        result = result.filter(p => p.hivStatus && (p.hivStatus.includes('+') || p.hivStatus.toLowerCase().includes('pos')));
      } else if (target.includes('-') || target.includes('neg')) {
        result = result.filter(p => p.hivStatus && (p.hivStatus.includes('-') || p.hivStatus.toLowerCase().includes('neg')));
      } else {
        result = result.filter(p => p.hivStatus && p.hivStatus.toLowerCase() === target);
      }
    }

    // Mask/hide WhatsApp contact numbers from public API response unless caller is Admin
    const isAdminReq = isAuthorizedAdmin(req);
    const sanitizedResult = result.map(p => {
      if (isAdminReq) {
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

  // API ROUTE 3b: Zimbabwe Location Database & CSV export
  app.get('/api/locations', (req, res) => {
    res.json({
      provinces: ZIMBABWE_PROVINCES,
      locations: ZIMBABWE_LOCATIONS,
      totalCities: ZIMBABWE_LOCATIONS.length,
      totalSubLocations: ZIMBABWE_LOCATIONS.reduce((acc, curr) => acc + curr.subLocations.length, 0),
      csv: ZIMBABWE_LOCATIONS_CSV
    });
  });

  app.get('/api/profiles/:id', (req, res) => {
    const profile = profiles.find(p => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (isAuthorizedAdmin(req)) {
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
    saveAppData();

    res.json({ success: true, profile: profiles[idx], review: newRev });
  });

  // Admin / User Add Profile
  app.post('/api/profiles', (req, res) => {
    const { name, age, location, province, city, subLocation, childrenCount, intent, bio, photos, interests, gender, seeking, height, relationshipGoal, bouncerStatus, bouncerNotes, whatsappNumber, hivStatus } = req.body;
    if (!name || !age || !location) {
      return res.status(400).json({ error: 'Name, Age, and Location are required.' });
    }

    const selectedCity = city || 'Harare';
    const selectedSubLocation = subLocation || 'Avondale';
    const selectedProvince = province || getProvinceForCity(selectedCity);

    const newProfile: SingleProfile = {
      id: `p_${Date.now()}`,
      name,
      age: Number(age),
      location,
      province: selectedProvince,
      city: selectedCity,
      subLocation: selectedSubLocation,
      childrenCount: childrenCount !== undefined ? Number(childrenCount) : 0,
      intent: intent || 'Marriage',
      hivStatus: hivStatus ? (hivStatus.includes('+') ? 'HIV+' : 'HIV-') : 'HIV-',
      reviews: [],
      averageRating: 5.0,
      bio: bio || 'Fresh profile on Dating with Bouncer.',
      photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'],
      interests: Array.isArray(interests) ? interests : ['Fine Dining', 'Travel', 'Art'],
      gender: gender || 'female',
      seeking: seeking || 'male',
      whatsappNumber: whatsappNumber || '+263 77 123 4567',
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

    // Broadcast gender-targeted notification:
    // If male registered -> send to females!
    // If female registered -> send to males!
    const singleGender = (newProfile.gender || 'female').toLowerCase();
    const isMale = singleGender === 'male';
    const isFemale = singleGender === 'female';
    const targetGender: 'male' | 'female' | 'all' = isMale ? 'female' : (isFemale ? 'male' : 'all');

    const singleCity = newProfile.city || newProfile.location || 'Harare';
    const singleAge = newProfile.age || 25;

    const notifTitle = isMale
      ? '❤️ New Gentleman Alert!'
      : (isFemale ? '❤️ New Lady Alert!' : '❤️ New Single Alert!');

    const notifMessage = isMale
      ? `A new gentleman (${singleAge}, ${singleCity}) has just registered! Check out his profile.`
      : (isFemale
          ? `A new lady (${singleAge}, ${singleCity}) has just registered! Check out her profile.`
          : `New Single, ${singleAge} and ${singleCity} has signed up`);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'all',
      title: notifTitle,
      message: notifMessage,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      targetGender,
      gender: singleGender as any,
      profileId: newProfile.id,
      photo: newProfile.photos?.[0]
    };
    notifications.unshift(newNotif);
    saveAppData();

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
    saveAppData();

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
    const currentProf = profiles[idx];
    const newCity = req.body.city || currentProf.city;
    const newProv = req.body.province || (req.body.city ? getProvinceForCity(req.body.city) : currentProf.province || getProvinceForCity(newCity));

    profiles[idx] = {
      ...currentProf,
      ...req.body,
      province: newProv
    };

    // Sync role and featured status with linked user account if present
    const uIdx = users.findIndex(u => u.id === profiles[idx].id || u.name.toLowerCase() === currentProf.name.toLowerCase());
    if (uIdx !== -1) {
      if (req.body.role !== undefined) {
        users[uIdx].role = req.body.role;
      }
      if (req.body.isFeatured !== undefined) {
        users[uIdx].isFeatured = Boolean(req.body.isFeatured);
      }
    }

    saveAppData();
    res.json({ success: true, profile: profiles[idx] });
  });

  app.delete('/api/profiles/:id', (req, res) => {
    profiles = profiles.filter(p => p.id !== req.params.id);
    saveAppData();
    res.json({ success: true, message: 'Profile deleted successfully' });
  });

  // Admin: Update Bouncer Status
  app.put('/api/admin/profiles/:id/bouncer-status', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const { status, notes } = req.body;
    const idx = profiles.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profiles[idx].bouncerStatus = status as BouncerStatus;
    if (notes) {
      profiles[idx].bouncerNotes = notes;
    }
    saveAppData();

    res.json({ success: true, profile: profiles[idx] });
  });

  // Admin: List all Users
  app.get('/api/admin/users', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    res.json(users);
  });

  // Admin: Add or Deduct Account Funds from User Balance
  app.post('/api/admin/users/:id/funds', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const { amount, action, reason, note } = req.body; // action: 'add' | 'remove' | 'set', amount: number
    const userId = req.params.id;
    
    const uIdx = users.findIndex(u => u.id === userId || (u.email && u.email.toLowerCase() === userId.toLowerCase()));
    if (uIdx === -1) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const numAmount = Number(amount) || 0;
    const currentBal = Number(users[uIdx].walletBalance) || 0;
    let newBal = currentBal;
    let deltaAmount = 0;

    if (action === 'add') {
      deltaAmount = Math.abs(numAmount);
      newBal = currentBal + deltaAmount;
    } else if (action === 'remove') {
      deltaAmount = -Math.min(currentBal, Math.abs(numAmount));
      newBal = Math.max(0, currentBal - Math.abs(numAmount));
    } else if (action === 'set') {
      deltaAmount = Math.max(0, numAmount) - currentBal;
      newBal = Math.max(0, numAmount);
    }

    users[uIdx].walletBalance = Number(newBal.toFixed(2));

    // Update currentUser if same
    if (currentUser && currentUser.id === users[uIdx].id) {
      currentUser.walletBalance = users[uIdx].walletBalance;
    }

    const customNote = reason || note ? ` (${reason || note})` : '';

    // Record adjustment in transaction history audit log
    const adjustmentTx: PaymentTransaction = {
      id: `tx_adj_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      userId: users[uIdx].id,
      userName: users[uIdx].name,
      userEmail: users[uIdx].email,
      amount: Number(Math.abs(numAmount).toFixed(2)),
      planId: 'wallet_adjustment',
      planName: action === 'add'
        ? `👛 Admin Wallet Credit (+$${Math.abs(numAmount).toFixed(2)})${customNote}`
        : action === 'remove'
        ? `👛 Admin Wallet Debit (-$${Math.abs(numAmount).toFixed(2)})${customNote}`
        : `👛 Admin Wallet Balance Set ($${Math.abs(numAmount).toFixed(2)})${customNote}`,
      cardLast4: 'ADMIN',
      cardBrand: action === 'add' ? 'Wallet Credit' : action === 'remove' ? 'Wallet Debit' : 'Wallet Set',
      status: 'succeeded',
      date: new Date().toISOString(),
      reference: `WAL-ADJ-${Date.now()}`
    };

    transactions.unshift(adjustmentTx);

    // Send notification to user
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: users[uIdx].id,
      title: action === 'add' ? '💰 Wallet Credited' : '👛 Wallet Balance Adjusted',
      message: `Admin ${action === 'add' ? 'added $' + Math.abs(numAmount).toFixed(2) : 'adjusted your wallet by $' + Math.abs(numAmount).toFixed(2)}${customNote}. New balance: $${users[uIdx].walletBalance.toFixed(2)}.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    saveAppData();
    res.json({
      success: true,
      user: users[uIdx],
      newBalance: users[uIdx].walletBalance,
      transaction: adjustmentTx,
      message: `Successfully ${action === 'add' ? 'added $' + numAmount.toFixed(2) : 'deducted $' + numAmount.toFixed(2)} ${action === 'add' ? 'to' : 'from'} ${users[uIdx].name}'s funds. Recorded in transaction history. New balance: $${users[uIdx].walletBalance.toFixed(2)}`
    });
  });

  // Admin: Update User Profile & Account Data (including Wallet Balance)
  app.put('/api/admin/users/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const userId = req.params.id;
    const {
      name,
      email,
      whatsappNumber,
      age,
      city,
      subLocation,
      location,
      childrenCount,
      intent,
      hivStatus,
      bio,
      gender,
      seeking,
      bouncerVerified,
      subscriptionPlan,
      role,
      isFeatured,
      walletBalance,
      walletAdjustmentReason
    } = req.body;

    const uIdx = users.findIndex(u => u.id === userId || (u.email && u.email.toLowerCase() === userId.toLowerCase()));
    if (uIdx === -1) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const prevUser = users[uIdx];
    const prevBalance = Number(prevUser.walletBalance) || 0;
    const formattedName = name ? capitalizeName(name) : prevUser.name;
    const fullLocation = location || (city && subLocation ? `${city} (${subLocation}), Zimbabwe` : prevUser.location);

    let newBalance = prevBalance;
    if (walletBalance !== undefined && !isNaN(Number(walletBalance))) {
      newBalance = Math.max(0, Number(Number(walletBalance).toFixed(2)));
    }

    // If wallet balance changed by admin, record in transaction log
    if (newBalance !== prevBalance) {
      const diff = newBalance - prevBalance;
      const isCredit = diff > 0;
      const customReason = walletAdjustmentReason ? ` (${walletAdjustmentReason})` : '';

      const adjTx: PaymentTransaction = {
        id: `tx_adj_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        userId: prevUser.id,
        userName: formattedName,
        userEmail: email || prevUser.email,
        amount: Number(Math.abs(diff).toFixed(2)),
        planId: 'wallet_adjustment',
        planName: isCredit
          ? `👛 Admin Profile Edit Wallet Credit (+$${Math.abs(diff).toFixed(2)})${customReason}`
          : `👛 Admin Profile Edit Wallet Debit (-$${Math.abs(diff).toFixed(2)})${customReason}`,
        cardLast4: 'ADMIN',
        cardBrand: isCredit ? 'Admin Credit' : 'Admin Debit',
        status: 'succeeded',
        date: new Date().toISOString(),
        reference: `ADM-PROF-${Date.now()}`
      };
      transactions.unshift(adjTx);

      notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: prevUser.id,
        title: isCredit ? '💰 Wallet Credited by Admin' : '👛 Wallet Balance Updated',
        message: `Admin updated your profile & adjusted wallet balance to $${newBalance.toFixed(2)}${customReason}.`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    users[uIdx] = {
      ...prevUser,
      name: formattedName,
      ...(email && { email }),
      ...(whatsappNumber && { whatsappNumber }),
      ...(age !== undefined && { age: Number(age) }),
      ...(city && { city }),
      ...(subLocation && { subLocation }),
      location: fullLocation,
      ...(childrenCount !== undefined && { childrenCount: Number(childrenCount) }),
      ...(intent && { intent }),
      ...(hivStatus && { hivStatus }),
      ...(bio !== undefined && { bio }),
      ...(gender && { gender }),
      ...(seeking && { seeking }),
      ...(bouncerVerified !== undefined && { bouncerVerified: Boolean(bouncerVerified) }),
      ...(subscriptionPlan && { subscriptionPlan }),
      ...(role && { role }),
      ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : role === 'featured' ? { isFeatured: true } : {}),
      walletBalance: newBalance
    };

    if (currentUser && currentUser.id === users[uIdx].id) {
      currentUser = users[uIdx];
    }

    // Synchronize linked SingleProfile if found
    const pIdx = profiles.findIndex(p => p.id === prevUser.id || p.name.toLowerCase() === prevUser.name.toLowerCase());
    if (pIdx !== -1) {
      profiles[pIdx] = {
        ...profiles[pIdx],
        name: formattedName,
        age: users[uIdx].age,
        city: users[uIdx].city || profiles[pIdx].city,
        subLocation: users[uIdx].subLocation || profiles[pIdx].subLocation,
        location: users[uIdx].location,
        childrenCount: users[uIdx].childrenCount ?? profiles[pIdx].childrenCount,
        intent: users[uIdx].intent || profiles[pIdx].intent,
        hivStatus: users[uIdx].hivStatus || profiles[pIdx].hivStatus,
        whatsappNumber: users[uIdx].whatsappNumber || profiles[pIdx].whatsappNumber,
        bio: users[uIdx].bio || profiles[pIdx].bio,
        gender: users[uIdx].gender || profiles[pIdx].gender,
        seeking: users[uIdx].seeking || profiles[pIdx].seeking,
        role: users[uIdx].role,
        isFeatured: Boolean(users[uIdx].isFeatured || users[uIdx].role === 'featured'),
        bouncerStatus: users[uIdx].isFeatured || users[uIdx].role === 'featured'
          ? 'vip_approved'
          : (users[uIdx].bouncerVerified ? 'verified' : profiles[pIdx].bouncerStatus)
      };
    }

    saveAppData();
    res.json({
      success: true,
      user: users[uIdx],
      message: `User profile for ${users[uIdx].name} updated successfully by Admin.`
    });
  });

  // User Add Funds / Wallet Top-Up Endpoint
  app.post('/api/wallet/topup', (req, res) => {
    const { amount, paymentMethod, mobileNumber, reference } = req.body;
    if (!currentUser) {
      return res.status(401).json({ error: 'Please log in to add wallet funds.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Please specify a valid deposit amount greater than $0.' });
    }

    const uIdx = users.findIndex(u => u.id === currentUser.id);
    if (uIdx === -1) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const currentBal = Number(users[uIdx].walletBalance) || 0;
    const newBal = Number((currentBal + numAmount).toFixed(2));
    users[uIdx].walletBalance = newBal;
    currentUser.walletBalance = newBal;

    const brandName = paymentMethod === 'ecocash' ? 'EcoCash Top-up' : paymentMethod === 'onemoney' ? 'OneMoney Top-up' : 'Paynow Card Deposit';
    const txRef = reference || `TOPUP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const topupTx: PaymentTransaction = {
      id: `tx_topup_${Date.now()}`,
      reference: txRef,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amount: numAmount,
      planId: 'wallet_topup',
      planName: `💵 Wallet Deposit (+$${numAmount.toFixed(2)})`,
      cardLast4: mobileNumber ? mobileNumber.slice(-4) : 'TOPUP',
      cardBrand: brandName,
      status: 'succeeded',
      date: new Date().toISOString()
    };

    transactions.unshift(topupTx);

    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: '💵 Funds Added Successfully!',
      message: `+$${numAmount.toFixed(2)} added to your Dating With Bouncer wallet. Current balance: $${newBal.toFixed(2)}.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    saveAppData();
    res.json({
      success: true,
      newBalance: newBal,
      transaction: topupTx,
      message: `Successfully deposited $${numAmount.toFixed(2)} into your wallet.`
    });
  });

  // Admin: Upgrade User Subscription, Role (Admin / Featured / User) & Bouncer Status
  app.put('/api/admin/users/:id/upgrade', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const { planId, bouncerVerified, role, isFeatured } = req.body;
    const userId = req.params.id;
    
    const uIdx = users.findIndex(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (uIdx === -1) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (planId) {
      users[uIdx].subscriptionPlan = (planId as SubscriptionPlanId) || 'starter_3_or_4';
      users[uIdx].subscriptionStatus = 'active';
      users[uIdx].subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (role) {
      users[uIdx].role = role as 'user' | 'featured' | 'admin';
      if (role === 'featured') {
        users[uIdx].isFeatured = true;
      } else if (role === 'user' && isFeatured === undefined) {
        users[uIdx].isFeatured = false;
      }
    }
    if (isFeatured !== undefined) {
      users[uIdx].isFeatured = Boolean(isFeatured);
      if (isFeatured && users[uIdx].role === 'user') {
        users[uIdx].role = 'featured';
      }
    }
    if (bouncerVerified !== undefined) {
      users[uIdx].bouncerVerified = !!bouncerVerified;
    } else {
      users[uIdx].bouncerVerified = true;
    }

    // Sync with SingleProfile if matched
    const pIdx = profiles.findIndex(p => p.id === users[uIdx].id || p.name.toLowerCase() === users[uIdx].name.toLowerCase());
    if (pIdx !== -1) {
      profiles[pIdx].role = users[uIdx].role;
      profiles[pIdx].isFeatured = Boolean(users[uIdx].isFeatured || users[uIdx].role === 'featured');
      if (profiles[pIdx].isFeatured) {
        profiles[pIdx].bouncerStatus = 'vip_approved';
      }
    }

    // Also update current logged in user if it's the same user
    if (currentUser && currentUser.id === users[uIdx].id) {
      currentUser = users[uIdx];
    }

    saveAppData();
    res.json({ success: true, user: users[uIdx], message: `Successfully upgraded user ${users[uIdx].name}` });
  });

  // Admin: Upgrade / Change User or Profile Role (admin, featured, user)
  app.put('/api/admin/users/:id/role', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const { role, isFeatured } = req.body;
    const targetId = req.params.id;

    let uIdx = users.findIndex(u => u.id === targetId || (u.email && u.email.toLowerCase() === targetId.toLowerCase()));
    const pIdx = profiles.findIndex(p => p.id === targetId || (uIdx !== -1 && p.name.toLowerCase() === users[uIdx].name.toLowerCase()));

    // If Admin is upgrading a SingleProfile that doesn't yet have a User account record, create one so they can log in with that role
    if (uIdx === -1 && pIdx !== -1) {
      const prof = profiles[pIdx];
      const slug = prof.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      const newLinkedUser: User = {
        id: prof.id,
        email: `${slug}@bouncer.date`,
        name: prof.name,
        age: prof.age,
        role: (role as 'user' | 'featured' | 'admin') || 'user',
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : role === 'featured',
        subscriptionPlan: role === 'admin' || role === 'featured' ? 'vip_30_singles' : 'free',
        subscriptionStatus: 'active',
        avatar: prof.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        province: prof.province,
        city: prof.city,
        subLocation: prof.subLocation,
        location: prof.location,
        childrenCount: prof.childrenCount,
        intent: prof.intent,
        hivStatus: prof.hivStatus,
        whatsappNumber: prof.whatsappNumber,
        bio: prof.bio,
        gender: prof.gender,
        seeking: prof.seeking,
        bouncerVerified: true,
        createdAt: new Date().toISOString()
      };
      users.push(newLinkedUser);
      uIdx = users.length - 1;
    }

    if (uIdx === -1 && pIdx === -1) {
      return res.status(404).json({ error: 'User or profile not found.' });
    }

    const effectiveRole: 'user' | 'featured' | 'admin' = role || (isFeatured ? 'featured' : 'user');
    const effectiveFeatured: boolean = isFeatured !== undefined ? Boolean(isFeatured) : effectiveRole === 'featured';

    if (uIdx !== -1) {
      users[uIdx].role = effectiveRole;
      users[uIdx].isFeatured = effectiveFeatured;
      if (effectiveRole === 'admin' || effectiveRole === 'featured' || effectiveFeatured) {
        users[uIdx].bouncerVerified = true;
      }
      if (effectiveRole === 'admin' && users[uIdx].subscriptionPlan === 'free') {
        users[uIdx].subscriptionPlan = 'vip_30_singles';
      }

      notifications.unshift({
        id: `notif_role_${Date.now()}`,
        userId: users[uIdx].id,
        title: effectiveRole === 'admin'
          ? '🛡️ Upgraded to Admin Role!'
          : effectiveFeatured
          ? '⭐ Upgraded to Featured Single!'
          : '👤 Account Role Updated',
        message: effectiveRole === 'admin'
          ? 'An Administrator has upgraded your account to Admin Role with full Bouncer Control Panel rights.'
          : effectiveFeatured
          ? 'An Administrator has upgraded your profile to Featured Single status in the Spotlight!'
          : 'Your account role has been updated to Standard Member.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    if (pIdx !== -1) {
      profiles[pIdx].role = effectiveRole;
      profiles[pIdx].isFeatured = effectiveFeatured;
      if (effectiveFeatured || effectiveRole === 'featured' || effectiveRole === 'admin') {
        profiles[pIdx].bouncerStatus = 'vip_approved';
      }
    } else if (uIdx !== -1) {
      // Also check by name match if pIdx wasn't found by ID
      const nameMatchIdx = profiles.findIndex(p => p.name.toLowerCase() === users[uIdx].name.toLowerCase());
      if (nameMatchIdx !== -1) {
        profiles[nameMatchIdx].role = effectiveRole;
        profiles[nameMatchIdx].isFeatured = effectiveFeatured;
        if (effectiveFeatured || effectiveRole === 'featured' || effectiveRole === 'admin') {
          profiles[nameMatchIdx].bouncerStatus = 'vip_approved';
        }
      }
    }

    saveAppData();
    res.json({
      success: true,
      user: uIdx !== -1 ? users[uIdx] : null,
      profile: pIdx !== -1 ? profiles[pIdx] : null,
      message: `Role updated to ${effectiveRole.toUpperCase()}${effectiveFeatured ? ' (Featured)' : ''}`
    });
  });

  // Admin: Delete/Remove User Account & Profile
  app.delete('/api/admin/users/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const targetId = req.params.id;
    
    // Find user to get name/email
    const userTarget = users.find(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
    const targetName = userTarget?.name || '';

    // Filter out user from users array
    users = users.filter(u => u.id !== targetId && u.email.toLowerCase() !== targetId.toLowerCase());
    
    // Filter out profile by profile id or matching name
    profiles = profiles.filter(p => p.id !== targetId && p.name.toLowerCase() !== targetName.toLowerCase());

    saveAppData();
    res.json({ success: true, message: 'User and single profile deleted successfully from Bouncer system.' });
  });

  // API ROUTE 4: Subscriptions & Paynow Payment Gateway Processing
  app.get('/api/subscriptions/plans', (_req, res) => {
    res.json(SUBSCRIPTION_PLANS);
  });

  // POST /api/payment/subscribe - Paynow Web & Mobile Initiation Endpoint (Supports Test Mode)
  app.post('/api/payment/subscribe', async (req, res) => {
    try {
      const { planId, profileIds, mobileNumber, paymentMethod, guestEmail, guestPhone } = req.body;

      // Auto resolve plan if not explicitly passed or if a tier alias / amount is passed
      let effectivePlanId = planId || (Array.isArray(profileIds) && profileIds.length === 1 ? 'test_1_single' : 'starter_3_or_4');
      if (typeof effectivePlanId === 'number' || effectivePlanId === '3' || effectivePlanId === '6' || effectivePlanId === '10' || effectivePlanId === '15') {
        const num = Number(effectivePlanId);
        if (num <= 3) effectivePlanId = 'test_1_single';
        else if (num <= 6) effectivePlanId = 'starter_3_or_4';
        else if (num <= 10) effectivePlanId = 'starter_10_singles';
        else effectivePlanId = 'vip_30_singles';
      }

      let plan = SUBSCRIPTION_PLANS.find(p => p.id === effectivePlanId);
      if (!plan) {
        // Robust alias fallback for all $3, $6, $10, and $15 packages
        const normalizedId = String(effectivePlanId).toLowerCase();
        if (
          normalizedId.includes('test') ||
          normalizedId.includes('1_single') ||
          normalizedId === 'test_1_single' ||
          normalizedId === '3'
        ) {
          plan = SUBSCRIPTION_PLANS.find(p => p.price === 3 || p.id === 'test_1_single') || {
            id: 'test_1_single',
            name: '1 Single Test Pass',
            price: 3,
            billingPeriod: 'monthly',
            tagline: 'Test package: Unlock 1 Single WhatsApp contact number to see it working!',
            badge: '$3 TEST PASS',
            popular: false,
            features: ['Select 1 Single for only $3', 'Unlock Direct WhatsApp Phone Number', 'Instant Real Connection Test']
          };
        } else if (
          normalizedId.includes('10') ||
          normalizedId.includes('bundle') ||
          normalizedId === 'starter_10_singles'
        ) {
          plan = SUBSCRIPTION_PLANS.find(p => p.price === 10 || p.id === 'starter_10_singles') || {
            id: 'starter_10_singles',
            name: '4 to 10 Singles Bundle',
            price: 10,
            billingPeriod: 'monthly',
            tagline: 'Unlock direct WhatsApp numbers for 4 to 10 Singles',
            badge: '$10 BUNDLE',
            popular: false,
            features: ['Select 4 to 10 Singles for $10', 'Unlock Direct WhatsApp Phone Numbers']
          };
        } else if (
          normalizedId.includes('15') ||
          normalizedId.includes('30') ||
          normalizedId.includes('vip') ||
          normalizedId.includes('unlimited') ||
          normalizedId === 'vip_30_singles'
        ) {
          plan = SUBSCRIPTION_PLANS.find(p => p.price === 15 || p.id === 'vip_30_singles') || {
            id: 'vip_30_singles',
            name: 'VIP Access (30+ Singles)',
            price: 15,
            billingPeriod: 'monthly',
            tagline: 'Unlock MORE THAN 30 Singles for $15',
            badge: '$15 VIP UNLIMITED',
            popular: true,
            features: ['Unlock MORE THAN 30 Singles for $15', 'Direct WhatsApp Contact Numbers', 'VIP Gold Access Badge']
          };
        } else {
          plan = SUBSCRIPTION_PLANS.find(p => p.price === 6 || p.id === 'starter_3_or_4') || SUBSCRIPTION_PLANS[0];
        }
      }

      if (!plan) {
        plan = SUBSCRIPTION_PLANS[0];
      }

      const userEmail = currentUser ? currentUser.email : (guestEmail || 'test@datingwithbouncer.com');
      const userName = currentUser ? currentUser.name : 'Valued Single';
      const userId = currentUser ? currentUser.id : 'usr_guest';

      const reference = `BOUNCER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const isTestMode = IS_PAYNOW_TEST_MODE || process.env.PAYNOW_TEST_MODE === 'true';
      const authEmail = getPaynowAuthEmail(userEmail);
      // In Test Mode, ensure authemail is explicitly set to PAYNOW_MERCHANT_EMAIL and NEVER customer's email
      const paymentAuthEmail = isTestMode ? PAYNOW_MERCHANT_EMAIL : authEmail;

      const isMobileMethod = paymentMethod === 'ecocash' || paymentMethod === 'onemoney';
      const phoneToUse = (mobileNumber || guestPhone || '0771490167').replace(/\s+/g, '');

      // CREATE AND PERSIST TRANSACTION IMMEDIATELY BEFORE SENDING TO PAYNOW
      // This guarantees that any instant Paynow callback or poll finds the record with zero race conditions
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
        cardBrand: isMobileMethod ? (paymentMethod === 'ecocash' ? 'EcoCash' : 'OneMoney') : 'Paynow',
        status: 'pending',
        pollUrl: '',
        date: new Date().toISOString()
      };

      transactions.unshift(transaction);
      saveAppData();

      const payment = paynow.createPayment(reference, paymentAuthEmail);
      payment.add(plan.name, plan.price);

      let response: any = null;
      let usedTestMode = false;

      try {
        if (isMobileMethod && phoneToUse) {
          response = await paynow.sendMobile(payment, phoneToUse, paymentMethod);
        } else {
          response = await paynow.send(payment);
        }
      } catch (sdkErr: any) {
        console.warn('Paynow live API call notice (falling back to Test Mode):', sdkErr?.message || sdkErr);
      }

      // If live Paynow call returned unsuccessful or threw, activate Paynow Test Mode seamlessly
      if (!response || !response.success) {
        usedTestMode = true;
        const testPollUrl = `https://www.paynow.co.zw/Interface/CheckPayment/?guid=test_${Date.now()}_${reference}`;
        const testRedirectUrl = `https://www.paynow.co.zw/Payment/ConfirmPayment/${reference}?test=true`;
        const testInstructions = isMobileMethod
          ? `[Paynow Test Mode] Dial ${paymentMethod === 'ecocash' ? '*151*2*2#' : '*111*2#'} on phone ${phoneToUse} and confirm payment of $${plan.price} USD for ${plan.name}.`
          : `[Paynow Test Mode] Complete your test checkout on Paynow redirect window.`;

        response = {
          success: true,
          redirectUrl: testRedirectUrl,
          pollUrl: testPollUrl,
          instructions: testInstructions
        };

        transaction.paynowReference = `PN-TEST-${reference}`;
        transaction.pollUrl = testPollUrl;
      } else {
        if (response.pollUrl) transaction.pollUrl = response.pollUrl;
        if (response.paynowReference) transaction.paynowReference = response.paynowReference;
      }

      notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: 'usr_admin',
        title: '💳 Paynow Payment Initiated',
        message: `New Paynow ${usedTestMode ? '[Test Mode] ' : ''}transaction of $${plan.price} initiated by ${userName} (${userEmail}) for ${plan.name} [Ref: ${reference}].`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });

      saveAppData();

      return res.json({
        success: true,
        reference,
        transaction,
        testMode: usedTestMode || IS_PAYNOW_TEST_MODE,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl,
        instructions: response.instructions
      });
    } catch (err: any) {
      console.error('Error initiating Paynow payment:', err?.message || err);
      return res.status(500).json({ success: false, error: 'Internal server error processing payment initiation' });
    }
  });

  // POST /api/payment/test-approve - Instantly marks a test payment as succeeded for rapid testing
  app.post('/api/payment/test-approve', (req, res) => {
    const { reference } = req.body;
    const tx = transactions.find(t => t.reference === reference || t.id === reference);
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    activateUserSubscription(tx);
    saveAppData();
    return res.json({ success: true, message: 'Test transaction approved & VIP unlocked!', transaction: tx });
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

      // If transaction is not marked succeeded yet and has a pollUrl, poll Paynow
      if (tx.status !== 'succeeded' && tx.pollUrl && !tx.pollUrl.includes('test_')) {
        try {
          const pollResult = await paynow.pollTransaction(tx.pollUrl);
          if (pollResult) {
            if (pollResult.paynowReference) {
              tx.paynowReference = pollResult.paynowReference;
            }
            const statusStr = (pollResult.status || '').toString().toLowerCase();
            if (statusStr === 'paid' || statusStr === 'awaiting delivery' || statusStr === 'delivered' || (typeof pollResult.paid === 'function' && pollResult.paid())) {
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

      saveAppData();

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
      const ref = (data.reference || data.merchantreference || data.Reference || data.MerchantReference || data.paynowreference || req.query.reference || req.query.merchantreference || '') as string;

      if (!ref) {
        return res.status(400).json({ error: 'Missing reference in callback' });
      }

      let tx = findTransaction(ref);
      if (!tx) {
        // Reload from storage in case another cluster worker saved it
        loadPersistentData();
        tx = findTransaction(ref);
      }

      if (!tx) {
        console.warn(`Paynow callback received for unknown transaction reference: ${ref}`);
        return res.status(200).json({ status: 'ok', message: 'Transaction reference not found' });
      }

      if (tx.status === 'succeeded') {
        return res.status(200).json({ status: 'ok', message: 'Transaction already succeeded' });
      }

      let isPaid = false;

      // Check incoming status payload from Paynow
      const incomingStatus = (data.status || req.query.status || '').toString().toLowerCase();
      if (incomingStatus === 'paid' || incomingStatus === 'awaiting delivery' || incomingStatus === 'delivered') {
        isPaid = true;
      }

      if (tx.pollUrl && !tx.pollUrl.includes('test_')) {
        try {
          const pollResult = await paynow.pollTransaction(tx.pollUrl);
          if (pollResult) {
            if (pollResult.paynowReference) {
              tx.paynowReference = pollResult.paynowReference;
            }
            const statusStr = (pollResult.status || '').toString().toLowerCase();
            if (statusStr === 'paid' || statusStr === 'awaiting delivery' || statusStr === 'delivered' || (typeof pollResult.paid === 'function' && pollResult.paid())) {
              isPaid = true;
            } else if (statusStr === 'cancelled' || statusStr === 'failed') {
              tx.status = 'failed';
            }
          }
        } catch (pollErr: any) {
          console.error(`Paynow poll error for ref ${ref}:`, pollErr?.message || pollErr);
        }
      }

      if (isPaid) {
        activateUserSubscription(tx);
        return res.status(200).json({ status: 'ok', message: 'Payment confirmed & subscription activated' });
      }

      saveAppData();
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
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const { id } = req.params;
    const tx = transactions.find(t => t.id === id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    activateUserSubscription(tx);

    res.json({ success: true, message: 'Payment approved successfully! VIP & unlocked profiles activated.', transaction: tx });
  });

  app.put('/api/admin/payments/:id/reject', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
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

  app.get('/api/payment/transactions', (req, res) => {
    if (isAuthorizedAdmin(req)) {
      return res.json(transactions);
    }
    if (!currentUser) {
      return res.json([]);
    }
    const userTxs = transactions.filter(t => t.userId === currentUser?.id || (t.userEmail && currentUser?.email && t.userEmail.toLowerCase() === currentUser.email.toLowerCase()));
    res.json(userTxs);
  });

  app.get('/api/admin/subscriptions', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
    const userSubs = users.map(u => ({
      userId: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      whatsappNumber: u.whatsappNumber,
      role: u.role || 'user',
      isFeatured: Boolean(u.isFeatured || u.role === 'featured'),
      plan: u.subscriptionPlan,
      status: u.subscriptionStatus,
      expiresAt: u.subscriptionExpiresAt || 'N/A',
      bouncerVerified: u.bouncerVerified,
      walletBalance: u.walletBalance !== undefined ? u.walletBalance : 0
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
    saveAppData();

    res.json({
      success: true,
      message: 'Date Cart match requests submitted! Bouncer is verifying match schedules.',
      order
    });
  });

  app.get('/api/matches', (req, res) => {
    if (isAuthorizedAdmin(req)) {
      return res.json(matchOrders);
    }
    if (!currentUser) {
      return res.json([]);
    }
    const userOrders = matchOrders.filter(o => o.userId === currentUser.id);
    res.json(userOrders);
  });

  // API ROUTE 6: Admin Overview Metrics
  app.get('/api/admin/stats', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
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

    saveAppData();

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
    saveAppData();
    res.json({ success: true, reel: newReel });
  });

  app.post('/api/reels/:id/like', (req, res) => {
    const reel = reels.find(r => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    reel.isLiked = !reel.isLiked;
    reel.likesCount += reel.isLiked ? 1 : -1;
    saveAppData();
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
    saveAppData();
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
    saveAppData();
    res.json({ success: true, post: newPost });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.isLiked = !post.isLiked;
    post.likesCount += post.isLiked ? 1 : -1;
    saveAppData();
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
    saveAppData();
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

    saveAppData();
    res.json({ success: true, message: newMsg });
  });

  // ==========================================
  // NOTIFICATIONS ENDPOINTS
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const userGender = (req.query.gender as string)?.toLowerCase();
    const userId = req.query.userId as string;
    const role = req.query.role as string;

    // Admins see all notifications
    if (role === 'admin') {
      return res.json(notifications);
    }

    // Filter notifications based on targetGender:
    // If a male registered, targetGender is 'female' -> only sent to females
    // If a female registered, targetGender is 'male' -> only sent to males
    const filtered = notifications.filter(n => {
      // Direct personal notifications for this user
      if (n.userId && n.userId !== 'all') {
        return n.userId === userId;
      }

      // If notification has a specific target gender:
      if (n.targetGender && n.targetGender !== 'all') {
        if (userGender) {
          return n.targetGender === userGender;
        }
        // Visitor without selected gender sees all or general
        return true;
      }

      return true;
    });

    res.json(filtered);
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const notif = notifications.find(n => n.id === req.params.id);
    if (notif) notif.read = true;
    saveAppData();
    res.json({ success: true });
  });

  app.post('/api/notifications/clear', (_req, res) => {
    notifications = [];
    saveAppData();
    res.json({ success: true });
  });

  app.post('/api/notifications/test-new-single', (req, res) => {
    const age = Number(req.body?.age) || 24;
    const location = req.body?.city || req.body?.location || 'Harare';
    const gender = ((req.body?.gender as string) || 'male').toLowerCase();
    const isMale = gender === 'male';
    const isFemale = gender === 'female';
    const targetGender: 'male' | 'female' | 'all' = isMale ? 'female' : (isFemale ? 'male' : 'all');

    const notifTitle = isMale
      ? '❤️ New Gentleman Alert!'
      : (isFemale ? '❤️ New Lady Alert!' : '❤️ New Single Alert!');

    const notifMessage = isMale
      ? `A new gentleman (${age}, ${location}) has just registered! Check out his profile.`
      : (isFemale
          ? `A new lady (${age}, ${location}) has just registered! Check out her profile.`
          : `New Single, ${age} and ${location} has signed up`);

    const testNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'all',
      title: notifTitle,
      message: notifMessage,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      targetGender,
      gender: gender as any,
      profileId: req.body?.profileId,
      photo: req.body?.photo || (isMale ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400')
    };
    notifications.unshift(testNotif);
    saveAppData();
    res.json({ success: true, notification: testNotif });
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
    saveAppData();
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

    saveAppData();
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
    saveAppData();
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
    saveAppData();
    res.json({ success: true, ad: newAd });
  });

  app.post('/api/boost', (req, res) => {
    if (!currentUser) return res.status(401).json({ error: 'Not authenticated' });
    const pIdx = profiles.findIndex(p => p.id === currentUser.id || p.name === currentUser.name);
    if (pIdx !== -1) {
      profiles[pIdx].isBoosted = true;
      profiles[pIdx].boostExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }
    saveAppData();
    res.json({ success: true, message: 'Your profile is now Boosted for 30 minutes! 🔥' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: 'index.html', dotfiles: 'ignore' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bouncer Dating Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
