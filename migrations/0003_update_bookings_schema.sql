-- Update bookings table
ALTER TABLE bookings ADD COLUMN name TEXT;
ALTER TABLE bookings ADD COLUMN email TEXT;
ALTER TABLE bookings ADD COLUMN phone TEXT;
ALTER TABLE bookings ADD COLUMN questions TEXT;

-- Create booking_dates table
CREATE TABLE booking_dates (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration TEXT,
    event_type TEXT,
    location TEXT NOT NULL,
    description TEXT,
    budget TEXT,
    is_public INTEGER DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Note: We are keeping the old columns for now to avoid breaking existing queries 
-- until the code is fully updated.
