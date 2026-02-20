-- Add missing OAuth 1.0 columns to accounts table for Auth.js D1 Adapter
ALTER TABLE accounts ADD COLUMN oauth_token TEXT;
ALTER TABLE accounts ADD COLUMN oauth_token_secret TEXT;
