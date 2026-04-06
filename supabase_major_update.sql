-- Supabase Database Extension Migration

-- 1. Extend the problems table
ALTER TABLE problems
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Main District',
ADD COLUMN IF NOT EXISTS location_lat NUMERIC(10, 6),
ADD COLUMN IF NOT EXISTS location_lng NUMERIC(10, 6),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS before_image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- 2. Extend the profiles table for Volunteers
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'villager',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::text[];

-- 3. Extend the problems table to link an assigned volunteer
ALTER TABLE problems
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Note: Make sure to reload the schema cache inside Supabase if using PostgREST directly.
