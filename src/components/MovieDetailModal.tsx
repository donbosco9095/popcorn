import React, { useEffect } from 'react';
import { X, Star, Calendar, Clock, Users, Plus, Check, Trash2, Play, Film } from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useApp } from '../contexts/AppContext';
import { RatingStars } from './RatingStars';
import toast from 'react-hot-toast';

interface MovieDetailModalProps {
  movieId: number | null;
  onClose: () => void;
  onMovieChange?: (movieId: number) => void;
}

export function MovieDetailModal({ movieId, onClose, onMovieChange }: MovieDetailModalProps) {
  const { movie, loading, error } = useMovieDetails(movieId);
  const { state, addToWatchlist, removeFromWatchlist, updateRating, isInWatchlist, getUserRating } = useApp();
  const [trailerKey, setTrailerKey] = React.useState<string | null>(null);
  const [showTrailer, setShowTrailer] = React.useState(false);
  const [trailerLoading, setTrailerLoading] = React.useState(false);
  const [trailerError, setTrailerError] = React.useState<string | null>(null);
  const modalContentRef = React.useRef<HTMLDivElement>(null);

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;
  const userRating = movie ? getUserRating(movie.id) : null;

  // Reset trailer state and scroll when movie changes
  React.useEffect(() => {
    setTrailerKey(null);
    setShowTrailer(false);
    setTrailerError(null);
    setTrailerLoading(false);
    
    // Scroll to top when movie changes
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [movieId]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!movieId) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Check if click is on backdrop and not on recommendations section
    const target = e.target as HTMLElement;
    const recommendationsSection = target.closest('[data-recommendations-section]');
    
    if (e.target === e.currentTarget && !recommendationsSection) {
      onClose();
    }
  };

  const handleWatchlistToggle = async () => {
    if (!movie || !state.user) return;

    if (inWatchlist) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist(movie);
    }
  };

  const handleRating = async (rating: number) => {
    if (!movie) return;
    await updateRating((movie as any).id || movie.id, rating);
  };

  const fetchTrailer = async () => {
    if (!movie) return;

    // Return early if we already have a trailer key
    if (trailerKey) {
      setShowTrailer(true);
      return;
    }
    setTrailerLoading(true);
    setTrailerError(null);
    
    try {
      // Check if TMDB_API_KEY is available in environment
      const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
      
      if (!tmdbApiKey) {
        // Fallback to edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trailer?id=${movie.id}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          setTrailerError(data.error || 'Failed to load trailer');
          setShowTrailer(true);
          return;
        }
        
        if (!data.videoKey) {
          setTrailerError(data.error || 'No trailer available for this movie yet.');
          setShowTrailer(true);
          return;
        }
        
        setTrailerKey(data.videoKey);
      } else {
        // Direct TMDb API call
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${tmdbApiKey}&language=en-US`
        );
        
        if (!response.ok) {
          setTrailerError('Failed to load trailer');
          setShowTrailer(true);
          return;
        }
        
        const data = await response.json();
        
        // Find the best trailer - prefer official trailers
        const trailers = data.results?.filter(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || [];
        
        const officialTrailer = trailers.find((t: any) => t.official === true);
        const selectedTrailer = officialTrailer || trailers[0];
        
        if (!selectedTrailer) {
          setTrailerError('No trailer available for this movie.');
          setShowTrailer(true);
          return;
        }
        
        setTrailerKey(selectedTrailer.key);
      }
      setShowTrailer(true);
      
    } catch (error) {
      console.error('Error fetching trailer:', error);
      setTrailerError('Failed to load trailer. Please try again.');
      setShowTrailer(true);
    } finally {
      setTrailerLoading(false);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey(null);
    setTrailerError(null);
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getBackdropUrl = (backdropPath: string | null) => {
    if (!backdropPath) return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';
    return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
  };

  const getProfileUrl = (profilePath: string | null) => {
    if (!profilePath) return 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop';
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRecommendationClick = (newMovieId: number) => {
    if (onMovieChange) {
      onMovieChange(newMovieId);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all active:scale-95 transform"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Single Loading/Error/Content State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 animate-cinema-reel mx-auto">
                  <Film className="w-full h-full text-yellow-400" />
                </div>
                <div className="absolute inset-0 w-24 h-24 animate-spin mx-auto">
                  <div className="w-full h-full border-4 border-transparent border-t-yellow-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-white text-xl font-medium">Loading movie details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-400 text-xl font-medium mb-4">Failed to load movie details</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold"
              >
                Close
              </button>
            </div>
          </div>
        ) : movie ? (
          <div ref={modalContentRef} className="overflow-y-auto max-h-[90vh] relative">
            {/* Backdrop Header */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={getBackdropUrl(movie.backdrop_path)}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              
              {/* Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-2">
                  {movie.title}
                </h1>
                {(formatYear(movie.release_date) || formatRuntime(movie.runtime)) && (
                  <div className="flex items-center space-x-4 text-yellow-400 text-lg font-bold">
                    {formatYear(movie.release_date) && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>{formatYear(movie.release_date)}</span>
                      </div>
                    )}
                    {formatYear(movie.release_date) && formatRuntime(movie.runtime) && (
                      <span>•</span>
                    )}
                    {formatRuntime(movie.runtime) && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                  </div>
                )}
                {movie.tagline && (
                  <p className="text-gray-300 text-lg italic mt-2 max-w-2xl">
                    "{movie.tagline}"
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column - Poster (Desktop) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    <img
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full max-w-sm mx-auto lg:max-w-none rounded-2xl shadow-2xl"
                    />
                    
                    {/* Watchlist Controls */}
                    {state.user && (
                      <div className="mt-6 space-y-4">
                        <button
                          onClick={handleWatchlistToggle}
                          disabled={loading}
                          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 transform ${
                            inWatchlist
                              ? 'bg-red-600/20 border-2 border-red-500 text-red-400 hover:bg-red-600/30'
                              : 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 hover:from-yellow-300 hover:to-yellow-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {inWatchlist ? (
                            <>
                              <Trash2 className="w-5 h-5" />
                              <span>Remove from Watchlist</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span>Add to Watchlist</span>
                            </>
                          )}
                        </button>

                      </div>
                    )}

                    {/* Watch Trailer Button */}
                    <div className="mt-6">
                      <button
                        onClick={fetchTrailer}
                        disabled={trailerLoading}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all font-bold active:scale-95 transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: '#F5C518',
                          color: '#000000'
                        }}
                        onMouseEnter={(e) => {
                          if (!trailerLoading) {
                            e.currentTarget.style.backgroundColor = '#FFE55C';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!trailerLoading) {
                            e.currentTarget.style.backgroundColor = '#F5C518';
                          }
                        }}
                      >
                        {trailerLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>🎬 Watch Trailer</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* User Rating - Always show if user is logged in */}
                    {state.user && (
                      <div className="mt-6">
                        <label className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider">
                          Your Rating
                        </label>
                        <RatingStars
                          rating={userRating || 0}
                          onRate={handleRating}
                          size="large"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Rating & Genres */}
                  <div className="space-y-6">
                    {/* IMDb Rating */}
                    {movie.vote_average > 0 && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-yellow-400/20 px-6 py-3 rounded-full">
                          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-extrabold text-white">
                              {movie.vote_average.toFixed(1)}
                            </span>
                            <span className="text-gray-400 font-medium text-lg">
                              /10
                            </span>
                          </div>
                        </div>
                        {movie.vote_count && (
                          <span className="text-gray-400 font-medium">
                            ({movie.vote_count.toLocaleString()} votes)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Genres */}
                    {movie.genres && movie.genres.length > 0 && (
                      <div>
                        <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-3">
                          Genres
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {movie.genres.map((genre) => (
                            <span
                              key={genre.id}
                              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-gray-300 border border-white/20"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Release Date */}
                    {(movie.release_date || movie.runtime) && (
                      <div className="flex items-center space-x-6 text-gray-300">
                        {movie.release_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-yellow-400" />
                            <span className="font-medium">
                              {movie.release_date ? formatDate(movie.release_date) : ''}
                            </span>
                          </div>
                        )}
                        {movie.runtime && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="font-medium">{formatRuntime(movie.runtime)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Overview */}
                  {movie.overview && (
                    <div>
                      <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-4">
                        Overview
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>
                  )}

                  {/* Cast */}
                  {movie.cast && movie.cast.length > 0 && (
                    <div>
                      <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Cast</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {movie.cast.slice(0, 10).map((actor) => (
                          <div key={actor.id} className="text-center">
                            <img
                              src={getProfileUrl(actor.profile_path)}
                              alt={actor.name}
                              className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-white/20"
                            />
                            <h4 className="text-white font-bold text-sm line-clamp-1">
                              {actor.name}
                            </h4>
                            <p className="text-gray-400 text-xs line-clamp-2">
                              {actor.character}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Production Info */}
                  {movie.production_companies && movie.production_companies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-4">
                        Production
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {movie.production_companies.slice(0, 4).map((company) => (
                          <div key={company.id} className="flex items-center space-x-2 text-gray-300">
                            {company.logo_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                alt={company.name}
                                className="w-8 h-8 object-contain bg-white/10 rounded p-1"
                              />
                            )}
                            <span className="font-medium">{company.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {(movie as any).recommendations && (movie as any).recommendations.results && (movie as any).recommendations.results.length > 0 && (
                    <div data-recommendations-section>
                      <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-4">
                        You might also like
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {(movie as any).recommendations.results.slice(0, 6).map((rec: any) => (
                          <div 
                            key={rec.id} 
                            className="cursor-pointer group"
                            onClick={() => handleRecommendationClick(rec.id)}
                          >
                            <img
                              src={getPosterUrl(rec.poster_path)}
                              alt={rec.title}
                              className="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            />
                            <h4 className="text-white text-sm font-medium mt-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                              {rec.title}
                            </h4>
                            {rec.vote_average > 0 && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-400">{rec.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && closeTrailer()}
        >
          <div 
            className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            style={{ backgroundColor: '#121212' }}
          >
            {/* Close Button */}
            <button
              onClick={closeTrailer}
              className="absolute top-4 right-4 z-10 p-3 rounded-full hover:bg-white/10 transition-all active:scale-95 transform"
              style={{ color: '#f5c518' }}
            >
              <X className="w-6 h-6" />
            </button>

            {trailerError ? (
              <div 
                className="flex items-center justify-center p-16 text-center"
                style={{ aspectRatio: '16/9', backgroundColor: '#121212' }}
              >
                <div>
                  <div className="text-6xl mb-6">🎬</div>
                  <p 
                    className="text-xl font-bold mb-2"
                    style={{ color: '#f5c518' }}
                  >
                    {trailerError}
                  </p>
                  <p className="text-gray-400">
                    {trailerError.includes('API key') 
                      ? 'Please configure your TMDb API key to watch trailers.'
                      : 'Check back later for trailer availability.'
                    }
                  </p>
                </div>
              </div>
            ) : trailerKey ? (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={`${movie.title} - Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  width="100%"
                  height="100%"
                  className="border-0"
                />
              </div>
            ) : (
              <div 
                className="flex items-center justify-center p-16"
                style={{ aspectRatio: '16/9', backgroundColor: '#121212' }}
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-current mx-auto mb-6" style={{ color: '#f5c518' }}></div>
                  <p className="text-xl font-bold" style={{ color: '#f5c518' }}>
                    Loading trailer...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}