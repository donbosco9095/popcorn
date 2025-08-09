import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Star, Filter, Film, Flame, Clock } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { Movie } from '../contexts/AppContext';

type TimeWindow = 'day' | 'week' | 'month';

export function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('day');

  useEffect(() => {
    fetchTrendingMovies();
  }, [timeWindow]);

  const fetchTrendingMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trending?time_window=${timeWindow}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform the results to match our Movie interface
        const transformedMovies = (data.results || []).map((movie: any) => ({
          id: movie.id,
          title: movie.title || '',
          overview: movie.overview || '',
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date || '',
          genre_ids: movie.genre_ids || [],
          vote_average: movie.vote_average || 0,
          vote_count: movie.vote_count || 0,
        }));
        setMovies(transformedMovies);
      } else {
        console.error('Failed to fetch trending movies:', response.status, response.statusText);
        setMovies([]);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
  };

  const getTabTitle = (tab: TimeWindow) => {
    switch (tab) {
      case 'day': return 'Today';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      default: return 'Today';
    }
  };

  const getTabDescription = (tab: TimeWindow) => {
    switch (tab) {
      case 'day': return 'Trending movies today';
      case 'week': return 'Trending movies this week';
      case 'month': return 'Popular movies from the last 30 days';
      default: return 'Trending movies today';
    }
  };

  const getTabIcon = (tab: TimeWindow) => {
    switch (tab) {
      case 'day': return Flame;
      case 'week': return TrendingUp;
      case 'month': return Calendar;
      default: return Flame;
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 animate-cinema-reel mx-auto">
            <Film className="w-full h-full text-yellow-400" />
          </div>
          <div className="absolute inset-0 w-24 h-24 animate-spin mx-auto">
            <div className="w-full h-full border-4 border-transparent border-t-yellow-400 rounded-full"></div>
          </div>
        </div>
        <p className="text-gray-300 text-xl font-medium">Loading trending movies...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      
      {/* Header */}
      <div className="relative z-10 glassmorphism border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center space-x-4 mb-8">
            <TrendingUp className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Trending Movies</h1>
              <p className="text-gray-300 font-medium text-lg">
                {getTabDescription(timeWindow)}
              </p>
            </div>
          </div>

          {/* Time Window Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['day', 'week', 'month'] as TimeWindow[]).map((tab) => {
              const Icon = getTabIcon(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setTimeWindow(tab)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all ${
                    timeWindow === tab
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{getTabTitle(tab)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <LoadingSkeleton />
        ) : movies.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="relative mb-10">
              <div className="text-8xl mb-4">🍿</div>
              <TrendingUp className="w-8 h-8 text-yellow-400 absolute top-4 right-1/2 transform translate-x-8 animate-pulse" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
              No trending movies found
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Check back later for the latest trending movies.
            </p>
            <button
              onClick={fetchTrendingMovies}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold active:scale-95 transform shadow-lg hover:shadow-xl"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-2">
                  {getTabTitle(timeWindow)}
                </h2>
                <h3 className="text-4xl font-extrabold text-white tracking-tight">
                  {movies.length} movies
                </h3>
              </div>
            </div>
            
            {/* Movies Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onMovieClick={handleMovieClick}
                  showWatchlistControls={true}
                />
              ))}
            </div>
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