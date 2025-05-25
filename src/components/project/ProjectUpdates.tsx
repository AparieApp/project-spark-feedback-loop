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
import { Calendar, User, MessageSquare, Heart, Share2, Megaphone, Image, Video } from "lucide-react";

interface ProjectUpdatesProps {
  projectId: string;
  isOwner: boolean;
}

interface Update {
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

export function ProjectUpdates({ projectId, isOwner }: ProjectUpdatesProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['updates', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      // For now, we'll use comments with a special marker to simulate updates
      // In a real app, you'd have a separate updates table
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
        .ilike('content', 'UPDATE:%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Update[];
    },
    enabled: !!projectId,
  });

  const createUpdate = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      if (!projectId) throw new Error('Project ID is required');

      const updateContent = `UPDATE: ${title}\n\n${content}`;
      
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          content: updateContent,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates', projectId] });
      queryClient.invalidateQueries({ queryKey: ['discussion-posts', projectId] });
      setTitle("");
      setContent("");
      setShowForm(false);
      toast({
        title: "Update posted!",
        description: "Your project update has been published.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error posting update",
        description: error.message,
      });
    },
  });

  const handleSubmitUpdate = () => {
    if (title.trim() && content.trim()) {
      createUpdate.mutate({ title, content });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading updates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <Megaphone className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-green-900">Project Updates</h2>
        </div>
        <p className="text-green-700">
          Stay up to date with the latest developments, milestones, and announcements from the project builders.
          {isOwner && " Share your progress and keep your community engaged!"}
        </p>
      </Card>

      {/* Create Update Form (Owner Only) */}
      {isOwner && (
        <Card className="p-6 border-l-4 border-l-green-500">
          {!showForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share an Update</h3>
                <p className="text-sm text-gray-600">Keep your community informed about your progress</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Post Update
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Megaphone className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">New Project Update</h3>
              </div>
              
              <Input
                placeholder="Update title (e.g., 'Major Feature Release', 'Milestone Achieved')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="text-lg font-medium"
              />
              
              <Textarea
                placeholder="Share what's new with your project... Include details about new features, progress updates, upcoming milestones, or any exciting developments!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
                maxLength={2000}
              />
              
              {/* Media Upload Placeholder */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Image className="h-5 w-5 text-gray-400" />
                <Video className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">Media upload coming soon - Add photos and videos to your updates</span>
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
                    onClick={handleSubmitUpdate}
                    disabled={!title.trim() || !content.trim() || createUpdate.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createUpdate.isPending ? 'Publishing...' : 'Publish Update'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Updates List */}
      <div className="space-y-6">
        {updates && updates.length > 0 ? (
          updates.map((update) => {
            const [updateTitle, ...contentParts] = update.content.replace('UPDATE: ', '').split('\n\n');
            const updateContent = contentParts.join('\n\n');
            
            return (
              <Card key={update.id} className="p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Megaphone className="h-3 w-3 mr-1" />
                        Update
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(update.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{updateTitle}</h3>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {update.profiles?.avatar_url ? (
                      <img
                        src={update.profiles.avatar_url}
                        alt={update.profiles.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {update.profiles?.full_name || 'Anonymous'}
                      </span>
                      {update.profiles?.user_type === 'builder' && (
                        <Badge variant="default" className="bg-blue-600 text-white text-xs">
                          Builder
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">Project Creator</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="prose max-w-none mb-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {updateContent}
                  </div>
                </div>
                
                {/* Engagement */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{update.upvotes || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(update.created_at).toLocaleTimeString('en-US', {
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
                <Megaphone className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h3>
                <p className="text-gray-600 max-w-md">
                  {isOwner 
                    ? "Share your first project update to keep your community engaged and informed about your progress."
                    : "The project builder hasn't shared any updates yet. Check back later for the latest developments!"
                  }
                </p>
              </div>
              {isOwner && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700 mt-4"
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Post Your First Update
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

