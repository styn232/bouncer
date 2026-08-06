import React from 'react';
import { Search, MapPin, Filter, ShieldCheck, RefreshCw } from 'lucide-react';
import { BouncerStatus } from '../types';

interface SinglesFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  selectedBouncerStatus: string;
  setSelectedBouncerStatus: (status: string) => void;
  locationsList: string[];
  onReset: () => void;
  totalResults: number;
}

export const SinglesFilterBar: React.FC<SinglesFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  setSelectedLocation,
  selectedGender,
  setSelectedGender,
  selectedBouncerStatus,
  setSelectedBouncerStatus,
  locationsList,
  onReset,
  totalResults
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search singles by Name, Age, Location, Occupation, or Interest..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Location Filter */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 rounded-xl pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Locations</option>
              {locationsList.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Gender Singles</option>
              <option value="female">Female Singles</option>
              <option value="male">Male Singles</option>
              <option value="non-binary">Non-binary Singles</option>
            </select>
          </div>

          {/* Bouncer Verification Filter */}
          <div className="col-span-2 sm:col-span-1">
            <select
              value={selectedBouncerStatus}
              onChange={e => setSelectedBouncerStatus(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/30 text-xs sm:text-sm text-amber-300 font-semibold rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-amber-500"
            >
              <option value="all">🛡️ All Bouncer Statuses</option>
              <option value="vip_approved">✨ VIP Approved Only</option>
              <option value="verified">✅ Bouncer Verified</option>
              <option value="pending_check">⏳ Pending Review</option>
            </select>
          </div>

        </div>

        {/* Reset & Stats Action */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            Showing <strong className="text-amber-400">{totalResults}</strong> vetted singles
          </span>
          <button
            onClick={onReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Reset All Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

      </div>
    </div>
  );
};
