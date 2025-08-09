import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { WatchlistItem, WatchlistCategory } from '../lib/watchlistClient';

export interface Movie {
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
  cast?: CastMember[];
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
  videos?: { results: any[] };
  recommendations?: { results: any[] };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export { type WatchlistItem, type WatchlistCategory } from '../lib/watchlistClient';

interface AppState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  watchlist: WatchlistItem[];
}

type AppAction =
  | { type: 'SET_USER'; payload: { user: User | null; session: Session | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WATCHLIST'; payload: WatchlistItem[] }
  | { type: 'ADD_TO_WATCHLIST'; payload: WatchlistItem }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: number } // tmdb_id
  | { type: 'UPDATE_RATING'; payload: { tmdb_id: number; rating: number } }
  | { type: 'UPDATE_CATEGORY'; payload: { tmdb_id: number; category: WatchlistCategory } }
  | { type: 'CLEAR_CACHE'; payload: null };

const initialState: AppState = {
  user: null,
  session: null,
  loading: true,
  watchlist: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    case 'ADD_TO_WATCHLIST':
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      };
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(item => {
          if (!item.movie || !item.movie.id) return true;
          return item.movie.id !== action.payload;
        }),
      };
    case 'UPDATE_RATING':
      return {
        ...state,
        watchlist: state.watchlist.map(item => {
          if (!item.movie || !item.movie.id) return item;
          return item.movie.id === action.payload.tmdb_id
            ? { ...item, user_rating: action.payload.rating }
            : item;
        }),
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        watchlist: state.watchlist.map(item => {
          if (!item.movie || !item.movie.id) return item;
          return item.movie.id === action.payload.tmdb_id
            ? { ...item, category: action.payload.category }
            : item;
        }),
      };
    case 'CLEAR_CACHE':
      return {
        ...state,
        watchlist: [],
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  addToWatchlist: (movie: Movie) => Promise<void>;
  removeFromWatchlist: (tmdbId: number) => Promise<void>;
  updateRating: (tmdbId: number, rating: number) => Promise<void>;
  updateCategory: (tmdbId: number, category: WatchlistCategory) => Promise<void>;
  isInWatchlist: (tmdbId: number) => boolean;
  getUserRating: (tmdbId: number) => number | null;
  getUserCategory: (tmdbId: number) => WatchlistCategory | null;
  loadUserData: () => Promise<void>;
  clearCache: () => void;
}>({} as any);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({
        type: 'SET_USER',
        payload: { user: session?.user ?? null, session },
      });
      
      if (session?.user) {
        loadUserData();
      } else {
        // Clear cache when no user
        dispatch({ type: 'CLEAR_CACHE', payload: null });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      dispatch({
        type: 'SET_USER',
        payload: { user: session?.user ?? null, session },
      });
      
      if (session?.user) {
        await loadUserData();
      } else {
        // Always clear cache when user signs out or session ends
        dispatch({ type: 'CLEAR_CACHE', payload: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Successfully signed in!');
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Check your email to confirm your account!');
  };

  const signOut = async () => {
    // Clear local cache immediately
    dispatch({ type: 'CLEAR_CACHE', payload: null });
    dispatch({
      type: 'SET_USER',
      payload: { user: null, session: null },
    });

    try {
      // Always attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('session_not_found')) {
        console.error('Sign out error:', error);
        toast.error(error.message);
        return;
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }

    toast.success('Successfully signed out!');
  };

  const addToWatchlist = async (movie: Movie) => {
    if (!state.user) {
      toast('Sign in to add movies to your watchlist', {
        icon: '🍿',
        duration: 3000,
      });
      return;
    }

    // Check if already in watchlist
    if (isInWatchlist(movie.id)) {
      toast('Movie is already in your watchlist', {
        icon: '✅',
        duration: 2000,
      });
      return;
    }

    // Optimistic update - add to local state immediately
    const optimisticItem: WatchlistItem = {
      id: `temp-${movie.id}`,
      user_id: state.user.id,
      movie_id: 0, // Will be updated when server responds
      category: 'want-to-watch',
      user_rating: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      movie: movie
    };
    
    dispatch({ type: 'ADD_TO_WATCHLIST', payload: optimisticItem });

    try {
      // Use the new watchlist client
      const { addToWatchlistClient } = await import('../lib/watchlistClient');
      const result = await addToWatchlistClient(movie.id, 'want-to-watch');
      
      if (!result) {
        // Revert optimistic update on failure
        dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movie.id });
      } else {
        // Reload user data to get fresh state
        await loadUserData();
      }
    } catch (error) {
      // Revert optimistic update on failure
      dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movie.id });
    }
  };

  const removeFromWatchlist = async (tmdbId: number) => {
    if (!state.user) {
      toast.error('You must be logged in.');
      return;
    }

    // Optimistic update - remove from local state immediately
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: tmdbId });
    toast.success('Removed from watchlist');

    try {
      const { removeFromWatchlistClient } = await import('../lib/watchlistClient');
      const success = await removeFromWatchlistClient(tmdbId);
      
      if (!success) {
        // Revert optimistic update on failure - reload user data
        await loadUserData();
        toast.error('Failed to remove from watchlist');
      }
    } catch (error) {
      // Revert optimistic update on failure
      await loadUserData();
      toast.error('Failed to remove from watchlist');
    }
  };

  const updateRating = async (tmdbId: number, rating: number) => {
    if (!state.user) {
      toast.error('You must be logged in.');
      return;
    }

    // Optimistic update
    dispatch({ type: 'UPDATE_RATING', payload: { tmdb_id: tmdbId, rating } });
    toast.success('Rating updated');

    try {
      const { updateWatchlistRating } = await import('../lib/watchlistClient');
      const success = await updateWatchlistRating(tmdbId, rating);
      
      if (!success) {
        // Revert optimistic update on failure
        await loadUserData();
        toast.error('Failed to update rating');
      }
    } catch (error) {
      // Revert optimistic update on failure
      await loadUserData();
      toast.error('Failed to update rating');
    }
  };

  const updateCategory = async (tmdbId: number, category: WatchlistCategory) => {
    if (!state.user) {
      toast.error('You must be logged in.');
      return;
    }

    const oldCategory = getUserCategory(tmdbId);
    
    // Optimistic update
    dispatch({ type: 'UPDATE_CATEGORY', payload: { tmdb_id: tmdbId, category } });

    // Show success message with category names
    // Forward-only movement toast messages
    if (oldCategory === 'want-to-watch' && category === 'watching') {
      toast.success('Moved to Currently Watching');
    } else if (oldCategory === 'watching' && category === 'watched') {
      toast.success('Marked as Watched');
    }

    try {
      const { addToWatchlistClient } = await import('../lib/watchlistClient');
      const result = await addToWatchlistClient(tmdbId, category);
      
      if (!result) {
        // Revert optimistic update on failure
        await loadUserData();
        toast.error('Failed to move movie. Please try again.', {
          style: {
            background: 'rgba(18, 18, 18, 0.95)',
            color: '#ffffff',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #ef4444',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(16px)',
          },
        });
      }
    } catch (error) {
      // Revert optimistic update on failure
      await loadUserData();
      toast.error('Failed to move movie. Please try again.', {
        style: {
          background: 'rgba(18, 18, 18, 0.95)',
          color: '#ffffff',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #ef4444',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(239, 68, 68, 0.2)',
          backdropFilter: 'blur(16px)',
        },
      });
    }
  };

  const isInWatchlist = (tmdbId: number): boolean => {
    return state.watchlist.some(item => {
      if (!item.movie || !item.movie.id) return false;
      return item.movie.id === tmdbId;
    });
  };

  const getUserRating = (tmdbId: number): number | null => {
    const item = state.watchlist.find(item => {
      if (!item.movie || !item.movie.id) return false;
      return item.movie.id === tmdbId;
    });
    return item?.user_rating || null;
  };

  const getUserCategory = (tmdbId: number): WatchlistCategory | null => {
    const item = state.watchlist.find(item => {
      if (!item.movie || !item.movie.id) return false;
      return item.movie.id === tmdbId;
    });
    return item?.category || null;
  };

  const clearCache = () => {
    dispatch({ type: 'CLEAR_CACHE', payload: null });
  };

  const loadUserData = async () => {
    if (!state.user) return;

    try {
      console.log('Loading user data for user:', state.user.id);
      
      // Load watchlist with movie data
      const { data: watchlistData, error } = await supabase
        .from('watchlist')
        .select(`
          *,
          movies!inner (
            tmdb_id,
            title,
            overview,
            poster_path,
            backdrop_path,
            genres,
            release_date,
            runtime,
            vote_average,
            vote_count,
            tmdb_json
          )
        `)
        .eq('user_id', state.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      console.log('Watchlist data from DB:', watchlistData?.length || 0, 'items');

      // Transform the data to include movie info
      const transformedWatchlist = (watchlistData || []).map(item => ({
        ...item,
        movie: {
          id: (item.movies as any).tmdb_id || 0,
          title: (item.movies as any).title || '',
          overview: (item.movies as any).overview || '',
          poster_path: (item.movies as any).poster_path || null,
          backdrop_path: (item.movies as any).backdrop_path || null,
          genres: (item.movies as any).genres || [],
          release_date: (item.movies as any).release_date || '',
          runtime: (item.movies as any).runtime || null,
          vote_average: (item.movies as any).vote_average || 0,
          vote_count: (item.movies as any).vote_count || 0,
          genre_ids: (item.movies as any).tmdb_json?.genre_ids || [],
          ...((item.movies as any).tmdb_json || {})
        }
      }));

      console.log('Final watchlist with movies:', transformedWatchlist.length, 'items');
      dispatch({ type: 'SET_WATCHLIST', payload: transformedWatchlist });
    } catch (error: any) {
      console.error('Error loading user data:', error);
      // On error, ensure we still clear any stale local state
      dispatch({ type: 'CLEAR_CACHE', payload: null });
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        signIn,
        signUp,
        signOut,
        addToWatchlist,
        removeFromWatchlist,
        updateRating,
        updateCategory,
        isInWatchlist,
        getUserRating,
        getUserCategory,
        loadUserData,
        clearCache,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};