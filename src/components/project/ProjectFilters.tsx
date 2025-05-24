
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const categories = [
  { value: "all", label: "All Projects" },
  { value: "tech", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "social", label: "Social Impact" },
  { value: "art", label: "Art & Creative" },
  { value: "education", label: "Education" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "discussed", label: "Most Discussed" },
  { value: "trending", label: "Trending" },
];

export function ProjectFilters({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ProjectFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                "transition-all duration-200",
                selectedCategory === category.value
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-gray-700 hover:text-blue-600 hover:border-blue-300"
              )}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {selectedCategory !== "all" && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onCategoryChange("all")}
              >
                {categories.find(c => c.value === selectedCategory)?.label}
                <button className="ml-1 text-gray-500 hover:text-gray-700">×</button>
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
