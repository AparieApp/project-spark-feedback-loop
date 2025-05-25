import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Mail,
  Heart,
  TrendingUp,
  Users,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Globe,
  LinkIcon,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Profile, UserProjectLink } from '@/hooks/useProfile';

interface ProfileViewProps {
  profile: Profile;
  projectLinks: UserProjectLink[];
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  followersCount?: number;
  stats?: {
    projects: number;
    totalUpvotes: number;
    totalComments: number;
  };
}

export function ProfileView({ 
  profile, 
  projectLinks, 
  isOwnProfile, 
  onEdit, 
  onFollow, 
  isFollowing = false,
  followersCount = 0,
  stats 
}: ProfileViewProps) {
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

  const socialLinks = [
    { platform: 'twitter', url: profile.twitter_url, label: 'Twitter' },
    { platform: 'youtube', url: profile.youtube_url, label: 'YouTube' },
    { platform: 'linkedin', url: profile.linkedin_url, label: 'LinkedIn' },
    { platform: 'facebook', url: profile.facebook_url, label: 'Facebook' },
    { platform: 'website', url: profile.website_url, label: 'Website' },
  ].filter(link => link.url);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <Avatar className="w-24 h-24 flex-shrink-0">
              <AvatarImage 
                src={profile.avatar_url || undefined} 
                alt={profile.full_name || 'User'} 
              />
              <AvatarFallback>
                <User className="h-12 w-12 text-gray-400" />
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                {profile.username && (
                  <span className="text-lg text-gray-600">@{profile.username}</span>
                )}
                {profile.user_type && (
                  <Badge variant={profile.user_type === 'builder' ? 'default' : 'secondary'}>
                    {profile.user_type === 'builder' ? 'Builder' : 'Feedback Provider'}
                  </Badge>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {socialLinks.map(({ platform, url, label }) => (
                    <a
                      key={platform}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {getSocialIcon(platform)}
                      <span className="ml-2">{label}</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isOwnProfile ? (
                  <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={onFollow}
                      className={
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.projects}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{followersCount}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUpvotes}</div>
                <div className="text-sm text-gray-600">Total Upvotes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalComments}</div>
                <div className="text-sm text-gray-600">Total Comments</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Links */}
      {projectLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects & Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {projectLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-lg">{link.title}</h4>
                      <Badge variant={link.is_internal ? 'default' : 'secondary'}>
                        {link.is_internal ? 'Internal Project' : 'External Link'}
                      </Badge>
                    </div>
                    {link.description && (
                      <p className="text-gray-600 mb-2">{link.description}</p>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
                    >
                      <span className="group-hover:underline">{link.url}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {link.created_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Added {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  {link.image_url && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={link.image_url}
                        alt={link.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 