import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Users, Crown, DollarSign, ShoppingBag, Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Sparkles, Filter, Image, Upload, Settings, Phone, UserPlus } from 'lucide-react';
import { SingleProfile, PaymentTransaction, AdminStats, BouncerStatus, SubscriptionPlanId, SiteSettings, DatingIntent } from '../types';
import { ZIMBABWE_LOCATIONS } from '../data/zimbabweLocations';

interface AdminPanelProps {
  profiles: SingleProfile[];
  stats: AdminStats;
  transactions: PaymentTransaction[];
  userSubscriptions: any[];
  matchOrders: any[];
  siteSettings?: SiteSettings;
  onAddProfile: (newProfData: Partial<SingleProfile>) => void;
  onEditProfile: (id: string, updatedData: Partial<SingleProfile>) => void;
  onDeleteProfile: (id: string) => void;
  onUpdateBouncerStatus: (id: string, status: BouncerStatus, notes?: string) => void;
  onUpdateSiteSettings?: (updated: Partial<SiteSettings>) => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  profiles,
  stats,
  transactions,
  userSubscriptions,
  matchOrders,
  siteSettings,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onUpdateBouncerStatus,
  onUpdateSiteSettings,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'queue' | 'subscriptions' | 'audit' | 'orders' | 'branding'>('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Branding state
  const [siteName, setSiteName] = useState(siteSettings?.siteName || 'DATING WITH BOUNCER');
  const [logoUrl, setLogoUrl] = useState(siteSettings?.logoUrl || '');
  const [iconUrl, setIconUrl] = useState(siteSettings?.iconUrl || '');
  const [brandingSaved, setBrandingSaved] = useState(false);
  
  // New Profile Form Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAge, setNewAge] = useState(25);
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newCity, setNewCity] = useState('Harare');
  const [newSubLocation, setNewSubLocation] = useState('Borrowdale');
  const [newGender, setNewGender] = useState<'female' | 'male'>('female');
  const [newChildrenCount, setNewChildrenCount] = useState(0);
  const [newIntent, setNewIntent] = useState<DatingIntent>('Marriage');
  const [newOccupation, setNewOccupation] = useState('Professional');
  const [newBio, setNewBio] = useState('');
  const [newPhoto, setNewPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800');
  const [newBouncerStatus, setNewBouncerStatus] = useState<BouncerStatus>('verified');

  // Search state for registered users in admin panel
  const [adminUserSearch, setAdminUserSearch] = useState('');

  // Upgrade state dictionary for subscription table dropdowns
  const [upgradePlanState, setUpgradePlanState] = useState<Record<string, SubscriptionPlanId>>({});

  // Active City Sub-locations
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === newCity.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : ['CBD'];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAge) return;

    const fullLocation = `${newCity} (${newSubLocation}), Zimbabwe`;

    onAddProfile({
      name: newName,
      age: Number(newAge),
      city: newCity,
      subLocation: newSubLocation,
      location: fullLocation,
      childrenCount: Number(newChildrenCount),
      intent: newIntent,
      whatsappNumber: newWhatsapp || '+263 77 123 4567',
      gender: newGender,
      occupation: newOccupation,
      bio: newBio || 'Newly added single on Dating With Bouncer.',
      photos: [newPhoto],
      interests: ['Dating', 'Travel', 'Music'],
      bouncerStatus: newBouncerStatus,
      bouncerNotes: 'Added & Verified by Admin Bouncer.'
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewBio('');
    setNewWhatsapp('');
  };

  const handleUpgradeUser = async (userId: string, targetPlan: SubscriptionPlanId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/upgrade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: targetPlan, bouncerVerified: true })
      });
      if (res.ok) {
        onRefreshData();
      } else {
        alert('Failed to upgrade user subscription.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove user "${userName}" and their profile?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onDeleteProfile(userId);
        onRefreshData();
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      alert('Error removing user.');
    }
  };

  const handleBrandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSiteSettings) {
      onUpdateSiteSettings({
        siteName,
        logoUrl,
        iconUrl
      });
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
    }
  };

  const filteredProfiles = profiles.filter(
    p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.occupation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingQueue = profiles.filter(p => p.bouncerStatus === 'pending_check');
  const paidTransactions = transactions.filter(t => t.amount > 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                  Bouncer Admin Control Panel
                </h1>
                <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full">
                  HQ Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage singles profiles, audit bouncer identity clearances, and track membership billing subscriptions.
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshData}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Admin Data
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-800">
          
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Singles</div>
            <div className="text-xl font-extrabold text-white font-serif mt-1">{stats.totalProfiles}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified Singles</div>
            <div className="text-xl font-extrabold text-emerald-400 font-serif mt-1">{stats.verifiedProfiles}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Bouncer Queue</div>
            <div className="text-xl font-extrabold text-amber-300 font-serif mt-1">{stats.pendingBouncerQueue}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Active Subscribers</div>
            <div className="text-xl font-extrabold text-rose-300 font-serif mt-1">{stats.activeSubscriptions}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Monthly Revenue</div>
            <div className="text-xl font-extrabold text-amber-400 font-serif mt-1">${stats.monthlyRevenue}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cart Match Orders</div>
            <div className="text-xl font-extrabold text-white font-serif mt-1">{stats.totalCartOrders}</div>
          </div>

        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'profiles'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Manage Profiles ({profiles.length})
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 relative ${
            activeTab === 'queue'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Bouncer Clearance Queue
          {pendingQueue.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {pendingQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'subscriptions'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          Subscriptions & Plans
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Payment Audit Logs ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Cart Match Orders ({matchOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Brand & Logo Settings
        </button>
      </div>

      {/* TAB 1: MANAGE PROFILES */}
      {activeTab === 'profiles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search profiles..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add New Single Profile
            </button>
          </div>

          {/* Profiles Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Profile</th>
                  <th className="p-3">Name, Age & Location</th>
                  <th className="p-3">Occupation</th>
                  <th className="p-3">Bouncer Badge</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <img
                        src={p.photos[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                    </td>
                    <td className="p-3 font-semibold text-white">
                      <div className="text-sm">{p.name}, <span className="text-amber-400">{p.age}</span></div>
                      <div className="text-[11px] text-slate-400 font-normal">📍 {p.location}</div>
                    </td>
                    <td className="p-3">{p.occupation}</td>
                    <td className="p-3">
                      {p.bouncerStatus === 'vip_approved' ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          ✨ VIP Approved
                        </span>
                      ) : p.bouncerStatus === 'verified' ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          ✅ Verified
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-[10px]">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onDeleteProfile(p.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BOUNCER CLEARANCE QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-extrabold text-white font-serif mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Bouncer Identity Verification Queue
          </h3>

          {pendingQueue.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              🎉 Bouncer queue is clean! All profiles currently have verified or VIP approved badges.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQueue.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-white font-serif">
                        {p.name}, <span className="text-amber-400 font-sans">{p.age}</span>
                      </h4>
                      <p className="text-xs text-slate-400">📍 {p.location} • {p.occupation}</p>
                      <p className="text-xs text-slate-300 italic mt-1">"{p.bio}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => onUpdateBouncerStatus(p.id, 'vip_approved', 'Granted VIP Status by Bouncer Admin')}
                      className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                    >
                      ✨ VIP Approve
                    </button>
                    <button
                      onClick={() => onUpdateBouncerStatus(p.id, 'verified', 'ID Verified by Bouncer Admin')}
                      className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                    >
                      ✅ Verify ID
                    </button>
                    <button
                      onClick={() => onUpdateBouncerStatus(p.id, 'bounced', 'Flagged by Bouncer Admin')}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Bounce Profile"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS & USER MANAGEMENT */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-700" />
                Manage Registered Users & Membership Upgrades
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Search and manage registered users by name, email, or WhatsApp number</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Admin Search By User Name / Email / WhatsApp */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name..."
                  value={adminUserSearch}
                  onChange={(e) => setAdminUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-emerald-50 text-emerald-950 uppercase text-[10px] font-extrabold tracking-wider border-b border-emerald-200">
                <tr>
                  <th className="p-3">User & Contact</th>
                  <th className="p-3">Current Plan</th>
                  <th className="p-3">Bouncer Verified</th>
                  <th className="p-3">Upgrade Membership</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {userSubscriptions
                  .filter((u) => {
                    if (!adminUserSearch.trim()) return true;
                    const query = adminUserSearch.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(query) ||
                      (u.email && u.email.toLowerCase().includes(query)) ||
                      (u.whatsappNumber && u.whatsappNumber.toLowerCase().includes(query))
                    );
                  })
                  .map((u, idx) => {
                    const currentSelectedPlan = upgradePlanState[u.id] || u.plan || 'starter_3_or_4';
                    return (
                      <tr key={u.id || idx} className="hover:bg-emerald-50/50">
                        <td className="p-3 font-semibold text-slate-900">
                          <div className="text-sm font-bold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{u.email}</div>
                          {u.whatsappNumber && (
                            <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {u.whatsappNumber}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            u.plan === 'vip_15_singles' || u.plan === 'vip_monthly'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.plan === 'starter_3_or_4'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.plan ? u.plan.replace(/_/g, ' ') : 'Free Pass'}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.bouncerVerified ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={currentSelectedPlan}
                              onChange={(e) => setUpgradePlanState({ ...upgradePlanState, [u.id]: e.target.value as SubscriptionPlanId })}
                              className="bg-slate-50 border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="free">Free Pass ($0)</option>
                              <option value="starter_3_or_4">$6 Starter (3-4 Singles)</option>
                              <option value="vip_15_singles">$10 VIP Bundle (10 Singles)</option>
                            </select>

                            <button
                              onClick={() => handleUpgradeUser(u.id, currentSelectedPlan)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider shrink-0 shadow-sm"
                            >
                              Upgrade
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveUser(u.id, u.name)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Remove User & Single Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-extrabold text-white font-serif mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Gateway Payment Audit Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">TX ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Card</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-amber-400">{tx.id}</td>
                    <td className="p-3 font-semibold text-white">{tx.userName}</td>
                    <td className="p-3">{tx.planName}</td>
                    <td className="p-3 font-bold text-emerald-400">${tx.amount.toFixed(2)}</td>
                    <td className="p-3">{tx.cardBrand} •••• {tx.cardLast4}</td>
                    <td className="p-3 text-[11px] text-slate-400">{new Date(tx.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CART MATCH ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-extrabold text-white font-serif mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-400" />
            Cart Match Requests Log
          </h3>

          <div className="space-y-4">
            {matchOrders.map((ord) => (
              <div key={ord.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs mb-3">
                  <span className="font-mono text-amber-400 font-bold">{ord.id}</span>
                  <span className="text-slate-400">Order by <strong>{ord.userName}</strong></span>
                  <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize">
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {ord.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-xs bg-slate-900 p-2.5 rounded-xl">
                      <img
                        src={it.profile.photos[0]}
                        alt={it.profile.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-white">{it.profile.name}, {it.profile.age} ({it.profile.location})</div>
                        <div className="text-[11px] text-slate-400">Date Type: <strong className="text-amber-400">{it.dateType}</strong></div>
                        <div className="text-[11px] text-slate-300 italic">"{it.icebreakerMessage}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BRANDING & LOGO SETTINGS */}
      {activeTab === 'branding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-serif">
                Brand Logo & Site Icon Settings
              </h2>
              <p className="text-xs text-slate-400">
                Upload custom logo image and site icon for DATING WITH BOUNCER.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateSiteSettings) {
                onUpdateSiteSettings({ siteName, logoUrl, iconUrl });
              }
              setBrandingSaved(true);
              setTimeout(() => setBrandingSaved(false), 2500);
            }}
            className="space-y-6 max-w-2xl text-xs"
          >
            {/* Site Name */}
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2">
                Site Name
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder="DATING WITH BOUNCER"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Header Logo Image Upload / URL */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-amber-400 uppercase tracking-wider">
                    Header Logo Image
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Upload an image file or paste an image URL to display as the primary header logo.
                  </p>
                </div>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-[11px] text-rose-400 hover:underline font-bold"
                  >
                    Reset Logo
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 shrink-0">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Upload Logo File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <div className="text-slate-500 text-[11px] font-bold uppercase">or</div>

                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="Paste Logo Image URL (https://...)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Logo Preview */}
              {logoUrl ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Preview:</div>
                  <img src={logoUrl} alt="Logo Preview" referrerPolicy="no-referrer" className="h-10 max-w-[180px] object-contain rounded-lg border border-slate-800 p-1 bg-slate-950" />
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">No custom logo set. Using default brand typography.</div>
              )}
            </div>

            {/* Site Icon Upload / URL */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-amber-400 uppercase tracking-wider">
                    Site Icon / Favicon
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Upload an icon file or paste an image URL to replace the Bouncer shield icon.
                  </p>
                </div>
                {iconUrl && (
                  <button
                    type="button"
                    onClick={() => setIconUrl('')}
                    className="text-[11px] text-rose-400 hover:underline font-bold"
                  >
                    Reset Icon
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 shrink-0">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Upload Icon File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setIconUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <div className="text-slate-500 text-[11px] font-bold uppercase">or</div>

                <input
                  type="text"
                  value={iconUrl}
                  onChange={e => setIconUrl(e.target.value)}
                  placeholder="Paste Icon Image URL (https://...)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Icon Preview */}
              {iconUrl ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Preview:</div>
                  <img src={iconUrl} alt="Icon Preview" referrerPolicy="no-referrer" className="w-8 h-8 object-contain rounded-lg border border-slate-800 p-1 bg-slate-950" />
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">No custom icon set. Using default Bouncer Shield icon.</div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {brandingSaved ? 'Brand Settings Saved!' : 'Save Branding Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Single Profile Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-white font-serif mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              Add New Single Profile
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    required
                    value={newAge}
                    onChange={e => setNewAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-400 font-bold mb-1">📱 WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={newWhatsapp}
                  onChange={e => setNewWhatsapp(e.target.value)}
                  placeholder="+263 77 123 4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as 'female' | 'male')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">👶 Number of Children</label>
                  <select
                    value={newChildrenCount}
                    onChange={e => setNewChildrenCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={0}>0 (No children)</option>
                    <option value={1}>1 Child</option>
                    <option value={2}>2 Children</option>
                    <option value={3}>3+ Children</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">📍 Zimbabwe City</label>
                  <select
                    value={newCity}
                    onChange={e => {
                      const nextCity = e.target.value;
                      setNewCity(nextCity);
                      const nextData = ZIMBABWE_LOCATIONS.find((l) => l.city === nextCity);
                      if (nextData && nextData.subLocations.length > 0) {
                        setNewSubLocation(nextData.subLocations[0]);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {ZIMBABWE_LOCATIONS.map((loc) => (
                      <option key={loc.city} value={loc.city}>
                        {loc.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">🏘️ Sub-location</label>
                  <select
                    value={newSubLocation}
                    onChange={e => setNewSubLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {availableSubLocations.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">💍 Dating Intent</label>
                  <select
                    value={newIntent}
                    onChange={e => setNewIntent(e.target.value as DatingIntent)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  >
                    <option value="Marriage">💍 Seeking Marriage</option>
                    <option value="Funny">😂 Funny & Good Vibe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Occupation</label>
                  <input
                    type="text"
                    value={newOccupation}
                    onChange={e => setNewOccupation(e.target.value)}
                    placeholder="e.g. Business Executive"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">📸 Photo Image (Upload File or Enter URL)</label>
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <img
                    src={newPhoto}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-amber-500/40"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor="admin-photo-upload"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] border border-slate-700 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" /> Choose File from Device
                    </label>
                    <input
                      id="admin-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setNewPhoto(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={newPhoto}
                      onChange={e => setNewPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                  placeholder="Describe personality & dating goals..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black uppercase"
                >
                  Create Single Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
