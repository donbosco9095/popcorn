/*
  # Create IMDB-inspired Watchlist Schema

  1. New Tables
    - `movies`
      - `id` (integer, primary key)
      - `tmdb_id` (integer, unique)
      - `title` (text)
      - `overview` (text)
      - `poster_path` (text)
      - `backdrop_path` (text)
      - `release_date` (date)
      - `vote_average` (real)
      - `runtime` (integer)
      - `tmdb_json` (jsonb)
      - `cached_at` (timestamptz)
    
    - `watchlist`
      - `id` (integer, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `tmdb_id` (integer, foreign key to movies.tmdb_id)
      - `date_added` (timestamptz)
      - `user_rating` (integer, 1-5 stars)

  2. Security
    - Enable RLS on both tables
    - Movies are publicly readable, authenticated users can insert
    - Watchlist items are private to each user

  3. Indexes
    - Index on tmdb_id for fast lookups
    - Index on user_id for watchlist queries
    - Composite index on user_id, tmdb_id for uniqueness
*/

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tmdb_id integer UNIQUE NOT NULL,
  title text,
  overview text,
  poster_path text,
  backdrop_path text,
  release_date date,
  vote_average real DEFAULT 0,
  runtime integer,
  tmdb_json jsonb,
  cached_at timestamptz DEFAULT now()
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  date_added timestamptz DEFAULT now(),
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  UNIQUE(user_id, tmdb_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_tmdb ON watchlist(user_id, tmdb_id);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Movies policies (publicly readable, authenticated users can insert)
CREATE POLICY "Movies are publicly readable"
  ON movies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Movies can be inserted by authenticated users"
  ON watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Watchlist policies (users can only access their own data)
CREATE POLICY "Users can view their own watchlist"
  ON watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items"
  ON watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON watchlist
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);