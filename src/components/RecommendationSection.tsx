import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Movie, useApp } from '../contexts/AppContext';

interface RecommendationSectionProps {
  onMovieClick: (movieId: number) => void;
}

export function RecommendationSection({ onMovieClick }: RecommendationSectionProps) {
  const { state } = useApp();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (state.user && state.watchlist.length > 0) {
      fetchRecommendations();
    }
  }, [state.user, state.watchlist]);

  const fetchRecommendations = async () => {
    if (!state.watchlist.length) return;

    setLoading(true);
    try {
      // Get a random movie from user's watchlist
      const randomWatchlistItem = state.watchlist[Math.floor(Math.random() * state.watchlist.length)];
      if (!randomWatchlistItem.movie) return;

      const movieId = (randomWatchlistItem.movie as any).id;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/movies?id=${movieId}&details=true`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const recs = data.movie?.recommendations?.results || [];
        
        const transformedRecs = recs.slice(0, 10).map((movie: any) => ({
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
        
        setRecommendations(transformedRecs);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, recommendations.length - 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, recommendations.length - 4)) % Math.max(1, recommendations.length - 4));
  };

  if (!state.user || recommendations.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Because You Liked...
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            disabled={loading}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            disabled={loading}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * 25}%)` }}
        >
          {recommendations.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-1/5">
              <MovieCard
                movie={movie}
                onMovieClick={onMovieClick}
                showWatchlistControls={true}
                size="normal"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}