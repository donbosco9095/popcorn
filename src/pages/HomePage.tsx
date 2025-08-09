import React, { useState } from 'react';
import { Film, Sparkles } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { DynamicFilterBar } from '../components/DynamicFilterBar';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { RecommendationSection } from '../components/RecommendationSection';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { useApp } from '../contexts/AppContext';

export function HomePage() {
  const { state } = useApp();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const { 
    query, 
    setQuery, 
    filters, 
    setFilters, 
    results, 
    loading, 
    hasMore, 
    loadMore,
  } = useMovieSearch();

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      genres: [],
      year: '',
      minRating: 0,
      language: ''
    });
  };

  // Show filters when user is typing or has typed something
  const shouldShowFilters = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 glassmorphism py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="text-7xl animate-pulse">📽️</div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
              Discover Movies
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
            Search millions of movies, build your personal watchlist, and rate your favorites with our modern movie discovery platform
          </p>
          
          {/* Search Bar with Live Suggestions */}
          <div className="space-y-6">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              placeholder="Search for movies, actors, directors..."
            />
            
            {/* Dynamic Filter Bar - Shows when user types */}
            <DynamicFilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClear={handleClearFilters}
              isVisible={shouldShowFilters}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Recommendations Section - Show for logged in users */}
        {state.user && state.watchlist.length > 0 && (
          <RecommendationSection onMovieClick={handleMovieClick} />
        )}

        {!query.trim() && !loading && results.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="relative mb-8">
              <Film className="w-32 h-32 text-gray-600 mx-auto" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute top-4 right-1/2 transform translate-x-8 animate-pulse" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
              Ready to Explore?
            </h2>
            <p className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
              Click the search bar to see popular movies, or start typing to discover new films. Build your personal watchlist and never forget what to watch next.
            </p>
            
            {/* Popular Search Suggestions */}
            <div className="mb-8">
              <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['The Dark Knight', 'Inception', 'Interstellar', 'Pulp Fiction', 'The Matrix', 'Dune'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-6 py-3 glassmorphism text-gray-300 rounded-full hover:card-hover hover:text-yellow-400 transition-all border border-white/20 hover:border-yellow-400/50 active:scale-95 transform font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-gray-500 mb-8">
              <Film className="w-24 h-24 mx-auto" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight">
              No movies found
            </h2>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-2">
                  Search Results
                </h2>
                <h3 className="text-4xl font-extrabold text-white tracking-tight">
                  {results.length} movies found
                </h3>
                {(filters.genres.length > 0 || filters.year || filters.minRating > 0 || filters.language) && (
                  <p className="text-gray-400 mt-2">
                    Filtered by: {[
                      filters.genres.length > 0 && `${filters.genres.length} genre${filters.genres.length > 1 ? 's' : ''}`,
                      filters.year && `year ${filters.year}`,
                      filters.minRating > 0 && `${filters.minRating}+ rating`,
                      filters.language && 'language'
                    ].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
            
            {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 5 columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onMovieClick={handleMovieClick}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More Movies'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movieId={selectedMovieId}
        onClose={handleCloseModal}
        onMovieChange={setSelectedMovieId}
      />
    </div>
  );
}