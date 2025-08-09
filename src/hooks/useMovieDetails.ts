import { useState, useEffect } from 'react';
import { Movie } from '../contexts/AppContext';

export function useMovieDetails(movieId: number | null) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setMovie(null);
      setLoading(false);
      setError(null);
      return;
    }

    fetchMovieDetails(movieId);
  }, [movieId]);

  const fetchMovieDetails = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/movies?id=${id}&details=true`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }

      const data = await response.json();
      
      // Transform the data to match our Movie interface
      const movieData = data.movie;
      const transformedMovie: Movie = {
        id: movieData.id,
        title: movieData.title || '',
        overview: movieData.overview || '',
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        release_date: movieData.release_date || '',
        genre_ids: movieData.genres?.map((g: any) => g.id) || [],
        genres: movieData.genres || [],
        vote_average: movieData.vote_average || 0,
        vote_count: movieData.vote_count || 0,
        runtime: movieData.runtime,
        cast: movieData.cast || [],
        tagline: movieData.tagline,
        status: movieData.status,
        budget: movieData.budget,
        revenue: movieData.revenue,
        production_companies: movieData.production_companies || [],
        production_countries: movieData.production_countries || [],
        spoken_languages: movieData.spoken_languages || [],
        // Add videos and recommendations if available
        videos: movieData.videos,
        recommendations: movieData.recommendations
      };

      setMovie(transformedMovie);
    } catch (err: any) {
      setError(err.message);
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    movie,
    loading,
    error,
    refetch: () => movieId && fetchMovieDetails(movieId),
  };
}