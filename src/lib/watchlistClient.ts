import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

export type WatchlistCategory = 'want-to-watch' | 'watching' | 'watched';

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  category: WatchlistCategory;
  user_rating: number | null;
  created_at: string;
  updated_at: string;
  movie?: {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    genre_ids: number[];
    genres?: { id: number; name: string }[];
    vote_average: number;
    vote_count?: number;
    runtime?: number;
  };
}

export async function addToWatchlistClient(
  tmdb_id: number, 
  category: WatchlistCategory = 'want-to-watch', 
  rating: number | null = null
): Promise<WatchlistItem | null> {
  try {
    // Get logged user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      toast.error('Login required');
      return null;
    }

    // Try server RPC first (idempotent)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/watchlist-rpc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ 
            user_id: user.id, 
            tmdb_id, 
            category, 
            rating 
          })
        }
      );

      const json = await response.json();
      
      if (json.success) {
        if (json.updated) {
          toast.success('Watchlist updated');
        } else if (json.created) {
          toast.success('Added to your watchlist');
        }
        return json.data;
      } else if (json.error === 'Movie not cached') {
        // Movie not in cache, need to fetch it first
        await fetchAndCacheMovie(tmdb_id);
        // Retry the operation
        return addToWatchlistClient(tmdb_id, category, rating);
      }
    } catch (rpcError) {
      console.warn('RPC failed, falling back to direct insert:', rpcError);
    }

    // Fallback: direct client insert with RLS
    // First ensure movie is cached
    const { data: movieData } = await supabase
      .from('movies')
      .select('id')
      .eq('tmdb_id', tmdb_id)
      .maybeSingle();

    if (!movieData) {
      await fetchAndCacheMovie(tmdb_id);
      // Retry after caching
      return addToWatchlistClient(tmdb_id, category, rating);
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movieData.id)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('watchlist')
        .update({ category, user_rating: rating })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        toast.error('Could not update watchlist');
        console.error(error);
        return null;
      }

      toast.success('Watchlist updated');
      return data;
    }

    // Insert new
    const { data, error } = await supabase
      .from('watchlist')
      .insert([{ 
        user_id: user.id, 
        movie_id: movieData.id, 
        category, 
        user_rating: rating 
      }])
      .select()
      .single();

    if (error) {
      toast.error('Could not add to watchlist');
      console.error(error);
      return null;
    }

    toast.success('Added to your watchlist');
    return data;

  } catch (error) {
    console.error('Error adding to watchlist:', error);
    toast.error('Failed to add to watchlist');
    return null;
  }
}

export async function removeFromWatchlistClient(tmdb_id: number): Promise<boolean> {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      toast.error('Login required');
      return false;
    }

    // Get movie_id from tmdb_id
    const { data: movieData } = await supabase
      .from('movies')
      .select('id')
      .eq('tmdb_id', tmdb_id)
      .single();

    if (!movieData) {
      toast.error('Movie not found');
      return false;
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movieData.id);

    if (error) {
      toast.error('Could not remove from watchlist');
      console.error(error);
      return false;
    }

    toast.success('Removed from watchlist');
    return true;

  } catch (error) {
    console.error('Error removing from watchlist:', error);
    toast.error('Failed to remove from watchlist');
    return false;
  }
}

export async function updateWatchlistRating(tmdb_id: number, rating: number): Promise<boolean> {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      toast.error('Login required');
      return false;
    }

    // Get movie_id from tmdb_id
    const { data: movieData } = await supabase
      .from('movies')
      .select('id')
      .eq('tmdb_id', tmdb_id)
      .single();

    if (!movieData) {
      toast.error('Movie not found');
      return false;
    }

    const { error } = await supabase
      .from('watchlist')
      .update({ user_rating: rating })
      .eq('user_id', user.id)
      .eq('movie_id', movieData.id);

    if (error) {
      toast.error('Could not update rating');
      console.error(error);
      return false;
    }

    toast.success('Rating updated');
    return true;

  } catch (error) {
    console.error('Error updating rating:', error);
    toast.error('Failed to update rating');
    return false;
  }
}

async function fetchAndCacheMovie(tmdb_id: number): Promise<void> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/movies?id=${tmdb_id}`,
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

    // Movie will be cached by the edge function
    await response.json();
  } catch (error) {
    console.error('Error fetching and caching movie:', error);
    throw error;
  }
}