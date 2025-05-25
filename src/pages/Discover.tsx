
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectFilters } from "@/components/project/ProjectFilters";
import { Users } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

export default function Discover() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data: projects = [], isLoading, error } = useProjects(selectedCategory, searchQuery);

  // Sort projects based on sortBy
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'most_upvoted':
        return b.upvotes - a.upvotes;
      case 'most_commented':
        return b.comment_count - a.comment_count;
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading projects</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Projects
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore innovative projects from builders around the world and share your feedback
            </p>
            {searchQuery && (
              <p className="mt-4 text-lg text-blue-600">
                Showing results for: "<span className="font-semibold">{searchQuery}</span>"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <ProjectFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Projects Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === "all" ? "All Projects" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Projects`}
            </h2>
            <span className="text-gray-600">
              {isLoading ? "Loading..." : `${sortedProjects.length} projects found`}
            </span>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  builder={{
                    name: project.profiles.full_name || 'Anonymous',
                    avatar: project.profiles.avatar_url,
                  }}
                  category={project.category}
                  image={project.image_url}
                  commentCount={project.comment_count}
                  upvotes={project.upvotes}
                  isUpvoted={false} // We'll implement this later with vote checking
                  createdAt={project.created_at}
                />
              ))}
            </div>
          )}

          {!isLoading && sortedProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No projects match your search for "${searchQuery}". Try adjusting your search terms or filters.`
                  : "No projects have been shared yet. Be the first to share your project!"
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
