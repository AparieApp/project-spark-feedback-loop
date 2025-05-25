import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  
  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;
  
  const { profile, projectLinks, loading } = useProfile(targetUserId);

  // Mock stats - in a real app, these would come from the database
  const [stats, setStats] = useState({
    projects: 0,
    totalUpvotes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    // If no userId in params and user is logged in, redirect to own profile
    if (!userId && user) {
      navigate(`/profile/${user.id}`, { replace: true });
    }
  }, [userId, user, navigate]);

  useEffect(() => {
    // In a real app, you would fetch these stats from the database
    if (profile) {
      // Mock stats calculation
      setStats({
        projects: 4, // This would be fetched from projects table
        totalUpvotes: 156,
        totalComments: 89,
      });
      setFollowerCount(127); // This would be fetched from followers table
    }
  }, [profile]);

  const handleFollow = () => {
    if (isFollowing) {
      setFollowerCount(prev => prev - 1);
      toast({
        title: "Unfollowed",
        description: `You are no longer following ${profile?.full_name || 'this user'}.`,
      });
    } else {
      setFollowerCount(prev => prev + 1);
      toast({
        title: "Following",
        description: `You are now following ${profile?.full_name || 'this user'}.`,
      });
    }
    setIsFollowing(!isFollowing);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {isOwnProfile ? (
          // Own profile with view/edit tabs
          <Tabs value={isEditing ? "edit" : "view"} onValueChange={(value) => setIsEditing(value === "edit")}>
            <TabsList className="mb-6 sm:mb-8 w-full sm:w-auto">
              <TabsTrigger value="view" className="flex-1 sm:flex-none">View Profile</TabsTrigger>
              <TabsTrigger value="edit" className="flex-1 sm:flex-none">Edit Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              <ProfileView
                profile={profile}
                projectLinks={projectLinks}
                isOwnProfile={isOwnProfile}
                onEdit={() => setIsEditing(true)}
                stats={stats}
                followersCount={followerCount}
              />
            </TabsContent>

            <TabsContent value="edit">
              <ProfileEditor
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Other user's profile (view only)
          <ProfileView
            profile={profile}
            projectLinks={projectLinks}
            isOwnProfile={isOwnProfile}
            onFollow={handleFollow}
            isFollowing={isFollowing}
            stats={stats}
            followersCount={followerCount}
          />
        )}
      </div>
    </div>
  );
} 