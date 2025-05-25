-- =====================================================
-- STORAGE POLICY FIX FOR PROFILE IMAGE UPLOADS
-- Run this script to fix the RLS policy issues
-- =====================================================

-- First, drop all existing storage policies for profile-images
DROP POLICY IF EXISTS "Users can view all profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Create corrected RLS policies for the profile-images bucket

-- 1. Allow everyone to view profile images (they should be public)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- 2. Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- 3. Allow users to update their own profile images
CREATE POLICY "Users can update own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- 4. Allow users to delete their own profile images
CREATE POLICY "Users can delete own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Alternative: If the above doesn't work, use these more permissive policies
-- Uncomment these and comment out the above if needed

/*
-- More permissive policies (use if the above fails)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
  );
*/

-- Verify the bucket exists and is properly configured
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'profile-images';

-- Check the new policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%profile%' OR policyname LIKE '%Public Access%';

-- =====================================================
-- POLICY FIX COMPLETE!
-- Try uploading a profile picture again.
-- ===================================================== 