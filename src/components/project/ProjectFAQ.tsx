
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs', projectId],
    queryFn: async () => {
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
  });

  const createFAQ = useMutation({
    mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
      if (!user) throw new Error('User not authenticated');

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

  if (isLoading) {
    return <div className="text-center py-8">Loading FAQ...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create FAQ Form (Owner Only) */}
      {isOwner && (
        <Card className="p-6">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New FAQ
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Frequently Asked Question</h3>
              <Input
                placeholder="Question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={300}
              />
              <Textarea
                placeholder="Answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={1000}
              />
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
                    className="bg-blue-600 hover:bg-blue-700"
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
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        {faqs && faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-gray-600 text-center py-8">
            {isOwner 
              ? "No FAQs yet. Add some frequently asked questions to help your supporters!"
              : "No FAQs available for this project yet."
            }
          </p>
        )}
      </Card>
    </div>
  );
}
