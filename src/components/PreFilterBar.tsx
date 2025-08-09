import React from 'react';
import { Search, Calendar, Film, SortAsc } from 'lucide-react';

export interface PreFilters {
  genre: string;
  year: string;
  sortBy: string;
}

interface PreFilterBarProps {
  filters: PreFilters;
  onFiltersChange: (filters: PreFilters) => void;
  onSearch: () => void;
  loading?: boolean;
}

const GENRES = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '10770', name: 'TV Movie' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'title.asc', label: 'A-Z' },
  { value: 'title.desc', label: 'Z-A' },
];

export function PreFilterBar({ filters, onFiltersChange, onSearch, loading }: PreFilterBarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const updateFilter = (key: keyof PreFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  return (
    <div className="glassmorphism rounded-2xl border border-white/20 p-6 mb-8 animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Search className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-extrabold text-white tracking-tight">Search Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider flex items-center space-x-2">
            <Film className="w-4 h-4" />
            <span>Genre</span>
          </label>
          <select
            value={filters.genre}
            onChange={(e) => updateFilter('genre', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all font-medium"
          >
            {GENRES.map((genre) => (
              <option key={genre.id} value={genre.id} className="bg-gray-800">
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Release Year</span>
          </label>
          <select
            value={filters.year}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all font-medium"
          >
            <option value="" className="bg-gray-800">All Years</option>
            {years.slice(0, 50).map((year) => (
              <option key={year} value={year.toString()} className="bg-gray-800">
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider flex items-center space-x-2">
            <SortAsc className="w-4 h-4" />
            <span>Sort By</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all font-medium"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-xl hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
          ) : (
            <Search className="w-5 h-5" />
          )}
          <span>Apply Filters</span>
        </button>
      </div>
    </div>
  );
}