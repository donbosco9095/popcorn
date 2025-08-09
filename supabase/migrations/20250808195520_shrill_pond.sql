/*
  # Create proper watchlist schema

  1. New Tables
    - `watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tmdb_id` (integer)
      - `user_rating` (integer, 1-5 stars)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `watchlist` table
    - Add policies for users to manage their own watchlist items

  3. Changes
    - Drop existing tables that don't match the spec
    - Create new watchlist table with proper structure
*/

-- Drop existing tables that don't match the spec
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS movies CASCADE;

-- Create the watchlist table according to spec
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  tmdb_id int NOT NULL,
  user_rating int CHECK (user_rating >= 1 AND user_rating <= 5),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own watchlist items"
  ON watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own watchlist"
  ON watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON watchlist
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_user_movie ON watchlist(user_id, tmdb_id);