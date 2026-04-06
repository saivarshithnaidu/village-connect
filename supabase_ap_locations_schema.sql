-- Create Tables for Hierarchical Location System (Andhra Pradesh)

-- 1. Districts
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_te TEXT, -- Telugu Name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Mandals
CREATE TABLE mandals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_te TEXT, -- Telugu Name
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, district_id)
);

-- 3. Villages
CREATE TABLE villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_te TEXT, -- Telugu Name
  mandal_id UUID REFERENCES mandals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, mandal_id)
);

-- Indices for performance
CREATE INDEX idx_mandals_district_id ON mandals(district_id);
CREATE INDEX idx_villages_mandal_id ON villages(mandal_id);

-- Enable RLS (Read-only for public)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandals ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read mandals" ON mandals FOR SELECT USING (true);
CREATE POLICY "Allow public read villages" ON villages FOR SELECT USING (true);
