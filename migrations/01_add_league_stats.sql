-- Migration: Add League Stats Columns
-- Run this in your Supabase SQL Editor

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS points integer default 0,
ADD COLUMN IF NOT EXISTS wins integer default 0,
ADD COLUMN IF NOT EXISTS draws integer default 0,
ADD COLUMN IF NOT EXISTS losses integer default 0,
ADD COLUMN IF NOT EXISTS goal_difference integer default 0;

-- Optional: Update existing records to have 0 if they are null (defaults usually handle new rows, but existing might need touch)
UPDATE players SET points = 0 WHERE points IS NULL;
UPDATE players SET wins = 0 WHERE wins IS NULL;
UPDATE players SET draws = 0 WHERE draws IS NULL;
UPDATE players SET losses = 0 WHERE losses IS NULL;
UPDATE players SET goal_difference = 0 WHERE goal_difference IS NULL;
