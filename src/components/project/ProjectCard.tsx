
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  builder: {
    name: string;
    avatar?: string;
  };
  category: string;
  image?: string;
  commentCount: number;
  upvotes: number;
  isUpvoted?: boolean;
  createdAt: string;
}

export function ProjectCard({
  id,
  title,
  description,
  builder,
  category,
  image,
  commentCount,
  upvotes,
  isUpvoted = false,
  createdAt
}: ProjectCardProps) {
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(isUpvoted);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasUpvoted) {
      setCurrentUpvotes(prev => prev - 1);
    } else {
      setCurrentUpvotes(prev => prev + 1);
    }
    setHasUpvoted(!hasUpvoted);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link to={`/project/${id}`}>
      <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Project Image */}
        {image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            
            {/* Upvote Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className={cn(
                "flex flex-col items-center p-2 h-auto min-w-[60px] transition-colors",
                hasUpvoted
                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <ChevronUp className={cn("h-4 w-4", hasUpvoted && "fill-current")} />
              <span className="text-xs font-medium">{currentUpvotes}</span>
            </Button>
          </div>

          {/* Builder Info */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              {builder.avatar ? (
                <img
                  src={builder.avatar}
                  alt={builder.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-3 w-3 text-gray-600" />
              )}
            </div>
            <span className="text-sm text-gray-600">by {builder.name}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              <div className="flex items-center space-x-1 text-gray-500">
                <Users className="h-3 w-3" />
                <span className="text-xs">{commentCount} comments</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
