CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evaluation TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policies for ideas
CREATE POLICY "Ideas are viewable by everyone" ON ideas FOR SELECT USING (true);
CREATE POLICY "Anyone can submit an idea" ON ideas FOR INSERT WITH CHECK (true);
