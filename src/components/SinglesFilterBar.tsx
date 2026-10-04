import React, { useState } from 'react';
import { Search, MapPin, Filter, RefreshCw, ChevronDown, ChevronUp, Star, Heart, HeartPulse, Building2, Landmark } from 'lucide-react';
import { ZIMBABWE_PROVINCES, ZIMBABWE_LOCATIONS, getCitiesByProvince } from '../data/zimbabweLocations';

interface SinglesFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedProvince?: string;
  setSelectedProvince?: (province: string) => void;
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
  selectedHivStatus?: string;
  setSelectedHivStatus?: (status: string) => void;
  selectedBouncerStatus: string;
  setSelectedBouncerStatus: (status: string) => void;
  sortByStars?: boolean;
  setSortByStars?: (stars: boolean) => void;
  onReset: () => void;
  totalResults: number;
  viewerGender?: string;
}

export const SinglesFilterBar: React.FC<SinglesFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedProvince = 'all',
  setSelectedProvince,
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
  selectedHivStatus = 'all',
  setSelectedHivStatus,
  selectedBouncerStatus,
  setSelectedBouncerStatus,
  sortByStars = true,
  setSortByStars,
  onReset,
  totalResults,
  viewerGender
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [internalProvince, setInternalProvince] = useState(selectedProvince);

  const activeProvince = setSelectedProvince ? selectedProvince : internalProvince;
  const handleProvinceChange = (prov: string) => {
    if (setSelectedProvince) {
      setSelectedProvince(prov);
    } else {
      setInternalProvince(prov);
    }
    // If a province is selected and the current city does not belong to it, reset city
    if (prov !== 'all') {
      const citiesInProv = getCitiesByProvince(prov);
      if (!citiesInProv.some(c => c.city.toLowerCase() === selectedCity.toLowerCase())) {
        setSelectedCity('all');
        setSelectedSubLocation('all');
      }
    }
  };

  // Filter available cities based on province
  const availableCities = activeProvince === 'all'
    ? ZIMBABWE_LOCATIONS
    : getCitiesByProvince(activeProvince);

  // Available sub-locations based on selected city
  const activeCityData = ZIMBABWE_LOCATIONS.find((l) => l.city.toLowerCase() === selectedCity.toLowerCase());
  const availableSubLocations = activeCityData ? activeCityData.subLocations : [];

  const filterContent = (
    <div className="space-y-5 text-xs text-slate-700">
      
      {/* Search Input */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
          Search Singles & Dating Keywords
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords (e.g. Marriage, Harare, Verified, Engineer)..."
            className="w-full bg-rose-50/40 border border-rose-200 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Popular Keyword Search Quick Pills */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {['Marriage', 'Harare', 'Bulawayo', 'Borrowdale', 'Verified', 'Professional', 'Travel', 'Funny'].map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setSearchTerm(searchTerm === kw ? '' : kw)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-all border ${
                searchTerm.toLowerCase() === kw.toLowerCase()
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-50/80 hover:bg-rose-100 text-rose-900 border-rose-200/80'
              }`}
            >
              #{kw}
            </button>
          ))}
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
              ? 'bg-rose-100 text-rose-950 border-rose-300 ring-1 ring-rose-400'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50'
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

      {/* Location Hierarchy: Province -> City -> Suburb */}
      <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Zimbabwe Location
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {activeProvince === 'all' ? 'All Zimbabwe' : activeProvince.split(' ')[0]}
          </span>
        </div>

        {/* 1. Zimbabwe Province Filter */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
            🏛️ 1. Province (10 Provinces)
          </label>
          <div className="relative">
            <Landmark className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
            <select
              value={activeProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full bg-white border border-emerald-200 text-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="all">All 10 Provinces</option>
              {ZIMBABWE_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.citiesCount} centres)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Zimbabwe City / Town Filter */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
            📍 2. City / Town / Centre
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedSubLocation('all');
              }}
              className="w-full bg-white border border-emerald-200 text-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="all">
                {activeProvince === 'all' ? 'All Cities / Towns (60+ centres)' : `All Centres in ${activeProvince}`}
              </option>
              {activeProvince === 'all' ? (
                // Group by Province
                ZIMBABWE_PROVINCES.map((prov) => {
                  const citiesInProv = getCitiesByProvince(prov.name);
                  if (citiesInProv.length === 0) return null;
                  return (
                    <optgroup key={prov.name} label={`── ${prov.name} ──`}>
                      {citiesInProv.map((loc) => (
                        <option key={loc.city} value={loc.city}>
                          {loc.city} ({loc.type || 'Town'})
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              ) : (
                availableCities.map((loc) => (
                  <option key={loc.city} value={loc.city}>
                    {loc.city} ({loc.type || 'Town'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* 3. Sub-location / Suburb Filter */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
            🏘️ 3. Sub-location / Suburb
          </label>
          <select
            value={selectedSubLocation}
            onChange={(e) => setSelectedSubLocation(e.target.value)}
            disabled={selectedCity === 'all' && availableSubLocations.length === 0}
            className="w-full bg-white border border-emerald-200 text-slate-900 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold disabled:opacity-50"
          >
            <option value="all">
              {selectedCity === 'all' ? 'All Sub-locations' : `All ${selectedCity} Suburbs (${availableSubLocations.length})`}
            </option>
            {availableSubLocations.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gender Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Gender</span>
          {(viewerGender === 'male' || viewerGender === 'female') && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
              {viewerGender === 'male' ? 'Men see Ladies' : 'Ladies see Men'}
            </span>
          )}
        </label>
        {viewerGender === 'male' ? (
          <div className="w-full bg-rose-50 border border-rose-300 text-rose-950 rounded-xl px-3 py-2 text-xs font-extrabold flex items-center justify-between">
            <span>👩 Single Ladies Only</span>
            <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">Matched</span>
          </div>
        ) : viewerGender === 'female' ? (
          <div className="w-full bg-amber-50 border border-amber-300 text-amber-950 rounded-xl px-3 py-2 text-xs font-extrabold flex items-center justify-between">
            <span>👨 Single Gentlemen Only</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">Matched</span>
          </div>
        ) : (
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full bg-slate-50 border border-emerald-200 text-slate-900 rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="all">All Genders</option>
            <option value="female">👩 Single Ladies Only</option>
            <option value="male">👨 Single Gentlemen Only</option>
          </select>
        )}
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

      {/* HIV Status Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            <span>HIV Status</span>
          </span>
          {selectedHivStatus !== 'all' && (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded">Filter On</span>
          )}
        </label>
        <select
          value={selectedHivStatus}
          onChange={(e) => setSelectedHivStatus && setSelectedHivStatus(e.target.value)}
          className="w-full bg-slate-50 border border-rose-200 text-slate-900 font-bold rounded-xl px-3 py-2 text-xs appearance-none focus:outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="all">All (HIV+ &amp; HIV-)</option>
          <option value="HIV-">🛡️ HIV- (Negative)</option>
          <option value="HIV+">💜 HIV+ (Positive)</option>
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
      <div className="pt-3 border-t border-rose-200/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-600 font-medium">
          Found <strong className="text-rose-700 font-extrabold">{totalResults}</strong> singles
        </span>
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors border border-rose-200/60"
        >
          <RefreshCw className="w-3 h-3 text-rose-600" />
          Reset All
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* 1. DESKTOP VIEW: Left Sticky Sidebar */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
        <div className="sticky top-24 bg-white border border-rose-200/90 rounded-3xl p-6 shadow-md shadow-rose-950/5">
          <div className="flex items-center gap-2 pb-4 border-b border-rose-100 mb-5 text-rose-950 font-serif font-bold text-base">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-500/20" />
            <span>Filter Singles</span>
          </div>

          {filterContent}
        </div>
      </aside>

      {/* 2. MOBILE VIEW: Top Filter Bar & Accordion */}
      <div className="lg:hidden w-full mb-6">
        <div className="bg-white border border-rose-200/90 rounded-2xl p-4 shadow-md shadow-rose-950/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-500/20" />
              <span>Filter Singles</span>
              <span className="bg-rose-100 text-rose-900 text-xs px-2.5 py-0.5 rounded-full font-sans font-extrabold">
                {totalResults} results
              </span>
            </div>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{isMobileOpen ? 'Close Filters' : 'Filter Options'}</span>
              {isMobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Mobile Drawer */}
          {isMobileOpen && (
            <div className="mt-4 pt-4 border-t border-rose-100">
              {filterContent}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

