# 🔧 Manual Storage Bucket Setup

Since the Supabase CLI isn't linked, you can set up the storage bucket manually through the Supabase Dashboard.

## 📋 Step-by-Step Instructions

### 1. Create Storage Bucket
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Enter bucket details:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ **Enabled**
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

### 2. Set Up RLS Policies
1. Go to **Authentication → Policies**
2. Find the **storage.objects** table
3. Add the following policies:

#### Policy 1: View All Profile Images
```sql
CREATE POLICY "Users can view all profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');
```

#### Policy 2: Upload Own Profile Images
```sql
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 3: Update Own Profile Images
```sql
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 4: Delete Own Profile Images
```sql
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. Alternative: SQL Editor Method
1. Go to **SQL Editor** in your Supabase Dashboard
2. Create a new query
3. Paste and run this SQL:

```sql
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

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
```

## ✅ Verification

After setup, verify everything works:

1. **Check Storage**: Go to Storage → profile-images bucket should exist
2. **Check Policies**: Go to Authentication → Policies → storage.objects should have 4 new policies
3. **Test Upload**: Try uploading a profile picture in your app

## 🔗 For Future CLI Usage

To link your project for future migrations:

1. Get your project reference ID from **Settings → General**
2. Run: `npx supabase link --project-ref YOUR_ACTUAL_PROJECT_REF`
3. Enter your database password when prompted

---

**The profile picture feature will work immediately after this manual setup!** 🎉 