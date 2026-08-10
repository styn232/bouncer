import React, { useState } from 'react';
import { Search, MapPin, Filter, RefreshCw, ChevronDown, ChevronUp, Star } from 'lucide-react';
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
  sortByStars?: boolean;
  setSortByStars?: (stars: boolean) => void;
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
  sortByStars = true,
  setSortByStars,
  onReset,
  totalResults
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Available sub-locations based on selected city
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === selectedCity.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : [];

  const filterContent = (
    <div className="space-y-5 text-xs text-slate-700">
      
      {/* Search Input */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          Search Singles
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, bio, occupation..."
            className="w-full bg-slate-50 border border-emerald-200 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Ranking / Star Rating Sort Toggle */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          ⭐ Display Ranking Order
        </label>
        <button
          onClick={() => setSortByStars && setSortByStars(!sortByStars)}
          className={`w-full py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-between transition-all ${
            sortByStars
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            Ranked by Stars (Highest First)
          </span>
          <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
            {sortByStars ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Age Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
            Age Range
          </label>
          <span className="font-extrabold text-emerald-800 text-xs">
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
              className="w-full bg-slate-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
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
              className="w-full bg-slate-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Zimbabwe City Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          📍 Zimbabwe City
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedSubLocation('all');
            }}
            className="w-full bg-slate-50 border border-emerald-200 text-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold"
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
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          🏘️ Sub-location / Suburb
        </label>
        <select
          value={selectedSubLocation}
          onChange={(e) => setSelectedSubLocation(e.target.value)}
          disabled={selectedCity === 'all' && availableSubLocations.length === 0}
          className="w-full bg-slate-50 border border-emerald-200 text-slate-900 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold disabled:opacity-50"
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
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          Gender
        </label>
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="w-full bg-slate-50 border border-emerald-200 text-slate-900 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold"
        >
          <option value="all">All Genders</option>
          <option value="female">Single Ladies Only</option>
          <option value="male">Single Gentlemen Only</option>
          <option value="non-binary">Non-binary Singles</option>
        </select>
      </div>

      {/* Number of Children Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          👶 Number of Children
        </label>
        <select
          value={selectedChildren}
          onChange={(e) => setSelectedChildren(e.target.value)}
          className="w-full bg-slate-50 border border-emerald-200 text-slate-900 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold"
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
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          💍 Dating Intent
        </label>
        <select
          value={selectedIntent}
          onChange={(e) => setSelectedIntent(e.target.value)}
          className="w-full bg-slate-50 border border-emerald-200 text-slate-900 font-bold rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Intentions</option>
          <option value="Marriage">💍 Seeking Marriage</option>
          <option value="Funny">😂 Funny & Good Vibe</option>
        </select>
      </div>

      {/* Bouncer Verification Status Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          🛡️ Bouncer Verification
        </label>
        <select
          value={selectedBouncerStatus}
          onChange={(e) => setSelectedBouncerStatus(e.target.value)}
          className="w-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Bouncer Statuses</option>
          <option value="vip_approved">✨ VIP Approved Only</option>
          <option value="verified">✅ Bouncer Verified</option>
          <option value="pending_check">⏳ Pending Review</option>
        </select>
      </div>

      {/* Reset Button & Results Counter */}
      <div className="pt-3 border-t border-emerald-200 flex items-center justify-between">
        <span className="text-[11px] text-slate-600 font-medium">
          Found <strong className="text-emerald-800">{totalResults}</strong> singles
        </span>
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
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
        <div className="sticky top-24 bg-white border border-emerald-200 rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-2 pb-4 border-b border-emerald-200 mb-5 text-emerald-950 font-serif font-bold text-base">
            <Filter className="w-5 h-5 text-emerald-700" />
            <span>Filter Singles</span>
          </div>

          {filterContent}
        </div>
      </aside>

      {/* 2. MOBILE VIEW: Top Filter Bar & Accordion */}
      <div className="lg:hidden w-full mb-6">
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span>Filter Singles</span>
              <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded-full font-sans font-bold">
                {totalResults} results
              </span>
            </div>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <span>{isMobileOpen ? 'Close Filters' : 'Filter Options'}</span>
              {isMobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Mobile Drawer */}
          {isMobileOpen && (
            <div className="mt-4 pt-4 border-t border-emerald-200">
              {filterContent}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

