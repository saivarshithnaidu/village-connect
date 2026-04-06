-- VillageConnect Multilingual and AI Database Update
-- Please run this SQL in your Supabase SQL Editor to add the required columns for the Gemini AI enhancements.

ALTER TABLE problems
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_te TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_te TEXT,
ADD COLUMN IF NOT EXISTS language TEXT;

-- Update existing rows (if any) to not break the frontend expectation
UPDATE problems
SET
  title_en = title,
  description_en = description,
  language = 'en'
WHERE title_en IS NULL;
