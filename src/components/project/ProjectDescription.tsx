import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, Users, Globe, Github, ExternalLink, Image, Video, FileText } from "lucide-react";

interface ProjectDescriptionProps {
  project: {
    title: string;
    description: string;
    category: string;
    created_at: string;
    upvotes?: number;
    comment_count?: number;
  };
}

export function ProjectDescription({ project }: ProjectDescriptionProps) {
  return (
    <div className="space-y-6">
      {/* Main Description */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-semibold">About This Project</h2>
        </div>
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
            {project.description}
          </div>
        </div>
      </Card>

      {/* Media Gallery Placeholder */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Image className="h-5 w-5 text-purple-600" />
          <h3 className="text-xl font-semibold">Project Gallery</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder for media content */}
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6">
            <Image className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              Project images and screenshots will be displayed here
            </p>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6">
            <Video className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              Demo videos and project walkthroughs
            </p>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6">
            <FileText className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              Additional documentation and resources
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Media upload functionality coming soon - builders will be able to showcase their projects with rich content
        </p>
      </Card>

      {/* Project Details */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-sm text-gray-600">Category</span>
              <div className="font-medium">
                <Badge variant="secondary" className="mt-1">
                  {project.category}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <span className="text-sm text-gray-600">Created</span>
              <div className="font-medium">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="text-sm text-gray-600">Community</span>
              <div className="font-medium">
                {(project.upvotes || 0)} upvotes, {(project.comment_count || 0)} comments
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Links Placeholder */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Project Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-600">Live Demo</span>
            </div>
            <p className="text-sm text-gray-500">
              Project demo link will be displayed here
            </p>
          </div>
          
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Github className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-600">Source Code</span>
            </div>
            <p className="text-sm text-gray-500">
              GitHub repository link will be displayed here
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Project links functionality coming soon - builders will be able to showcase live demos and source code
        </p>
      </Card>

      {/* Tech Stack Placeholder */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Technology Stack</h3>
        <div className="flex flex-wrap gap-2">
          {/* Placeholder tech stack badges */}
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            React
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Node.js
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            TypeScript
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Supabase
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Technology stack will be customizable by project builders
        </p>
      </Card>
    </div>
  );
}
