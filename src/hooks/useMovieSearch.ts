import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { Movie } from '../contexts/AppContext';

export interface SearchFilters {
  genres: string[];
  year: string;
  minRating: number;
  language: string;
}

export function useMovieSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    genres: [],
    year: '',
    minRating: 0,
    language: ''
  });
  const [results, setResults] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Handle search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      setPage(1);
      setHasMore(false);
      // Reset filters when query is cleared
      setFilters({
        genres: [],
        year: '',
        minRating: 0,
        language: ''
      });
      return;
    }

    searchMovies(debouncedQuery, 1, true);
  }, [debouncedQuery]);

  // Handle filter changes - trigger new search with current query
  useEffect(() => {
    if (query.trim()) {
      searchMovies(query, 1, true);
    }
  }, [filters]);

  const buildTMDbParams = (searchQuery: string, pageNum: number) => {
    const params = new URLSearchParams({
      q: searchQuery,
      page: pageNum.toString()
    });

    // Add TMDb-specific filter parameters
    if (filters.genres.length > 0) {
      params.append('with_genres', filters.genres.join(','));
    }

    if (filters.year) {
      params.append('primary_release_year', filters.year);
    }

    if (filters.minRating > 0) {
      params.append('vote_average.gte', filters.minRating.toString());
    }

    if (filters.language) {
      params.append('with_original_language', filters.language);
    }

    return params;
  };

  const searchMovies = async (
    searchQuery: string, 
    pageNum: number, 
    reset: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = buildTMDbParams(searchQuery, pageNum);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/movies?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search movies');
      }

      const data = await response.json();
      const newResults = (data.results || []).map((movie: any) => ({
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
      
      if (reset) {
        setResults(newResults);
        // Update suggestions with search results
        setSuggestions(newResults.slice(0, 20));
      } else {
        setResults(prev => [...prev, ...newResults]);
      }
      
      setPage(pageNum);
      setHasMore(data.results?.length === 20);
    } catch (err: any) {
      setError(err.message);
      if (reset) {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && query.trim()) {
      searchMovies(query, page + 1, false);
    }
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setResults([]);
      setFilters({
        genres: [],
        year: '',
        minRating: 0,
        language: ''
      });
    }
  };

  const handleFocus = () => {};
  const handleBlur = () => {};
  
  const handleSuggestionClick = (movie: Movie) => {
    setQuery(movie.title);
  };

  return {
    query,
    setQuery: handleQueryChange,
    filters,
    setFilters,
    results,
    suggestions,
    showSuggestions,
    loading,
    loadingSuggestions,
    error,
    hasMore,
    loadMore,
    handleFocus,
    handleBlur,
    handleSuggestionClick,
  };
}