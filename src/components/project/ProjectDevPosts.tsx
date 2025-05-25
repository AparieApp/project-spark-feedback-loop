
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
import { Calendar, User, Lock } from "lucide-react";

interface ProjectDevPostsProps {
  projectId: string;
}

interface DevPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export function ProjectDevPosts({ projectId }: ProjectDevPostsProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devPosts, isLoading } = useQuery({
    queryKey: ['devPosts', projectId],
    queryFn: async () => {
      // For now, we'll use comments with a special marker to simulate dev posts
      // In a real app, you'd have a separate dev_posts table
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .ilike('content', 'DEVPOST:%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DevPost[];
    },
  });

  const createDevPost = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

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
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-900">Developer Posts</h2>
        </div>
        <p className="text-blue-700">
          This section is private to project developers. Share internal updates, technical details, 
          and collaborate with your team.
        </p>
      </Card>

      {/* Create Dev Post Form */}
      <Card className="p-6">
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Developer Post
          </Button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">New Developer Post</h3>
            <Input
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <Textarea
              placeholder="Share technical updates, internal discussions, or development notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={2000}
            />
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createDevPost.isPending ? 'Publishing...' : 'Publish Post'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Dev Posts List */}
      <div className="space-y-4">
        {devPosts && devPosts.length > 0 ? (
          devPosts.map((post) => {
            const [postTitle, ...contentParts] = post.content.replace('DEVPOST: ', '').split('\n\n');
            const postContent = contentParts.join('\n\n');
            
            return (
              <Card key={post.id} className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">{postTitle}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Dev Only
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        {post.profiles?.avatar_url ? (
                          <img
                            src={post.profiles.avatar_url}
                            alt={post.profiles.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-gray-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{post.profiles?.full_name || 'Anonymous'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {postContent}
                  </p>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              No developer posts yet. Share technical updates and collaborate with your team!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
