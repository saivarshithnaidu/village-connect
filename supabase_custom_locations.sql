-- Update Location Tables for Custom/Manual Entry Fallback

-- 1. Add is_custom flag to mandals
ALTER TABLE mandals ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- 2. Add is_custom flag to villages
ALTER TABLE villages ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- 3. Update RLS to allow authenticated users to insert custom locations
CREATE POLICY "Allow auth insert custom mandals" ON mandals 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow auth insert custom villages" ON villages 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
