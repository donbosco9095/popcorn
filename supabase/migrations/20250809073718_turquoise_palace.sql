/*
  # Enhanced Popcorn Cue Database Schema

  1. New Tables
    - `movies` - Cached movie data from TMDb with enhanced fields
    - Enhanced `watchlist` - Categories (want-to-watch, watching, watched) and movie references

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for user data access

  3. Performance
    - Add indexes for common queries
    - Optimize for watchlist operations
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Movies cache table with enhanced fields
CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  genres TEXT[], -- flattened genre names
  release_date DATE,
  runtime INTEGER,
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  tmdb_json JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing watchlist table if it exists
DROP TABLE IF EXISTS watchlist CASCADE;

-- Enhanced watchlist with categories and movie references
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'want-to-watch' CHECK (category IN ('want-to-watch', 'watching', 'watched')),
  user_rating SMALLINT CHECK (user_rating >= 1 AND user_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_category ON watchlist(category);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_category ON watchlist(user_id, category);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Movies policies (public read for cached data)
CREATE POLICY "Movies are publicly readable" ON movies FOR SELECT USING (true);
CREATE POLICY "Movies can be inserted by authenticated users" ON movies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Movies can be updated by authenticated users" ON movies FOR UPDATE TO authenticated USING (true);

-- Watchlist policies
CREATE POLICY "Users can insert own watchlist" ON watchlist 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist" ON watchlist 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own watchlist" ON watchlist 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON watchlist 
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_watchlist_updated_at 
  BEFORE UPDATE ON watchlist 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();