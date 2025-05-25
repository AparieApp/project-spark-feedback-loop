import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronUp, User, Calendar, Users, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjectVote } from "@/hooks/useProjects";
import { ProjectDescription } from "@/components/project/ProjectDescription";
import { ProjectDiscussion } from "@/components/project/ProjectDiscussion";
import { ProjectUpdates } from "@/components/project/ProjectUpdates";
import { ProjectFAQ } from "@/components/project/ProjectFAQ";
import { ProjectDevPosts } from "@/components/project/ProjectDevPosts";
import { cn } from "@/lib/utils";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const projectVote = useProjectVote();
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: userVote } = useQuery({
    queryKey: ['userVote', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('project_votes')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  const handleUpvote = async () => {
    if (!user || !id) {
      window.location.href = '/login';
      return;
    }

    try {
      await projectVote.mutateAsync({ projectId: id, isUpvoted: !!userVote });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleInvestClick = () => {
    setShowInvestModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Project not found</div>
      </div>
    );
  }

  const isProjectOwner = user?.id === project.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Image */}
            <div className="lg:col-span-2">
              {project.image_url && (
                <div className="aspect-video overflow-hidden rounded-lg mb-6">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              
              <p className="text-lg text-gray-700 mb-6">
                {project.description}
              </p>

              {/* Creator Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {project.profiles?.avatar_url ? (
                    <img
                      src={project.profiles.avatar_url}
                      alt={project.profiles.full_name || 'Creator'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-900">
                      by {project.profiles?.full_name || 'Anonymous'}
                    </p>
                    {project.profiles?.user_type === 'builder' && (
                      <Badge variant="default" className="bg-blue-600 text-white text-xs">
                        Builder
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(project.created_at)}</span>
                    </span>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 sticky top-6">
                {/* Vote Button */}
                <Button
                  onClick={handleUpvote}
                  disabled={projectVote.isPending}
                  className={cn(
                    "w-full mb-4 flex items-center justify-center space-x-2",
                    userVote
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  )}
                >
                  <ChevronUp className={cn("h-5 w-5", userVote && "fill-current")} />
                  <span>{userVote ? 'Upvoted' : 'Upvote'}</span>
                </Button>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Upvotes</span>
                    <span className="font-semibold">{project.upvotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Comments</span>
                    </span>
                    <span className="font-semibold">{project.comment_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white border rounded-lg p-1">
            <TabsTrigger 
              value="description" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="discussion" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Discussion
            </TabsTrigger>
            <TabsTrigger 
              value="updates" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Updates
            </TabsTrigger>
            <TabsTrigger 
              value="faq" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              FAQ
            </TabsTrigger>
            <TabsTrigger 
              value="dev-posts" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Dev Posts
            </TabsTrigger>
            <button
              onClick={handleInvestClick}
              className="flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
              disabled
            >
              <Lock className="h-4 w-4" />
              <span>Invest</span>
            </button>
          </TabsList>

          <TabsContent value="description">
            <ProjectDescription project={project} />
          </TabsContent>

          <TabsContent value="discussion">
            {project?.id ? (
              <ProjectDiscussion projectId={project.id} />
            ) : (
              <div className="text-center py-8">Loading discussion...</div>
            )}
          </TabsContent>

          <TabsContent value="updates">
            {project?.id ? (
              <ProjectUpdates projectId={project.id} isOwner={isProjectOwner} />
            ) : (
              <div className="text-center py-8">Loading updates...</div>
            )}
          </TabsContent>

          <TabsContent value="faq">
            {project?.id ? (
              <ProjectFAQ projectId={project.id} isOwner={isProjectOwner} />
            ) : (
              <div className="text-center py-8">Loading FAQ...</div>
            )}
          </TabsContent>

          <TabsContent value="dev-posts">
            {project?.id ? (
              <ProjectDevPosts projectId={project.id} />
            ) : (
              <div className="text-center py-8">Loading developer posts...</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={showInvestModal} onOpenChange={setShowInvestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <span>Investment Feature</span>
            </DialogTitle>
            <DialogDescription>
              The investment feature is coming soon! This will allow users to invest in promising projects and support builders directly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowInvestModal(false)} className="bg-blue-600 hover:bg-blue-700">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
