-- Enhanced Profiles Migration
-- Add social media links, interests, and project links to profiles table

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Create table for user project links (internal and external)
CREATE TABLE IF NOT EXISTS user_project_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- TRUE for internal projects, FALSE for external websites
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Only set if is_internal is TRUE
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_project_links
ALTER TABLE user_project_links ENABLE ROW LEVEL SECURITY;

-- Users can view all project links
CREATE POLICY "Users can view all project links" ON user_project_links
    FOR SELECT USING (true);

-- Users can manage their own project links
CREATE POLICY "Users can manage their own project links" ON user_project_links
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_project_links_user_id ON user_project_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_project_links_project_id ON user_project_links(project_id);

-- Update timestamp trigger for user_project_links
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_project_links_updated_at
    BEFORE UPDATE ON user_project_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to profiles if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 