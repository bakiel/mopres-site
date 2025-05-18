-- Create content management tables

-- Content Banners table
CREATE TABLE IF NOT EXISTS content_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  image_url VARCHAR NOT NULL,
  link_url VARCHAR,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Content Pages table
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  content TEXT NOT NULL,
  meta_title VARCHAR,
  meta_description VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Size Guides table
CREATE TABLE IF NOT EXISTS size_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  product_category VARCHAR NOT NULL,
  content JSONB NOT NULL,
  image_url VARCHAR,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add Row Level Security (RLS) policies

-- Policies for content_banners
ALTER TABLE content_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for content_banners" ON content_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access for content_banners" ON content_banners
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for content_pages
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for published content_pages" ON content_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow admin full access for content_pages" ON content_pages
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for size_guides
ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for active size_guides" ON size_guides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access for size_guides" ON size_guides
  USING (auth.jwt() ->> 'role' = 'admin');
