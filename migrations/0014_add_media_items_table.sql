-- Migration number: 0014 	 2026-04-21T03:08:31.000Z
CREATE TABLE media_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'image', 'video', 'youtube'
    url TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
