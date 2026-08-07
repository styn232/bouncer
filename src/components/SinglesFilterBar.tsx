import React, { useState } from 'react';
import { Search, MapPin, Filter, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, Sparkles, Heart, Baby } from 'lucide-react';
import { ZIMBABWE_LOCATIONS } from '../data/zimbabweLocations';

interface SinglesFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedSubLocation: string;
  setSelectedSubLocation: (sub: string) => void;
  minAge: number;
  setMinAge: (age: number) => void;
  maxAge: number;
  setMaxAge: (age: number) => void;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  selectedChildren: string;
  setSelectedChildren: (child: string) => void;
  selectedIntent: string;
  setSelectedIntent: (intent: string) => void;
  selectedBouncerStatus: string;
  setSelectedBouncerStatus: (status: string) => void;
  onReset: () => void;
  totalResults: number;
}

export const SinglesFilterBar: React.FC<SinglesFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  selectedSubLocation,
  setSelectedSubLocation,
  minAge,
  setMinAge,
  maxAge,
  setMaxAge,
  selectedGender,
  setSelectedGender,
  selectedChildren,
  setSelectedChildren,
  selectedIntent,
  setSelectedIntent,
  selectedBouncerStatus,
  setSelectedBouncerStatus,
  onReset,
  totalResults
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Available sub-locations based on selected city
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === selectedCity.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : [];

  const filterContent = (
    <div className="space-y-5 text-xs text-slate-300">
      
      {/* Search Input */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Search Singles
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, bio, occupation..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Age Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Age Range
          </label>
          <span className="font-extrabold text-amber-400 text-xs">
            {minAge} - {maxAge} yrs
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500">Min Age</span>
            <input
              type="number"
              min={18}
              max={maxAge}
              value={minAge}
              onChange={(e) => setMinAge(Math.max(18, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Max Age</span>
            <input
              type="number"
              min={minAge}
              max={80}
              value={maxAge}
              onChange={(e) => setMaxAge(Math.min(80, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Zimbabwe City Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          📍 Zimbabwe City
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedSubLocation('all'); // reset sublocation when city changes
            }}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs appearance-none focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Zimbabwe Cities</option>
            {ZIMBABWE_LOCATIONS.map((loc) => (
              <option key={loc.city} value={loc.city}>
                {loc.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-location / Suburb Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          🏘️ Sub-location / Suburb
        </label>
        <select
          value={selectedSubLocation}
          onChange={(e) => setSelectedSubLocation(e.target.value)}
          disabled={selectedCity === 'all' && availableSubLocations.length === 0}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-amber-500 disabled:opacity-50"
        >
          <option value="all">
            {selectedCity === 'all' ? 'All Sub-locations' : `All ${selectedCity} Suburbs`}
          </option>
          {availableSubLocations.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Gender
        </label>
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Genders</option>
          <option value="female">Female Singles</option>
          <option value="male">Male Singles</option>
          <option value="non-binary">Non-binary Singles</option>
        </select>
      </div>

      {/* Number of Children Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          👶 Number of Children
        </label>
        <select
          value={selectedChildren}
          onChange={(e) => setSelectedChildren(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-amber-500"
        >
          <option value="all">Any Children Count</option>
          <option value="0">0 (No children)</option>
          <option value="1">1 Child</option>
          <option value="2">2 Children</option>
          <option value="3+">3 or more Children</option>
        </select>
      </div>

      {/* Dating Intent Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          💍 Dating Intent
        </label>
        <select
          value={selectedIntent}
          onChange={(e) => setSelectedIntent(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-bold rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Intentions</option>
          <option value="Marriage">💍 Seeking Marriage</option>
          <option value="Funny">😂 Funny & Good Vibe</option>
        </select>
      </div>

      {/* Bouncer Verification Status Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          🛡️ Bouncer Verification
        </label>
        <select
          value={selectedBouncerStatus}
          onChange={(e) => setSelectedBouncerStatus(e.target.value)}
          className="w-full bg-slate-950 border border-amber-500/30 text-amber-300 font-semibold rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Bouncer Statuses</option>
          <option value="vip_approved">✨ VIP Approved Only</option>
          <option value="verified">✅ Bouncer Verified</option>
          <option value="pending_check">⏳ Pending Review</option>
        </select>
      </div>

      {/* Reset Button & Results Counter */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Found <strong className="text-amber-400">{totalResults}</strong> singles
        </span>
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset All
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* 1. DESKTOP VIEW: Left Sticky Sidebar */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
        <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5 text-white font-serif font-bold text-base">
            <Filter className="w-5 h-5 text-amber-400" />
            <span>Filter Singles</span>
          </div>

          {filterContent}
        </div>
      </aside>

      {/* 2. MOBILE VIEW: Top Filter Bar & Accordion */}
      <div className="lg:hidden w-full mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-amber-400" />
              <span>Filter Singles</span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-sans">
                {totalResults} results
              </span>
            </div>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>{isMobileOpen ? 'Close Filters' : 'Filter Options'}</span>
              {isMobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Mobile Drawer */}
          {isMobileOpen && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              {filterContent}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
