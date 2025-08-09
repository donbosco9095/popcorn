import React from 'react';
import { Calendar, Star, Plus, Check, X, Trash2, Eye, CheckCircle, Play, Film } from 'lucide-react';
import { Movie, useApp } from '../contexts/AppContext';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movieId: number) => void;
  showWatchlistControls?: boolean;
  size?: 'normal' | 'large';
  className?: string;
}

export function MovieCard({ movie, onMovieClick, showWatchlistControls = true, size = 'normal', className = '' }: MovieCardProps) {
  const { state, addToWatchlist, removeFromWatchlist, updateCategory, isInWatchlist, getUserCategory } = useApp();
  
  const inWatchlist = isInWatchlist(movie.id);
  const userCategory = getUserCategory(movie.id);
  const [justAdded, setJustAdded] = React.useState(false);

  // Reset justAdded when movie is removed from watchlist
  React.useEffect(() => {
    if (!inWatchlist) {
      setJustAdded(false);
    }
  }, [inWatchlist]);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!state.user) {
      // Show toast to encourage sign in
      const { toast } = await import('react-hot-toast');
      toast('Sign in to add movies to your watchlist', {
        icon: '🍿',
        duration: 3000,
      });
      return;
    }

    // Only allow adding if not in watchlist
    if (inWatchlist) {
      return; // Do nothing if already in watchlist
    }

    // Add movie flip animation class
    const cardElement = e.currentTarget.closest('.movie-card');
    if (cardElement) {
      cardElement.classList.add('animate-flip');
      setTimeout(() => {
        cardElement.classList.remove('animate-flip');
      }, 600);
    }

    setJustAdded(true);
    await addToWatchlist(movie);
    
    // Reset justAdded after showing confirmation
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!state.user) {
      return;
    }

    await removeFromWatchlist(movie.id);
  };

  const handleCategoryMove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!state.user || !userCategory) {
      return;
    }

    // Forward-only movement
    if (userCategory === 'want-to-watch') {
      await updateCategory(movie.id, 'watching');
    } else if (userCategory === 'watching') {
      await updateCategory(movie.id, 'watched');
    }
  };

  const handleCardClick = () => {
    if (onMovieClick) {
      onMovieClick(movie.id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const getNextCategoryButton = () => {
    if (!userCategory) return null;

    if (userCategory === 'want-to-watch') {
      return {
        icon: Eye,
        text: 'Start Watching',
        action: handleCategoryMove
      };
    } else if (userCategory === 'watching') {
      return {
        icon: CheckCircle,
        text: 'Mark as Watched',
        action: handleCategoryMove
      };
    }
    
    return null; // Already watched, no forward movement
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const cardSize = size === 'large' ? 'aspect-[2/3]' : 'aspect-[2/3]';

  const nextCategoryButton = getNextCategoryButton();

  // Determine button text and styling
  const getWatchlistButtonContent = () => {
    if (!inWatchlist) {
      return {
        icon: Plus,
        text: 'Add to Watchlist',
        className: 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 hover:from-yellow-300 hover:to-yellow-200 hover:shadow-lg'
      };
    }

    if (justAdded) {
      return {
        icon: Check,
        text: 'Added to Watchlist',
        className: 'bg-green-500/90 backdrop-blur-sm text-white cursor-default'
      };
    }

    // Show current category status
    if (userCategory === 'want-to-watch') {
      return {
        icon: Film,
        text: 'Want to Watch',
        className: 'bg-blue-500 text-white cursor-default'
      };
    } else if (userCategory === 'watching') {
      return {
        icon: Eye,
        text: 'Currently Watching',
        className: 'bg-yellow-500 text-white cursor-default'
      };
    } else if (userCategory === 'watched') {
      return {
        icon: CheckCircle,
        text: 'Watched',
        className: 'bg-green-500 text-white cursor-default'
      };
    }

    return {
      icon: Plus,
      text: 'Add to Watchlist',
      className: 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 hover:from-yellow-300 hover:to-yellow-200 hover:shadow-lg'
    };
  };

  const buttonContent = getWatchlistButtonContent();
  const ButtonIcon = buttonContent.icon;

  return (
    <div 
      className={`movie-card group relative rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden border border-white/10 hover:border-yellow-400/50 animate-fade-in bg-gray-800/50 ${className}`}
      onClick={handleCardClick}
    >
      {/* Poster Image with Overlay */}
      <div className={`relative ${cardSize} overflow-hidden`}>
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-3 left-3 glassmorphism text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center space-x-1.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Watchlist Badge */}
        {inWatchlist && (
          <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-sm font-bold">
            ✓
          </div>
        )}

        {/* Hover Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-extrabold text-lg text-white line-clamp-2 mb-2 tracking-tight">
            {movie.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-300 mb-3">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(movie.release_date)}</span>
          </div>

          {/* Add to Watchlist Button */}
          {showWatchlistControls && state.user && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleWatchlistClick}
                disabled={state.loading || (inWatchlist && !justAdded)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed ${buttonContent.className}`}
              >
                <ButtonIcon className="w-4 h-4" />
                <span className="text-sm">{buttonContent.text}</span>
              </button>
              
              {/* Remove button - only show when in watchlist and not just added */}
              {inWatchlist && !justAdded && (
                <button
                  onClick={handleRemoveClick}
                  className="p-2.5 rounded-xl bg-red-600/90 backdrop-blur-sm text-white hover:bg-red-600/100 transition-all active:scale-95 transform"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Static Info (Always Visible) */}
      <div className="p-4 bg-gray-800/80 backdrop-blur-sm">
        <h3 className="font-extrabold text-base text-white line-clamp-2 mb-2 group-hover:text-yellow-400 transition-colors tracking-tight">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(movie.release_date)}</span>
          </div>
          
          {movie.vote_average > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Sign in prompt for unauthenticated users */}
        {showWatchlistControls && !state.user && (
          <div className="mt-3">
            <button
              onClick={handleWatchlistClick}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-gray-300 hover:text-white hover:bg-white/20 transition-all font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Sign in to add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}