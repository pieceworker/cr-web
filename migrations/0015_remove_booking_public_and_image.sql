-- Migration number: 0015 	 2026-04-27T14:17:30.000Z
ALTER TABLE bookings DROP COLUMN image;
ALTER TABLE bookings DROP COLUMN image_preference;
ALTER TABLE booking_dates DROP COLUMN is_public;
