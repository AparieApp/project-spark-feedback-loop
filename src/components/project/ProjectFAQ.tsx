import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, Plus, MessageCircle, Clock } from "lucide-react";

interface ProjectFAQProps {
  projectId: string;
  isOwner: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export function ProjectFAQ({ projectId, isOwner }: ProjectFAQProps) {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      // For now, we'll use comments with a special marker to simulate FAQs
      // In a real app, you'd have a separate FAQs table
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', projectId)
        .ilike('content', 'FAQ:%')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map(item => {
        const content = item.content.replace('FAQ: ', '');
        const [question, answer] = content.split('\nANSWER: ');
        return {
          id: item.id,
          question,
          answer: answer || '',
          created_at: item.created_at,
        };
      }) as FAQ[];
    },
    enabled: !!projectId,
  });

  const createFAQ = useMutation({
    mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
      if (!user) throw new Error('User not authenticated');
      if (!projectId) throw new Error('Project ID is required');

      const faqContent = `FAQ: ${question}\nANSWER: ${answer}`;
      
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          content: faqContent,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs', projectId] });
      setQuestion("");
      setAnswer("");
      setShowForm(false);
      toast({
        title: "FAQ added!",
        description: "Your FAQ has been added to the project.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error adding FAQ",
        description: error.message,
      });
    },
  });

  const handleSubmitFAQ = () => {
    if (question.trim() && answer.trim()) {
      createFAQ.mutate({ question, answer });
    }
  };

  // Filter FAQs based on search query
  const filteredFAQs = faqs?.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="text-center py-8">Loading FAQ...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-orange-900">Frequently Asked Questions</h2>
        </div>
        <p className="text-orange-700">
          Find answers to common questions about this project. 
          {isOwner && " Add FAQs to help your community get quick answers to common questions."}
        </p>
      </Card>

      {/* Search Bar */}
      {faqs && faqs.length > 0 && (
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      )}

      {/* Create FAQ Form (Owner Only) */}
      {isOwner && (
        <Card className="p-6 border-l-4 border-l-orange-500">
          {!showForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Manage FAQs</h3>
                <p className="text-sm text-gray-600">Help your community by answering common questions</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Add Frequently Asked Question</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <Input
                  placeholder="What question do users frequently ask?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={300}
                  className="text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <Textarea
                  placeholder="Provide a clear and helpful answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Question: {question.length}/300, Answer: {answer.length}/1000
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setQuestion("");
                      setAnswer("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitFAQ}
                    disabled={!question.trim() || !answer.trim() || createFAQ.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {createFAQ.isPending ? 'Adding...' : 'Add FAQ'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* FAQ List */}
      <Card className="p-6">
        {faqs && faqs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {filteredFAQs.length} {filteredFAQs.length === 1 ? 'Question' : 'Questions'}
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Filtered
                  </Badge>
                )}
              </div>
            </div>
            
            {filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`item-${index}`} className="border-b border-gray-200">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <div className="flex items-start space-x-3 w-full">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-medium text-orange-600">Q</span>
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Added {new Date(faq.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">A</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching FAQs</h3>
                <p className="text-gray-600">
                  No FAQs match your search query. Try different keywords.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {isOwner 
                ? "Add frequently asked questions to help your community get quick answers to common questions about your project."
                : "The project builder hasn't added any FAQs yet. Check back later or ask questions in the discussion tab."
              }
            </p>
            {isOwner && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-orange-600 hover:bg-orange-700 mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First FAQ
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
