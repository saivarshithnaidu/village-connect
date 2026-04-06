-- Update Problems table to support multiple images

-- 1. Add image_urls array column if it doesn't exist
ALTER TABLE problems ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 2. Ensure old image_url data is not lost (optional migration)
-- UPDATE problems SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '' AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);
