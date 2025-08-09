import React from 'react';
import { Search, X, Star, Calendar } from 'lucide-react';
import { Movie } from '../contexts/AppContext';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  suggestions?: Movie[];
  showSuggestions?: boolean;
  onSuggestionClick?: (movie: Movie) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({ 
  query, 
  onQueryChange, 
  loading, 
  placeholder, 
  suggestions = [], 
  showSuggestions = false,
  onSuggestionClick,
  onFocus,
  onBlur
}: SearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay blur to allow suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 200);
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto animate-fade-in">
      <div className="relative">
        <Search className={`absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
          loading 
            ? 'text-yellow-400 animate-pulse' 
            : 'text-gray-400'
        }`} />
        
        <input
          type="text"
          value={query}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder || "Search for movies..."}
          className="w-full pl-14 pr-14 py-4 text-lg rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 focus:outline-none focus:shadow-lg focus:shadow-yellow-400/20 transition-all duration-300 hover:bg-white/15"
          style={{ 
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(245, 197, 24, 0.3)',
            borderRadius: '9999px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        />
        
        {loading ? (
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            <div 
              className="animate-spin rounded-full h-5 w-5 border-2 border-transparent border-t-current animate-projector-spin"
              style={{ color: '#f5c518' }}
            ></div>
          </div>
        ) : query ? (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-200 transition-colors active:scale-95 transform"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </div>
      
      {/* Removed suggestions dropdown as requested */}
    </div>
  );
}