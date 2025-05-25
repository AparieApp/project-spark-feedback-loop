# 🚨 Quick Fix Guide - Profile Issues

## 🔍 **Issues Found**
Based on your console logs, here are the problems and their solutions:

### ❌ **Error 1: Bucket not found**
```
Error uploading avatar: ImageUploadError: Upload failed: Bucket not found
```

### ❌ **Error 2: user_project_links table not found**
```
Failed to load resource: the server responded with a status of 404 ()
Error fetching project links: Object
```

### ❌ **Error 3: Missing accessibility description**
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

## ✅ **IMMEDIATE SOLUTION**

### **Step 1: Run Database Setup**
1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the entire content from `COMPLETE_DATABASE_SETUP.sql`**
5. **Click "Run"**

This will:
- ✅ Create the `user_project_links` table
- ✅ Add social media columns to `profiles` table
- ✅ Create the `profile-images` storage bucket
- ✅ Set up all necessary RLS policies
- ✅ Create proper indexes and triggers

### **Step 2: Verify Setup**
After running the SQL script, you should see:
- **Storage**: A new `profile-images` bucket in Storage section
- **Tables**: `user_project_links` table in Table Editor
- **Policies**: New RLS policies in Authentication → Policies

### **Step 3: Test Features**
1. **Refresh your app** (hard refresh: Ctrl+F5 or Cmd+Shift+R)
2. **Go to Profile → Edit Profile**
3. **Try uploading a profile picture**
4. **Try adding a YouTube URL**
5. **Try adding an external project link**

## 🔧 **What Each Fix Does**

### **Database Tables**
- **`user_project_links`**: Stores project links (internal/external)
- **Profile columns**: Stores social media URLs and interests
- **Triggers**: Auto-updates timestamps

### **Storage Bucket**
- **`profile-images`**: Stores uploaded profile pictures
- **Public access**: Allows viewing profile pictures
- **Size limit**: 5MB maximum
- **File types**: JPEG, PNG, WebP only

### **Security Policies**
- **RLS enabled**: Users can only edit their own data
- **Storage policies**: Users can only upload/delete their own images
- **Table policies**: Users can manage their own project links

## 🚀 **Expected Results After Fix**

### **Profile Pictures**
- ✅ Upload works without "Bucket not found" error
- ✅ Images display immediately after upload
- ✅ Old images are automatically deleted

### **Social Media Links**
- ✅ YouTube, Twitter, LinkedIn URLs save correctly
- ✅ Links display on profile view
- ✅ Validation works for URL format

### **Project Links**
- ✅ External project links save and display
- ✅ Internal project links work
- ✅ Edit and delete functions work

## 🐛 **If Issues Persist**

### **Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any remaining errors
4. Check Network tab for failed requests

### **Verify Database**
1. Go to Supabase → Table Editor
2. Check if `user_project_links` table exists
3. Check if `profiles` table has new columns
4. Go to Storage → Check if `profile-images` bucket exists

### **Clear Cache**
1. Hard refresh the page (Ctrl+F5)
2. Clear browser cache
3. Try in incognito/private mode

## 📞 **Still Having Issues?**

If problems persist after running the database setup:

1. **Check Supabase project status** - ensure it's active
2. **Verify environment variables** - check if Supabase URL/keys are correct
3. **Check browser network** - ensure no network blocking
4. **Try different browser** - rule out browser-specific issues

---

**Run the database setup script and all your profile features should work perfectly!** 🎉 