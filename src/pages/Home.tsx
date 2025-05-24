
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectFilters } from "@/components/project/ProjectFilters";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Award } from "lucide-react";

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

const statsData = [
  { icon: TrendingUp, label: "Active Projects", value: "1,247" },
  { icon: Users, label: "Builders", value: "892" },
  { icon: Award, label: "Feedback Given", value: "15,420" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProjects = mockProjects.filter(project => 
    selectedCategory === "all" || project.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Get <span className="text-blue-300">Actionable Feedback</span> for Your Projects
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Connect with a community of builders and feedback providers to iterate, improve, and launch better products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                <Plus className="h-5 w-5 mr-2" />
                Share Your Project
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold">
                Browse Projects
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
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
              <p className="text-gray-600">Try adjusting your filters or check back later for new projects.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
