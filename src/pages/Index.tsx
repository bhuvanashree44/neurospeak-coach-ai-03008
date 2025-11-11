import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { TeacherMode } from "@/components/TeacherMode";
import { FriendMode } from "@/components/FriendMode";
import { LearningGraph } from "@/components/LearningGraph";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [mode, setMode] = useState<"teacher" | "friend">("teacher");
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
  const [learningData, setLearningData] = useState<Array<{ date: string; score: number; mode: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('score, created_at, mode, topic')
        .not('score', 'is', null)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      if (data) {
        const formattedData = data.map(session => ({
          date: new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: Number(session.score),
          mode: session.mode
        }));
        setLearningData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    }
  };

  const handleTeacherSubmit = async (topic: string, answer: string, bertKeywords: string[]) => {
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

      // Save to database
      await supabase.from('learning_sessions').insert({
        mode: 'teacher',
        topic,
        score: data.score
      });
      
      // Refresh learning data
      await fetchLearningData();
      
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

  const handleFriendSessionComplete = async (score: number, topic: string) => {
    await fetchLearningData();
  };

  return (
    <div className="min-h-screen">
      <Hero />
      
      <ModeSwitcher mode={mode} onModeChange={setMode} />
      
      {mode === "teacher" ? (
        <TeacherMode 
          isLoading={isLoading}
          evaluation={evaluation}
          onSubmit={handleTeacherSubmit}
        />
      ) : (
        <FriendMode onSessionComplete={handleFriendSessionComplete} />
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
