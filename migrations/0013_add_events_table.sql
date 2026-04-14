CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  city TEXT,
  date TEXT NOT NULL, -- YYYY-MM-DD
  time TEXT NOT NULL, -- HH:mm
  link TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
