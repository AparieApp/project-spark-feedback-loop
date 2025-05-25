
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectFilters } from "@/components/project/ProjectFilters";
import { Users } from "lucide-react";

// Mock data for demonstration
const mockProjects = [
  {
    id: "1",
    title: "EcoTrack - Carbon Footprint Calculator",
    description: "A mobile app that helps users track and reduce their daily carbon footprint through gamification and community challenges.",
    builder: {
      name: "Sarah Chen",
      avatar: undefined,
    },
    category: "social",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
    commentCount: 23,
    upvotes: 47,
    isUpvoted: false,
    createdAt: "2024-05-23",
  },
  {
    id: "2",
    title: "DevMentor - Code Review Platform",
    description: "Connect junior developers with experienced mentors for real-time code reviews and learning opportunities.",
    builder: {
      name: "Alex Rodriguez",
      avatar: undefined,
    },
    category: "tech",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    commentCount: 31,
    upvotes: 62,
    isUpvoted: true,
    createdAt: "2024-05-22",
  },
  {
    id: "3",
    title: "Mindful Moments - Meditation Assistant",
    description: "AI-powered meditation app that adapts to your stress levels and schedule to provide personalized mindfulness sessions.",
    builder: {
      name: "Maya Patel",
      avatar: undefined,
    },
    category: "tech",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop",
    commentCount: 18,
    upvotes: 35,
    isUpvoted: false,
    createdAt: "2024-05-21",
  },
  {
    id: "4",
    title: "LocalCraft - Artisan Marketplace",
    description: "Digital platform connecting local artisans with customers, featuring AR try-on and sustainability tracking.",
    builder: {
      name: "James Wilson",
      avatar: undefined,
    },
    category: "business",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
    commentCount: 12,
    upvotes: 28,
    isUpvoted: false,
    createdAt: "2024-05-20",
  },
];

export default function Discover() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const filteredProjects = mockProjects.filter(project => {
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.builder.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
            <span className="text-gray-600">{filteredProjects.length} projects found</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No projects match your search for "${searchQuery}". Try adjusting your search terms or filters.`
                  : "Try adjusting your filters or check back later for new projects."
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
