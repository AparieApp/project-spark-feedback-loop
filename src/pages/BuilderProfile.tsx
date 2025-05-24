
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Mail,
  Heart,
  TrendingUp,
  Users,
  ArrowLeft 
} from "lucide-react";

// Mock builder data
const mockBuilder = {
  id: "builder1",
  name: "Sarah Chen",
  bio: "Environmental Engineer & Product Designer passionate about climate tech. Previously at Tesla and Nest. Currently building solutions to help individuals and businesses reduce their carbon footprint through technology.",
  location: "San Francisco, CA",
  joinedDate: "2024-01-15",
  avatar: undefined,
  socialLinks: {
    linkedin: "https://linkedin.com/in/sarahchen",
    twitter: "https://twitter.com/sarahchen_eco",
    website: "https://sarahchen.dev",
  },
  stats: {
    projects: 4,
    followers: 127,
    totalUpvotes: 234,
    totalComments: 89,
  },
  projects: [
    {
      id: "1",
      title: "EcoTrack - Carbon Footprint Calculator",
      description: "A mobile app that helps users track and reduce their daily carbon footprint through gamification and community challenges.",
      builder: {
        name: "Sarah Chen",
        avatar: undefined,
      },
      category: "social",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
      commentCount: 23,
      upvotes: 47,
      isUpvoted: false,
      createdAt: "2024-05-23",
    },
    {
      id: "2",
      title: "GreenCommute - Sustainable Transportation",
      description: "Platform connecting commuters for carpooling and bike-sharing with environmental impact tracking.",
      builder: {
        name: "Sarah Chen",
        avatar: undefined,
      },
      category: "social",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop",
      commentCount: 15,
      upvotes: 32,
      isUpvoted: false,
      createdAt: "2024-05-15",
    },
    {
      id: "3",
      title: "EnergyWise - Smart Home Assistant",
      description: "AI-powered home energy management system that optimizes consumption and reduces costs.",
      builder: {
        name: "Sarah Chen",
        avatar: undefined,
      },
      category: "tech",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
      commentCount: 28,
      upvotes: 56,
      isUpvoted: true,
      createdAt: "2024-04-20",
    },
  ],
};

export default function BuilderProfile() {
  const { id } = useParams();
  const [builder] = useState(mockBuilder);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(builder.stats.followers);

  const handleFollow = () => {
    if (isFollowing) {
      setFollowerCount(prev => prev - 1);
    } else {
      setFollowerCount(prev => prev + 1);
    }
    setIsFollowing(!isFollowing);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {builder.avatar ? (
                <img
                  src={builder.avatar}
                  alt={builder.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-600" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{builder.name}</h1>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">{builder.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {builder.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{builder.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(builder.joinedDate)}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(builder.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleFollow}
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
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{builder.stats.projects}</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{followerCount}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{builder.stats.totalUpvotes}</div>
              <div className="text-sm text-gray-600">Total Upvotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{builder.stats.totalComments}</div>
              <div className="text-sm text-gray-600">Comments Received</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Projects ({builder.projects.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builder.projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>

            {builder.projects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600">{builder.name} hasn't shared any projects yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Posted a new project:</span> EcoTrack - Carbon Footprint Calculator
                    </p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Replied to feedback</span> on GreenCommute project
                    </p>
                    <p className="text-sm text-gray-500">1 week ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Updated project:</span> EnergyWise - Smart Home Assistant
                    </p>
                    <p className="text-sm text-gray-500">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
