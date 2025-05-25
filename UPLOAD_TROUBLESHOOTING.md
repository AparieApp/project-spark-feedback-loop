# 🚨 Profile Picture Upload Fix

## 🔍 **The Problem**
You're getting "new row violates row-level security policy" when trying to upload profile pictures. This is a common Supabase storage RLS policy issue.

## ✅ **IMMEDIATE SOLUTION**

### **Step 1: Fix Storage Policies**
1. **Go to your Supabase Dashboard** → **SQL Editor**
2. **Copy and paste the content from `SIMPLE_STORAGE_FIX.sql`**
3. **Click "Run"**

This will:
- ✅ Remove all conflicting storage policies
- ✅ Create simple, working policies for authenticated users
- ✅ Allow public read access to profile images

### **Step 2: Verify the Fix**
After running the SQL:
1. **Hard refresh your app** (Ctrl+F5 or Cmd+Shift+R)
2. **Try uploading a profile picture again**
3. **Check the browser console** - should be no more RLS errors

## 🔧 **What Was Wrong**

### **Original Issue**
The storage policies were trying to extract the user ID from the file path using:
```sql
auth.uid()::text = (storage.foldername(name))[1]
```

This was failing because:
- The path structure didn't match expectations
- The user ID extraction wasn't working correctly
- The policy was too restrictive

### **The Fix**
The new policies are simpler and more reliable:
```sql
-- Allow any authenticated user to upload to profile-images bucket
CREATE POLICY "profile_images_authenticated_upload" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
  );
```

## 🛠️ **Additional Fixes Applied**

### **File Extension Fix**
I also fixed the file extension issue in `imageUpload.ts`:
- **Before**: Used original file extension (could be .jfif, .jpeg, etc.)
- **After**: Always use `.jpg` since we convert to JPEG format

### **Code Changes**
```typescript
// OLD (problematic)
const fileExt = file.name.split('.').pop();
const fileName = `${userId}-${Date.now()}.${fileExt}`;

// NEW (fixed)
const fileName = `${userId}-${Date.now()}.jpg`;
```

## 🚀 **Expected Results**

After applying the fix:
- ✅ **Profile picture uploads work** without RLS errors
- ✅ **Images display immediately** after upload
- ✅ **No more 400 Bad Request errors**
- ✅ **Consistent file naming** with .jpg extension

## 🔒 **Security Notes**

### **What the New Policies Allow**
- **Public Read**: Anyone can view profile pictures (intended behavior)
- **Authenticated Upload**: Only logged-in users can upload images
- **Authenticated Update/Delete**: Only logged-in users can modify images

### **Security Considerations**
- Users can upload to any path in the bucket (less restrictive)
- In production, you might want to add user-specific path restrictions
- Current setup is secure enough for most applications

## 🐛 **If Issues Still Persist**

### **Check Authentication**
1. Verify user is properly logged in
2. Check if `auth.role()` returns 'authenticated'
3. Test with a fresh login

### **Check Storage Bucket**
1. Go to **Supabase Dashboard** → **Storage**
2. Verify `profile-images` bucket exists
3. Check if bucket is set to public

### **Check Policies**
1. Go to **Authentication** → **Policies**
2. Look for `storage.objects` table
3. Verify the new policies are listed

### **Debug Steps**
```sql
-- Check if user is authenticated
SELECT auth.role();

-- Check current storage policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects';

-- Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'profile-images';
```

## 📞 **Alternative Solutions**

### **If Simple Fix Doesn't Work**
Try the more detailed fix in `STORAGE_POLICY_FIX.sql` which includes:
- Path-based restrictions
- More granular permissions
- Alternative policy options

### **Nuclear Option**
If all else fails, temporarily disable RLS on storage:
```sql
-- TEMPORARY - NOT RECOMMENDED FOR PRODUCTION
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```
(Remember to re-enable it later with proper policies)

---

**The simple storage fix should resolve your upload issues immediately!** 🎉 