import { useState } from "react";
import { Hero } from "@/components/Hero";
import { EvaluationForm } from "@/components/EvaluationForm";
import { EvaluationResult } from "@/components/EvaluationResult";
import { LearningGraph } from "@/components/LearningGraph";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    topic: string;
    keywords: {
      covered: string[];
      missing: string[];
    };
  } | null>(null);
  const { toast } = useToast();

  // Sample data for the learning graph (0-5 scale)
  const [learningData, setLearningData] = useState([
    { date: "Week 1", score: 2.5 },
    { date: "Week 2", score: 3.0 },
    { date: "Week 3", score: 3.5 },
    { date: "Week 4", score: 4.0 },
    { date: "Week 5", score: 4.2 },
  ]);

  const handleSubmit = async (topic: string, answer: string, bertKeywords: string[]) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-text', {
        body: { text: answer, topic, bertKeywords }
      });

      if (error) {
        throw error;
      }

      const result = {
        score: data.score,
        feedback: data.feedback,
        topic,
        keywords: data.keywords
      };
      
      setEvaluation(result);
      
      // Update learning data
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setLearningData(prev => [...prev, { date: today, score: data.score }]);
      
      toast({
        title: "Evaluation Complete!",
        description: `Your score: ${data.score}/5`,
      });
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById("evaluation-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: "Evaluation Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Hero />
      
      <EvaluationForm onSubmit={handleSubmit} isLoading={isLoading} />
      
      {evaluation && (
        <div id="evaluation-results">
          <EvaluationResult 
            score={evaluation.score}
            feedback={evaluation.feedback}
            topic={evaluation.topic}
            keywords={evaluation.keywords}
          />
        </div>
      )}
      
      <LearningGraph data={learningData} />
      
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground border-t">
        <p className="text-sm">
          © 2025 NeuroSpeak. AI-Powered Learning Evaluation Platform.
        </p>
      </footer>
    </div>
  );
};

export default Index;
