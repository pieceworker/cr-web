-- Add director_chapters column to users table
ALTER TABLE users ADD COLUMN director_chapters TEXT; -- JSON array of chapter IDs
