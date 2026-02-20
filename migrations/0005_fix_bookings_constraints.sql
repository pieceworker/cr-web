-- Fix bookings table by removing legacy NOT NULL constraints on location, date, time
PRAGMA foreign_keys=OFF;

CREATE TABLE bookings_new (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    questions TEXT,
    created_by TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data from old table to new table
INSERT INTO bookings_new (id, name, email, phone, questions, created_by, status)
SELECT id, name, email, phone, questions, created_by, status FROM bookings;

DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;

PRAGMA foreign_keys=ON;
