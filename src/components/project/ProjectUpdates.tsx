
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

interface ProjectUpdatesProps {
  projectId: string;
  isOwner: boolean;
}

interface Update {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
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
      // For now, we'll use comments with a special marker to simulate updates
      // In a real app, you'd have a separate updates table
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
        .ilike('content', 'UPDATE:%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Update[];
    },
  });

  const createUpdate = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

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
      {/* Create Update Form (Owner Only) */}
      {isOwner && (
        <Card className="p-6">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Post New Update
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">New Project Update</h3>
              <Input
                placeholder="Update title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <Textarea
                placeholder="Share what's new with your project..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
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
                    onClick={handleSubmitUpdate}
                    disabled={!title.trim() || !content.trim() || createUpdate.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
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
      <div className="space-y-4">
        {updates && updates.length > 0 ? (
          updates.map((update) => {
            const [updateTitle, ...contentParts] = update.content.replace('UPDATE: ', '').split('\n\n');
            const updateContent = contentParts.join('\n\n');
            
            return (
              <Card key={update.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{updateTitle}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(update.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {update.profiles?.avatar_url ? (
                      <img
                        src={update.profiles.avatar_url}
                        alt={update.profiles.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <span className="font-medium">{update.profiles?.full_name || 'Anonymous'}</span>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {updateContent}
                  </p>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              {isOwner 
                ? "No updates yet. Share your progress with supporters!"
                : "No updates yet. Check back later for project news!"
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
