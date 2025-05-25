import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Lock, Wrench, MessageSquare, Code, GitBranch } from "lucide-react";

interface ProjectDevPostsProps {
  projectId: string;
}

interface DevPost {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
}

export function ProjectDevPosts({ projectId }: ProjectDevPostsProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user is a builder for this project
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const isProjectOwner = user?.id === project?.user_id;

  const { data: devPosts, isLoading } = useQuery({
    queryKey: ['devPosts', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Get comments that are marked as dev posts
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('project_id', projectId)
        .ilike('content', 'DEVPOST:%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DevPost[];
    },
    enabled: !!projectId,
  });

  const createDevPost = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      if (!projectId) throw new Error('Project ID is required');

      const devPostContent = `DEVPOST: ${title}\n\n${content}`;
      
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          content: devPostContent,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devPosts', projectId] });
      queryClient.invalidateQueries({ queryKey: ['discussion-posts', projectId] });
      setTitle("");
      setContent("");
      setShowForm(false);
      toast({
        title: "Dev post published!",
        description: "Your developer post has been shared.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error posting",
        description: error.message,
      });
    },
  });

  const handleSubmitDevPost = () => {
    if (title.trim() && content.trim()) {
      createDevPost.mutate({ title, content });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading developer posts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center space-x-2 mb-2">
          <Wrench className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-purple-900">Developer Posts</h2>
        </div>
        <p className="text-purple-700">
          Technical updates, development insights, and behind-the-scenes content from the project builders.
          {isProjectOwner && " Share your development journey with the community!"}
        </p>
      </Card>

      {/* Access Notice for Non-Owners */}
      {!isProjectOwner && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              This section shows public developer posts. Some internal development discussions may be private to the project team.
            </span>
          </div>
        </Card>
      )}

      {/* Create Dev Post Form (Owner Only) */}
      {isProjectOwner && (
        <Card className="p-6 border-l-4 border-l-purple-500">
          {!showForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share Development Updates</h3>
                <p className="text-sm text-gray-600">Keep your community informed about technical progress and insights</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Wrench className="h-4 w-4 mr-2" />
                New Dev Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">New Developer Post</h3>
              </div>
              
              <Input
                placeholder="Post title (e.g., 'API Integration Complete', 'Performance Optimization Update')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="text-lg font-medium"
              />
              
              <Textarea
                placeholder="Share technical updates, development insights, challenges overcome, or upcoming features... Be as detailed as you'd like!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
                maxLength={2000}
              />
              
              {/* Dev Tools Placeholder */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Code className="h-5 w-5 text-gray-400" />
                <GitBranch className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">Code snippets and technical diagrams coming soon</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {content.length}/2000 characters
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitDevPost}
                    disabled={!title.trim() || !content.trim() || createDevPost.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {createDevPost.isPending ? 'Publishing...' : 'Publish Post'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Dev Posts List */}
      <div className="space-y-6">
        {devPosts && devPosts.length > 0 ? (
          devPosts.map((post) => {
            const [postTitle, ...contentParts] = post.content.replace('DEVPOST: ', '').split('\n\n');
            const postContent = contentParts.join('\n\n');
            
            return (
              <Card key={post.id} className="p-6 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Wrench className="h-3 w-3 mr-1" />
                        Dev Post
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{postTitle}</h3>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {post.profiles?.avatar_url ? (
                      <img
                        src={post.profiles.avatar_url}
                        alt={post.profiles.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {post.profiles?.full_name || 'Anonymous'}
                      </span>
                      <Badge variant="default" className="bg-blue-600 text-white text-xs">
                        Builder
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">Project Developer</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="prose max-w-none mb-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                    {postContent}
                  </div>
                </div>
                
                {/* Engagement */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600 transition-colors">
                      <span>👍</span>
                      <span>{post.upvotes || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comment</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Wrench className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No developer posts yet</h3>
                <p className="text-gray-600 max-w-md">
                  {isProjectOwner 
                    ? "Share your first developer post to give your community insights into your development process and technical progress."
                    : "The project builders haven't shared any developer posts yet. Check back later for technical updates and development insights!"
                  }
                </p>
              </div>
              {isProjectOwner && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 mt-4"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Share Your First Dev Post
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
