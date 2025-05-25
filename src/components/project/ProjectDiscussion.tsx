import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommentCard } from "@/components/feedback/CommentCard";
import { Filter, MessageSquare, Megaphone, Wrench } from "lucide-react";

interface ProjectDiscussionProps {
  projectId: string;
}

type PostType = 'all' | 'discussion' | 'dev-posts';

interface PostData {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  post_type: 'discussion' | 'dev-post';
  display_content: string;
  title?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
}

export function ProjectDiscussion({ projectId }: ProjectDiscussionProps) {
  const [newComment, setNewComment] = useState("");
  const [filterType, setFilterType] = useState<PostType>('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all posts (comments and dev posts)
  const { data: allPosts, isLoading } = useQuery({
    queryKey: ['discussion-posts', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Get regular comments
      const { data: comments, error: commentsError } = await supabase
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
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Process comments to separate dev posts from regular discussions
      const processedPosts: PostData[] = (comments || []).map(comment => {
        const isDevPost = comment.content?.startsWith('DEVPOST:');
        let title = '';
        let displayContent = comment.content || '';
        
        if (isDevPost) {
          const lines = comment.content.split('\n');
          title = lines[0].replace('DEVPOST: ', '');
          displayContent = lines.slice(2).join('\n'); // Skip title and empty line
        }

        return {
          id: comment.id,
          content: comment.content || '',
          created_at: comment.created_at,
          upvotes: comment.upvotes || 0,
          post_type: isDevPost ? 'dev-post' : 'discussion',
          display_content: displayContent,
          title: isDevPost ? title : undefined,
          profiles: comment.profiles ? {
            full_name: comment.profiles.full_name || '',
            avatar_url: comment.profiles.avatar_url || undefined,
            user_type: comment.profiles.user_type || ''
          } : undefined
        };
      });

      return processedPosts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!projectId,
  });

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      if (!projectId) throw new Error('Project ID is required');

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          content,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts', projectId] });
      setNewComment("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error posting comment",
        description: error.message,
      });
    },
  });

  const handleSubmitComment = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (newComment.trim()) {
      createComment.mutate(newComment);
    }
  };

  // Filter posts based on selected type
  const filteredPosts = allPosts?.filter(post => {
    if (filterType === 'all') return true;
    if (filterType === 'discussion') return post.post_type === 'discussion';
    if (filterType === 'dev-posts') return post.post_type === 'dev-post';
    return true;
  }) || [];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'dev-post':
        return <Wrench className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case 'dev-post':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Dev Post</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading discussion...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Discussion</h3>
            <p className="text-sm text-gray-600">
              Join the conversation with questions, feedback, and discussions. 
              See updates from builders and participate in the community.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterType} onValueChange={(value: PostType) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="dev-posts">Dev Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* New Comment Form */}
        <div className="space-y-4">
          <Textarea
            placeholder="Share your thoughts, feedback, or questions..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {newComment.length}/1000 characters
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createComment.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={`${post.post_type}-${post.id}`} className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {post.profiles?.avatar_url ? (
                    <img
                      src={post.profiles.avatar_url}
                      alt={post.profiles.full_name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                      {(post.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {post.profiles?.full_name || 'Anonymous'}
                    </span>
                    {post.profiles?.user_type === 'builder' && (
                      <Badge variant="default" className="bg-blue-600 text-white text-xs">
                        Builder
                      </Badge>
                    )}
                    {getPostTypeBadge(post.post_type)}
                    <span className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Post Title for dev posts */}
                  {post.post_type === 'dev-post' && post.title && (
                    <h4 className="font-semibold text-lg mb-2 flex items-center space-x-2">
                      {getPostTypeIcon(post.post_type)}
                      <span>{post.title}</span>
                    </h4>
                  )}

                  {/* Content */}
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {post.display_content}
                  </div>

                  {/* Engagement */}
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                      <span>👍</span>
                      <span>{post.upvotes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              {getPostTypeIcon(filterType === 'all' ? 'discussion' : filterType)}
              <p className="text-gray-600">
                {filterType === 'all' 
                  ? "No posts yet. Be the first to start the discussion!"
                  : `No ${filterType.replace('-', ' ')} posts yet.`
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
