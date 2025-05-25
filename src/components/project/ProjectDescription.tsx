
import { Card } from "@/components/ui/card";

interface ProjectDescriptionProps {
  project: {
    title: string;
    description: string;
    category: string;
    created_at: string;
  };
}

export function ProjectDescription({ project }: ProjectDescriptionProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">About This Project</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Category:</span>
            <span className="ml-2 font-medium">{project.category}</span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 font-medium">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
