CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evaluation TEXT,
  score INTEGER,
  uniqueness_score INTEGER,
  demand_score INTEGER,
  difficulty_score INTEGER,
  category TEXT,
  audience TEXT,
  stage TEXT,
  monetization TEXT,
  tags TEXT[] DEFAULT '{}',
  evidence_links JSONB DEFAULT '[]'::jsonb,
  votes INTEGER DEFAULT 0,
  builder_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS uniqueness_score INTEGER;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS demand_score INTEGER;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS difficulty_score INTEGER;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS audience TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS monetization TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS evidence_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS builder_notes TEXT;

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policies for ideas
CREATE POLICY "Ideas are viewable by everyone" ON ideas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can submit an idea" ON ideas;
DROP POLICY IF EXISTS "Authenticated users can submit ideas" ON ideas;
CREATE POLICY "Authenticated users can submit ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
