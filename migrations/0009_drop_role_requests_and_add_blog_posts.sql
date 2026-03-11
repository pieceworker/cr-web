-- Drop legacy role_requests table
DROP TABLE IF EXISTS role_requests;

-- Ensure requests table handles all types (it already exists from 0004_unified_requests.sql, 
-- we just need to use it exclusively now, so no structural change is strictly necessary for it,
-- but we'll add the blog_posts table here as well to prepare for Goal 2)

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id TEXT NOT NULL,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
