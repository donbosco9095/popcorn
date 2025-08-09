/*
  # Create Movies Schema

  1. New Tables
    - `movies`
      - `id` (serial, primary key)
      - `tmdb_id` (integer, unique)
      - `title` (text)
      - `overview` (text)
      - `poster_path` (text)
      - `release_date` (date)
      - `tmdb_json` (jsonb)
      - `cached_at` (timestamptz)
    
    - `watchlists`
      - `id` (serial, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `movie_id` (integer, foreign key to movies)
      - `status` (text, default 'to-watch')
      - `added_at` (timestamptz)
    
    - `ratings`
      - `id` (serial, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `movie_id` (integer, foreign key to movies)
      - `rating` (smallint, 1-5)
      - `review` (text)
      - `rated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id serial PRIMARY KEY,
  tmdb_id integer UNIQUE NOT NULL,
  title text,
  overview text,
  poster_path text,
  release_date date,
  tmdb_json jsonb,
  cached_at timestamptz DEFAULT now()
);

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id integer REFERENCES movies(id) ON DELETE CASCADE,
  status text DEFAULT 'to-watch',
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id integer REFERENCES movies(id) ON DELETE CASCADE,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  review text,
  rated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Movies policies (public read access)
CREATE POLICY "Movies are publicly readable"
  ON movies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Movies can be inserted by authenticated users"
  ON movies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist"
  ON watchlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items"
  ON watchlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON watchlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON watchlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Users can view their own ratings"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_movie_id ON watchlists(movie_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_movie_id ON ratings(movie_id);