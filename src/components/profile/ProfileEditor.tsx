import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Camera, 
  MapPin, 
  Link as LinkIcon, 
  Plus, 
  Edit, 
  Trash2,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Globe,
  ExternalLink
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const profileFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  youtube_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  tiktok_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const projectLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  url: z.string().url('Invalid URL'),
  is_internal: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type ProjectLinkFormData = z.infer<typeof projectLinkSchema>;

interface ProfileEditorProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProfileEditor({ profile, isOwnProfile }: ProfileEditorProps) {
  const { user } = useAuth();
  const { updateProfile, projectLinks, addProjectLink, updateProjectLink, deleteProjectLink, updating, uploadAvatar, removeAvatar, uploadingImage } = useProfile();
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [editingProjectLink, setEditingProjectLink] = useState<any>(null);
  const [isProjectLinkDialogOpen, setIsProjectLinkDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      username: profile.username || '',
      bio: profile.bio || '',
      location: profile.location || '',
      twitter_url: profile.twitter_url || '',
      youtube_url: profile.youtube_url || '',
      linkedin_url: profile.linkedin_url || '',
      facebook_url: profile.facebook_url || '',
      tiktok_url: profile.tiktok_url || '',
      website_url: profile.website_url || '',
    },
  });

  const {
    register: registerProjectLink,
    handleSubmit: handleSubmitProjectLink,
    formState: { errors: projectLinkErrors },
    reset: resetProjectLink,
    setValue: setProjectLinkValue,
    watch: watchProjectLink,
  } = useForm<ProjectLinkFormData>({
    resolver: zodResolver(projectLinkSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      is_internal: false,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    const updates = {
      ...data,
      interests,
    };
    
    // Remove empty strings
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === '') {
        updates[key as keyof typeof updates] = null;
      }
    });

    await updateProfile(updates);
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const onSubmitProjectLink = async (data: ProjectLinkFormData) => {
    try {
      if (editingProjectLink) {
        await updateProjectLink(editingProjectLink.id, data);
        setEditingProjectLink(null);
      } else {
        await addProjectLink({
          title: data.title,
          description: data.description || '',
          url: data.url,
          is_internal: data.is_internal,
        });
      }
      resetProjectLink();
      setIsProjectLinkDialogOpen(false);
    } catch (error) {
      console.error('Error saving project link:', error);
    }
  };

  const handleEditProjectLink = (link: any) => {
    setEditingProjectLink(link);
    setProjectLinkValue('title', link.title);
    setProjectLinkValue('description', link.description || '');
    setProjectLinkValue('url', link.url);
    setProjectLinkValue('is_internal', link.is_internal);
    setIsProjectLinkDialogOpen(true);
  };

  const handleDeleteProjectLink = async (id: string) => {
    if (confirm('Are you sure you want to delete this project link?')) {
      await deleteProjectLink(id);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  if (!isOwnProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You can only edit your own profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Profile Picture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <ImageUpload
              currentImageUrl={profile.avatar_url}
              onImageSelect={uploadAvatar}
              onImageRemove={removeAvatar}
              isUploading={uploadingImage}
              variant="avatar"
              size="lg"
              className="flex-shrink-0"
            />
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your photo</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will be displayed on your profile and next to your projects and comments.
              </p>
              <div className="text-xs text-gray-500">
                <p>• Recommended size: 400x400px</p>
                <p>• Max file size: 5MB</p>
                <p>• Supported formats: JPG, PNG, WebP</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Your full name"
                  className="w-full"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register('username')}
                  placeholder="Your username"
                  className="w-full"
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full resize-none"
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Your location"
                className="w-full"
              />
            </div>

            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => removeInterest(interest)}
                >
                  {interest} ×
                </Badge>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1"
              />
              <Button type="button" onClick={addInterest} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Interest
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media & Links</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { name: 'twitter_url', label: 'Twitter', icon: 'twitter' },
                { name: 'youtube_url', label: 'YouTube', icon: 'youtube' },
                { name: 'linkedin_url', label: 'LinkedIn', icon: 'linkedin' },
                { name: 'facebook_url', label: 'Facebook', icon: 'facebook' },
                { name: 'tiktok_url', label: 'TikTok', icon: 'tiktok' },
                { name: 'website_url', label: 'Website', icon: 'website' },
              ].map(({ name, label, icon }) => (
                <div key={name} className="space-y-2">
                  <Label htmlFor={name} className="flex items-center space-x-2">
                    {getSocialIcon(icon)}
                    <span>{label}</span>
                  </Label>
                  <Input
                    id={name}
                    {...register(name as keyof ProfileFormData)}
                    placeholder={`Your ${label} URL`}
                    className="w-full"
                  />
                  {errors[name as keyof ProfileFormData] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[name as keyof ProfileFormData]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" disabled={updating} className="w-full sm:w-auto">
              {updating ? 'Updating...' : 'Update Links'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Project Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Links</span>
            <Dialog open={isProjectLinkDialogOpen} onOpenChange={setIsProjectLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProjectLink(null);
                    resetProjectLink();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProjectLink ? 'Edit Project Link' : 'Add Project Link'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProjectLink 
                      ? 'Update the details for your project link.' 
                      : 'Add a new project link to showcase your work.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitProjectLink(onSubmitProjectLink)} className="space-y-4">
                  <div>
                    <Label htmlFor="project-title">Title *</Label>
                    <Input
                      id="project-title"
                      {...registerProjectLink('title')}
                      placeholder="Project title"
                    />
                    {projectLinkErrors.title && (
                      <p className="text-sm text-red-500 mt-1">{projectLinkErrors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      {...registerProjectLink('description')}
                      placeholder="Brief description of the project"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="project-url">URL *</Label>
                    <Input
                      id="project-url"
                      {...registerProjectLink('url')}
                      placeholder="https://..."
                    />
                    {projectLinkErrors.url && (
                      <p className="text-sm text-red-500 mt-1">{projectLinkErrors.url.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="project-type">Project Type</Label>
                    <Select
                      value={watchProjectLink('is_internal') ? 'internal' : 'external'}
                      onValueChange={(value) => setProjectLinkValue('is_internal', value === 'internal')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal Project (within this app)</SelectItem>
                        <SelectItem value="external">External Website</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsProjectLinkDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProjectLink ? 'Update' : 'Add'} Project
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {projectLinks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No project links added yet. Click "Add Project" to get started.
              </p>
            ) : (
              projectLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{link.title}</h4>
                      <Badge variant={link.is_internal ? 'default' : 'secondary'}>
                        {link.is_internal ? 'Internal' : 'External'}
                      </Badge>
                    </div>
                    {link.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{link.description}</p>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 group"
                    >
                      <span className="truncate group-hover:underline">{link.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProjectLink(link)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProjectLink(link.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 