import React from 'react';
import { Filter, X, Star, Clock, Calendar, Eye, EyeOff } from 'lucide-react';

export interface PostFilters {
  minRating: number;
  minRuntime: number;
  minYear: number;
  hideWatched: boolean;
  userRatingFilter: number | null; // Filter by user's own rating
}

interface PostFilterBarProps {
  filters: PostFilters;
  onFiltersChange: (filters: PostFilters) => void;
  onClear: () => void;
  resultsCount: number;
}

export function PostFilterBar({ filters, onFiltersChange, onClear, resultsCount }: PostFilterBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const hasActiveFilters = 
    filters.minRating > 0 ||
    filters.minRuntime > 0 ||
    filters.minYear > 1900 ||
    filters.hideWatched ||
    filters.userRatingFilter !== null;

  const updateFilter = (key: keyof PostFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="glassmorphism rounded-2xl border border-white/20 mb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-3 text-white hover:text-yellow-400 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-bold">Post Filters</span>
            <span className="text-sm text-gray-400">({resultsCount} results)</span>
          </button>
          
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full font-medium">
                Filters Active
              </span>
              <button
                onClick={onClear}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-white/20 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* IMDb Rating Range */}
            <div>
              <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Min IMDb Rating</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minRating}
                  onChange={(e) => updateFilter('minRating', parseFloat(e.target.value))}
                  className="flex-1 accent-yellow-400"
                />
                <span className="text-white font-medium w-12 text-center">
                  {filters.minRating.toFixed(1)}+
                </span>
              </div>
            </div>

            {/* Min Runtime */}
            <div>
              <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Min Runtime</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={filters.minRuntime}
                  onChange={(e) => updateFilter('minRuntime', parseInt(e.target.value))}
                  className="flex-1 accent-yellow-400"
                />
                <span className="text-white font-medium w-12 text-center">
                  {filters.minRuntime}+ min
                </span>
              </div>
            </div>

            {/* Min Release Year */}
            <div>
              <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>From Year</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.minYear}
                  onChange={(e) => updateFilter('minYear', parseInt(e.target.value))}
                  className="flex-1 accent-yellow-400"
                />
                <span className="text-white font-medium w-16 text-center">
                  {filters.minYear}+
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/20">
            <button
              onClick={() => updateFilter('hideWatched', !filters.hideWatched)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
                filters.hideWatched
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
            >
              {filters.hideWatched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Hide Watched</span>
            </button>

            {/* User Rating Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">My Rating:</span>
              <select
                value={filters.userRatingFilter || ''}
                onChange={(e) => updateFilter('userRatingFilter', e.target.value ? parseInt(e.target.value) : null)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                <option value="3">⭐⭐⭐ (3 stars)</option>
                <option value="2">⭐⭐ (2 stars)</option>
                <option value="1">⭐ (1 star)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}