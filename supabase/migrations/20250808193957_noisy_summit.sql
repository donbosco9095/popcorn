/*
  # Add backdrop_path column to movies table

  1. Schema Changes
    - Add `backdrop_path` column to `movies` table
    - Column type: TEXT (nullable)
    - This column will store the TMDB backdrop image path

  2. Purpose
    - Fixes the schema cache error when adding movies to watchlist
    - Allows storing backdrop images for better movie display
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'movies' AND column_name = 'backdrop_path'
  ) THEN
    ALTER TABLE movies ADD COLUMN backdrop_path text;
  END IF;
END $$;