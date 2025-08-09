import React from 'react';
import { Star, Calendar, Globe, Film, X, Filter } from 'lucide-react';

export interface SearchFilters {
  genres: string[];
  year: string;
  minRating: number;
  language: string;
}

interface DynamicFilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
  isVisible: boolean;
}

// TMDb official genre list
export const TMDB_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

// TMDb supported languages
export const TMDB_LANGUAGES = [
  { code: '', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any Rating' },
  { value: 5, label: '5.0+ Stars' },
  { value: 6, label: '6.0+ Stars' },
  { value: 7, label: '7.0+ Stars' },
  { value: 8, label: '8.0+ Stars' },
  { value: 9, label: '9.0+ Stars' },
];

export function DynamicFilterBar({ filters, onFiltersChange, onClear, isVisible }: DynamicFilterBarProps) {
  const hasActiveFilters = 
    filters.genres.length > 0 ||
    filters.year !== '' ||
    filters.minRating > 0 ||
    filters.language !== '';

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleGenre = (genreId: string) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    updateFilter('genres', newGenres);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  if (!isVisible) return null;

  return (
    <div className="glassmorphism rounded-2xl border border-white/20 p-6 mb-8 animate-slide-up" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5" style={{ color: '#f5c518' }} />
          <h3 className="text-lg font-extrabold text-white tracking-tight">Refine Search</h3>
          {hasActiveFilters && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#f5c518', color: '#1a1a1a' }}>
              {filters.genres.length + (filters.year ? 1 : 0) + (filters.minRating > 0 ? 1 : 0) + (filters.language ? 1 : 0)} active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Genres */}
        <div>
          <label className="block text-sm font-extrabold mb-3 uppercase tracking-wider flex items-center space-x-2" style={{ color: '#f5c518' }}>
            <Film className="w-4 h-4" />
            <span>Genres</span>
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto md:max-h-none md:overflow-visible">
            {TMDB_GENRES.map((genre) => (
              <button
                key={genre.id.toString()}
                onClick={() => toggleGenre(genre.id.toString())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 transform ${
                  filters.genres.includes(genre.id.toString())
                    ? 'shadow-lg font-bold'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border hover:border-opacity-60'
                }`}
                style={filters.genres.includes(genre.id.toString()) 
                  ? { backgroundColor: '#f5c518', color: '#1a1a1a' }
                  : { borderColor: '#f5c518', borderOpacity: 0.3 }
                }
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row - Year, Rating, Language */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Release Year */}
          <div>
            <label className="block text-sm font-extrabold mb-3 uppercase tracking-wider flex items-center space-x-2" style={{ color: '#f5c518' }}>
              <Calendar className="w-4 h-4" />
              <span>Release Year</span>
            </label>
            <select
              value={filters.year}
              onChange={(e) => updateFilter('year', e.target.value)}
              className="w-full bg-white/10 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent transition-all font-medium hover:border-opacity-60"
              style={{ borderColor: '#f5c518', borderOpacity: 0.3 }}
              onFocus={(e) => e.target.style.borderColor = '#f5c518'}
              onBlur={(e) => e.target.style.borderColor = '#f5c518'}
            >
              <option value="" className="bg-gray-800">All Years</option>
              {years.slice(0, 50).map((year) => (
                <option key={year} value={year.toString()} className="bg-gray-800">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-extrabold mb-3 uppercase tracking-wider flex items-center space-x-2" style={{ color: '#f5c518' }}>
              <Star className="w-4 h-4" />
              <span>Min Rating</span>
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => updateFilter('minRating', parseInt(e.target.value))}
              className="w-full bg-white/10 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent transition-all font-medium hover:border-opacity-60"
              style={{ borderColor: '#f5c518', borderOpacity: 0.3 }}
              onFocus={(e) => e.target.style.borderColor = '#f5c518'}
              onBlur={(e) => e.target.style.borderColor = '#f5c518'}
            >
              {RATING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-extrabold mb-3 uppercase tracking-wider flex items-center space-x-2" style={{ color: '#f5c518' }}>
              <Globe className="w-4 h-4" />
              <span>Language</span>
            </label>
            <select
              value={filters.language}
              onChange={(e) => updateFilter('language', e.target.value)}
              className="w-full bg-white/10 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent transition-all font-medium hover:border-opacity-60"
              style={{ borderColor: '#f5c518', borderOpacity: 0.3 }}
              onFocus={(e) => e.target.style.borderColor = '#f5c518'}
              onBlur={(e) => e.target.style.borderColor = '#f5c518'}
            >
              {TMDB_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-800">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}