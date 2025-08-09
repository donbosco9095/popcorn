/*
  # Create watchlist schema with RLS

  1. New Tables
    - `watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tmdb_id` (integer, movie ID from TMDb)
      - `user_rating` (integer, nullable, 1-5 stars)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `watchlist` table
    - Add policies for users to manage their own watchlist items
    - Add constraint to ensure rating is between 1-5

  3. Indexes
    - Index on user_id for fast user queries
    - Index on tmdb_id for movie lookups
    - Unique constraint on user_id + tmdb_id to prevent duplicates
*/

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own watchlist items"
  ON watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own watchlist"
  ON watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);

-- Create unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_user_movie 
  ON watchlist(user_id, tmdb_id);