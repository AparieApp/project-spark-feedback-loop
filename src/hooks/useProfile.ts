import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { uploadProfilePicture, deleteProfilePicture, ImageUploadError } from '@/lib/imageUpload';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type UserProjectLink = Tables<'user_project_links'>;
export type UserProjectLinkInsert = TablesInsert<'user_project_links'>;

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projectLinks, setProjectLinks] = useState<UserProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchProjectLinks();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          user_type: user.user_metadata?.user_type || 'feedback_provider',
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        variant: "destructive",
        title: "Error creating profile",
        description: error.message,
      });
    }
  };

  const fetchProjectLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_project_links')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjectLinks(data || []);
    } catch (error: any) {
      console.error('Error fetching project links:', error);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!targetUserId) return;

    try {
      setUpdating(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const addProjectLink = async (projectLink: Omit<UserProjectLinkInsert, 'user_id'>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_project_links')
        .insert({
          ...projectLink,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjectLinks(prev => [data, ...prev]);
      
      toast({
        title: "Project link added!",
        description: "Your project link has been added successfully.",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding project link:', error);
      toast({
        variant: "destructive",
        title: "Error adding project link",
        description: error.message,
      });
      throw error;
    }
  };

  const updateProjectLink = async (id: string, updates: Partial<UserProjectLink>) => {
    try {
      const { data, error } = await supabase
        .from('user_project_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjectLinks(prev => 
        prev.map(link => link.id === id ? data : link)
      );
      
      toast({
        title: "Project link updated!",
        description: "Your project link has been updated successfully.",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating project link:', error);
      toast({
        variant: "destructive",
        title: "Error updating project link",
        description: error.message,
      });
      throw error;
    }
  };

  const deleteProjectLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_project_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjectLinks(prev => prev.filter(link => link.id !== id));
      
      toast({
        title: "Project link deleted!",
        description: "Your project link has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting project link:', error);
      toast({
        variant: "destructive",
        title: "Error deleting project link",
        description: error.message,
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setUploadingImage(true);
      
      // Delete old avatar if it exists
      if (profile?.avatar_url) {
        try {
          // Extract file path from URL if it's a Supabase storage URL
          const url = new URL(profile.avatar_url);
          if (url.hostname.includes('supabase')) {
            const pathParts = url.pathname.split('/');
            const filePath = pathParts.slice(-2).join('/'); // Get 'avatars/filename'
            await deleteProfilePicture(filePath);
          }
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
          // Continue with upload even if deletion fails
        }
      }

      // Upload new avatar
      const { url } = await uploadProfilePicture(file, user.id);
      
      // Update profile with new avatar URL
      await updateProfile({ avatar_url: url });
      
      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been updated successfully.",
      });
      
      return url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (error instanceof ImageUploadError) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "An unexpected error occurred while uploading your profile picture.",
        });
      }
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile?.avatar_url) return;

    try {
      setUploadingImage(true);
      
      // Delete from storage if it's a Supabase storage URL
      try {
        const url = new URL(profile.avatar_url);
        if (url.hostname.includes('supabase')) {
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(-2).join('/'); // Get 'avatars/filename'
          await deleteProfilePicture(filePath);
        }
      } catch (error) {
        console.warn('Failed to delete avatar from storage:', error);
      }

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: null });
      
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        variant: "destructive",
        title: "Error removing profile picture",
        description: "An unexpected error occurred while removing your profile picture.",
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    profile,
    projectLinks,
    loading,
    updating,
    uploadingImage,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    addProjectLink,
    updateProjectLink,
    deleteProjectLink,
    refetch: () => {
      fetchProfile();
      fetchProjectLinks();
    },
  };
} 