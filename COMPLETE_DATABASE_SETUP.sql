-- =====================================================
-- COMPLETE DATABASE SETUP FOR PROFILE FEATURES
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- 1. ENHANCED PROFILES MIGRATION
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all project links" ON user_project_links;
DROP POLICY IF EXISTS "Users can manage their own project links" ON user_project_links;

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

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_user_project_links_updated_at ON user_project_links;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create triggers
CREATE TRIGGER update_user_project_links_updated_at
    BEFORE UPDATE ON user_project_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. STORAGE BUCKET SETUP
-- Create storage bucket for profile images

-- Insert the bucket (will be ignored if it already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Set up RLS policies for the profile-images bucket
CREATE POLICY "Users can view all profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. VERIFICATION QUERIES
-- Run these to verify everything was created correctly

-- Check if new columns were added to profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('twitter_url', 'youtube_url', 'linkedin_url', 'facebook_url', 'tiktok_url', 'website_url', 'interests', 'location');

-- Check if user_project_links table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_project_links';

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'profile-images';

-- Check storage policies
SELECT policyname, tablename 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%profile images%';

-- =====================================================
-- SETUP COMPLETE!
-- Your profile features should now work correctly.
-- ===================================================== 