
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CommentCard } from "@/components/feedback/CommentCard";

interface ProjectDiscussionProps {
  projectId: string;
}

export function ProjectDiscussion({ projectId }: ProjectDiscussionProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', projectId],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');

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
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
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

  if (isLoading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* New Comment Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Join the Discussion</h3>
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

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={{
                id: comment.id,
                author: {
                  name: comment.profiles?.full_name || 'Anonymous',
                  avatar: comment.profiles?.avatar_url,
                  role: comment.profiles?.user_type as "builder" | "feedback_provider" || "feedback_provider",
                },
                content: comment.content,
                upvotes: comment.upvotes || 0,
                downvotes: 0,
                createdAt: comment.created_at || '',
              }}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No comments yet. Be the first to start the discussion!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
