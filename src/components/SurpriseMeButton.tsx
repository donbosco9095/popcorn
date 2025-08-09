import React, { useState } from 'react';
import { Shuffle, Play, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';

interface SurpriseMeButtonProps {
  className?: string;
}

export function SurpriseMeButton({ className = '' }: SurpriseMeButtonProps) {
  const { state } = useApp();
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSurpriseMe = async () => {
    if (!state.user || state.watchlist.length === 0) {
      toast('Add some movies to your watchlist first!', {
        icon: '🍿',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get a random movie from watchlist
      const randomIndex = Math.floor(Math.random() * state.watchlist.length);
      const randomItem = state.watchlist[randomIndex];
      
      if (!randomItem.movie) {
        toast.error('No movie found');
        return;
      }

      const movie = randomItem.movie;
      setSelectedMovie(movie);

      // Fetch trailer
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trailer?id=${(movie as any).id}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (response.ok && data.videoKey) {
        setTrailerKey(data.videoKey);
        setShowTrailer(true);
        toast.success(`Surprise! Playing trailer for "${(movie as any).title}"`, {
          icon: '🎬',
          duration: 3000,
        });
      } else {
        toast(`Picked "${(movie as any).title}" but no trailer available`, {
          icon: '🎭',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error in surprise me:', error);
      toast.error('Failed to surprise you. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey(null);
    setSelectedMovie(null);
  };

  return (
    <>
      <button
        onClick={handleSurpriseMe}
        disabled={loading || !state.user || state.watchlist.length === 0}
        className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full font-bold transition-all active:scale-95 transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : (
          <Shuffle className="w-5 h-5" />
        )}
        <span>Surprise Me!</span>
      </button>

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

            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">
                🎲 Surprise Pick: {selectedMovie?.title}
              </h2>
            </div>

            {trailerKey ? (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
                  title={`${selectedMovie?.title} - Surprise Trailer`}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </div>
            ) : (
              <div 
                className="flex items-center justify-center p-16"
                style={{ aspectRatio: '16/9', backgroundColor: '#121212' }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-6">🎭</div>
                  <p 
                    className="text-xl font-bold mb-2"
                    style={{ color: '#f5c518' }}
                  >
                    No trailer available for this surprise pick!
                  </p>
                  <p className="text-gray-400">
                    But "{selectedMovie?.title}" is still a great choice from your watchlist!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}