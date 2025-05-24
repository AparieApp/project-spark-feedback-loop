import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CommentCard } from "@/components/feedback/CommentCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronUp, 
  User, 
  Calendar, 
  ExternalLink, 
  Heart,
  Share2,
  Flag,
  ArrowLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock project data
const mockProject = {
  id: "1",
  title: "EcoTrack - Carbon Footprint Calculator",
  description: `EcoTrack is a comprehensive mobile application designed to help individuals track, understand, and reduce their daily carbon footprint. The app combines real-time data tracking with gamification elements to make environmental consciousness engaging and rewarding.

Key Features:
• Daily activity tracking (transportation, energy use, food consumption)
• Personalized carbon footprint calculations using AI algorithms
• Gamified challenges and community competitions
• Educational content about climate impact
• Integration with smart home devices and transportation apps
• Social features to compare progress with friends and family

The app addresses the growing need for individuals to understand their environmental impact and provides actionable insights to reduce their carbon footprint. With climate change becoming increasingly urgent, EcoTrack empowers users to make informed decisions about their daily activities.

Current Status: We have a working prototype and are seeking feedback on user experience, feature prioritization, and potential partnerships with environmental organizations.`,
  builder: {
    id: "builder1",
    name: "Sarah Chen",
    bio: "Environmental Engineer & Product Designer passionate about climate tech. Previously at Tesla and Nest.",
    avatar: undefined,
    socialLinks: {
      linkedin: "https://linkedin.com/in/sarahchen",
      twitter: "https://twitter.com/sarahchen_eco",
    }
  },
  category: "Social Impact",
  images: [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
  ],
  upvotes: 47,
  isUpvoted: false,
  createdAt: "2024-05-23T10:00:00Z",
  updatedAt: "2024-05-23T15:30:00Z",
};

const mockComments = [
  {
    id: "1",
    author: {
      name: "Alex Rodriguez",
      avatar: undefined,
      role: "feedback_provider" as const,
    },
    content: "This is exactly what we need! I love the gamification aspect. Have you considered integrating with fitness trackers to automatically detect transportation methods?",
    upvotes: 12,
    downvotes: 1,
    userVote: null as "up" | "down" | null,
    createdAt: "2024-05-23T12:00:00Z",
    replies: [
      {
        id: "1-1",
        author: {
          name: "Sarah Chen",
          avatar: undefined,
          role: "builder" as const,
        },
        content: "Great suggestion! We're actually exploring partnerships with Fitbit and Apple Health. The challenge is accurately detecting bike vs. car vs. walking without draining battery.",
        upvotes: 8,
        downvotes: 0,
        userVote: null as "up" | "down" | null,
        createdAt: "2024-05-23T12:15:00Z",
      }
    ]
  },
  {
    id: "2",
    author: {
      name: "Maya Patel",
      avatar: undefined,
      role: "feedback_provider" as const,
    },
    content: "The concept is solid, but I'm concerned about data privacy. How are you handling sensitive location and activity data? Users will be sharing very personal information about their daily routines.",
    upvotes: 18,
    downvotes: 2,
    userVote: "up" as "up" | "down" | null,
    createdAt: "2024-05-23T14:30:00Z",
  },
  {
    id: "3",
    author: {
      name: "James Wilson",
      avatar: undefined,
      role: "feedback_provider" as const,
    },
    content: "Love the environmental focus! One suggestion: partner with local businesses to offer rewards for eco-friendly choices. Like discounts for biking to a coffee shop instead of driving.",
    upvotes: 15,
    downvotes: 0,
    userVote: null as "up" | "down" | null,
    createdAt: "2024-05-23T16:45:00Z",
  },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [project] = useState(mockProject);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isUpvoted, setIsUpvoted] = useState(project.isUpvoted);
  const [upvotes, setUpvotes] = useState(project.upvotes);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(prev => prev - 1);
    } else {
      setUpvotes(prev => prev + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: {
          name: "Current User",
          avatar: undefined,
          role: "feedback_provider" as const,
        },
        content: newComment,
        upvotes: 0,
        downvotes: 0,
        userVote: null as "up" | "down" | null,
        createdAt: new Date().toISOString(),
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-3">
                    {project.category}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {project.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(project.createdAt)}</span>
                    </div>
                    <span>•</span>
                    <span>Last updated {formatDate(project.updatedAt)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpvote}
                    className={cn(
                      "flex items-center space-x-2",
                      isUpvoted
                        ? "text-blue-600 border-blue-300 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600"
                    )}
                  >
                    <ChevronUp className={cn("h-4 w-4", isUpvoted && "fill-current")} />
                    <span>{upvotes}</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Project Images */}
              {project.images && project.images.length > 0 && (
                <div className="mb-6">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img
                      src={project.images[selectedImage]}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {project.images.length > 1 && (
                    <div className="flex space-x-2">
                      {project.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                            selectedImage === index
                              ? "border-blue-500"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <img
                            src={image}
                            alt={`${project.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Project Description */}
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Feedback & Discussion ({comments.length})
              </h2>

              {/* Add Comment Form */}
              <div className="mb-8">
                <Textarea
                  placeholder="Share your feedback, suggestions, or questions..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[120px] mb-3 resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/500 characters
                  </span>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Post Feedback
                  </Button>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <User className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback yet</h3>
                  <p className="text-gray-600">Be the first to share your thoughts on this project!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Builder Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Builder</h3>
              
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {project.builder.avatar ? (
                    <img
                      src={project.builder.avatar}
                      alt={project.builder.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    to={`/builder/${project.builder.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {project.builder.name}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    {project.builder.bio}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {project.builder.socialLinks && (
                <div className="space-y-2">
                  {Object.entries(project.builder.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  ))}
                </div>
              )}

              <Separator className="my-4" />

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Follow Builder
              </Button>
            </div>

            {/* Project Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upvotes</span>
                  <span className="font-semibold text-gray-900">{upvotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-semibold text-gray-900">{comments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
