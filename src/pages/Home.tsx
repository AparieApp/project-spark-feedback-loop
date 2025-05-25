
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Award, ArrowRight, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";

const statsData = [
  { icon: TrendingUp, label: "Active Projects", value: "1,247" },
  { icon: Users, label: "Builders", value: "892" },
  { icon: Award, label: "Feedback Given", value: "15,420" },
];

const featuresData = [
  {
    icon: MessageSquare,
    title: "Get Quality Feedback",
    description: "Share your projects and receive constructive feedback from a community of builders and creators."
  },
  {
    icon: Star,
    title: "Discover Amazing Projects",
    description: "Explore innovative projects across technology, design, business, and social impact categories."
  },
  {
    icon: Users,
    title: "Connect with Builders",
    description: "Network with like-minded entrepreneurs and creators building the future."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Get <span className="text-blue-300">Actionable Feedback</span> for Your Projects
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Connect with a community of builders and feedback providers to iterate, improve, and launch better products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/share-project">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  <Plus className="h-5 w-5 mr-2" />
                  Share Your Project
                </Button>
              </Link>
              <Link to="/discover">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold">
                  Browse Projects
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FeedbackLab?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a builder looking for feedback or someone who loves discovering new projects, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Growing Community</h2>
            <p className="text-xl text-gray-600">Thousands of builders are already getting valuable feedback</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center bg-white p-8 rounded-lg shadow-sm">
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

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of builders sharing their projects and getting valuable feedback from the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/share-project">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                <Plus className="h-5 w-5 mr-2" />
                Share Your First Project
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold">
                Explore Projects
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
