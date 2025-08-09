import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: {
          id: number;
          tmdb_id: number;
          title: string | null;
          overview: string | null;
          poster_path: string | null;
          backdrop_path: string | null;
          genres: string[] | null;
          release_date: string | null;
          runtime: number | null;
          vote_average: number | null;
          vote_count: number | null;
          tmdb_json: any;
          cached_at: string;
        };
        Insert: {
          id?: number;
          tmdb_id: number;
          title?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          genres?: string[] | null;
          release_date?: string | null;
          runtime?: number | null;
          vote_average?: number | null;
          vote_count?: number | null;
          tmdb_json?: any;
          cached_at?: string;
        };
        Update: {
          id?: number;
          tmdb_id?: number;
          title?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          genres?: string[] | null;
          release_date?: string | null;
          runtime?: number | null;
          vote_average?: number | null;
          vote_count?: number | null;
          tmdb_json?: any;
          cached_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          category: 'want-to-watch' | 'watching' | 'watched';
          user_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          category?: 'want-to-watch' | 'watching' | 'watched';
          user_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: number;
          category?: 'want-to-watch' | 'watching' | 'watched';
          user_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};