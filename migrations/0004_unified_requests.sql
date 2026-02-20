-- Create unified requests table
CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ROLE_CHANGE', 'USER_EDIT', 'ARTIST_EDIT', 'ARTIST_ADD', 'BOOKING_INQUIRY'
    target_id TEXT, -- ID of the record being edited or added
    data TEXT, -- JSON blob of changes or new record data
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Note: We will keep role_requests for now but we should migrate to this new table.
-- For this refactor, we will start using 'requests' for all new activity.
