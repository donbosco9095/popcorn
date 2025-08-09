import React from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { WatchlistGrid } from '../components/WatchlistGrid';
import { PostFilterBar, PostFilters } from '../components/PostFilterBar';
import { SurpriseMeButton } from '../components/SurpriseMeButton';
import { Heart, Film, Plus, Grid, List, Filter, Move, Star, Trash2 } from 'lucide-react';
import { WatchlistCategory, WatchlistItem } from '../contexts/AppContext';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function WatchlistPage() {
  const navigate = useNavigate();
  const { state, removeFromWatchlist, updateRating, updateCategory } = useApp();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | WatchlistCategory>('all');
  const [filters, setFilters] = useState<PostFilters>({
    minRating: 0,
    minRuntime: 0,
    minYear: 1900,
    hideWatched: false,
    userRatingFilter: null,
  });

  // Filter and sort watchlist items
  const filteredItems = useMemo(() => {
    let items = state.watchlist;

    // Filter by tab
    if (activeTab !== 'all') {
      items = items.filter(item => item.category === activeTab);
    }

    // Apply post filters
    items = items.filter(item => {
      const movie = item.movie;
      if (!movie) return false;

      // Rating filter
      const movieRating = (movie as any).vote_average || 0;
      if (movieRating < filters.minRating) {
        return false;
      }

      // Runtime filter
      const runtime = (movie as any).runtime || 0;
      if (runtime > 0 && runtime < filters.minRuntime) {
        return false;
      }

      // Year filter
      const year = (movie as any).release_date ? new Date((movie as any).release_date).getFullYear() : 0;
      if (year > 0 && year < filters.minYear) {
        return false;
      }

      // Hide watched filter
      if (filters.hideWatched && item.category === 'watched') {
        return false;
      }

      // User rating filter
      if (filters.userRatingFilter !== null && item.user_rating !== filters.userRatingFilter) {
        return false;
      }

      return true;
    });

    return items;
  }, [state.watchlist, activeTab, filters]);

  const handleRating = async (tmdbId: number, rating: number) => {
    await updateRating(tmdbId, rating);
  };

  const handleCategoryChange = async (tmdbId: number, category: WatchlistCategory) => {
    await updateCategory(tmdbId, category);
  };

  const handleRemove = async (tmdbId: number) => {
    await removeFromWatchlist(tmdbId);
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
  };

  const handleReorder = async (newOrder: WatchlistItem[]) => {
    // Update local state immediately for optimistic UI
    // In a real app, you'd save the new order to the database
    console.log('New watchlist order:', newOrder);
  };

  const clearFilters = () => {
    setFilters({
      minRating: 0,
      minRuntime: 0,
      minYear: 1900,
      hideWatched: false,
      userRatingFilter: null,
    });
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: state.watchlist.length,
      'want-to-watch': 0,
      'watching': 0,
      'watched': 0,
    };
    
    state.watchlist.forEach(item => {
      const category = item.category || 'want-to-watch';
      counts[category]++;
    });
    
    return counts;
  }, [state.watchlist]);

  if (state.watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        
        {/* Header */}
        <div className="relative z-10 glassmorphism border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center space-x-4 mb-4">
              <Heart className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">My Watchlist</h1>
                <p className="text-gray-300 font-medium text-lg">0 movies in your collection</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center animate-fade-in">
            <div className="relative mb-10">
              <Film className="w-32 h-32 text-gray-600 mx-auto" />
              <Heart className="w-8 h-8 text-yellow-400 absolute top-4 right-1/2 transform translate-x-8 animate-pulse" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
              Your watchlist is empty
            </h2>
            <p className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
              Start adding movies to your watchlist by searching and clicking the "Add to Watchlist" button. Build your personal collection of must-watch films.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold active:scale-95 transform shadow-lg hover:shadow-xl"
            >
              Browse Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        
        {/* Header */}
        <div className="relative z-10 glassmorphism border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Heart className="w-10 h-10 text-yellow-400" />
                <div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">My Watchlist</h1>
                  <p className="text-gray-300 font-medium text-lg">
                    {filteredItems.length} of {state.watchlist.length} movies
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 glassmorphism rounded-full p-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all ${
                      viewMode === 'grid'
                        ? 'bg-yellow-400 text-gray-900'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-all ${
                      viewMode === 'list'
                        ? 'bg-yellow-400 text-gray-900'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold active:scale-95 transform shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Movies</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center space-x-4 mt-8 overflow-x-auto">
              {[
                { key: 'all', label: 'All Movies', count: categoryCounts.all },
                { key: 'want-to-watch', label: 'Want to Watch', count: categoryCounts['want-to-watch'] },
                { key: 'watching', label: 'Watching', count: categoryCounts.watching },
                { key: 'watched', label: 'Watched', count: categoryCounts.watched },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-extrabold ${
                      activeTab === tab.key
                        ? 'bg-gray-900/20 text-gray-900'
                        : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Post Filters */}
          <PostFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
            resultsCount={filteredItems.length}
          />

          {/* Content */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Filter className="w-24 h-24 text-gray-600 mx-auto mb-8" />
              <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight">
                No movies match your filters
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Try adjusting your filters or browse more movies to add to your watchlist.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold active:scale-95 transform shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <WatchlistGrid
              items={filteredItems}
              onMovieClick={handleMovieClick}
              onCategoryChange={handleCategoryChange}
              onRemove={handleRemove}
              onRatingChange={handleRating}
              onReorder={handleReorder}
            />
          ) : (
            <div className="space-y-6">
              {/* List View */}
              {filteredItems.map((item) => {
                if (!item.movie) return null;
                
                return (
                  <div 
                    key={item.id}
                    className="glassmorphism rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all group"
                  >
                    <div className="flex items-start space-x-6">
                      {/* Poster */}
                      <div 
                        className="flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform duration-200"
                        onClick={() => handleMovieClick((item.movie as any).id || (item.movie as any).tmdb_id)}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w200${(item.movie as any).poster_path}`}
                          alt={(item.movie as any).title}
                          className="w-24 h-36 object-cover rounded-xl shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop';
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-xl font-extrabold text-white line-clamp-2 cursor-pointer hover:text-yellow-400 transition-colors tracking-tight"
                              onClick={() => handleMovieClick((item.movie as any).id || (item.movie as any).tmdb_id)}
                            >
                              {(item.movie as any).title}
                            </h3>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              {(item.movie as any).release_date && (
                                <span>{new Date((item.movie as any).release_date).getFullYear()}</span>
                              )}
                              {(item.movie as any).vote_average > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{(item.movie as any).vote_average.toFixed(1)}</span>
                                </div>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.category === 'want-to-watch' ? 'bg-blue-400/20 text-blue-400' :
                                item.category === 'watching' ? 'bg-yellow-400/20 text-yellow-400' :
                                'bg-green-400/20 text-green-400'
                              }`}>
                                {item.category === 'want-to-watch' ? 'Want to Watch' :
                                 item.category === 'watching' ? 'Watching' : 'Watched'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {item.user_rating && (
                              <div className="flex items-center space-x-1 bg-yellow-400/20 px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-yellow-400 font-bold text-sm">{item.user_rating}</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleRemove((item.movie as any).tmdb_id)}
                              className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                              title="Remove from watchlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="p-2 text-gray-400 cursor-move" title="Drag to reorder">
                              <Move className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Overview */}
                        {(item.movie as any).overview && (
                          <p 
                            className="text-gray-300 line-clamp-3 cursor-pointer hover:text-gray-200 transition-colors leading-relaxed"
                            onClick={() => handleMovieClick((item.movie as any).id || (item.movie as any).tmdb_id)}
                          >
                            {(item.movie as any).overview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {selectedMovieId && (
        <MovieDetailModal
          movieId={selectedMovieId}
          onClose={handleCloseModal}
          onMovieChange={setSelectedMovieId}
        />
      )}
    </>
  );
}